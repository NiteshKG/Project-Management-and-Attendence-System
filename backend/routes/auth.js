import express from "express";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post('/register', async (req,res) =>{
    const { fullName, userName, password, address } = req.body;
   try{
  let user = await User.findOne({userName});
  if(user){
    return res.status(400).json({msg:"User already exists"});
  }
  const hashed = await bcrypt.hash(password,10);
  user = await User.create({
    fullName, userName, password: hashed, address
  });
   res.status(201).json({ msg: "Registered Successfully", user });

   }catch(err){
   console.log("REGISTER ERROR:", err);
  res.status(500).json({ error: err.message });
   }

} )

router.post('/login', async (req, res) => {
    const { userName, password } = req.body;

    try {
        
        const user = await User.findOne({ userName });

        if (!user) {
            return res.status(400).json({ msg: "Invalid Username" });
        }

        
        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.status(400).json({ msg: "Wrong password" });
        }

        
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({
            msg: "Login Successful",
            token,
            user: {
                fullName: user.fullName,
                userName: user.userName,
                address: user.address
            }
        });

    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).send("Server error");
    }
});

router.get("/loggeduser", authMiddleware, async (req, res) => {
  try {
    console.log("Logged-in user id:", req.user);
    const user = await User.findById(req.user).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/users", authMiddleware, async (req, res) => {
  try {
    const users = await User.find().select("_id fullName userName");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
});




export default router;