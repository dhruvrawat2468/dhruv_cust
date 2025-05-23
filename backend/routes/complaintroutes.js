import express from "express";
import { isValidObjectId } from "mongoose";
import Complaint from "../models/Complaint.js";
import Order from "../models/orders.js";
import Technician from "../models/technician.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { orderId, complaintType, description, audio,name } = req.body;

    // 1. Validate required fields
    if (!orderId || !complaintType || !description) {
      return res.status(400).json({ message: "Order ID, complaint type, and description are required." });
    }

    // 2. Validate ObjectId
    if (!isValidObjectId(orderId)) {
      return res.status(400).json({ message: "Invalid order ID." });
    }

    // 3. Validate complaintType
    if (!["app", "technician", "service"].includes(complaintType)) {
      return res.status(400).json({ message: "Invalid complaint type. Must be 'app', 'technician', or 'service'." });
    }

    // 4. Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    // 5. Check if order is completed
    if (order.status !== "completed") {
      return res.status(400).json({ message: "Only completed orders can have complaints." });
    }

    // 6. Get technician ID from order
    const technicianId = order.technicianId;
    if (!isValidObjectId(technicianId)) {
      return res.status(400).json({ message: "Invalid technician ID in order." });
    }

    // 7. Find the technician
    const technician = await Technician.findById(technicianId);
    if (!technician) {
      return res.status(404).json({ message: "Technician not found." });
    }

    // 8. Create and save complaint
    const complaint = new Complaint({
      orderId,
      complaintType,
      description,
      technicianName: technician.name,
      audio: audio || null,
      appliance:name,
    });
    await complaint.save();

    res.status(201).json({ message: "Complaint submitted successfully!", complaint });
  } catch (error) {
    console.error("Submit Complaint Error:", error.message, error.stack);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router;