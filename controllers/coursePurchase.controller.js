import Stripe from "stripe";
import Course from "../models/course.model.js";
import CoursePurchase from "../models/coursePurchase.model.js";
import Lecture from "../models/lecture.model.js";
import User from "../models/user.model.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createCheckoutSession = async (req, res) => {
  try {
    const userId = req.id;
    const { courseId } = req.body;

    const course = await Course.findById(courseId);
    console.log("course", course);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Create a new course purchase record
    const newPurchase = new CoursePurchase({
      courseId,
      userId,
      amount: course.price,
      status: "pending",
    });

    // Create a stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: course.title,
              images: [course.thumbnail],
            },
            unit_amount: course.price * 100,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}/student/course-progress/${courseId}`,
      cancel_url: `${process.env.FRONTEND_URL}/student/course-details/${courseId}`,
      metadata: {
        courseId,
        userId,
      },
      shipping_address_collection: {
        allowed_countries: ["US", "CA"],
      },
    });

    if (!session.url) {
      return res
        .status(500)
        .json({ message: "Failed to create checkout session" });
    }

    // Save the checkout session ID to the course purchase record
    newPurchase.paymentId = session.id;
    await newPurchase.save();

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("Error creating checkout session:", error.message);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};

export const stripeWebhook = async (req, res) => {
  let event;

  try {
    const payloadString = JSON.stringify(req.body, null, 2);
    const secret = process.env.WEBHOOK_ENDPOINT_SECRET;

    const header = stripe.webhooks.generateTestHeaderString({
      payload: payloadString,
      secret,
    });

    event = stripe.webhooks.constructEvent(payloadString, header, secret);
  } catch (error) {
    console.error("Webhook error:", error.message);
    return res.status(400).send(`Webhook error: ${error.message}`);
  }

  // Handle the checkout session completed event
  if (event.type === "checkout.session.completed") {
    console.log("check session complete is called");

    try {
      const session = event.data.object;

      const purchase = await CoursePurchase.findOne({
        paymentId: session.id,
      }).populate({ path: "courseId" });

      if (!purchase) {
        return res.status(404).json({ message: "Purchase not found" });
      }

      if (session.amount_total) {
        purchase.amount = session.amount_total / 100;
      }
      purchase.status = "completed";

      // Make all lectures visible by setting `isPreviewFree` to true
      if (purchase.courseId && purchase.courseId.lectures.length > 0) {
        await Lecture.updateMany(
          { _id: { $in: purchase.courseId.lectures } },
          { $set: { isPreviewFree: true } }
        );
      }

      await purchase.save();

      // Update user's enrolledCourses
      await User.findByIdAndUpdate(
        purchase.userId,
        { $addToSet: { enrolledCourses: purchase.courseId._id } }, // Add course ID to enrolledCourses
        { new: true }
      );

      // Update course to add user ID to enrolledStudents
      await Course.findByIdAndUpdate(
        purchase.courseId._id,
        { $addToSet: { enrolledStudents: purchase.userId } }, // Add user ID to enrolledStudents
        { new: true }
      );
    } catch (error) {
      console.error("Error handling event:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
  res.status(200).send();
};

export const getCoursePurchaseDetails = async (req, res) => {
  try {
    const userId = req.id;
    const { courseId } = req.params;

    const course = await Course.findById(courseId)
      .populate({ path: "creator" })
      .populate({ path: "lectures" });

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const purchase = await CoursePurchase.findOne({
      userId,
      courseId,
    });

    res.status(200).json({ course, purchase: !!purchase });
  } catch (error) {
    console.error("Error fetching purchase details:", error.message);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};

export const getAllPurchasedCourses = async (req, res) => {
  try {
    const purchases = await CoursePurchase.find({
      status: "completed",
    }).populate("courseId");

    if (!purchases || purchases.length === 0) {
      return res.status(404).json({ message: "No purchased courses found" });
    }

    res.status(200).json({ purchases });
  } catch (error) {
    console.error("Error fetching purchased courses:", error.message);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
};
