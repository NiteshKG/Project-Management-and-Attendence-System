
import mongoose from "mongoose";

const DeletedProjectSchema = new mongoose.Schema({
  
  originalProject: mongoose.Schema.Types.Mixed, 
  
  
  deletedAt: {
    type: Date,
    default: Date.now
  },
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  deleteReason: String,
  
  
  willAutoDeleteAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) 
  }
}, { timestamps: true });

export default mongoose.model('DeletedProject', DeletedProjectSchema);