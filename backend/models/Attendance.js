import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    startTime: { type: Date },
    endTime: { type: Date },
    duration: { type: String },
    status: { type: Boolean },
    date: { type: Date, default: Date.now }
});

export default mongoose.model("Attendance", attendanceSchema);
