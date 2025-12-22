import express from "express";
import Project from "../models/Project.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware , async (req,res) =>{
    try{
     const project = await Project.create({...req.body, user: req.user})
     res.json(project);

    }catch(err){
     res.status(500).json({error: err.message });
    }
})

router.get("/", authMiddleware ,async (req,res) =>{
    try{
     const projects = await Project.find({user: req.user});
     res.json(projects);
    }catch(err){
        res.status(500).json({error: err.message });
    }
})

router.get("/:id", authMiddleware ,async(req,res) =>{
    try{

    const project = await Project.findOne({
        _id: req.params.id,
        userId: req.UserId,
    });
    res.json(project);

    }catch(err){
        res.status(500).json({error: err.message});
    }
})

router.put("/:id", authMiddleware ,async (req,res) =>{

    try{
   const project = await Project.findByIdAndUpdate(
    req.params.id,
    req.body,
    {new: true}
   );
   res.json(project);

    }catch(err){
      res.status(500).json({error: err.message});
    }
})

router.delete("/:id", authMiddleware ,async (req,res) =>{
    try{
     await Project.findByIdAndDelete(req.params.id);
     res.json({msg: "Project deleted"});

    }catch(err){
       res.status(500).json({error: err.message});
    }
})

router.post("/:projectId/tasks", authMiddleware ,async (req,res) =>{
    try{
     const project = await Project.findById(req.params.projectId);
     const newTask = {
      title: req.body.title,
      description: req.body.description,
      logs: [],
      isRunning: false,
      runningLogId: null

     };
     project.tasks.push(newTask);
     await project.save();
     res.json(project);

    }catch(err){
        res.status(500).json({error: err.message});
    }
})

router.post("/:projectId/tasks/:taskId/start", authMiddleware ,async (req,res) =>{
    try{
    const project = await Project.findById(req.params.projectId);
    const task = project.tasks.id(req.params.taskId);
    const log = {
      startTime: new Date(),
      endTime: null,
      duration: 0
    };
    tasks.logs.push(log);
    task.isRunning = true;
    task.runningLogId = task.logs[task.logs.length - 1]._id;
    await project.save();
    res.json({message: "Timer Started"});

    }catch(err){
        res.status(500).json({error: err.message});
    }
})

router.post("/:projectId/tasks/:taskId/stop" , authMiddleware ,async(req,res) =>{
    try{
    const project = await Project.findById(req.params.projectId);
    const task = project.tasks.id(req.params.taskId);
    const runningLog = task.logs.id(task.runningLogId);

    const endTime = new Date();
    const durationMs = endTime - runningLog.startTime;
    const hrs = Math.floor(durationMs / 3600000);
    const mins = Math.floor((durationMs % 3600000) / 60000);
    const sec = Math.floor((durationMs % 60000) / 1000);

    runningLog.endTime = new Date();
    runningLog.duration = `${hrs.toString().padStart(2,'0')}:${mins.toString().padStart(2,'0')}:${sec.toString().padStart(2,'0')}`;
    task.isRunning = false;
    task.runningLogId = null;

    await project.save();

    res.json({message: "Timer stopped"});

    }catch(err){
        res.status(500).json({error: err.message});
    }
})

router.get("/:projectId/tasks/:taskId/logs" , authMiddleware ,async (req,res) =>{
    try{
    const project = await Project.findById(req.params.projectId);
    const task = project.tasks.id(req.params.taskId);
    res.json(task.logs);

    }catch(err){
        res.status(500).json({error: err.message});
    }
})

router.get("/:projectId/running-task", authMiddleware, async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);

    const runningTask = project.tasks.find(t => t.isRunning);

    res.json(runningTask || null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


export default router;