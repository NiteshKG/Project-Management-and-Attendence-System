import express from "express";
import Project from "../models/Project.js";
import DeletedProject from "../models/DeletedProject.js";
import Attendance from "../models/Attendance.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import mongoose from "mongoose";
import softDeleteService from "../services/softDelete.service.js"; 

const router = express.Router();

router.post("/", authMiddleware , async (req,res) =>{
    try{
     const project = await Project.create({...req.body, user: req.user})
     res.json(project);

    }catch(err){
     res.status(500).json({error: err.message });
    }
})

router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user;

    const projects = await Project.find({
      $or: [
        { manager: userId },
        { members: userId }
      ]
      
      
    })
    .populate("members", "fullName userName")
    .populate("manager", "fullName userName");

    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get("/deleted", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    
    
    const deletedProjects = await DeletedProject.find({});
    
    
    const result = deletedProjects.map(doc => ({
      originalDeletedDocId: doc._id,
      name: doc.originalProject?.name,
      description: doc.originalProject?.description,
      user: doc.originalProject?.user,
      manager: doc.originalProject?.manager,
      members: doc.originalProject?.members,
      tasks: doc.originalProject?.tasks,
      deletedAt: doc.deletedAt,
      deleteReason: doc.deleteReason
    }));
    
    res.json(result);
    
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



router.get("/:id", authMiddleware, async(req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        
        const project = await Project.findById(req.params.id);
        
        if (!project) {
            return res.status(404).json({ error: "Project not found" });
        }
        
        res.json(project);

    } catch(err) {
        res.status(500).json({ error: err.message });
    }
});


/*
router.get("/:id", authMiddleware ,async(req,res) =>{
    try{
      const userId = req.user.id || req.user._id;
    const project = await Project.findOne({
        _id: req.params.id,
        user: userId,
       
       
       
    });

     

    res.json(project);

    }catch(err){
        res.status(500).json({error: err.message});
    }
})
    */

router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const updateData = {};

    // Basic fields
    if (req.body.name !== undefined) updateData.name = req.body.name;
    if (req.body.manager !== undefined) updateData.manager = req.body.manager;
    if (req.body.deadline !== undefined) updateData.deadline = req.body.deadline;

    
    if (Array.isArray(req.body.members)) {
      updateData.members = req.body.members;
    }

    // Tasks (keep your existing logic)
    if (Array.isArray(req.body.tasks)) {
      updateData.tasks = req.body.tasks.map(task => ({
        ...task,
        totalTime: task.totalTime || 0
      }));
    }

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      updateData,
      
      { new: true }
    );

    res.json(project);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});





router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }
    
   
    const deletedProject = new DeletedProject({
      originalProject: project.toObject(), 
      deletedBy: req.user.id,
      deleteReason: req.body.reason || 'No reason provided'
    });
    
    await deletedProject.save();
    
    
    await Project.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: "Project deleted and moved to trash",
      deletedProjectId: deletedProject._id,
      originalProjectName: project.name
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
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

/*
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
    */
/*
router.post("/:projectId/tasks/:taskId/start", authMiddleware, async (req, res) => {
  const project = await Project.findById(req.params.projectId);
  const task = project.tasks.id(req.params.taskId);

  
  const alreadyRunning = task.logs.find(
    l => l.user.toString() === req.user && !l.endTime
  );

  if (alreadyRunning) {
    return res.status(400).json({ message: "Task already running" });
  }

  task.logs.push({
    user: req.user,
    startTime: new Date(),
    endTime: null,
    durationMs: 0
  });

  await project.save();

  
  await startAttendanceIfNotRunning(req.user);

  res.json({ message: "Task timer started" });
});


/*
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
    */
   /*

router.post("/:projectId/tasks/:taskId/stop", authMiddleware, async (req, res) => {
  const project = await Project.findById(req.params.projectId);
  const task = project.tasks.id(req.params.taskId);

  const log = task.logs.find(
    l => l.user.toString() === req.user && !l.endTime
  );

  if (!log) {
    return res.status(400).json({ message: "No running timer found" });
  }

  const end = new Date();
  log.endTime = end;
  log.durationMs = end - log.startTime;

  await project.save();

  
  await stopAttendanceIfNoRunningTasks(req.user);

  res.json({ message: "Task timer stopped" });
});


router.get("/:projectId/tasks/:taskId/logs" , authMiddleware ,async (req,res) =>{
    try{
    const project = await Project.findById(req.params.projectId);
    const task = project.tasks.id(req.params.taskId);
    res.json(task.logs);

    }catch(err){
        res.status(500).json({error: err.message});
    }
})
*/
router.get("/:projectId/running-task", authMiddleware, async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);

    const runningTask = project.tasks.find(t => t.isRunning);

    res.json(runningTask || null);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});





router.post("/trash/projects/:id/restore", authMiddleware, async (req, res) => {
  try {
    
    const deletedDoc = await DeletedProject.findById(req.params.id);
    
    if (!deletedDoc) {
      return res.status(404).json({ error: "Deleted project not found" });
    }
    
    
    const newProject = new Project(deletedDoc.originalProject);
    
    
    
    await newProject.save();
    
    
    await DeletedProject.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: "Project restored successfully",
      project: newProject
    });
    
  } catch (err) {
    console.error("Restore error:", err);
    res.status(500).json({ error: err.message });
  }
});




router.delete("/trash/projects/:id/permanent", authMiddleware, async (req, res) => {
  try {
    
    const deletedDoc = await DeletedProject.findByIdAndDelete(req.params.id);
    
    if (!deletedDoc) {
      return res.status(404).json({ error: "Project not found in trash" });
    }
    
    res.json({
      success: true,
      message: "Project permanently deleted from trash",
      projectName: deletedDoc.originalProject?.name
    });
    
  } catch (err) {
    console.error("Permanent delete error:", err);
    res.status(500).json({ error: err.message });
  }
});


async function startAttendanceIfNotRunning(userId) {
  const today = new Date().toISOString().slice(0, 10);

  let attendance = await Attendance.findOne({ user: req.user, date: today });

  if (!attendance) {
    attendance = await Attendance.create({
      user: req.user,
      date: today,
      duration: 0,
      startTime: new Date()
    });
    return;
  }

  if (!attendance.startTime) {
    attendance.startTime = new Date();
    await attendance.save();
  }
}

async function stopAttendanceIfNoRunningTasks(userId) {
  const hasRunningTask = await Project.exists({
    "tasks.logs": {
      $elemMatch: {
        user: userId,
        endTime: null
      }
    }
  });

  if (hasRunningTask) return;

  const today = new Date().toISOString().slice(0, 10);
  const attendance = await Attendance.findOne({ user: userId, date: today });

  if (attendance?.runningStartTime) {
    attendance.duration += Date.now() - attendance.startTime;
    attendance.startTime = null;
    await attendance.save();
  }
}









export default router;