import mongoose from "mongoose";
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  // Initial Form Fields
  name: {
    type: String,
    required: true,
    trim: true,
  },
  mobile: {
    type: String,
    required: true,
    match: [/^\d{10}$/, 'Mobile number must be 10 digits'],
    unique: true,
  },
  address: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    sparse: true,
  },
  password: {
    type: String,
    required: true,
    minlength: [6, 'Password must be at least 6 characters'],
  },

  // Additional Form Fields
  gender: {
    type: String,
    required: true,
    enum: ['Male', 'Female', 'Other'],
    trim: true,
  },
  age: {
    type: Number,
    required: true,
    min: [1, 'Age must be at least 1'],
    max: [120, 'Age cannot exceed 120'],
  },
  ifscCode: {
    type: String,
    required: true,
    match: [/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Please enter a valid IFSC code'],
    uppercase: true,
    trim: true,
  },
  aadhaarImage: {
    type: Schema.Types.ObjectId,
    ref: 'Image',
    default: null,
  },
  userPhoto: {
    type: Schema.Types.ObjectId,
    ref: 'Image',
    default: null,
  },

  // Suspension date range field
  suspenddate: [
    {
      from: {
        type: Date,
        required: true,
      },
      to: {
        type: Date,
        required: true,
      },
    },
  ],
});

// Indexes for faster queries
UserSchema.index({ mobile: 1 });
UserSchema.index({ email: 1 }, { sparse: true });

const User = mongoose.model('Technician', UserSchema);

export default User;
