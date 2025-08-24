import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import {
  getCourseProgress,
  markAsCompleted,
  resetCourseProgress,
  updateLectureProgress,
} from "../controllers/courseProgress.controller.js";

const router = express.Router();

router.route("/:courseId").get(isAuthenticated, getCourseProgress);
router
  .route("/lectures/:courseId/:lectureId")
  .post(isAuthenticated, updateLectureProgress);
router.route("/completed/:courseId").post(isAuthenticated, markAsCompleted);
router.route("/reset/:courseId").post(isAuthenticated, resetCourseProgress);

export default router;
