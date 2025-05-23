// router/otp.js
import express from "express";
import { add_number, get_otp, send_otp, verify_otp } from "../controllers/otp_controller.js";

const router = express.Router();

router.post("/add", add_number); // Kept as is (not used in signup flow)
router.post("/get", get_otp);   // Kept as is (not used in signup flow)
router.post("/send", send_otp); // Updated to match controller function name
router.post("/verify", verify_otp);

export default router;