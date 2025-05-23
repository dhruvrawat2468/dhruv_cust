import mongoose from 'mongoose';
const { Schema } = mongoose;

const otpSchema = new Schema({
  mobileNumber: {
    type: String,
    required: [true, 'Mobile number is required'],
    unique: true, // Ensure only one OTP per mobile number
    trim: true,
    match: [/^\d{10}$/, 'Mobile number must be a 10-digit number'],
  },
  otp: {
    type: String,
    required: [true, 'OTP is required'],
    trim: true,
  },
  expiresAt: {
    type: Date,
    required: [true, 'Expiration date is required'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// TTL index to auto-remove expired OTPs
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Index for sorting by createdAt
otpSchema.index({ createdAt: 1 });

const Otp = mongoose.model('Otp', otpSchema); // Capitalized for consistency

export default Otp;