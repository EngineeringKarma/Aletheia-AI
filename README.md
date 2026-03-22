# 🌟 ALETHEIA AI - Student Productivity Assistant

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![React](https://img.shields.io/badge/React-18.2.0-61dafb.svg)
![Tailwind](https://img.shields.io/badge/Tailwind-3.3.5-38bdf8.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104.1-009688.svg)
![Groq AI](https://img.shields.io/badge/Groq%20AI-Powered-ff69b4.svg)

*An intelligent, AI-powered student productivity companion with stunning dual-theme support and animated interactions*

[![Demo](https://img.shields.io/badge/Demo-Live-green.svg)]()
[![Documentation](https://img.shields.io/badge/Docs-Complete-brightgreen.svg)]()
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)]()

</div>

---

## ✨ Features

### 🎨 **4 Beautiful Themes**
- 🌙 **Blue Eclipse Light** - Vibrant blue/purple theme
- 🌙 **Blue Eclipse Dark** - Softer, darker blue variant
- 🌸 **Soft Pink Light** - Warm, bright pink/rose theme
- 🌸 **Soft Pink Dark** - Muted, elegant pink variant

### 🤖 **AI-Powered Intelligence**
- **Productivity Analysis**: Get detailed insights with personalized recommendations
- **Smart Study Planner**: Create comprehensive study plans with timelines
- **Goal Setting Assistant**: Define and track your academic goals
- **Time Management**: Optimize your study schedule

### ✨ **Interactive Features**
- **Animated Cursor**: Dynamic cursor that changes with themes
- **Guided Sessions**: Step-by-step AI conversations for better planning
- **Glass Morphism**: Modern, aesthetic UI with backdrop blur effects
- **Responsive Design**: Works perfectly on all devices

### 🚀 **Technical Highlights**
- Real-time AI responses powered by Groq's LLaMA 3.1
- Smooth theme transitions with CSS animations
- Local storage for persistent conversations
- FastAPI backend with proper error handling
- Tailwind CSS for beautiful, consistent styling

---

## 📸 Preview

<div align="center">
  <img src="https://via.placeholder.com/800x400/0F0E47/FFFFFF?text=Blue+Eclipse+Light+Mode" alt="Blue Eclipse Light" width="45%" />
  <img src="https://via.placeholder.com/800x400/1A1A44/FFFFFF?text=Blue+Eclipse+Dark+Mode" alt="Blue Eclipse Dark" width="45%" />
  <br/>
  <img src="https://via.placeholder.com/800x400/DCA1A1/FFFFFF?text=Soft+Pink+Light+Mode" alt="Soft Pink Light" width="45%" />
  <img src="https://via.placeholder.com/800x400/8B5A5A/FFFFFF?text=Soft+Pink+Dark+Mode" alt="Soft Pink Dark" width="45%" />
</div>

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.2.0 | UI Framework |
| Vite | 5.0.0 | Build Tool |
| Tailwind CSS | 3.3.5 | Styling |
| Framer Motion | 10.16.4 | Animations |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| FastAPI | 0.104.1 | API Framework |
| Groq AI | 0.4.2 | LLM Integration |
| Python | 3.9+ | Runtime |
| Uvicorn | 0.24.0 | ASGI Server |

---

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- Python (v3.9 or higher)
- Groq API Key ([Get it here](https://console.groq.com))

### Clone the Repository

bash
git clone https://github.com/YOUR_USERNAME/aletheia-ai.git
cd aletheia-ai


### FRONTEND SETUP
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview


### BACKEND SETUP 
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Create .env file
echo "GROQ_API_KEY=your_groq_api_key_here" > .env

# Start the backend server
python main.py

# The server will run at http://localhost:8000

Usage Guide
1. Productivity Analyzer

    Enter your Attendance %, Marks %, and Pending Assignments

    Click "Get Detailed Analysis" for:

        Performance metrics evaluation

        Personalized recommendations

        Action plan for improvement

        Progress tracking suggestions

2. Smart Planner

    Input your Subjects (comma-separated)

    Specify Hours per day available for study

    Generate comprehensive study plans including:

        Weekly schedule with time blocks

        Break recommendations

        Revision strategies

        Progress tracking milestones

3. AI Assistant

    Ask any question about:

        Study techniques and strategies

        Time management tips

        Motivation and focus

        Subject-specific help

        Career guidance

4. Guided Sessions

Quick-action buttons for structured conversations:

    📚 Create Study Plan - Step-by-step plan creation

    📊 Analyze Productivity - In-depth productivity audit

    🎯 Set Goals - SMART goal setting assistance

    ⏰ Time Management - Optimize your schedule

5. Theme Switching

Click the theme selector dropdown to switch between:

    🌙 Blue Eclipse Light - Bright, energetic blue theme

    🌙 Blue Eclipse Dark - Deep, focused blue theme

    🌸 Soft Pink Light - Warm, inviting pink theme

    🌸 Soft Pink Dark - Calm, elegant pink theme


    aletheia-ai/
├── src/
│   ├── components/
│   │   ├── AIGeneratedComponent.jsx
│   │   └── ComponentGallery.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── public/
│   ├── a-icon.svg
│   └── index.html
├── backend/
│   ├── main.py
│   └── requirements.txt
├── .env
├── .gitignore
├── tailwind.config.js
├── postcss.config.js
├── vite.config.js
├── package.json
└── README.md







    


