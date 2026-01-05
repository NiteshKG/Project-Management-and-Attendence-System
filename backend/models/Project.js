import mongoose from "mongoose";
import filterDeleted from '../middleware/softDeleteMiddleware.js';

const TimeLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
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
  logs: [TimeLogSchema],

  isDeleted: { type: Boolean, default: false },
  deletedAt: Date,
  deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  deletedReason: String,
  willPermanentlyDelete: { 
    type: Date, 
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
  }
});

const ProjectSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  name: String,
  description: String,
  deadline: Date,
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  manager: {type: mongoose.Schema.Types.ObjectId,
    ref: "User"},
  tasks: [TaskSchema],

   isDeleted: { type: Boolean, default: false },
  deletedAt: Date,
  deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  deletedReason: String,
  willPermanentlyDelete: { 
    type: Date, 
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  }

}, { timestamps: true });

filterDeleted(ProjectSchema);


ProjectSchema.index({ isDeleted: 1, willPermanentlyDelete: 1 });
ProjectSchema.index({ 'tasks.isDeleted': 1, 'tasks.willPermanentlyDelete': 1 });

export default mongoose.model("Project", ProjectSchema);
