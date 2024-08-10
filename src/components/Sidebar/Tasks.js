import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const Tasks = () => {
  const { darkMode } = useTheme();
  const [tasks, setTasks] = React.useState([
    { id: 1, title: "Complete project proposal", done: false },
    { id: 2, title: "Schedule team meeting", done: true },
    { id: 3, title: "Review client feedback", done: false }
  ]);

  const toggleTask = (id) => {
    setTasks(tasks.map(task => 
      task.id === id ? {...task, done: !task.done} : task
    ));
  };

  return (
    <div className={`p-4 border-t ${darkMode ? 'border-gray-600' : 'border-gray-300'}`}>
      <h3 className={`text-sm font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>Tasks</h3>
      {tasks.map(task => (
        <div key={task.id} className="flex items-center space-x-2 mb-2">
          <input 
            type="checkbox" 
            checked={task.done} 
            onChange={() => toggleTask(task.id)}
            className={`form-checkbox h-4 w-4 ${darkMode ? 'text-blue-600' : 'text-blue-500'}`}
          />
          <span className={task.done ? `line-through ${darkMode ? 'text-gray-400' : 'text-gray-500'}` : ''}>{task.title}</span>
        </div>
      ))}
    </div>
  );
};

export default Tasks;