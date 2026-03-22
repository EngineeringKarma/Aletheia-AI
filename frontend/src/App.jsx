import { useState, useRef, useEffect } from "react";

export default function App() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState("blue-eclipse-light"); // blue-eclipse-light, blue-eclipse-dark, soft-pink-light, soft-pink-dark
  const [chatMode, setChatMode] = useState("free");
  const [guidedContext, setGuidedContext] = useState(null);
  const messagesEndRef = useRef(null);

  const [attendance, setAttendance] = useState("");
  const [marks, setMarks] = useState("");
  const [assignments, setAssignments] = useState("");

  const [subjects, setSubjects] = useState("");
  const [hours, setHours] = useState("");

  const [question, setQuestion] = useState("");

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Format AI response with detailed analyses
  const formatAIResponse = (text) => {
    const isBlueEclipse = theme.includes("blue-eclipse");
    const isDark = theme.includes("dark");
    
    if (typeof text !== 'string') return <p>{String(text)}</p>;
    
    if (text.includes("Productivity Analysis") || text.includes("Study Plan")) {
      return text.split('\n').map((line, i) => {
        if (line.includes("**")) {
          const cleanLine = line.replace(/\*\*/g, '');
          if (line.includes("📊") || line.includes("📚") || line.includes("🎯")) {
            return <h2 key={i} className={`text-xl font-bold mt-4 mb-3 ${isBlueEclipse ? (isDark ? 'text-[#6B6B9B]' : 'text-[#8686AC]') : (isDark ? 'text-[#B88A8A]' : 'text-[#DCA1A1]')}`}>{cleanLine}</h2>;
          }
          return <h3 key={i} className={`font-bold mt-3 mb-2 ${isBlueEclipse ? (isDark ? 'text-[#5A5A8A]' : 'text-[#505081]') : (isDark ? 'text-[#A57A7A]' : 'text-[#996666]')}`}>{cleanLine}</h3>;
        } else if (line.includes("•")) {
          return <div key={i} className="flex items-start gap-2 mb-2 ml-2">
            <span className={isBlueEclipse ? (isDark ? 'text-[#6B6B9B]' : 'text-[#8686AC]') : (isDark ? 'text-[#B88A8A]' : 'text-[#DCA1A1]')}>▹</span>
            <span className={isDark ? 'text-gray-200' : 'text-white'}>{line.substring(1).trim()}</span>
          </div>;
        } else if (line.match(/^\d+\./)) {
          return <div key={i} className="flex items-start gap-2 mb-2 ml-2">
            <span className={`font-bold ${isBlueEclipse ? (isDark ? 'text-[#5A5A8A]' : 'text-[#505081]') : (isDark ? 'text-[#A57A7A]' : 'text-[#996666]')}`}>{line.split('.')[0]}.</span>
            <span className={isDark ? 'text-gray-200' : 'text-white'}>{line.split('.')[1]}</span>
          </div>;
        } else if (line.includes("✅")) {
          return <div key={i} className={`flex items-center gap-2 mb-2 ${isBlueEclipse ? (isDark ? 'text-[#6B6B9B]' : 'text-[#8686AC]') : (isDark ? 'text-[#B88A8A]' : 'text-[#DCA1A1]')}`}>
            <span>✅</span>
            <span>{line.replace("✅", "").trim()}</span>
          </div>;
        } else if (line.trim() === '') {
          return <div key={i} className="h-2"></div>;
        }
        return <p key={i} className={`mb-2 leading-relaxed ${isDark ? 'text-gray-200' : 'text-white'}`}>{line}</p>;
      });
    }
    
    return text.split('\n').map((line, i) => {
      if (line.trim() === '') return null;
      if (line.match(/^\d+\./)) {
        return <li key={i} className={`ml-4 mb-1 ${isDark ? 'text-gray-200' : 'text-white'}`}>{line}</li>;
      } else if (line.match(/^[*-]/)) {
        return <li key={i} className={`ml-4 mb-1 list-disc ${isDark ? 'text-gray-200' : 'text-white'}`}>{line.substring(1).trim()}</li>;
      } else if (line.includes(':')) {
        const [key, ...valueParts] = line.split(':');
        const value = valueParts.join(':');
        return (
          <div key={i} className="mb-2">
            <span className={`font-semibold ${isBlueEclipse ? (isDark ? 'text-[#5A5A8A]' : 'text-[#505081]') : (isDark ? 'text-[#A57A7A]' : 'text-[#996666]')}`}>{key}:</span>
            <span className={isDark ? 'text-gray-200' : 'text-white'}> {value}</span>
          </div>
        );
      }
      return <p key={i} className={`mb-2 leading-relaxed ${isDark ? 'text-gray-200' : 'text-white'}`}>{line}</p>;
    });
  };

  async function sendMessage(messageText, label, context = null) {
    if (!messageText) return;

    setLoading(true);
    
    if (label) {
      setMessages((prev) => [
        ...prev,
        { type: "user", text: label, timestamp: new Date() },
      ]);
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const payload = {
        message: messageText,
        chat_mode: chatMode,
        context: guidedContext || context,
        detailed_analysis: true
      };

      const res = await fetch("http://127.0.0.1:8000/agent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      console.log("Backend:", data);

      if (data.is_question) {
        setMessages((prev) => [
          ...prev,
          { 
            type: "ai", 
            text: data.response, 
            timestamp: new Date(),
            isQuestion: true,
            options: data.options,
          },
        ]);
        
        setGuidedContext({
          ...guidedContext,
          lastQuestion: data.response,
          collectedData: { ...guidedContext?.collectedData, ...data.collected_data }
        });
      } else {
        setMessages((prev) => [
          ...prev,
          { type: "ai", text: data.response, timestamp: new Date() },
        ]);
        
        if (data.completed) {
          setGuidedContext(null);
          setChatMode("free");
        }
      }
    } catch (error) {
      console.error("Error:", error);
      let errorMessage = "Backend error: ";
      
      if (error.name === 'AbortError') {
        errorMessage += "Request timeout. Please check if the backend server is running.";
      } else if (error.message.includes('Failed to fetch')) {
        errorMessage += "Cannot connect to backend. Make sure the server is running on http://127.0.0.1:8000";
      } else {
        errorMessage += error.message;
      }
      
      setMessages((prev) => [
        ...prev,
        { type: "ai", text: errorMessage, timestamp: new Date() },
      ]);
    } finally {
      setQuestion("");
      setLoading(false);
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(question, `❓ ${question}`);
    }
  };

  const changeTheme = (newTheme) => {
    setTheme(newTheme);
  };

  const startGuidedSession = (type) => {
    setChatMode("guided");
    setGuidedContext({ type, collectedData: {}, step: 0 });
    sendMessage(
      `Start guided ${type} session with detailed analysis`,
      `🎯 Starting guided ${type} session`
    );
  };

  // Theme configurations
  const getThemeStyles = () => {
    switch(theme) {
      case "blue-eclipse-light":
        return {
          background: 'bg-gradient-to-br from-[#0F0E47] via-[#272757] to-[#505081]',
          cardBg: 'bg-white/20',
          buttonGradient: 'from-[#8686AC] to-[#505081]',
          buttonHover: 'hover:from-[#505081] hover:to-[#8686AC]',
          accentColor: 'text-[#8686AC]',
          borderColor: 'border-white/30',
          textColor: 'text-white',
          cursorColor: '#8686AC',
          name: 'Blue Eclipse Light'
        };
      case "blue-eclipse-dark":
        return {
          background: 'bg-gradient-to-br from-[#08082F] via-[#1A1A44] to-[#2A2A55]',
          cardBg: 'bg-black/30',
          buttonGradient: 'from-[#5A5A8A] to-[#3A3A6A]',
          buttonHover: 'hover:from-[#3A3A6A] hover:to-[#5A5A8A]',
          accentColor: 'text-[#6B6B9B]',
          borderColor: 'border-gray-700/50',
          textColor: 'text-gray-100',
          cursorColor: '#6B6B9B',
          name: 'Blue Eclipse Dark'
        };
      case "soft-pink-light":
        return {
          background: 'bg-gradient-to-br from-[#DCA1A1] via-[#996666] to-[#DCA1A1]',
          cardBg: 'bg-white/20',
          buttonGradient: 'from-[#DCA1A1] to-[#996666]',
          buttonHover: 'hover:from-[#996666] hover:to-[#DCA1A1]',
          accentColor: 'text-[#DCA1A1]',
          borderColor: 'border-white/30',
          textColor: 'text-white',
          cursorColor: '#DCA1A1',
          name: 'Soft Pink Light'
        };
      case "soft-pink-dark":
        return {
          background: 'bg-gradient-to-br from-[#8B5A5A] via-[#6B4444] to-[#8B5A5A]',
          cardBg: 'bg-black/30',
          buttonGradient: 'from-[#B88A8A] to-[#8A5A5A]',
          buttonHover: 'hover:from-[#8A5A5A] hover:to-[#B88A8A]',
          accentColor: 'text-[#B88A8A]',
          borderColor: 'border-gray-700/50',
          textColor: 'text-gray-100',
          cursorColor: '#B88A8A',
          name: 'Soft Pink Dark'
        };
      default:
        return themeStyles['blue-eclipse-light'];
    }
  };

  const currentTheme = getThemeStyles();
  const isDark = theme.includes("dark");
  const isBlueEclipse = theme.includes("blue-eclipse");

  return (
    <div className={`min-h-screen transition-all duration-500 ${currentTheme.background}`}>
      {/* Animated Cursor Styles */}
      <style>{`
        * {
          cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="27" viewBox="0 0 24 27"><polygon points="2,2 22,13 12,13 12,25 2,2" fill="${currentTheme.cursorColor}" stroke="${isBlueEclipse ? (isDark ? '#3A3A6A' : '#505081') : (isDark ? '#8A5A5A' : '#996666')}" stroke-width="1.5"/><circle cx="12" cy="13" r="2" fill="white"/><animateTransform attributeName="transform" type="scale" values="1;1.1;1" dur="0.5s" repeatCount="indefinite"/></svg>') 12 5, auto;
        }
        
        button, a, input, textarea, [role="button"] {
          cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="28" height="31" viewBox="0 0 28 31"><polygon points="2,2 26,15 14,15 14,29 2,2" fill="${currentTheme.cursorColor}" stroke="${isBlueEclipse ? (isDark ? '#3A3A6A' : '#505081') : (isDark ? '#8A5A5A' : '#996666')}" stroke-width="1.5"/><circle cx="14" cy="15" r="3" fill="white"/><animateTransform attributeName="transform" type="scale" values="1;1.15;1" dur="0.3s" repeatCount="indefinite"/></svg>') 14 7, pointer;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-5px);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .card-hover {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .card-hover:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, ${isDark ? '0.3' : '0.2'});
        }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: ${isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.1)'};
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: ${currentTheme.cursorColor};
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: ${isBlueEclipse ? (isDark ? '#5A5A8A' : '#505081') : (isDark ? '#A57A7A' : '#996666')};
        }
      `}</style>

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header with Aesthetic Design */}
        <div className="text-center mb-12 relative">
          <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
            <div className={`w-32 h-32 rounded-full blur-2xl ${isDark ? 'bg-black/20' : 'bg-white/20'}`}></div>
          </div>
          <div className="relative">
            <div className="flex justify-center mb-4">
              <div className={`w-24 h-24 rounded-2xl flex items-center justify-center shadow-xl transition-all duration-300 ${
                isBlueEclipse 
                  ? `bg-gradient-to-br ${isDark ? 'from-[#5A5A8A] to-[#3A3A6A]' : 'from-[#8686AC] to-[#505081]'} border ${isDark ? 'border-gray-700/50' : 'border-white/30'}`
                  : `bg-gradient-to-br ${isDark ? 'from-[#B88A8A] to-[#8A5A5A]' : 'from-[#DCA1A1] to-[#996666]'} border ${isDark ? 'border-gray-700/50' : 'border-white/30'}`
              }`}>
                <span className="text-5xl font-bold text-white">A</span>
              </div>
            </div>
            <h1 className={`text-6xl font-bold tracking-tight ${isDark ? 'text-gray-100' : 'text-white'}`}>
              ALETHEIA AI
            </h1>
            <p className={`text-lg mt-2 ${currentTheme.accentColor} font-light`}>
              Your Intelligent Student Productivity Companion
            </p>
          </div>
          
          {/* Theme Selector Dropdown */}
          <div className="absolute top-0 right-0">
            <select
              value={theme}
              onChange={(e) => changeTheme(e.target.value)}
              className={`px-4 py-2 rounded-full transition-all duration-300 font-medium shadow-md backdrop-blur-sm ${
                isDark 
                  ? 'bg-black/30 text-gray-100 border border-gray-700/50 hover:bg-black/40' 
                  : 'bg-white/20 text-white border border-white/30 hover:bg-white/30'
              }`}
            >
              <option value="blue-eclipse-light" className="bg-[#272757] text-white">🌙 Blue Eclipse Light</option>
              <option value="blue-eclipse-dark" className="bg-[#1A1A44] text-white">🌙 Blue Eclipse Dark</option>
              <option value="soft-pink-light" className="bg-[#996666] text-white">🌸 Soft Pink Light</option>
              <option value="soft-pink-dark" className="bg-[#6B4444] text-white">🌸 Soft Pink Dark</option>
            </select>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="mb-8 flex gap-3 flex-wrap justify-center">
          {[
            { icon: "📚", text: "Create Study Plan", action: "study_plan" },
            { icon: "📊", text: "Analyze Productivity", action: "productivity_analysis" },
            { icon: "🎯", text: "Set Goals", action: "goal_setting" },
            { icon: "⏰", text: "Time Management", action: "time_management" }
          ].map((btn, idx) => (
            <button
              key={idx}
              onClick={() => startGuidedSession(btn.action)}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-300 transform hover:scale-105 shadow-md ${
                isDark 
                  ? 'bg-black/30 text-gray-100 hover:bg-black/40 backdrop-blur-sm border border-gray-700/50' 
                  : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border border-white/30'
              }`}
            >
              <span className="flex items-center gap-2">
                <span className="text-xl">{btn.icon}</span>
                <span>{btn.text}</span>
              </span>
            </button>
          ))}
        </div>

        {/* Three Column Layout */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Productivity Card */}
          <div className={`rounded-2xl p-6 transition-all duration-300 hover:shadow-xl card-hover ${
            isDark 
              ? 'bg-black/30 backdrop-blur-md border border-gray-700/50' 
              : 'bg-white/20 backdrop-blur-md border border-white/30'
          }`}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-3xl">📊</span>
              <h2 className={`text-xl font-semibold ${isDark ? 'text-gray-100' : 'text-white'}`}>
                Productivity Analyzer
              </h2>
            </div>
            <p className={`text-sm mb-4 ${currentTheme.accentColor}`}>
              Get detailed insights about your performance
            </p>
            <input
              placeholder="Attendance %"
              value={attendance}
              onChange={(e) => setAttendance(e.target.value)}
              className={`w-full mb-2 p-3 rounded-xl border focus:outline-none focus:ring-2 transition-all ${
                isDark 
                  ? 'bg-black/30 border-gray-700/50 text-gray-100 placeholder:text-gray-500 focus:ring-${currentTheme.cursorColor} focus:border-${currentTheme.cursorColor}' 
                  : 'bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:ring-white focus:border-white'
              }`}
              style={{ '--tw-ring-color': currentTheme.cursorColor }}
            />
            <input
              placeholder="Marks %"
              value={marks}
              onChange={(e) => setMarks(e.target.value)}
              className={`w-full mb-2 p-3 rounded-xl border focus:outline-none focus:ring-2 transition-all ${
                isDark 
                  ? 'bg-black/30 border-gray-700/50 text-gray-100 placeholder:text-gray-500' 
                  : 'bg-white/20 border-white/30 text-white placeholder:text-white/60'
              }`}
            />
            <input
              placeholder="Assignments Pending"
              value={assignments}
              onChange={(e) => setAssignments(e.target.value)}
              className={`w-full mb-3 p-3 rounded-xl border focus:outline-none focus:ring-2 transition-all ${
                isDark 
                  ? 'bg-black/30 border-gray-700/50 text-gray-100 placeholder:text-gray-500' 
                  : 'bg-white/20 border-white/30 text-white placeholder:text-white/60'
              }`}
            />
            <button
              onClick={() =>
                sendMessage(
                  `Provide a detailed analysis of my productivity. Attendance: ${attendance}%, Marks: ${marks}%, Assignments: ${assignments} pending. Include recommendations and action plan.`,
                  `📊 Analyzing productivity...`
                )
              }
              className={`w-full py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-[1.02] shadow-md bg-gradient-to-r ${currentTheme.buttonGradient} ${currentTheme.buttonHover} text-white`}
            >
              Get Detailed Analysis →
            </button>
          </div>

          {/* Planner Card */}
          <div className={`rounded-2xl p-6 transition-all duration-300 hover:shadow-xl card-hover ${
            isDark 
              ? 'bg-black/30 backdrop-blur-md border border-gray-700/50' 
              : 'bg-white/20 backdrop-blur-md border border-white/30'
          }`}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-3xl">📅</span>
              <h2 className={`text-xl font-semibold ${isDark ? 'text-gray-100' : 'text-white'}`}>
                Smart Planner
              </h2>
            </div>
            <p className={`text-sm mb-4 ${currentTheme.accentColor}`}>
              Create personalized study plans with timelines
            </p>
            <input
              placeholder="Subjects (comma separated)"
              value={subjects}
              onChange={(e) => setSubjects(e.target.value)}
              className={`w-full mb-2 p-3 rounded-xl border focus:outline-none focus:ring-2 transition-all ${
                isDark 
                  ? 'bg-black/30 border-gray-700/50 text-gray-100 placeholder:text-gray-500' 
                  : 'bg-white/20 border-white/30 text-white placeholder:text-white/60'
              }`}
            />
            <input
              placeholder="Hours per day"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              className={`w-full mb-3 p-3 rounded-xl border focus:outline-none focus:ring-2 transition-all ${
                isDark 
                  ? 'bg-black/30 border-gray-700/50 text-gray-100 placeholder:text-gray-500' 
                  : 'bg-white/20 border-white/30 text-white placeholder:text-white/60'
              }`}
            />
            <button
              onClick={() =>
                sendMessage(
                  `Create a comprehensive study plan with detailed schedule for: ${subjects}. I can study ${hours} hours daily. Include time blocks, breaks, revision strategies, and progress tracking.`,
                  `📅 Creating study plan...`
                )
              }
              className={`w-full py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-[1.02] shadow-md bg-gradient-to-r ${currentTheme.buttonGradient} ${currentTheme.buttonHover} text-white`}
            >
              Generate Detailed Plan →
            </button>
          </div>

          {/* AI Assistant Card */}
          <div className={`rounded-2xl p-6 transition-all duration-300 hover:shadow-xl card-hover ${
            isDark 
              ? 'bg-black/30 backdrop-blur-md border border-gray-700/50' 
              : 'bg-white/20 backdrop-blur-md border border-white/30'
          }`}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-3xl">💬</span>
              <h2 className={`text-xl font-semibold ${isDark ? 'text-gray-100' : 'text-white'}`}>
                AI Assistant
              </h2>
            </div>
            <p className={`text-sm mb-4 ${currentTheme.accentColor}`}>
              Ask anything about productivity, studies, or life
            </p>
            <input
              placeholder="Ask for detailed advice..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyPress={handleKeyPress}
              className={`w-full mb-3 p-3 rounded-xl border focus:outline-none focus:ring-2 transition-all ${
                isDark 
                  ? 'bg-black/30 border-gray-700/50 text-gray-100 placeholder:text-gray-500' 
                  : 'bg-white/20 border-white/30 text-white placeholder:text-white/60'
              }`}
            />
            <button
              onClick={() => sendMessage(question, `❓ ${question}`)}
              className={`w-full py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-[1.02] shadow-md bg-gradient-to-r ${currentTheme.buttonGradient} ${currentTheme.buttonHover} text-white`}
            >
              Ask for Analysis →
            </button>
          </div>
        </div>

        {/* Chat Display Area */}
        <div className={`rounded-2xl shadow-xl overflow-hidden transition-all duration-300 ${
          isDark 
            ? 'bg-black/30 backdrop-blur-md border border-gray-700/50' 
            : 'bg-white/20 backdrop-blur-md border border-white/30'
        }`}>
          <div className="h-[500px] overflow-y-auto p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="text-7xl mb-4 animate-float">🤖</div>
                <p className={`text-lg mb-2 font-medium ${isDark ? 'text-gray-100' : 'text-white'}`}>
                  Welcome to Aletheia AI
                </p>
                <p className={`text-sm ${currentTheme.accentColor}`}>
                  Your personal companion for productivity, studies, and goals
                </p>
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => startGuidedSession("study_plan")}
                    className={`px-4 py-2 rounded-full text-sm transition-all shadow-md ${
                      isDark 
                        ? 'bg-black/30 text-gray-100 hover:bg-black/40 backdrop-blur-sm border border-gray-700/50' 
                        : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border border-white/30'
                    }`}
                  >
                    📚 Create Study Plan
                  </button>
                  <button
                    onClick={() => startGuidedSession("productivity_analysis")}
                    className={`px-4 py-2 rounded-full text-sm transition-all shadow-md ${
                      isDark 
                        ? 'bg-black/30 text-gray-100 hover:bg-black/40 backdrop-blur-sm border border-gray-700/50' 
                        : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border border-white/30'
                    }`}
                  >
                    📊 Get Analysis
                  </button>
                </div>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"} animate-fadeIn`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-5 py-3 shadow-md transition-all ${
                      msg.type === "user"
                        ? `bg-gradient-to-r ${currentTheme.buttonGradient} text-white`
                        : msg.isQuestion
                        ? `${isDark ? 'bg-black/30' : 'bg-white/20'} backdrop-blur-sm border-l-4 ${currentTheme.accentColor.replace('text-', 'border-')}`
                        : `${isDark ? 'bg-black/30' : 'bg-white/20'} backdrop-blur-sm border ${isDark ? 'border-gray-700/50' : 'border-white/30'}`
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xl">
                        {msg.type === "user" ? "👤" : msg.isQuestion ? "❓" : "🤖"}
                      </span>
                      <div className="flex-1">
                        <div className="font-semibold text-sm mb-1 opacity-75">
                          {msg.type === "user" ? "You" : "Aletheia AI"}
                        </div>
                        <div>
                          {msg.type === "ai" 
                            ? formatAIResponse(msg.text)
                            : <p className="whitespace-pre-wrap">{msg.text}</p>
                          }
                        </div>
                        
                        {msg.isQuestion && msg.options && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {msg.options.map((option, idx) => (
                              <button
                                key={idx}
                                onClick={() => sendMessage(option, `📝 ${option}`)}
                                className={`px-3 py-1 rounded-full text-sm transition-all ${
                                  isDark 
                                    ? 'bg-black/30 hover:bg-black/40 text-gray-100' 
                                    : 'bg-white/20 hover:bg-white/30 text-white'
                                }`}
                              >
                                {option}
                              </button>
                            ))}
                          </div>
                        )}
                        
                        {msg.timestamp && (
                          <div className="text-xs opacity-50 mt-2">
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
            {loading && (
              <div className="flex justify-start">
                <div className={`rounded-2xl px-5 py-3 shadow-md ${isDark ? 'bg-black/30' : 'bg-white/20'} backdrop-blur-sm`}>
                  <div className="flex items-center gap-2">
                    <span>🤖</span>
                    <div className="flex gap-1">
                      <div className={`w-2 h-2 rounded-full animate-bounce ${currentTheme.accentColor.replace('text-', 'bg-')}`}></div>
                      <div className={`w-2 h-2 rounded-full animate-bounce ${currentTheme.accentColor.replace('text-', 'bg-')}`} style={{ animationDelay: "0.1s" }}></div>
                      <div className={`w-2 h-2 rounded-full animate-bounce ${currentTheme.accentColor.replace('text-', 'bg-')}`} style={{ animationDelay: "0.2s" }}></div>
                    </div>
                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-white'}`}>Analyzing insights...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Bottom Input Area */}
        <div className="mt-4">
          <div className={`rounded-2xl shadow-lg p-4 transition-all duration-300 ${
            isDark 
              ? 'bg-black/30 backdrop-blur-md border border-gray-700/50' 
              : 'bg-white/20 backdrop-blur-md border border-white/30'
          }`}>
            <div className="flex gap-3">
              <input
                placeholder="Ask for detailed analysis, study plans, or productivity insights..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyPress={handleKeyPress}
                className={`flex-1 p-3 rounded-xl border focus:outline-none focus:ring-2 transition-all ${
                  isDark 
                    ? 'bg-black/30 border-gray-700/50 text-gray-100 placeholder:text-gray-500' 
                    : 'bg-white/20 border-white/30 text-white placeholder:text-white/60'
                }`}
              />
              <button
                onClick={() => sendMessage(question, `❓ ${question}`)}
                className={`px-8 rounded-xl font-medium transition-all duration-300 transform hover:scale-[1.02] shadow-md bg-gradient-to-r ${currentTheme.buttonGradient} ${currentTheme.buttonHover} text-white`}
              >
                Send
              </button>
            </div>
            <p className={`text-xs mt-3 text-center ${currentTheme.accentColor}`}>
              ✨ Ask for detailed analysis • Get personalized insights • Create study plans • Track your progress
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}