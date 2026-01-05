import express from "express";
import Attendance from "../models/Attendance.js";
import User from "../models/User.js";
import Project from "../models/Project.js";
import jwt from "jsonwebtoken";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();


function parseDuration(duration) {
  if (!duration) return 0;

  const parts = duration.split(":").map(Number);

  if (parts.length !== 3) return 0;

  const [hours, minutes, seconds] = parts;

  return (
    hours * 60 * 60 * 1000 +
    minutes * 60 * 1000 +
    seconds * 1000
  );
}


router.post("/start", authMiddleware, async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);

    // First check if there's already a running attendance
    const existingRunning = await Attendance.findOne({
      user: req.user,
      date: today,
      isRunning: true
    });

    // If already running, don't create new one, just return current
    if (existingRunning) {
      return res.json({ 
        attendance: existingRunning,
        message: "Timer is already running" 
      });
    }

    // Find today's attendance (running or not)
    let attendance = await Attendance.findOne({
      user: req.user,
      date: today
    });

    // If no attendance exists for today, create one
    if (!attendance) {
      attendance = new Attendance({
        user: req.user,
        date: today,
        duration: "00:00:00",
        isRunning: false,
        status: false
      });
    }

    // If attendance exists but is not running, start it
    if (!attendance.isRunning) {
      attendance.startTime = new Date();
      attendance.isRunning = true;
      attendance.logs.push({
      start: attendance.startTime,
      end: null
    });
      await attendance.save();
      
      return res.json({ 
        attendance,
        message: "Timer started successfully" 
      });
    }

    // Fallback: return the existing attendance
    res.json({ attendance });
    
  } catch (err) {
    console.error("Start error:", err);
    res.status(500).send("Server error");
  }
});


router.post("/end", authMiddleware, async (req, res) => {
  try {
    const attendance = await Attendance.findOne({
      user: req.user,
      isRunning: true
    }).sort({ startTime: -1 });

    if (!attendance) {
      return res.status(400).json({ msg: "No running attendance found" });
    }

    const endTime = new Date();
    const diffMs = endTime - attendance.startTime;

    const prevMs = parseDuration(attendance.duration);
    const totalMs = prevMs + diffMs;

    attendance.duration = formatDuration(totalMs);
   // attendance.startTime = null;
    attendance.isRunning = false;
    attendance.status = true;
    if (attendance.logs.length > 0) {
      attendance.logs[attendance.logs.length - 1].end = endTime;
    }

    await attendance.save();
    res.json({ attendance });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});



router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user).select("-password");
    const today = new Date().toISOString().slice(0, 10);

    let attendance = await Attendance.findOne({
      user: req.user,
      date: today
    }).sort({ startTime: -1 });
    res.json({ user, attendance });

    // If no attendance for today, create a default one (not running)
    if (!attendance) {
      attendance = new Attendance({
        user: req.user,
        date: today,
        duration: "00:00:00",
        isRunning: false,
        status: false
      });
      await attendance.save();
    }

    // ✅ CRITICAL FIX: Calculate REAL-TIME duration if attendance is running
    let currentDuration = attendance.duration;
    let elapsedSinceStart = 0;
    
    if (attendance.isRunning && attendance.startTime) {
      // Calculate how much time has passed since the timer started
      const now = new Date();
      elapsedSinceStart = now - new Date(attendance.startTime);
      const prevMs = parseDuration(attendance.duration);
      const totalMs = prevMs + elapsedSinceStart;
      currentDuration = formatDuration(totalMs);
    }

    res.json({ 
      attendance: {
        ...attendance.toObject(),
        // Send both the stored duration and the calculated current duration
        duration: attendance.duration,
        currentDuration: currentDuration,
        elapsedSinceStart: elapsedSinceStart  // For frontend accuracy
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});






function formatDuration(ms) {
  const sec = Math.floor(ms / 1000);
  const h = Math.floor(sec / 3600).toString().padStart(2, "0");
  const m = Math.floor((sec % 3600) / 60).toString().padStart(2, "0");
  const s = (sec % 60).toString().padStart(2, "0");
  return `${h}:${m}:${s}`;
}


router.get("/all", authMiddleware, async (req, res) => {
  try {
    const userId = req.user;
    
    // Get all attendance records for this user, sorted by date
    const attendanceRecords = await Attendance.find({
      user: userId
    })
    .sort({ date: -1 }) // Newest first
    .select("date duration status logs startTime endTime")
    .lean();

    // Format the data
    const formattedRecords = attendanceRecords.map(record => {
      // Calculate total duration from logs if available
      let totalDurationMs = 0;
      if (record.logs && record.logs.length > 0) {
        record.logs.forEach(log => {
          if (log.start && log.end) {
            totalDurationMs += new Date(log.end) - new Date(log.start);
          }
        });
      }

      // Use stored duration or calculate from logs
      const duration = record.duration || formatDuration(totalDurationMs);
      
      // Determine status
      let status = 'absent';
      if (record.status) {
        const hours = parseDuration(duration) / (60 * 60 * 1000);
        status = hours >= 8 ? 'present' : 'half-day';
      }

      return {
        id: record._id,
        date: new Date(record.date).toISOString().split('T')[0],
        startTime: record.logs && record.logs[0] ? record.logs[0].start : null,
        endTime: record.logs && record.logs[record.logs.length - 1] 
          ? record.logs[record.logs.length - 1].end 
          : null,
        duration: duration,
        status: status,
        totalSessions: record.logs ? record.logs.length : 0
      };
    });

    res.json({ 
      records: formattedRecords,
      total: formattedRecords.length
    });
  } catch (err) {
    console.error("Get all error:", err);
    res.status(500).send("Server error");
  }
});

/*
router.get("/me", authMiddleware, async (req, res) => {
  const today = new Date().toISOString().slice(0, 10);

  let attendance = await Attendance.findOne({ user: req.user, date: today });

  if (!attendance) {
    attendance = await Attendance.create({
      user: req.user,
      date: today,
      duration: 0,
      startTime: null
    });
  }

  res.json({ attendance });
});
*/

/*

router.get("/projectshow", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user).select("-password");

   
    const projects = await Project.find({
      user: req.user,
      
    });

    res.json(projects);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});
*/



router.get("/my-attendance", authMiddleware, async (req, res) => {
  try {
    const attendance = await Attendance.find({ user: req.user })
      .sort({ startTime: -1 })
      .lean();
    
    console.log(`Found ${attendance.length} total attendance records`);
    
    // Group records by date
    const groupedByDate = {};
    
    attendance.forEach(record => {
      if (!record.startTime) return;
      
      const date = new Date(record.startTime);
      const dateString = date.toISOString().split('T')[0];
      
      if (!groupedByDate[dateString]) {
        groupedByDate[dateString] = {
          records: [],
          totalDurationMs: 0,
          earliestStartTime: null,
          latestEndTime: null
        };
      }
      
      groupedByDate[dateString].records.push(record);
      
      // Calculate total duration
      if (record.endTime && record.startTime) {
        const durationMs = new Date(record.endTime) - new Date(record.startTime);
        groupedByDate[dateString].totalDurationMs += durationMs;
        
        // Track earliest start and latest end
        const startTime = new Date(record.startTime);
        const endTime = new Date(record.endTime);
        
        if (!groupedByDate[dateString].earliestStartTime || 
            startTime < groupedByDate[dateString].earliestStartTime) {
          groupedByDate[dateString].earliestStartTime = startTime;
        }
        
        if (!groupedByDate[dateString].latestEndTime || 
            endTime > groupedByDate[dateString].latestEndTime) {
          groupedByDate[dateString].latestEndTime = endTime;
        }
      }
    });
    
    // Format the data - one entry per day
    const formattedAttendance = Object.keys(groupedByDate).map(dateString => {
      const dayData = groupedByDate[dateString];
      const totalDurationMs = dayData.totalDurationMs;
      
      // Convert duration to HH:MM:SS format
      const hrs = Math.floor(totalDurationMs / 3600000);
      const mins = Math.floor((totalDurationMs % 3600000) / 60000);
      const sec = Math.floor((totalDurationMs % 60000) / 1000);
      const duration = `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
      
      // Determine status based on total duration
      const status = totalDurationMs > 0 ? 'present' : 'absent';
      
      return {
        id: dayData.records[0]?._id,
        date: dateString,
        startTime: dayData.earliestStartTime,
        endTime: dayData.latestEndTime,
        duration: duration,
        status: status,
        dayOfWeek: new Date(dateString).toLocaleDateString('en-US', { weekday: 'short' }),
        totalRecords: dayData.records.length,
        totalDurationMs: totalDurationMs
      };
    }).sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by date descending
    
    console.log(`Formatted into ${formattedAttendance.length} daily entries`);
    
    res.json(formattedAttendance);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// Get calendar view for specific month/year
// In your attendance.js backend - Update the calendar route
router.get("/calendar", authMiddleware, async (req, res) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const month = parseInt(req.query.month) || new Date().getMonth() + 1;
    
    console.log(`Calendar request: year=${year}, month=${month}`);
    
    // Create date range for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);
    
    // Get total days in month
    const daysInMonth = new Date(year, month, 0).getDate();
    console.log(`Days in month: ${daysInMonth}`);
    
    // Get all attendance records for this month
    const attendanceRecords = await Attendance.find({
      user: req.user,
      startTime: {
        $gte: startDate,
        $lte: endDate
      },
      endTime: { $ne: null } // Only count completed sessions
    }).lean();
    
    console.log(`Found ${attendanceRecords.length} attendance records for this month`);
    
    // Get unique dates where user worked (completed at least one session)
    const uniqueWorkDates = new Set();
    const attendanceByDate = {};
    
    attendanceRecords.forEach(record => {
      if (!record.startTime || !record.endTime) return;
      
      const date = new Date(record.startTime);
      const dateString = date.toISOString().split('T')[0];
      
      // Mark this date as worked (1 present per day, regardless of sessions)
      uniqueWorkDates.add(dateString);
      
      if (!attendanceByDate[dateString]) {
        attendanceByDate[dateString] = {
          records: [],
          totalDurationMs: 0,
          earliestStartTime: null,
          latestEndTime: null
        };
      }
      
      attendanceByDate[dateString].records.push(record);
      
      // Calculate total duration for this date
      const durationMs = new Date(record.endTime) - new Date(record.startTime);
      attendanceByDate[dateString].totalDurationMs += durationMs;
      
      // Track earliest start and latest end times
      const startTime = new Date(record.startTime);
      const endTime = new Date(record.endTime);
      
      if (!attendanceByDate[dateString].earliestStartTime || 
          startTime < attendanceByDate[dateString].earliestStartTime) {
        attendanceByDate[dateString].earliestStartTime = startTime;
      }
      
      if (!attendanceByDate[dateString].latestEndTime || 
          endTime > attendanceByDate[dateString].latestEndTime) {
        attendanceByDate[dateString].latestEndTime = endTime;
      }
    });
    
    // Create calendar grid
    const firstDayOfMonth = new Date(year, month - 1, 1).getDay();
    
    const calendar = [];
    let week = [];
    
    // Add empty cells for days before the first day of month
    for (let i = 0; i < firstDayOfMonth; i++) {
      week.push({ day: null, attendance: null });
    }
    
    // Add days with attendance data
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const dateString = date.toISOString().split('T')[0];
      const isToday = dateString === new Date().toISOString().split('T')[0];
      
      let dayAttendance = null;
      
      if (attendanceByDate[dateString]) {
        const dayData = attendanceByDate[dateString];
        
        // Convert total duration to HH:MM:SS format
        const totalDurationMs = dayData.totalDurationMs;
        const hrs = Math.floor(totalDurationMs / 3600000);
        const mins = Math.floor((totalDurationMs % 3600000) / 60000);
        const sec = Math.floor((totalDurationMs % 60000) / 1000);
        const duration = `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
        
        // Mark as present (1 per day, regardless of sessions)
        dayAttendance = {
          id: dayData.records[0]?._id,
          startTime: dayData.earliestStartTime,
          endTime: dayData.latestEndTime,
          duration: duration,
          status: 'present',
          totalRecords: dayData.records.length,
          totalDurationMs: totalDurationMs
        };
      } else {
        // No completed attendance record for this day - mark as absent
        dayAttendance = {
          status: 'absent',
          totalRecords: 0,
          totalDurationMs: 0
        };
      }
      
      week.push({
        day,
        date: dateString,
        attendance: dayAttendance,
        isToday
      });
      
      if (week.length === 7) {
        calendar.push(week);
        week = [];
      }
    }
    
    // Add empty cells for remaining days
    if (week.length > 0) {
      while (week.length < 7) {
        week.push({ day: null, attendance: null });
      }
      calendar.push(week);
    }
    
    // Calculate stats - 1 present per day where user worked
    const presentDays = uniqueWorkDates.size;
    const absentDays = daysInMonth - presentDays;
    
    console.log(`Stats: present=${presentDays}, absent=${absentDays}, total=${daysInMonth}`);
    
    res.json({
      year,
      month,
      calendar,
      totalPresent: presentDays,
      totalAbsent: absentDays,
      totalDays: daysInMonth
    });
    
  } catch (err) {
    console.error('Calendar route error:', err);
    res.status(500).json({ 
      error: "Server error", 
      details: err.message
    });
  }
});
// Mark attendance manually (for admin/HR)
router.post("/mark", authMiddleware, async (req, res) => {
  try {
    const { date, status } = req.body;
    
    // Check if user is admin (add this logic based on your user model)
    const user = await User.findById(req.user);
    if (!user.isAdmin) {
      return res.status(403).json({ msg: "Not authorized" });
    }
    
    const attendance = await Attendance.findOneAndUpdate(
      { 
        user: req.body.userId || req.user,
        startTime: {
          $gte: new Date(date + 'T00:00:00'),
          $lt: new Date(date + 'T23:59:59')
        }
      },
      {
        status: status === 'present' || status === 'half-day',
        halfDay: status === 'half-day'
      },
      { new: true, upsert: true }
    );
    
    res.json({ msg: "Attendance marked", attendance });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

export default router;
