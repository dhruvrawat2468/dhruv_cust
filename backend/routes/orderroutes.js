import express from "express";
import mongoose from "mongoose"; // Added for transaction
import { isValidObjectId } from "mongoose";
import Order from "../models/orders.js";
import User from "../models/user.js";
import Technician from "../models/technician.js";
import Device from "../models/devices.js";
import OrderStatus from "../models/OrderStatus.js";
import getOrdersByUser from '../controllers/getOrdersByUser.js';
import { 
  getOrderById, 
  setArrived, 
  setCostVerification, 
  acceptCost, 
  rejectCost, 
  updateOrderStatus,
  acceptOrder,
  completeOrder,
  declineOrder
} from "../controllers/orderStatusController.js";

const router = express.Router();

const newOrder = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    const {
      userId,
      applianceName,
      type,
      brandName,
      serviceDate,
      serviceFromTime,
      serviceToTime,
      imageId,
      address,
    } = req.body;

    // 1. Validate required fields
    if (
      !userId ||
      !applianceName ||
      !type ||
      !brandName ||
      !serviceDate ||
      !serviceFromTime ||
      !serviceToTime ||
      !address ||
      !address.street ||
      !address.pincode
    ) {
      return res.status(400).json({ message: "All required fields must be filled." });
    }

    // 2. Validate ObjectIds
    if (!isValidObjectId(userId)) {
      return res.status(400).json({ message: "Invalid user ID." });
    }

    // 3. Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // 4. Validate service time formats
    const isValidTime = (time) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(time);
    if (!isValidTime(serviceFromTime) || !isValidTime(serviceToTime)) {
      return res.status(400).json({
        message: "Invalid time format. Use HH:MM (24-hour format).",
      });
    }

    // 5. Validate service type
    const allowedTypes = ["Pickup Repair Drop", "Home Repair"];
    if (!allowedTypes.includes(type)) {
      return res.status(400).json({
        message: `Invalid type. Allowed types: ${allowedTypes.join(", ")}`,
      });
    }

    // 6. Find the device by name and service mode
    const device = await Device.findOne({
      name: applianceName,
      serviceMode: type,
    });

    if (!device) {
      return res.status(404).json({
        message: "No matching device found for this service type.",
      });
    }

    // 7. Get technician IDs from device
    const technicianIds = device.technicianIds;
    if (!technicianIds || technicianIds.length === 0) {
      return res.status(404).json({ message: "No technicians available for this device." });
    }

    // 8. Parse service date and time for suspension check
    const serviceDateTimeStart = new Date(`${serviceDate}T${serviceFromTime}:00Z`);
    const serviceDateTimeEnd = new Date(`${serviceDate}T${serviceToTime}:00Z`);

    if (isNaN(serviceDateTimeStart) || isNaN(serviceDateTimeEnd)) {
      return res.status(400).json({ message: "Invalid service date or time format." });
    }

    // 9. Find available technicians
    const availableTechnicians = await Technician.find({
      _id: { $in: technicianIds },
      $or: [
        { suspenddate: { $exists: false } },
        { suspenddate: { $size: 0 } },
        {
          suspenddate: {
            $not: {
              $elemMatch: {
                from: { $lte: serviceDateTimeEnd },
                to: { $gte: serviceDateTimeStart },
              },
            },
          },
        },
      ],
    });

    if (availableTechnicians.length === 0) {
      return res.status(404).json({ message: "No available technicians for the selected time slot." });
    }

    // 10. Randomly select one technician
    const selectedTechnician = availableTechnicians[Math.floor(Math.random() * availableTechnicians.length)];

    // 11. Validate imageId if provided
    if (imageId && !isValidObjectId(imageId)) {
      return res.status(400).json({ message: "Invalid image ID." });
    }

    // 12. Create and save the new order and OrderStatus within a transaction
    session.startTransaction();

    const newOrder = new Order({
      userId,
      applianceName,
      type,
      brandName,
      serviceDate: new Date(serviceDate),
      serviceFromTime,
      serviceToTime,
      technicianId: selectedTechnician._id,
      imageId,
      address: address || {},
    });

    await newOrder.save({ session });

    const newOrderStatus = new OrderStatus({
      orderId: newOrder._id,
      // Other fields (status, paymentStatus, cost, serviceCharge, repairDetails) use schema defaults
    });

    await newOrderStatus.save({ session });

    await session.commitTransaction();

    res.status(201).json({
      message: "Order and OrderStatus saved successfully!",
      assignedTechnicianId: selectedTechnician._id,
      order: newOrder,
      orderStatus: newOrderStatus,
    });
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    console.error("Create Order Error:", {
      message: error.message,
      stack: error.stack,
      orderId: req.body.orderId || "N/A",
    });
    res.status(500).json({ message: "Server error", error: error.message });
  } finally {
    session.endSession();
  }
};

// Order Routes
router.post("/create", newOrder);
router.get("/user/:userId", getOrdersByUser);
router.get("/technician/:technicianId",async (req, res) => {
  try {
    const { technicianId } = req.params;

    // 1. Validate technicianId
    if (!isValidObjectId(technicianId)) {
      return res.status(400).json({ message: "Invalid technician ID." });
    }

    // 2. Check if technician exists
    const technician = await Technician.findById(technicianId);
    if (!technician) {
      return res.status(404).json({ message: "Technician not found." });
    }

    // 3. Find unaccepted orders
    const orders = await Order.find({
      technicianId,
      status: "unaccepted",
    }).populate("technicianId", "name mobile");

    // 4. Return orders (empty array if none)
    res.status(200).json(orders);
  } catch (error) {
    console.error("Get Orders Error:", error.message, error.stack);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.put("/accept/:orderId", acceptOrder);
router.put("/decline/:orderId", declineOrder);
router.put("/complete/:orderId", completeOrder);

// OrderStatus Routes
router.get("/order-status/:orderId", getOrderById);
router.post("/order-status/arrived", setArrived);
router.post("/order-status/cost-verification", setCostVerification);
router.post("/order-status/accept-cost", acceptCost);
router.post("/order-status/reject-cost", rejectCost);
router.post("/order-status/update", updateOrderStatus);

export default router;