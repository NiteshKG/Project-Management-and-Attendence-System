import express from "express";
import Message from "../models/Message.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware , async (req,res) =>{
    try{
     const message = await Message.create({...req.body})
     res.json(message);

    }catch(err){
     res.status(500).json({error: err.message });
    }
})

router.get("/", authMiddleware ,async (req,res) =>{
    try{
     const messages = await Message.find();
     res.json(messages);
    }catch(err){
        res.status(500).json({error: err.message });
    }
})