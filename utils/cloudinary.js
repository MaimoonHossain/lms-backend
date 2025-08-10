import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

export const uploadMedia = async (file) => {
  try {
    const uploadResponse = await cloudinary.uploader.upload(file.path, {
      resource_type: "auto",
    });
    return uploadResponse;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error("Cloudinary upload failed");
  }
};

export const deleteMedia = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    throw new Error("Cloudinary delete failed");
  }
};

export const deleteVideo = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: "video",
    });
  } catch (error) {
    throw new Error("Cloudinary video delete failed");
  }
};
