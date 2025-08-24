import Course from "../models/course.model.js";
import { CourseProgress } from "../models/courseProgress.js";

export const getCourseProgress = async (req, res) => {
  const { courseId } = req.params;
  const userId = req.id;

  try {
    // Always get course details
    const courseDetails = await Course.findById(courseId).populate("lectures");
    if (!courseDetails) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Try to get progress
    let progress = await CourseProgress.findOne({ userId, courseId });

    // If no progress exists yet, return empty progress but with course details
    if (!progress) {
      return res.status(200).json({
        data: {
          courseDetails,
          progress: [], // no lectures viewed yet
          completed: false,
        },
      });
    }

    // Otherwise return progress
    res.status(200).json({
      data: {
        courseDetails,
        progress: progress.lectureProgress,
        completed: progress.completed,
      },
    });
  } catch (error) {
    console.error("Error fetching course progress:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateLectureProgress = async (req, res) => {
  const { courseId, lectureId } = req.params;
  const userId = req.id;

  try {
    let courseProgress = await CourseProgress.findOne({
      userId,
      courseId,
    });

    if (!courseProgress) {
      courseProgress = new CourseProgress({
        userId,
        courseId,
        completed: false,
        lectureProgress: [],
      });
    }

    const lectureIndex = courseProgress.lectureProgress.findIndex(
      (lp) => lp.lectureId === lectureId
    );

    if (lectureIndex === -1) {
      courseProgress.lectureProgress.push({ lectureId, viewed: true });
    } else {
      courseProgress.lectureProgress[lectureIndex].viewed = true;
    }

    const lectureProgressLength = courseProgress.lectureProgress.filter(
      (lectureProg) => lectureProg.viewed
    ).length;

    const course = await Course.findById(courseId);

    if (course && lectureProgressLength === course.lectures.length) {
      courseProgress.completed = true;
    }

    await courseProgress.save();

    res.status(200).json({
      message: "Lecture progress updated successfully",
      data: courseProgress,
    });
  } catch (error) {
    console.error("Error updating lecture progress:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const markAsCompleted = async (req, res) => {
  const { courseId } = req.params;
  const userId = req.id;

  try {
    const courseProgress = await CourseProgress.findOne({ userId, courseId });

    if (!courseProgress) {
      return res
        .status(404)
        .json({ success: false, message: "Progress not found" });
    }

    // Mark all lectures as viewed
    courseProgress.lectureProgress = courseProgress.lectureProgress.map(
      (lp) => ({
        ...lp,
        viewed: true,
      })
    );

    courseProgress.completed = true;
    await courseProgress.save();

    return res.status(200).json({
      success: true,
      message: "Course progress marked as completed",
      data: courseProgress,
    });
  } catch (error) {
    console.error("❌ Error marking course progress as completed:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// ✅ Reset all lectures to unviewed
export const resetCourseProgress = async (req, res) => {
  const { courseId } = req.params;
  const userId = req.id;

  try {
    const courseProgress = await CourseProgress.findOne({ userId, courseId });

    if (!courseProgress) {
      return res
        .status(404)
        .json({ success: false, message: "Progress not found" });
    }

    // Reset all lectures to not viewed
    courseProgress.lectureProgress = courseProgress.lectureProgress.map(
      (lp) => ({
        ...lp,
        viewed: false,
      })
    );

    courseProgress.completed = false;
    await courseProgress.save();

    return res.status(200).json({
      success: true,
      message: "Course progress reset successfully",
      data: courseProgress,
    });
  } catch (error) {
    console.error("❌ Error resetting course progress:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
