import React, { useEffect, useState } from 'react';
import { CalendarPlus, Calendar, Sparkles, Clock } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

const AiPromptExamples = ({ onExampleClick, visible }) => {
const { darkMode } = useTheme();

  if (!visible) return null;

  const [isBoxVisible, setIsBoxVisible] = useState([false, false]);
  const [visiblePrompts, setVisiblePrompts] = useState([]);

  const createEventExamples = [
    {
      text: "Create a new event. I am meeting with Justin to discuss the project tomorrow at 2pm for 1 hour",
      icon: <CalendarPlus className="w-5 h-5" />
    },
    {
      text: "Create a new event. I am ",
      icon: <CalendarPlus className="w-5 h-5" />
    }
  ];

  const scheduleExamples = [
    {
      text: "What events do I have scheduled for next week?",
      icon: <Calendar className="w-5 h-5" />
    },
    {
      text: "Show me my upcoming tasks for this week",
      icon: <Calendar className="w-5 h-5" />
    },
    {
      text: "Do I have any free time this week?",
      icon: <Clock className="w-5 h-5" />
    }
  ];

  useEffect(() => {
    setTimeout(() => setIsBoxVisible([true, false]), 200);
    setTimeout(() => setIsBoxVisible([true, true]), 600);

    const allPrompts = [...createEventExamples, ...scheduleExamples];
    allPrompts.forEach((_, index) => {
      setTimeout(() => {
        setVisiblePrompts((prev) => [...prev, index]);
      }, 700 + index * 200);
    });
  }, []);

  return (
    <div className="w-full h-screen flex flex-col justify-center items-center">
      <Sparkles className="w-10 h-10 mb-5" ></Sparkles>
      <h2 className={`text-3xl font-bold mb-2 text-center ${darkMode ? 'text-gray-200' : 'text-blue-600'}`}>
        How can I help you?
      </h2>
      <h2 className={`text-xl font-semibold mb-10 text-center ${darkMode ? 'text-gray-500' : 'text-gray-600'} animate-fade-in-delay-1`}>
        Use one of the most common prompts below or use your own to begin
      </h2>
      <div className="w-full max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <div
            className={`rounded-xl shadow-md p-6 transition-opacity duration-700 ${
              isBoxVisible[0] ? "opacity-100" : "opacity-0"
            } ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
          >
            <h3 className={`text-xl font-bold mb-5 text-center ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              Create New Events
            </h3>
            <div className="space-y-3">
              {createEventExamples.map((example, index) => (
                <button
                  key={index}
                  onClick={() => onExampleClick(example.text)}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-colors text-left group ${
                    visiblePrompts.includes(index)
                      ? "opacity-100 transition-opacity duration-700"
                      : "opacity-0"
                  } ${darkMode
                      ? 'border-gray-700 hover:border-gray-600 hover:bg-gray-700 text-gray-400 hover:text-gray-300'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-600 hover:text-gray-700'
                  }`}
                >
                  <span>
                    {example.icon}
                  </span>
                  <span className="text-sm">
                    {example.text}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div
            className={`rounded-xl shadow-md p-6 transition-opacity duration-700 ${
              isBoxVisible[1] ? "opacity-100" : "opacity-0"
            } ${darkMode ? 'bg-gray-800' : 'bg-white'}`}
          >
            <h3 className={`text-xl font-bold mb-5 text-center ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              Check Your Schedule
            </h3>
            <div className="space-y-3">
              {scheduleExamples.map((example, index) => (
                <button
                  key={index + createEventExamples.length}
                  onClick={() => onExampleClick(example.text)}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-colors text-left group ${
                    visiblePrompts.includes(index + createEventExamples.length)
                      ? "opacity-100 transition-opacity duration-700"
                      : "opacity-0"
                  } ${darkMode
                      ? 'border-gray-700 hover:border-gray-600 hover:bg-gray-700 text-gray-400 hover:text-gray-300'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-600 hover:text-gray-700'
                  }`}
                >
                  <span>
                    {example.icon}
                  </span>
                  <span className="text-sm">
                    {example.text}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiPromptExamples;
