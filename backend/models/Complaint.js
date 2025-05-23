import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema({
  complaintId: {
    type: String,
    required: true,
    unique: true, // e.g., "C-101"
  },
  complaintType: {
    type: String,
    enum: ["app", "technician", "service"],
    required: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true,
  },
  technician: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Technician",
    required: true,
  },
  appliance: {
    type: String,
    required: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ["Pending", "Resolved"],
    default: "Pending",
  },
  adminReply: {
    type: String,
    default: null,
    trim: true,
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

// Indexes for faster queries
complaintSchema.index({ complaintId: 1 });
complaintSchema.index({ orderId: 1 });
complaintSchema.index({ technician: 1 });

export default mongoose.model("Complaint", complaintSchema);