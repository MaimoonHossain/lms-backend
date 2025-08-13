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

export const editCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, subTitle, description, category, level, thumbnail } =
      req.body;
    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    course.title = title;
    course.subTitle = subTitle;
    course.description = description;
    course.category = category;
    course.level = level;
    course.thumbnail = thumbnail;

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
