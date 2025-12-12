import mongoose from "mongoose";


const UserSchema = new mongoose.Schema({
    fullName: {type: String, required: true},
    userName: { 
    type: String, 
    required: true, 
    unique: true,
    
    trim: true,
    lowercase: true,
    minLength: 1  
  },
    password: {type: String, required: true},
    address: {type: String},
});

export default mongoose.model('User', UserSchema);