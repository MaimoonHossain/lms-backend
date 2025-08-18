import express from "express";

import isAuthenticated from "../middlewares/isAuthenticated.js";
import upload from "../utils/multer.js";
import {
  createCourse,
  createLecture,
  deleteCourse,
  deleteLecture,
  editCourse,
  editLecture,
  getAllLecturesByCourseId,
  getCourseById,
  getCreatorCourses,
  getLectureById,
  togglePublishCourse,
} from "../controllers/course.controller.js";

const router = express.Router();

router
  .route("/create")
  .post(isAuthenticated, upload.single("thumbnail"), createCourse);
router
  .route("/edit/:id")
  .patch(isAuthenticated, upload.single("thumbnail"), editCourse);
router.route("/get-course-by-id/:id").get(isAuthenticated, getCourseById);
router.route("/").get(isAuthenticated, getCreatorCourses);
router.route("/delete-course/:id").delete(isAuthenticated, deleteCourse);
router.route("/lecture-create/:courseId").post(isAuthenticated, createLecture);
router.route("/lecture-edit/:lectureId").patch(isAuthenticated, editLecture);
router
  .route("/lecture-get-all/:courseId")
  .get(isAuthenticated, getAllLecturesByCourseId);
router
  .route("/lecture-delete/:lectureId")
  .delete(isAuthenticated, deleteLecture);
router
  .route("/lecture-get-by-id/:lectureId")
  .get(isAuthenticated, getLectureById);
router
  .route("/toggle-publish/:courseId")
  .patch(isAuthenticated, togglePublishCourse);

export default router;
