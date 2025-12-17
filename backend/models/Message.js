import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    senderName: {type: String},
    message: { type: String, required: true },
    
    createdAt: {
    type: Date,
    default: Date.now
  }
},);

export default mongoose.model("Message", messageSchema);
