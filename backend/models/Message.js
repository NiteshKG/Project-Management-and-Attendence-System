import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    senderName: {type: String},
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
    message: { type: String, required: true },
    
    createdAt: {
    type: Date,
    default: Date.now
  }
},);

export default mongoose.model("Message", messageSchema);
