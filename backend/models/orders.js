import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  applianceName: { type: String, required: true },
  type: { 
    type: String, 
    enum: ["Pickup Repair Drop", "Home Repair"], 
    required: true 
  },
  brandName: { type: String, required: true },
  serviceDate: { type: Date, required: true },
  serviceFromTime: { 
    type: String, 
    required: true,
    validate: {
      validator: function(value) {
        return /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);
      },
      message: "Invalid time format. Use HH:MM (24-hour format)."
    }
  },
  serviceToTime: { 
    type: String, 
    required: true,
    validate: {
      validator: function(value) {
        return /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);
      },
      message: "Invalid time format. Use HH:MM (24-hour format)."
    }
  },
  technicianId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Technician", 
    required: true 
  },
  imageId: { type: mongoose.Schema.Types.ObjectId, ref: "Image", required: false },
  address: {
    houseNumber: { type: String, required: false },
    landmark: { type: String, required: false },
    street: { type: String, required: true },
    city: { type: String, required: false },
    pincode: { type: String, required: true }
  },
  paymentStatus: { 
    type: String, 
    enum: ["incomplete", "pending", "completed"],
    default: "incomplete" 
  },
  cost: { 
    type: Number, 
    default: null 
  },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Order", orderSchema);