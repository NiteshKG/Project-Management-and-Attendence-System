import express from "express";
import Attendance from "../models/Attendance.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();




router.post("/start", authMiddleware, async (req, res) => {
  try {
    const attendance = new Attendance({
      user: req.user,
      startTime: new Date(),
    });
    await attendance.save();
    res.json({ msg: "Day started", attendance });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});


router.post("/end", authMiddleware, async (req, res) => {
  try {
    const attendance = await Attendance.findOne({ user: req.user, endTime: null }).sort({ startTime: -1 });
    if (!attendance) return res.status(400).json({ msg: "No ongoing day found" });

    const endTime = new Date();
    const durationMs = endTime - attendance.startTime;
    const hrs = Math.floor(durationMs / 3600000);
    const mins = Math.floor((durationMs % 3600000) / 60000);
    const sec = Math.floor((durationMs % 60000) / 1000);

    attendance.endTime = endTime;
    attendance.duration = `${hrs.toString().padStart(2,'0')}:${mins.toString().padStart(2,'0')}:${sec.toString().padStart(2,'0')}`;
    attendance.status = true;
    await attendance.save();

    res.json({ msg: "Day ended", attendance });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});


router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user).select("-password");

   
    const runningAttendance = await Attendance.findOne({
      user: req.user,
      endTime: null,
    }).sort({ startTime: -1 });

    res.json({ user, runningAttendance });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});


export default router;
