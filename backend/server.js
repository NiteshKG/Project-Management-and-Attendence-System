import express from "express";
import {Server} from "socket.io";
import http from "http";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import attendanceRoute from "./routes/attendance.js";
import projectRoutes from "./routes/project.js";
import Message from "./models/Message.js";

dotenv.config();
connectDB();
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:4200",
    methods: ["GET", "POST"]
  }
});
app.use(express.json());
app.use(cors());
app.use('/api/auth', authRoutes);
app.use('/api/attendance',attendanceRoute);
app.use('/api/projects', projectRoutes);

io.on('connection', (socket) =>{
    console.log('User connected',socket.id);
   
    socket.on("join-project", async (projectId) =>{
        socket.join(projectId);
        console.log('Socket ${socket.id} joined project ${projectId}');

       const messages = await Message.find({projectId})
      .sort({ createdAt: 1 })
      .limit(100);

    socket.emit("previousMessages", messages);
    });

   socket.on("sendMessage", async (data) => {
    try {
      const message = await Message.create(data); 
      io.to(data.projectId).emit("newMessage", message);  
      console.log("Received message:", data);
           
    } catch (err) {
      console.error("Message save error:", err.message);
    }
 });


   socket.on("disconnect", ()=>{
    console.log("User disconnected", socket.id);
   });

} );

app.use((err, req, res, next) => {
    console.error("GLOBAL ERROR:", err);
    res.status(500).json({ error: "Server error" });
});




server.listen(5000,() =>{console.log('Server is running on port 5000')});