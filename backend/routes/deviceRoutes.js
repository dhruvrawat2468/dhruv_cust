import express from "express";
import mongoose from "mongoose";
import Device from "../models/devices.js";

const router = express.Router();

// Route to add a new device
router.post("/add", async (req, res) => {
  try {
    const { name, serviceMode, technicianIds, deviceId } = req.body;

    // Validate required fields
    if (!name || !serviceMode || !technicianIds || !deviceId) {
      return res.status(400).json({ message: "Name, serviceMode, technicianIds, and deviceId are required" });
    }

    // Ensure technicianIds is an array and validate ObjectIds
    const techIds = Array.isArray(technicianIds) ? technicianIds : [technicianIds];
    if (!techIds.every(id => mongoose.Types.ObjectId.isValid(id))) {
      return res.status(400).json({ message: "All technicianIds must be valid ObjectIds" });
    }

    const existingDevice = await Device.findOne({ name, serviceMode });

    if (existingDevice) {
      // Add new technician IDs that aren't already present
      const newIds = techIds.filter(id => !existingDevice.technicianIds.includes(id));
      if (newIds.length > 0) {
        existingDevice.technicianIds.push(...newIds);
        await existingDevice.save();
      }
      return res.status(200).json({
        message: "Device already exists. New technician IDs added if not present.",
        device: existingDevice,
      });
    }

    const newDevice = new Device({
      deviceId,
      name,
      serviceMode,
      technicianIds: techIds,
    });

    await newDevice.save();

    res.status(201).json({ message: "Device created successfully", device: newDevice });
  } catch (error) {
    console.error("Error adding device:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Route to update a device
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, category, serviceMode, technicianIds } = req.body;
  console.log("Updating device:", id, "with data:", { name, category, serviceMode, technicianIds });

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid device ID format" });
  }

  try {
    const updateData = {};
    if (name) updateData.name = name;
    if (category) updateData.category = category;
    if (serviceMode) updateData.serviceMode = serviceMode;
    if (technicianIds) {
      if (!Array.isArray(technicianIds) || !technicianIds.every(id => mongoose.Types.ObjectId.isValid(id))) {
        return res.status(400).json({ message: "technicianIds must be an array of valid ObjectIds" });
      }
      updateData.technicianIds = technicianIds;
    }

    const objectId = new mongoose.Types.ObjectId(id);
    const updatedDevice = await Device.findByIdAndUpdate(
      objectId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedDevice) {
      return res.status(404).json({ message: "Device not found" });
    }

    res.status(200).json({ message: "Device updated successfully", updatedDevice });
  } catch (error) {
    console.error("Error updating device:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Route to fetch all devices (for admin panel)
router.get("/all", async (req, res) => {
  try {
    const devices = await Device.find();
    res.status(200).json(devices);
  } catch (error) {
    res.status(500).json({ message: "Error fetching devices", error: error.message });
  }
});

export default router;