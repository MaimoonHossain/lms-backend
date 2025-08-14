import Course from "../models/course.model.js";
import { deleteMedia, uploadMedia } from "../utils/cloudinary.js";

export const createCourse = async (req, res) => {
  try {
    const { title, subTitle, description, category, level, isPublished } =
      req.body;
    const thumbnailFile = req.file;

    if (!title || !description || !category || !level) {
      return res.status(400).json({ message: "All fields are required" });
    }

    let thumbnailUrl = "";
    if (thumbnailFile) {
      const uploadResponse = await uploadMedia(thumbnailFile);
      thumbnailUrl = uploadResponse.secure_url;
    } else {
      return res.status(400).json({ message: "Thumbnail image is required" });
    }
    const newCourse = new Course({
      title,
      subTitle,
      description,
      category,
      level,
      thumbnail: thumbnailUrl,
      isPublished,
      creator: req.id,
    });

    const savedCourse = await newCourse.save();
    res.status(201).json(savedCourse);
  } catch (error) {
    console.error("Error creating course:", error);
    res.status(400).json({ message: error.message });
  }
};

function extractCloudinaryPublicId(url) {
  const parts = url.split("/");
  const filename = parts.pop();
  const publicId = filename.split(".")[0];
  return publicId;
}

export const editCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      subTitle,
      description,
      category,
      level,
      isPublished,
      thumbnailUrl, // from frontend if no new file uploaded
    } = req.body;

    const file = req.file; // new uploaded thumbnail

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Update basic fields
    course.title = title;
    course.subTitle = subTitle;
    course.description = description;
    course.category = category;
    course.level = level;
    course.isPublished = isPublished;

    // Handle thumbnail
    if (file) {
      // Delete old thumbnail if exists
      if (course.thumbnail) {
        const publicId = extractCloudinaryPublicId(course.thumbnail);
        await deleteMedia(publicId);
      }
      // Upload new thumbnail
      const uploadResponse = await uploadMedia(file);
      course.thumbnail = uploadResponse.secure_url;
    } else if (thumbnailUrl) {
      // Keep old URL if no new file uploaded
      course.thumbnail = thumbnailUrl;
    }

    const updatedCourse = await course.save();
    res.status(200).json(updatedCourse);
  } catch (error) {
    console.error("Error editing course:", error);
    res.status(400).json({ message: error.message });
  }
};

export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate(
      "creator",
      "name email"
    );

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    res.status(200).json(course);
  } catch (error) {
    console.error("Error fetching course:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getCreatorCourses = async (req, res) => {
  try {
    const courses = await Course.find({ creator: req.id }).populate(
      "creator",
      "name email"
    );

    if (!courses || courses.length === 0) {
      return res
        .status(404)
        .json({ message: "No courses found for this creator" });
    }
    res.status(200).json(courses);
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
