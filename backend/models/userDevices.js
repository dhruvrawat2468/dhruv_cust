import mongoose from "mongoose"

const deviceSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  imageUrl: { type: String, required: true }, // Store as URL path
});

const Device = mongoose.model("Device", deviceSchema);

module.exports = Device;
