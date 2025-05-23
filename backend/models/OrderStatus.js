import mongoose from "mongoose";

const orderStatusSchema = new mongoose.Schema({
  orderId: {
    type: String,
  },
  status: {
    type: String,
    required: true,
    enum: [
      "unaccepted",
      "accepted",
      "Arrived",
      "Cost Verification",
      "Repair in Progress",
      "Ready to Deliver",
      "completed",
    ],
    default: "unaccepted",
  },
  cost: {
    type: Number,
    default: 0,
  },
  serviceCharge: {
    type: Number,
    default: 0,
  },
  repairDetails: [
    {
      whatRepaired: { type: String, default: "" },
      cost: { type: Number, default: 0 },
    },
  ],
  paymentStatus: {
    type: String,
    default: "incomplete",
    enum: ["incomplete", "pending", "completed"],
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update updatedAt on save
orderStatusSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model("OrderStatus", orderStatusSchema);