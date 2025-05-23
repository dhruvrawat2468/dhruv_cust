import express from "express";
import User from "../models/user.js";
import authMiddleware from "./authMiddleware.js";

const router = express.Router();

// Fetch user profile (Authenticated Request)
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
