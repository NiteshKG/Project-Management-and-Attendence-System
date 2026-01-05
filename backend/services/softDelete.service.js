
import Project from '../models/Project.js';

class SoftDeleteService {
  
  
  async softDeleteProject(projectId, userId, reason = '') {
    const project = await Project.findById(projectId);
    
    if (!project) {
      throw new Error('Project not found');
    }
    
    project.isDeleted = true;
    project.deletedAt = new Date();
    project.deletedBy = userId;
    project.deletedReason = reason;
    project.willPermanentlyDelete = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    
    await project.save();
    
    return project;
  }
  
  // Soft delete a task within a project
  async softDeleteTask(projectId, taskId, userId, reason = '') {
    const project = await Project.findOne({ _id: projectId });
    
    if (!project) {
      throw new Error('Project not found');
    }
    
    const taskIndex = project.tasks.findIndex(task => 
      task._id.toString() === taskId && !task.isDeleted
    );
    
    if (taskIndex === -1) {
      throw new Error('Task not found');
    }
    
    project.tasks[taskIndex].isDeleted = true;
    project.tasks[taskIndex].deletedAt = new Date();
    project.tasks[taskIndex].deletedBy = userId;
    project.tasks[taskIndex].deletedReason = reason;
    project.tasks[taskIndex].willPermanentlyDelete = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    
    await project.save();
    
    return project.tasks[taskIndex];
  }
  
  // Soft delete a time log within a task
  async softDeleteTimeLog(projectId, taskId, logId, userId) {
    const project = await Project.findOne({ _id: projectId });
    
    if (!project) {
      throw new Error('Project not found');
    }
    
    const task = project.tasks.find(t => 
      t._id.toString() === taskId && !t.isDeleted
    );
    
    if (!task) {
      throw new Error('Task not found');
    }
    
    const logIndex = task.logs.findIndex(log => 
      log._id.toString() === logId && !log.isDeleted
    );
    
    if (logIndex === -1) {
      throw new Error('Time log not found');
    }
    
    task.logs[logIndex].isDeleted = true;
    task.logs[logIndex].deletedAt = new Date();
    
    await project.save();
    
    return task.logs[logIndex];
  }
  
  // Restore a project
  async restoreProject(projectId, userId) {
    const project = await Project.findById(projectId);
    
    if (!project) {
      throw new Error('Project not found');
    }
    
    project.isDeleted = false;
    project.deletedAt = null;
    project.deletedBy = null;
    project.deletedReason = '';
    project.willPermanentlyDelete = null;
    
    await project.save();
    
    return project;
  }
  
  // Restore a task
  async restoreTask(projectId, taskId, userId) {
    const project = await Project.findOne({ _id: projectId });
    
    if (!project) {
      throw new Error('Project not found');
    }
    
    const taskIndex = project.tasks.findIndex(task => 
      task._id.toString() === taskId && task.isDeleted
    );
    
    if (taskIndex === -1) {
      throw new Error('Task not found or not deleted');
    }
    
    project.tasks[taskIndex].isDeleted = false;
    project.tasks[taskIndex].deletedAt = null;
    project.tasks[taskIndex].deletedBy = null;
    project.tasks[taskIndex].deletedReason = '';
    project.tasks[taskIndex].willPermanentlyDelete = null;
    
    await project.save();
    
    return project.tasks[taskIndex];
  }
  
  // Restore a time log
  async restoreTimeLog(projectId, taskId, logId, userId) {
    const project = await Project.findOne({ _id: projectId });
    
    if (!project) {
      throw new Error('Project not found');
    }
    
    const task = project.tasks.find(t => 
      t._id.toString() === taskId && !t.isDeleted
    );
    
    if (!task) {
      throw new Error('Task not found');
    }
    
    const logIndex = task.logs.findIndex(log => 
      log._id.toString() === logId && log.isDeleted
    );
    
    if (logIndex === -1) {
      throw new Error('Time log not found or not deleted');
    }
    
    task.logs[logIndex].isDeleted = false;
    task.logs[logIndex].deletedAt = null;
    
    await project.save();
    
    return task.logs[logIndex];
  }
  
  // Get all deleted projects for a user
 // Get all deleted projects for a user
async getDeletedProjects(userId) {
  console.log('getDeletedProjects called with userId:', userId);
  
  // Make sure userId is a string
  const userString = userId.toString ? userId.toString() : userId;
  
  console.log('Searching for projects where:');
  console.log('- user:', userString);
  console.log('- manager:', userString); 
  console.log('- members includes:', userString);
  console.log('- deletedBy:', userString);
  
  const deletedProjects = await Project.find({
    $or: [
      { user: userString },
      { manager: userString },
      { members: userString },
      { deletedBy: userString } 
    ],
    isDeleted: true,
    willPermanentlyDelete: { $gt: new Date() }
  })
  .populate("members", "fullName userName")
  .populate("manager", "fullName userName")
  .populate("deletedBy", "fullName userName")
  .sort({ deletedAt: -1 });
  
  console.log('Found deleted projects:', deletedProjects.length);
  console.log('Projects found:', deletedProjects.map(p => ({
    id: p._id,
    name: p.name,
    user: p.user,
    manager: p.manager,
    members: p.members,
    deletedBy: p.deletedBy
  })));
  
  return deletedProjects;
}
  // Get all deleted tasks within a project
  async getDeletedTasks(projectId, userId) {
    const project = await Project.findOne({
      _id: projectId,
      $or: [
        { user: userId },
        { manager: userId },
        { members: userId }
      ]
    });
    
    if (!project) {
      throw new Error('Project not found or no access');
    }
    
    return project.tasks.filter(task => 
      task.isDeleted && task.willPermanentlyDelete > new Date()
    );
  }
  
  // Get all deleted time logs within a task
  async getDeletedTimeLogs(projectId, taskId, userId) {
    const project = await Project.findOne({
      _id: projectId,
      $or: [
        { user: userId },
        { manager: userId },
        { members: userId }
      ]
    });
    
    if (!project) {
      throw new Error('Project not found or no access');
    }
    
    const task = project.tasks.find(t => 
      t._id.toString() === taskId
    );
    
    if (!task) {
      throw new Error('Task not found');
    }
    
    return task.logs.filter(log => log.isDeleted);
  }
  
  // Permanently delete expired items
  async permanentlyDeleteExpiredItems() {
    const now = new Date();
    
    // Find projects that should be permanently deleted
    const expiredProjects = await Project.find({
      isDeleted: true,
      willPermanentlyDelete: { $lte: now }
    });
    
    for (const project of expiredProjects) {
      // Actually delete the project
      await Project.findByIdAndDelete(project._id);
    }
    
    // For projects not expired, clean up expired tasks
    const projects = await Project.find({
      isDeleted: false,
      'tasks.isDeleted': true,
      'tasks.willPermanentlyDelete': { $lte: now }
    });
    
    for (const project of projects) {
      // Remove expired tasks
      project.tasks = project.tasks.filter(task => 
        !task.isDeleted || task.willPermanentlyDelete > now
      );
      await project.save();
    }
    
    return {
      projectsDeleted: expiredProjects.length,
      tasksCleaned: projects.length
    };
  }
  
  // Force delete (bypass soft delete) - Admin only
  async forceDeleteProject(projectId) {
    return await Project.findByIdAndDelete(projectId);
  }
}

export default new SoftDeleteService();