// middleware/softDelete.middleware.js
// This middleware automatically filters out deleted items from queries

const filterDeleted = (schema) => {
  // Add static method to find non-deleted items
  schema.statics.findActive = function(conditions = {}) {
    return this.find({ ...conditions, isDeleted: false });
  };
  
  schema.statics.findOneActive = function(conditions = {}) {
    return this.findOne({ ...conditions, isDeleted: false });
  };
  
  // Add query helper for tasks
  if (schema.path('tasks')) {
    schema.methods.getActiveTasks = function() {
      return this.tasks.filter(task => !task.isDeleted);
    };
    
    schema.methods.getDeletedTasks = function() {
      return this.tasks.filter(task => task.isDeleted);
    };
  }
  
  // Pre-find hook to filter out deleted items
  schema.pre('find', function() {
    if (!this.getOptions().includeDeleted) {
      this.where({ isDeleted: false });
    }
  });
  
  schema.pre('findOne', function() {
    if (!this.getOptions().includeDeleted) {
      this.where({ isDeleted: false });
    }
  });
};

export default filterDeleted;