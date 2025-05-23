import Order from '../models/orders.js'; // adjust path as needed
import mongoose from "mongoose";

const getOrdersByUser = async (req, res) => {
  const { userId } = req.params;

  // Check if userId is valid
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid user ID." });
  }

  try {
    const orders = await Order.find({ userId }).sort({ createdAt: -1 }); // Latest first

    if (orders.length === 0) {
      return res.status(404).json({ message: "No orders found for this user." });
    }

    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching orders by user:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
export default getOrdersByUser;
