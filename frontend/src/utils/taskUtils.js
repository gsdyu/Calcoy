// frontend/src/utils/taskUtils.js

// Filter tasks for today
export const getTodayTasks = (tasks) => {
    const today = new Date().toDateString();
    return tasks.filter((task) => new Date(task.date).toDateString() === today);
  };
  
  // Sort tasks by time (assuming task.time is a string like "14:30")
  export const sortTasksByTime = (tasks) => {
    return tasks.sort((a, b) => new Date(`1970-01-01T${a.time}:00Z`) - new Date(`1970-01-01T${b.time}:00Z`));
  };
  