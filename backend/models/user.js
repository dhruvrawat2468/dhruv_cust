import mongoose from "mongoose"

const addressSchema = new mongoose.Schema({
  street: { type: String, required: true },
  landmark: { type: String, required: true },
  pincode: { type: String, required: true },
  houseNumber: { type: String, required: true },
  city: { type: String, required: true }
});



const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true }, 
  password: { type: String, required: true },
  address: { type: [addressSchema], required: true }, // Array of address objects
  age: { type: Number, required: true },
  mobile: { type: String, required: true },
  gender: { type: String, required: true, enum: ["male", "female", "other"] },
  role: { type: String, required: true, enum: ["tech", "cust", "admin"], default: "cust" }
});

// Ensure email is unique
userSchema.index({ email: 1 }, { unique: true });

export default mongoose.model("User", userSchema);
