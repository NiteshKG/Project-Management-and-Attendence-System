import mongoose from "mongoose";

const TimeLogSchema = new mongoose.Schema({
  startTime: Date,
  endTime: Date,
  duration: Number
});

const TaskSchema = new mongoose.Schema({
  title: String,
  description: String,
  isRunning: { type: Boolean, default: false },
  status: String,
  startTime: Date,
  totalTime: { type: Number, default: 0 },
  logs: [TimeLogSchema]
});

const ProjectSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  name: String,
  description: String,
  deadline: Date,
  manager: String,
  tasks: [TaskSchema]
}, { timestamps: true });

export default mongoose.model("Project", ProjectSchema);
