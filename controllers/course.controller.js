import Course from "../models/course.model.js";
import { Lecture } from "../models/lecture.model.js";
import {
  deleteMedia,
  deleteVideo,
  extractCloudinaryPublicId,
  uploadMedia,
} from "../utils/cloudinary.js";

export const createCourse = async (req, res) => {
  try {
    const {
      title,
      subTitle,
      description,
      category,
      level,
      price,
      isPublished,
    } = req.body;
    const thumbnailFile = req.file;

    if (!title || !description || !category || !level || !price) {
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
      price,
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
    const {
      title,
      subTitle,
      description,
      category,
      level,
      price,
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
    course.price = price;
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

export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Delete thumbnail from Cloudinary if it exists
    if (course.thumbnail) {
      const publicId = extractCloudinaryPublicId(course.thumbnail);
      await deleteMedia(publicId);
    }

    await Course.findByIdAndDelete(id);
    res.status(200).json({ message: "Course deleted successfully" });
  } catch (error) {
    console.error("Error deleting course:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getPublishedCourses = async (_, res) => {
  try {
    const courses = await Course.find({ isPublished: true }).populate({
      path: "creator",
      select: "name photoUrl",
    });

    if (!courses || courses.length === 0) {
      return res.status(404).json({ message: "No published courses found" });
    }
    res.status(200).json(courses);
  } catch (error) {
    console.error("Error fetching published courses:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createLecture = async (req, res) => {
  try {
    const { lectureTitle } = req.body;
    const { courseId } = req.params;

    if (!lectureTitle || !courseId) {
      return res
        .status(400)
        .json({ message: "Lecture title and course ID are required" });
    }

    const newLecture = await Lecture.create({ lectureTitle });

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    course.lectures.push(newLecture._id);
    await course.save();

    res
      .status(201)
      .json({ newLecture, message: "Lecture created successfully" });
  } catch (error) {
    console.error("Error creating lecture:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllLecturesByCourseId = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId).populate("lectures");

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.status(200).json(course.lectures);
  } catch (error) {
    console.error("Error fetching lectures:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const editLecture = async (req, res) => {
  try {
    const { courseId, lectureId } = req.params;
    const { lectureTitle, videoUrl, publicId, isPreviewFree } = req.body;

    if (!lectureId) {
      return res.status(400).json({
        message: "Lecture ID is required",
      });
    }

    const lecture = await Lecture.findById(lectureId);

    if (!lecture) {
      return res.status(404).json({ message: "Lecture not found" });
    }

    if (lectureTitle) lecture.lectureTitle = lectureTitle;
    if (videoUrl) lecture.videoUrl = videoUrl;
    if (publicId) lecture.publicId = publicId;
    if (isPreviewFree) lecture.isPreviewFree = isPreviewFree;

    await lecture.save();

    const course = await Course.findById(courseId);
    if (course && !course.lectures.includes(lecture._id)) {
      course.lectures.push(lecture._id);
      await course.save();
    }

    res.status(200).json({ message: "Lecture updated successfully", lecture });
  } catch (error) {
    console.error("Error editing lecture:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteLecture = async (req, res) => {
  try {
    const { lectureId } = req.params;

    const lecture = await Lecture.findById(lectureId);

    if (!lecture) {
      return res.status(404).json({ message: "Lecture not found" });
    }

    await Lecture.findByIdAndDelete(lectureId);

    if (lecture.publicId) {
      await deleteVideo(lecture.publicId);
    }

    await Course.updateOne(
      { lectures: lectureId },
      { $pull: { lectures: lectureId } }
    );

    res.status(200).json({ message: "Lecture deleted successfully" });
  } catch (error) {
    console.error("Error deleting lecture:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getLectureById = async (req, res) => {
  try {
    const { lectureId } = req.params;

    const lecture = await Lecture.findById(lectureId);

    if (!lecture) {
      return res.status(404).json({ message: "Lecture not found" });
    }

    res.status(200).json(lecture);
  } catch (error) {
    console.error("Error fetching lecture:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const togglePublishCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    course.isPublished = !course.isPublished;
    await course.save();

    res
      .status(200)
      .json({ message: "Course publication status updated", course });
  } catch (error) {
    console.error("Error toggling course publication:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
