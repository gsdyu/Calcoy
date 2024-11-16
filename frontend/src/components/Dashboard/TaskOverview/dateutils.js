// Utility functions for transforming task data from database into the required format
export const transformTaskData = (tasks, timeFrame, selectedDate) => {
  switch (timeFrame) {
    case 'week':
      return transformWeeklyTasks(tasks, selectedDate);
    case 'month':
      return transformMonthlyTasks(tasks, selectedDate);
    case 'year':
      return transformYearlyTasks(tasks, selectedDate);
    default:
      return [];
  }
};

// Helper to check if a date is the same day
const isSameDay = (date1, date2) => {
  return date1.getDate() === date2.getDate() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getFullYear() === date2.getFullYear();
};

// Helper to categorize tasks for a specific day
const categorizeTasks = (tasks, targetDate) => {
  const now = new Date();
  
  return tasks.reduce((acc, task) => {
    const taskDate = new Date(task.start_time);
    
    // Only process tasks for the target date
    if (!isSameDay(taskDate, targetDate)) return acc;
    
    if (task.completed) {
      acc.completed++;
    } else if (taskDate < now) {
      acc.missed++;
    } else {
      acc.upcoming++;
    }
    
    return acc;
  }, { completed: 0, missed: 0, upcoming: 0 });
};

const transformWeeklyTasks = (tasks, selectedDate) => {
  const startOfWeek = new Date(selectedDate);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Start from Sunday
  
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => {
    const currentDate = new Date(startOfWeek);
    currentDate.setDate(currentDate.getDate() + index);
    
    const { completed, missed, upcoming } = categorizeTasks(tasks, currentDate);
    
    return {
      name: day,
      completed,
      missed,
      upcoming
    };
  });
};

const transformMonthlyTasks = (tasks, selectedDate) => {
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  return Array.from({ length: daysInMonth }, (_, i) => {
    const currentDate = new Date(year, month, i + 1);
    const { completed, missed, upcoming } = categorizeTasks(tasks, currentDate);
    
    return {
      day: i + 1,
      completed,
      missed,
      upcoming
    };
  });
};

const transformYearlyTasks = (tasks, selectedDate) => {
  const year = selectedDate.getFullYear();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  return months.map((monthName, monthIndex) => {
    // Get all tasks for this month
    const monthTasks = tasks.filter(task => {
      const taskDate = new Date(task.start_time);
      return taskDate.getFullYear() === year && taskDate.getMonth() === monthIndex;
    });
    
    // Calculate totals for the month
    const totals = monthTasks.reduce((acc, task) => {
      const taskDate = new Date(task.start_time);
      const now = new Date();
      
      if (task.completed) {
        acc.completed++;
      } else if (taskDate < now) {
        acc.missed++;
      } else {
        acc.upcoming++;
      }
      
      return acc;
    }, { completed: 0, missed: 0, upcoming: 0 });
    
    return {
      name: monthName,
      ...totals,
      totalUsers: monthTasks.length 
    };
  });
};

export const getWeekNumber = (d) => {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return { week: weekNo, year: d.getUTCFullYear() };
};