import express from "express";

import upload from "../utils/multer.js";
import { uploadMedia } from "../utils/cloudinary.js";

const router = express.Router();

router.route("/upload-video").post(upload.single("file"), async (req, res) => {
  try {
    console.log("Uploading video...", req.file);
    const result = await uploadMedia(req.file);
    res.status(200).json({
      message: "Video uploaded successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error uploading video",
      error: error.message,
    });
  }
});

export default router;
