from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
import os
from dotenv import load_dotenv
import json
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

app = FastAPI()

# Configure CORS for production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],  # Add your frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Request(BaseModel):
    type: str = None
    data: dict = None
    question: str = None
    message: str = None

# Groq API setup
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not GROQ_API_KEY:
    logger.error("GROQ_API_KEY not found in environment variables")
    raise ValueError("GROQ_API_KEY is required")

client = OpenAI(
    api_key=GROQ_API_KEY,
    base_url="https://api.groq.com/openai/v1"
)

# -----------------------
# TOOLS (Agent Tools)
# -----------------------

def analyze_productivity(data):
    try:
        if isinstance(data, str):
            return f"Analyzing productivity from message: {data}"
        
        attendance = data.get('attendance', 'Not provided')
        marks = data.get('marks', 'Not provided')
        assignments = data.get('assignments', 'Not provided')
        
        return f"""📊 **Productivity Analysis Results**

📈 **Metrics:**
• Attendance: {attendance}
• Marks: {marks}
• Assignments Pending: {assignments}

💡 **Recommendations:**
- Track your progress weekly
- Set specific goals for improvement
- Prioritize pending assignments

Would you like a detailed action plan based on these metrics?"""
    except Exception as e:
        logger.error(f"Error in analyze_productivity: {e}")
        return f"Error analyzing productivity: {str(e)}"

def create_study_plan(data):
    try:
        if isinstance(data, str):
            return f"Creating study plan from message: {data}"
        
        subjects = data.get('subjects', 'Not provided')
        hours = data.get('hours', 'Not provided')
        
        return f"""📚 **Personalized Study Plan**

**Subjects:** {subjects}
**Daily Study Hours:** {hours}

**Weekly Schedule:**
• Monday - Friday: {hours} hours of focused study
• Saturday: Review and practice
• Sunday: Rest and light revision

**Study Tips:**
✅ Use Pomodoro Technique (25 min study, 5 min break)
✅ Review material within 24 hours
✅ Practice active recall
✅ Stay hydrated and take breaks

Would you like a more detailed schedule with specific time slots?"""
    except Exception as e:
        logger.error(f"Error in create_study_plan: {e}")
        return f"Error creating study plan: {str(e)}"

def answer_question(data):
    try:
        if isinstance(data, dict):
            question = data.get('question', 'No question provided')
        else:
            question = str(data)
        
        return f"💡 **Answering your question:**\n\n{question}\n\nLet me help you with that..."
    except Exception as e:
        logger.error(f"Error in answer_question: {e}")
        return f"Error processing question: {str(e)}"

tools = {
    "analyze_productivity": analyze_productivity,
    "create_study_plan": create_study_plan,
    "answer_question": answer_question
}

# -----------------------
# AGENT SYSTEM PROMPT
# -----------------------

agent_system_prompt = """
You are Aletheia AI, an autonomous student productivity agent. You are friendly, helpful, and focused on student success.

You have access to the following tools:
1. analyze_productivity - Use when user wants to analyze their productivity metrics (attendance, marks, assignments pending)
2. create_study_plan - Use when user wants to create a study plan for specific subjects with time constraints
3. answer_question - Use for general educational questions or when no other tool fits

When a user request is received:
- Analyze the user's message carefully
- Decide which tool is most appropriate
- Return ONLY JSON in this format: {"tool": "tool_name", "input": {}}

Examples:
- For productivity: {"tool": "analyze_productivity", "input": {"attendance": "85%", "marks": "75", "assignments": "2"}}
- For study plan: {"tool": "create_study_plan", "input": {"subjects": "Math, Science", "hours": "3"}}
- For question: {"tool": "answer_question", "input": {"question": "What is the capital of France?"}}

Always respond with valid JSON only, no additional text.
"""

# -----------------------
# AGENT DECISION
# -----------------------

def agent_decide(user_input):
    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": agent_system_prompt},
                {"role": "user", "content": str(user_input)}
            ],
            temperature=0.1,
            max_tokens=150
        )
        
        return response.choices[0].message.content
    except Exception as e:
        logger.error(f"Error in agent_decide: {e}")
        return '{"tool": "answer_question", "input": {"question": "Error processing request"}}'

# -----------------------
# AGENT LOOP
# -----------------------

def run_agent(user_input):
    try:
        # Extract the actual message
        if isinstance(user_input, dict):
            if 'message' in user_input:
                user_message = user_input['message']
            elif 'question' in user_input:
                user_message = user_input['question']
            else:
                user_message = str(user_input)
        else:
            user_message = str(user_input)
        
        logger.info(f"Processing user message: {user_message[:100]}")
        
        # Get tool decision
        decision = agent_decide(user_message)
        
        # Clean and parse JSON
        decision = decision.strip()
        if decision.startswith('```json'):
            decision = decision[7:]
        if decision.startswith('```'):
            decision = decision[3:]
        if decision.endswith('```'):
            decision = decision[:-3]
        decision = decision.strip()
        
        try:
            decision_json = json.loads(decision)
        except json.JSONDecodeError as e:
            logger.error(f"JSON Parse Error: {e}, Raw: {decision}")
            decision_json = {"tool": "answer_question", "input": {"question": user_message}}
        
        tool_name = decision_json.get("tool")
        tool_input = decision_json.get("input", {})
        
        # Validate tool
        if tool_name not in tools:
            logger.warning(f"Tool '{tool_name}' not found, using fallback")
            tool_name = "answer_question"
            tool_input = {"question": user_message}
        
        # Execute tool
        tool_function = tools[tool_name]
        tool_result = tool_function(tool_input)
        
        # Generate final response
        final_response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": "You are a helpful AI assistant. Generate a friendly, natural response using the tool result. Make it conversational and helpful for students."},
                {"role": "user", "content": user_message},
                {"role": "assistant", "content": tool_result}
            ],
            temperature=0.7,
            max_tokens=500
        )
        
        return final_response.choices[0].message.content
        
    except Exception as e:
        logger.error(f"Error in run_agent: {e}")
        return f"I encountered an error: {str(e)}. Please try again or check if the backend is running properly."

# -----------------------
# API ROUTES
# -----------------------

@app.post("/agent")
async def agent(req: Request):
    try:
        user_input = req.dict(exclude_none=True)
        
        if req.message:
            user_input = {"message": req.message}
        
        response = run_agent(user_input)
        return {"response": response, "status": "success"}
        
    except Exception as e:
        logger.error(f"Error in agent endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "Backend is running"}

@app.get("/")
async def root():
    return {"message": "Aletheia AI Backend is running", "status": "active"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)