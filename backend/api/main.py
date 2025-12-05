from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from dotenv import load_dotenv
from pathlib import Path

import sqlite3
import datetime
import os
import bcrypt
import secrets

from langchain_google_genai import ChatGoogleGenerativeAI

# ------------------------------------------------------------
# INIT
# ------------------------------------------------------------

load_dotenv()

llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    google_api_key=os.getenv("GOOGLE_API_KEY")
)
BASE_DIR = Path(__file__).resolve().parent.parent  # backend/
DB_FILE = str(BASE_DIR / "chatbot.db")

app = FastAPI(title="Chatbot API (FastAPI + LangChain)")

# Allow Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------------------------------------------------
# DATABASE SETUP
# ------------------------------------------------------------

def init_db():
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()

    c.execute("PRAGMA journal_mode=WAL;")

    c.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            name TEXT,
            created_at TEXT
        )
    """)

    c.execute("""
        CREATE TABLE IF NOT EXISTS sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            token TEXT UNIQUE NOT NULL,
            created_at TEXT,
            expires_at TEXT,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )
    """)

    c.execute("""
        CREATE TABLE IF NOT EXISTS chats (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            title TEXT,
            created_at TEXT,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )
    """)

    c.execute("""
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            chat_id INTEGER,
            sender TEXT,
            text TEXT,
            created_at TEXT,
            FOREIGN KEY(chat_id) REFERENCES chats(id)
        )
    """)

    conn.commit()
    conn.close()


init_db()


# DB Connection Dependency
def get_db():
    conn = sqlite3.connect(DB_FILE, check_same_thread=False)
    try:
        yield conn
    finally:
        conn.close()


# ------------------------------------------------------------
# Pydantic Models
# ------------------------------------------------------------

class SendMessage(BaseModel):
    message: str

class UpdateChatTitle(BaseModel):
    title: str

class UserSignup(BaseModel):
    email: str
    password: str
    name: str

class UserLogin(BaseModel):
    email: str
    password: str


# ------------------------------------------------------------
# Helper Functions
# ------------------------------------------------------------

def hash_password(password: str) -> str:
    """Hash password using bcrypt"""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    """Verify password against hash"""
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_session_token() -> str:
    """Generate a secure random token"""
    return secrets.token_urlsafe(32)

def get_current_user(token: str, db):
    """Get user from session token"""
    c = db.cursor()
    c.execute("""
        SELECT u.id, u.email, u.name 
        FROM users u 
        JOIN sessions s ON u.id = s.user_id 
        WHERE s.token = ? AND datetime(s.expires_at) > datetime('now')
    """, (token,))
    row = c.fetchone()
    if not row:
        return None
    return {"id": row[0], "email": row[1], "name": row[2]}


# ------------------------------------------------------------
# ROUTES
# ------------------------------------------------------------

# 🔐 AUTHENTICATION ROUTES

@app.post("/auth/signup")
def signup(data: UserSignup, db=Depends(get_db)):
    """User signup"""
    c = db.cursor()
    
    # Check if email already exists
    c.execute("SELECT id FROM users WHERE email = ?", (data.email,))
    if c.fetchone():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Hash password and create user
    password_hash = hash_password(data.password)
    now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    c.execute("""
        INSERT INTO users (email, password_hash, name, created_at)
        VALUES (?, ?, ?, ?)
    """, (data.email, password_hash, data.name, now))
    user_id = c.lastrowid
    
    # Create session token
    token = create_session_token()
    expires_at = (datetime.datetime.now() + datetime.timedelta(days=30)).strftime("%Y-%m-%d %H:%M:%S")
    
    c.execute("""
        INSERT INTO sessions (user_id, token, created_at, expires_at)
        VALUES (?, ?, ?, ?)
    """, (user_id, token, now, expires_at))
    
    db.commit()
    
    return {
        "success": True,
        "token": token,
        "user": {
            "id": user_id,
            "email": data.email,
            "name": data.name
        }
    }

@app.post("/auth/login")
def login(data: UserLogin, db=Depends(get_db)):
    """User login"""
    c = db.cursor()
    
    # Find user by email
    c.execute("SELECT id, email, password_hash, name FROM users WHERE email = ?", (data.email,))
    row = c.fetchone()
    
    if not row or not verify_password(data.password, row[2]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    user_id, email, _, name = row
    
    # Create session token
    token = create_session_token()
    now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    expires_at = (datetime.datetime.now() + datetime.timedelta(days=30)).strftime("%Y-%m-%d %H:%M:%S")
    
    c.execute("""
        INSERT INTO sessions (user_id, token, created_at, expires_at)
        VALUES (?, ?, ?, ?)
    """, (user_id, token, now, expires_at))
    
    db.commit()
    
    return {
        "success": True,
        "token": token,
        "user": {
            "id": user_id,
            "email": email,
            "name": name
        }
    }

@app.post("/auth/logout")
def logout(token: str, db=Depends(get_db)):
    """User logout"""
    c = db.cursor()
    c.execute("DELETE FROM sessions WHERE token = ?", (token,))
    db.commit()
    return {"success": True}


# ------------------------------------------------------------
# ROUTES
# ------------------------------------------------------------

# 1️⃣ HOME (auto redirect to latest chat)
@app.get("/")
def home(db=Depends(get_db)):
    c = db.cursor()
    c.execute("SELECT id FROM chats ORDER BY created_at DESC LIMIT 1")
    row = c.fetchone()

    if row:
        return {"redirect_to": f"/chat/{row[0]}"}
    return {"redirect_to": "/new_chat"}


# 2️⃣ CREATE NEW CHAT
@app.get("/new_chat")
def new_chat(db=Depends(get_db)):
    now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    c = db.cursor()
    c.execute("INSERT INTO chats (title, created_at) VALUES (?, ?)", (f"Chat {now}", now))
    chat_id = c.lastrowid

    # Initial AI greeting
    c.execute("""
        INSERT INTO messages (chat_id, sender, text, created_at)
        VALUES (?, ?, ?, ?)
    """, (chat_id, "ai", "Hello! How can I help you today?", now))

    db.commit()

    return {"chat_id": chat_id}


# 3️⃣ VIEW CHAT (sidebar + messages)
@app.get("/chat/{chat_id}")
def view_chat(chat_id: int, db=Depends(get_db)):
    c = db.cursor()

    # Fetch all chats (sidebar)
    c.execute("SELECT id, title, created_at FROM chats ORDER BY created_at DESC")
    chats = [{"id": row[0], "title": row[1], "created_at": row[2]} for row in c.fetchall()]

    # Fetch messages of the selected chat
    c.execute("SELECT id, sender, text, created_at FROM messages WHERE chat_id=? ORDER BY created_at ASC",
              (chat_id,))
    messages = [
        {"id": row[0], "sender": row[1], "text": row[2], "created_at": row[3]}
        for row in c.fetchall()
    ]

    return {
        "current_chat": chat_id,
        "chats": chats,
        "messages": messages
    }


# 4️⃣ SEND MESSAGE
@app.post("/send/{chat_id}")
def send_message(chat_id: int, data: SendMessage, db=Depends(get_db)):
    user_message = data.message.strip()

    if user_message == "":
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    now = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    c = db.cursor()

    # Store user message
    c.execute("""
        INSERT INTO messages (chat_id, sender, text, created_at)
        VALUES (?, ?, ?, ?)
    """, (chat_id, "user", user_message, now))
    db.commit()

    # Fetch conversation history from database
    c.execute("""
        SELECT sender, text FROM messages 
        WHERE chat_id=? 
        ORDER BY created_at ASC
    """, (chat_id,))
    
    history_rows = c.fetchall()
    
    # Build conversation history for LLM
    messages = [
        {
            "role": "system",
            "content": "You are a friendly, polite, helpful conversational chatbot. Answer every question in clear sentences. If unclear, ask for clarification."
        }
    ]
    
    for sender, text in history_rows:
        if sender == "user":
            messages.append({"role": "user", "content": text})
        elif sender == "ai":
            messages.append({"role": "assistant", "content": text})
    
    # Invoke LLM with full conversation history
    ai_response = llm.invoke(messages)
    ai_reply = ai_response.content.strip()

    # Store AI message
    c.execute("""
        INSERT INTO messages (chat_id, sender, text, created_at)
        VALUES (?, ?, ?, ?)
    """, (chat_id, "ai", ai_reply, now))
    db.commit()

    return {
        "chat_id": chat_id,
        "user_message": user_message,
        "ai_message": ai_reply
    }


# 5️⃣ DELETE CHAT
@app.delete("/chat/{chat_id}")
def delete_chat(chat_id: int, db=Depends(get_db)):
    c = db.cursor()
    
    # Check if chat exists
    c.execute("SELECT id FROM chats WHERE id=?", (chat_id,))
    if not c.fetchone():
        raise HTTPException(status_code=404, detail="Chat not found")
    
    # Delete messages first (foreign key)
    c.execute("DELETE FROM messages WHERE chat_id=?", (chat_id,))
    
    # Delete chat
    c.execute("DELETE FROM chats WHERE id=?", (chat_id,))
    
    db.commit()
    
    return {"success": True, "message": "Chat deleted successfully"}


# 6️⃣ UPDATE CHAT TITLE
@app.put("/chat/{chat_id}/title")
def update_chat_title(chat_id: int, data: UpdateChatTitle, db=Depends(get_db)):
    new_title = data.title.strip()
    
    if new_title == "":
        raise HTTPException(status_code=400, detail="Title cannot be empty")
    
    c = db.cursor()
    
    # Check if chat exists
    c.execute("SELECT id FROM chats WHERE id=?", (chat_id,))
    if not c.fetchone():
        raise HTTPException(status_code=404, detail="Chat not found")
    
    # Update title
    c.execute("UPDATE chats SET title=? WHERE id=?", (new_title, chat_id))
    db.commit()
    
    return {"success": True, "message": "Title updated successfully", "title": new_title}


# ------------------------------------------------------------
# HEALTH CHECK
# ------------------------------------------------------------
@app.get("/health")
def health():
    return {"status": "ok"}