// src/components/ComponentGallery.jsx
import { useState } from 'react';
import AIGeneratedComponent from './AIGeneratedComponent';

// Pre-configured AI-generated components from Google AI Studio
const componentTemplates = {
  flashcard: {
    name: 'FlashcardComponent',
    code: `
      function FlashcardComponent() {
        const [flipped, setFlipped] = useState(false);
        const [currentCard, setCurrentCard] = useState(0);
        
        const flashcards = [
          { front: "What is React?", back: "A JavaScript library for building user interfaces" },
          { front: "What is JSX?", back: "JavaScript XML - allows writing HTML in React" },
          { front: "What are hooks?", back: "Functions that let you use state and lifecycle features" }
        ];
        
        return (
          <div className="p-6 bg-gradient-to-br from-purple-900 to-indigo-900 rounded-xl">
            <div 
              className="cursor-pointer min-h-[200px] bg-white/10 backdrop-blur rounded-lg p-6 flex items-center justify-center transition-all hover:scale-105"
              onClick={() => setFlipped(!flipped)}
            >
              <p className="text-xl text-center">
                {flipped ? flashcards[currentCard].back : flashcards[currentCard].front}
              </p>
            </div>
            <div className="flex justify-between mt-4">
              <button 
                onClick={() => {
                  setCurrentCard((prev) => (prev > 0 ? prev - 1 : flashcards.length - 1));
                  setFlipped(false);
                }}
                className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30"
              >
                Previous
              </button>
              <span className="px-4 py-2 bg-white/10 rounded-lg">
                {currentCard + 1} / {flashcards.length}
              </span>
              <button 
                onClick={() => {
                  setCurrentCard((prev) => (prev + 1) % flashcards.length);
                  setFlipped(false);
                }}
                className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30"
              >
                Next
              </button>
            </div>
          </div>
        );
      }
    `
  },
  
  pomodoro: {
    name: 'PomodoroTimer',
    code: `
      function PomodoroTimer() {
        const [minutes, setMinutes] = useState(25);
        const [seconds, setSeconds] = useState(0);
        const [isActive, setIsActive] = useState(false);
        
        useEffect(() => {
          let interval;
          if (isActive) {
            interval = setInterval(() => {
              if (seconds === 0) {
                if (minutes === 0) {
                  setIsActive(false);
                  alert("Time's up! Take a break!");
                  setMinutes(25);
                  setSeconds(0);
                } else {
                  setMinutes(minutes - 1);
                  setSeconds(59);
                }
              } else {
                setSeconds(seconds - 1);
              }
            }, 1000);
          }
          return () => clearInterval(interval);
        }, [isActive, minutes, seconds]);
        
        const resetTimer = () => {
          setIsActive(false);
          setMinutes(25);
          setSeconds(0);
        };
        
        return (
          <div className="p-6 bg-gradient-to-br from-green-900 to-emerald-900 rounded-xl text-center">
            <h3 className="text-2xl font-bold mb-4">🍅 Pomodoro Timer</h3>
            <div className="text-6xl font-mono mb-6">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>
            <div className="flex gap-3 justify-center">
              <button 
                onClick={() => setIsActive(!isActive)}
                className="px-6 py-2 bg-white/20 rounded-lg hover:bg-white/30"
              >
                {isActive ? 'Pause' : 'Start'}
              </button>
              <button 
                onClick={resetTimer}
                className="px-6 py-2 bg-white/20 rounded-lg hover:bg-white/30"
              >
                Reset
              </button>
            </div>
          </div>
        );
      }
    `
  },
  
  habitTracker: {
    name: 'HabitTracker',
    code: `
      function HabitTracker() {
        const [habits, setHabits] = useState([
          { id: 1, name: "Read for 30 mins", completed: false },
          { id: 2, name: "Exercise", completed: false },
          { id: 3, name: "Meditate", completed: false }
        ]);
        const [newHabit, setNewHabit] = useState("");
        
        const toggleHabit = (id) => {
          setHabits(habits.map(habit => 
            habit.id === id ? { ...habit, completed: !habit.completed } : habit
          ));
        };
        
        const addHabit = () => {
          if (newHabit.trim()) {
            setHabits([...habits, { id: Date.now(), name: newHabit, completed: false }]);
            setNewHabit("");
          }
        };
        
        return (
          <div className="p-6 bg-gradient-to-br from-blue-900 to-indigo-900 rounded-xl">
            <h3 className="text-2xl font-bold mb-4">✅ Daily Habits</h3>
            <div className="space-y-2 mb-4">
              {habits.map(habit => (
                <div key={habit.id} className="flex items-center gap-3 bg-white/10 p-3 rounded-lg">
                  <input
                    type="checkbox"
                    checked={habit.completed}
                    onChange={() => toggleHabit(habit.id)}
                    className="w-5 h-5"
                  />
                  <span className={habit.completed ? 'line-through opacity-60' : ''}>
                    {habit.name}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newHabit}
                onChange={(e) => setNewHabit(e.target.value)}
                placeholder="Add new habit..."
                className="flex-1 p-2 rounded bg-white/10 border border-white/20"
                onKeyPress={(e) => e.key === 'Enter' && addHabit()}
              />
              <button
                onClick={addHabit}
                className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30"
              >
                Add
              </button>
            </div>
          </div>
        );
      }
    `
  }
};

export default function ComponentGallery() {
  const [activeComponent, setActiveComponent] = useState(null);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(componentTemplates).map(([key, template]) => (
          <button
            key={key}
            onClick={() => setActiveComponent(key === activeComponent ? null : key)}
            className="p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-all text-left"
          >
            <h3 className="font-bold text-lg mb-2 capitalize">{key}</h3>
            <p className="text-sm text-gray-400">Click to {activeComponent === key ? 'hide' : 'show'} component</p>
          </button>
        ))}
      </div>
      
      {activeComponent && componentTemplates[activeComponent] && (
        <div className="mt-6 animate-fadeIn">
          <AIGeneratedComponent 
            componentCode={componentTemplates[activeComponent].code}
            componentName={componentTemplates[activeComponent].name}
          />
        </div>
      )}
    </div>
  );
}