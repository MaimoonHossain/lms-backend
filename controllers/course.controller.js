import Course from "../models/course.model.js";

export const createCourse = async (req, res) => {
  try {
    const { title, subTitle, description, category, level, thumbnail } =
      req.body;

    if (!title || !description || !category || !level || !thumbnail) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newCourse = new Course({
      title,
      subTitle,
      description,
      category,
      level,
      thumbnail,
      creator: req.id,
    });

    const savedCourse = await newCourse.save();
    res.status(201).json(savedCourse);
  } catch (error) {
    console.error("Error creating course:", error);
    res.status(400).json({ message: error.message });
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
