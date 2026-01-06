import mongoose from "mongoose";


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


}, { timestamps: true });



export default mongoose.model("Project", ProjectSchema);
