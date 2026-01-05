import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    startTime: { type: Date },
    endTime: { type: Date },
    duration: { type: String },
    
    isRunning: { type: Boolean, default: false },
    status: { type: Boolean },
    date: { type: Date, default: Date.now },
    logs: [
    {
      start: Date,
      end: Date
    }
  ]
});

export default mongoose.model("Attendance", attendanceSchema);
