// This is temp since I want to see example data
// Simple seeded random number generator
const seededRandom = (seed) => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };
  
  export const generateData = (timeFrame, year, month) => {
    // Use the year, month, and timeFrame as a seed
    let seed = year * 10000 + month * 100 + (timeFrame === 'week' ? 1 : timeFrame === 'month' ? 2 : 3);
  
    const generateNumber = (max) => Math.floor(seededRandom(seed++) * max);
  
    switch (timeFrame) {
      case 'week':
        return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => ({
          name: day,
          completed: generateNumber(10),
          missed: generateNumber(5),
          upcoming: generateNumber(7)
        }));
      case 'month':
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        return Array.from({ length: daysInMonth }, (_, i) => ({
          day: i + 1,
          completed: generateNumber(5),
          missed: generateNumber(3),
          upcoming: generateNumber(4)
        }));
      case 'year':
        return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(month => ({
          name: month,
          completed: generateNumber(100),
          missed: generateNumber(50),
          upcoming: generateNumber(75)
        }));
      default:
        return [];
    }
  };
  
  export const getWeekNumber = (d) => {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return { week: weekNo, year: d.getUTCFullYear() };
  };