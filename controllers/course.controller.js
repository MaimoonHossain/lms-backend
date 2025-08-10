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
