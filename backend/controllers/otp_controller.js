import twilio from "twilio";
import bcrypt from "bcrypt";
import Otp from "../models/Otp_schema.js";
import dotenv from 'dotenv';

// Load environment variables from config/.env
dotenv.config({ path: '../config/.env' });

// Hardcoded configuration
const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 5;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER; // Replace with your Twilio phone number
const COUNTRY_CODE = process.env.COUNTRY_CODE; // Adjust based on your region (e.g., +1 for USA)

// Twilio client
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID, // Use environment variable directly
  process.env.TWILIO_AUTH_TOKEN   // Use environment variable directly
);

// Rest of the code remains unchanged
export const add_number = async (req, res) => {
  try {
    const { mobileNumber } = req.body;

    // Basic validation
    if (!mobileNumber || !/^\+?\d{10,}$/.test(mobileNumber)) {
      return res.status(400).json({ success: false, message: "Mobile number must be a valid phone number" });
    }

    // Generate OTP
    const otp = Math.floor(10 ** (OTP_LENGTH - 1) + Math.random() * 9 * 10 ** (OTP_LENGTH - 1)).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    // Store OTP
    const otpRecord = await Otp.findOneAndUpdate(
      { mobileNumber },
      { otp: hashedOtp, expiresAt, createdAt: new Date() },
      { upsert: true, new: true }
    );

    return res.status(200).json({ success: true, message: "OTP stored successfully" });
  } catch (error) {
    console.error("Error in add_number:", { message: error.message, stack: error.stack });
    if (error.name === 'MongoServerError' && error.code === 11000) {
      return res.status(400).json({ success: false, message: "Mobile number already has an active OTP" });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const get_otp = async (req, res) => {
  try {
    const { mobileNumber } = req.body;

    // Basic validation
    if (!mobileNumber || !/^\+?\d{10,}$/.test(mobileNumber)) {
      return res.status(400).json({ success: false, message: "Mobile number must be a valid phone number" });
    }

    const otpRecord = await Otp.findOne({ mobileNumber }).sort({ createdAt: -1 });

    if (!otpRecord || otpRecord.expiresAt <= new Date()) {
      return res.status(404).json({ success: false, message: "No valid OTP found" });
    }

    return res.status(200).json({
      success: true,
      otp: { mobileNumber: otpRecord.mobileNumber, expiresAt: otpRecord.expiresAt },
    });
  } catch (error) {
    console.error("Error in get_otp:", { message: error.message, stack: error.stack });
    if (error.name === 'MongoServerError' && error.code === 11000) {
      return res.status(400).json({ success: false, message: "Mobile number already has an active OTP" });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const send_otp = async (req, res) => {
  try {
    const { mobileNumber } = req.body;

    // Basic validation
    if (!mobileNumber || !/^\+?\d{10,}$/.test(mobileNumber)) {
      return res.status(400).json({ success: false, message: "Mobile number must be a valid phone number" });
    }

    // Generate OTP
    const otp = Math.floor(10 ** (OTP_LENGTH - 1) + Math.random() * 9 * 10 ** (OTP_LENGTH - 1)).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    // Store OTP
    const otpRecord = await Otp.findOneAndUpdate(
      { mobileNumber },
      { otp: hashedOtp, expiresAt, createdAt: new Date() },
      { upsert: true, new: true }
    );

    // Send OTP via Twilio
    try {
      const toNumber = mobileNumber.startsWith('+') ? mobileNumber : `${COUNTRY_CODE}${mobileNumber}`;
      const message = await twilioClient.messages.create({
        body: `Your OTP is ${otp}. Valid for ${OTP_EXPIRY_MINUTES} minutes.`,
        from: TWILIO_PHONE_NUMBER,
        to: toNumber,
      });
      console.log(`OTP sent via Twilio to ${mobileNumber}: SID ${message.sid}`);
    } catch (twilioError) {
      console.error("Twilio error:", {
        message: twilioError.message,
        code: twilioError.code,
        status: twilioError.status,
        details: twilioError.details,
      });
      return res.status(500).json({
        success: false,
        message: `Failed to send OTP via SMS: ${twilioError.message}`,
        errorCode: twilioError.code,
      });
    }

    // Fallback: Console logging for development (uncomment to disable Twilio)
    // console.log(`DEV: OTP for ${mobileNumber}: ${otp}`);

    return res.status(200).json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.error("Error in send_otp:", { message: error.message, stack: error.stack });
    if (error.name === 'MongoServerError' && error.code === 11000) {
      return res.status(400).json({ success: false, message: "Mobile number already has an active OTP" });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const verify_otp = async (req, res) => {
  try {
    const { mobileNumber, enteredOtp } = req.body;

    // Basic validation
    if (!mobileNumber || !/^\+?\d{10,}$/.test(mobileNumber)) {
      return res.status(400).json({ success: false, message: "Mobile number must be a valid phone number" });
    }
    if (!enteredOtp) {
      return res.status(400).json({ success: false, message: "OTP is required" });
    }

    const otpRecord = await Otp.findOne({ mobileNumber }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(404).json({ success: false, message: "No OTP found for this mobile number" });
    }

    const isNotExpired = otpRecord.expiresAt > new Date();
    const isOtpValid = await bcrypt.compare(enteredOtp, otpRecord.otp);

    if (!isOtpValid || !isNotExpired) {
      const message = !isOtpValid ? "Invalid OTP" : "OTP has expired";
      return res.status(400).json({ success: false, message });
    }

    // Delete OTP after successful verification
    await Otp.deleteOne({ _id: otpRecord._id });

    return res.status(200).json({ success: true, message: "OTP verified successfully" });
  } catch (error) {
    console.error("Error in verify_otp:", { message: error.message, stack: error.stack });
    if (error.name === 'MongoServerError' && error.code === 11000) {
      return res.status(400).json({ success: false, message: "Mobile number already has an active OTP" });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};