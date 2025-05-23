import dotenv from "dotenv";
import path from "path";
// Load environment variables
dotenv.config({ path: path.resolve("config/.env") });

import express from "express";
import cors from "cors";
import connectDB from "../config/db.js";
import authRoutes from '../routes/authRoutes.js'
import imageRoutes from "../routes/image.js";
import bodyParser from "body-parser";
import deviceRoutes from "../routes/deviceRoutes.js"
import orderRoutes from "../routes/orderroutes.js"
import profileroute from "../routes/profilefetch.js"
import editprofile from "../routes/editprofile.js"
import technicianRoutes from "../routes/technicianRoute.js";
import complaintRoutes from "../routes/complaintroutes.js";
import otpRoutes from '../routes/otpRoutes.js';

const app = express();
const port = process.env.PORT || 4000 
// CORS configuration
app.use(cors({
  origin: [
    "https://59f7-2401-4900-1c5e-2625-3174-1ae3-f08f-4f26.ngrok-free.app",
    "http://localhost:700",
    "http://localhost:8081",
    "exp://192.168.199.1:8081",
    // Add your actual React Native app URLs here
    // For production, you might want to be more restrictive
  ],
  credentials: true,
}));

app.set("view engine", "ejs");

// Connect to database
connectDB();

// Body parsing middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Routes
app.use('/auth', authRoutes);
app.use("/api/devices", deviceRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/other", profileroute);
app.use("/api/other", editprofile);
app.use("/api/orders", technicianRoutes);
app.use("/api", otpRoutes);
app.use("/api", imageRoutes);

// Basic routes
app.get("/", (req, res) => {
    res.render("loggedin");
});
// Add this route for testing
app.get("/test", (req, res) => {
    res.json({ 
        message: "API is working!", 
        timestamp: new Date().toISOString() 
    });
});

app.get("/signup", (req, res) => {
    res.render("signup");
});
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

// Export the Express API for Vercel
export default app;