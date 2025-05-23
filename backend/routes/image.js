// routes/image.js
import express from "express";
import { uploadImage, getImage } from "../controllers/imageController.js";
import multer from "multer";

// Configure multer for file uploads (memory storage for encryption)
const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = express.Router();

// Route to upload an image
router.post("/image/upload", upload.single("file"), uploadImage);

// Route to get an image by ID
router.get("/image/:id", getImage);

export default router;