import express from "express";

import isAuthenticated from "../middlewares/isAuthenticated.js";
import upload from "../utils/multer.js";
import { createCourse } from "../controllers/course.controller.js";

const router = express.Router();

router.route("/create").post(isAuthenticated, createCourse);

export default router;
