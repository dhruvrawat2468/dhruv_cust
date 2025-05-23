// models/Image.js
import mongoose from "mongoose";

const ImageSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  data: { type: Buffer, required: true },
  contentType: { type: String, required: true },
  uploadDate: { type: Date, default: Date.now }
});

const Image = mongoose.model("Image", ImageSchema);
export default Image;