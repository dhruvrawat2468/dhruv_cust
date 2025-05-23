// technicianRoutes.js or orderRoutes.js (up to you)

import express from "express";
import Order from "../models/orders.js";

const router = express.Router();

// Get orders by technicianId
router.get("/technician/:technicianId", async (req, res) => {
    try {
      const { technicianId } = req.params;
  
      const orders = await Order.find({
        technicianId,
        status: "unaccepted", // Filter for new tasks only
      }).populate("userId", "-password");
  
      if (orders.length === 0) {
        return res.status(404).json({ message: "No new orders for this technician." });
      }
  
      res.status(200).json(orders); // return only the array of orders
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
});

export default router;
