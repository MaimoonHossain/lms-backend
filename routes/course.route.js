import express from "express";

import isAuthenticated from "../middlewares/isAuthenticated.js";
import upload from "../utils/multer.js";
import {
  createCourse,
  editCourse,
  getCourseById,
  getCreatorCourses,
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

export default router;
