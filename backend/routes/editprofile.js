import express from "express";
const router = express.Router();
import User from "../models/user.js";
import authenticate from "./authMiddleware.js";

router.put("/profile/edit", authenticate, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: No user ID found" });
    }

    const { name, email, gender, address, age } = req.body;

    // Validation
    if (!name) return res.status(400).json({ message: "Name is required" });
    if (!email || !email.includes("@")) return res.status(400).json({ message: "Invalid email format" });
    if (!["male", "female", "other"].includes(gender)) {
      return res.status(400).json({ message: "Gender must be male, female, or other" });
    }
    const parsedAge = parseInt(age);
    if (isNaN(parsedAge) || parsedAge < 1 || parsedAge > 120) {
      return res.status(400).json({ message: "Age must be a number between 1 and 120" });
    }
    if (!Array.isArray(address) || address.length === 0) {
      return res.status(400).json({ message: "At least one address is required" });
    }
    const addr = address[0];
    if (!addr.street) return res.status(400).json({ message: "Street is required" });
    if (!addr.houseNumber) return res.status(400).json({ message: "House number is required" });
    if (!addr.city) return res.status(400).json({ message: "City is required" });
    if (!addr.pincode || !/^\d{6}$/.test(addr.pincode)) {
      return res.status(400).json({ message: "Pincode must be a 6-digit number" });
    }
    // Landmark is optional but must be a string if provided
    if (addr.landmark && typeof addr.landmark !== "string") {
      return res.status(400).json({ message: "Landmark must be a string" });
    }

    const updateData = { name, email, gender, age: parsedAge, address };

    console.log("Updating user with data:", updateData);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    console.error("Error updating profile:", error.message);
    console.error("Stack:", error.stack);
    if (error.name === "ValidationError") {
      const errorMessages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: "Validation error", errors: errorMessages });
    }
    if (error.code === 11000 && error.keyPattern?.email) {
      return res.status(400).json({ message: "This email is already in use" });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router;