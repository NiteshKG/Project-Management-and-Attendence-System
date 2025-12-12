import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import attendanceRoute from "./routes/attendance.js";
import projectRoutes from "./routes/project.js";

dotenv.config();
connectDB();
const app = express();

app.use(express.json());
app.use(cors());
app.use('/api/auth', authRoutes);
app.use('/api/attendance',attendanceRoute);
app.use('/api/projects', projectRoutes);

app.use((err, req, res, next) => {
    console.error("GLOBAL ERROR:", err);
    res.status(500).json({ error: "Server error" });
});


app.listen(5000,() =>{console.log('Server is running on port 5000')});