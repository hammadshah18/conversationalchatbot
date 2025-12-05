# Aivora - AI-Powered Conversational Chatbot

A modern, full-stack AI chatbot application with user authentication, built with FastAPI and Next.js.

## 🌟 Features

### Frontend
- ✅ **Beautiful Landing Page** with feature showcase
- ✅ **User Authentication** - Signup/Login forms
- ✅ **Modern UI** - Clean white & green design
- ✅ **Dark/Light Mode** - Theme toggle with persistence
- ✅ **Real-time Chat** - AI conversations with typing animation
- ✅ **Chat Management** - Edit titles, delete chats
- ✅ **Responsive Design** - Works on all devices
- ✅ **Smooth Animations** - Framer Motion powered

### Backend
- ✅ **User Authentication** - Secure signup/login with bcrypt
- ✅ **Session Management** - Token-based authentication
- ✅ **Chat Management** - Create, read, update, delete
- ✅ **AI Integration** - Google Gemini 2.5 Flash
- ✅ **SQLite Database** - Persistent storage
- ✅ **CORS Enabled** - Ready for frontend integration

## 📁 Project Structure

```
chatbot/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── requirements.txt     # Python dependencies
│   ├── .env                 # Environment variables
│   └── chatbot.db          # SQLite database (auto-created)
│
└── frontend/
    ├── app/
    │   ├── layout.tsx       # Root layout
    │   ├── page.tsx         # Landing page
    │   ├── login/
    │   │   └── page.tsx     # Login page
    │   ├── signup/
    │   │   └── page.tsx     # Signup page
    │   ├── dashboard/
    │   │   └── page.tsx     # Dashboard (redirects to chat)
    │   └── chat/
    │       └── [id]/
    │           └── page.tsx # Chat page
    ├── components/
    │   ├── Navbar.tsx       # Navigation with Aivora branding
    │   ├── ChatSidebar.tsx  # Chat list with edit/delete
    │   ├── ChatWindow.tsx   # Message display
    │   ├── ChatInput.tsx    # Message input
    │   ├── MessageBubble.tsx # Individual messages
    │   ├── TypingAnimation.tsx # AI typing effect
    │   └── Loader.tsx       # Loading animation
    ├── lib/
    │   ├── api.ts          # Chat API functions
    │   └── auth.ts         # Authentication functions
    └── package.json
```

## 🚀 Setup Instructions

### Backend Setup

1. **Navigate to backend folder:**
   ```bash
   cd backend
   ```

2. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Create `.env` file:**
   ```env
   GOOGLE_API_KEY=your_google_gemini_api_key_here
   ```

4. **Run the backend:**
   ```bash
   uvicorn main:app --reload
   ```

   Backend will run on `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend folder:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Update `.env.local`:**
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

4. **Run the frontend:**
   ```bash
   npm run dev
   ```

   Frontend will run on `http://localhost:3000`

## 📡 API Endpoints

### Authentication
- `POST /auth/signup` - Create new user account
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout

### Chat Management
- `GET /` - Get redirect to latest chat
- `GET /new_chat` - Create new chat
- `GET /chat/{chat_id}` - Get chat with messages
- `POST /send/{chat_id}` - Send message to chat
- `DELETE /chat/{chat_id}` - Delete chat
- `PUT /chat/{chat_id}/title` - Update chat title

### Health
- `GET /health` - Health check

## 🎨 Features in Detail

### 1. Landing Page
- Hero section with Aivora branding
- Feature showcase (Natural Conversations, Lightning Fast, Secure)
- Call-to-action buttons
- Gradient design with animations

### 2. Authentication
- **Signup**: Email, password, full name
- **Login**: Email, password
- Password visibility toggle
- Form validation
- Error handling
- Token-based sessions (30 days)

### 3. Chat Interface
- **Sidebar**: List all chats, create new, edit titles, delete
- **Chat Window**: Message bubbles, typing animation, auto-scroll
- **Input**: Send messages, Enter to send, loading states

### 4. Advanced Features
- **Typing Animation**: AI responses type character-by-character
- **Theme Toggle**: Dark/light mode saved to localStorage
- **Chat Editing**: Inline title editing with save/cancel
- **Chat Deletion**: Confirmation dialog before delete
- **Protected Routes**: Authentication required for chat access

## 🔒 Security Features

- Password hashing with bcrypt
- Session tokens with expiration
- CORS configuration
- Input validation
- SQL injection protection (parameterized queries)

## 🎯 User Flow

1. **New User**:
   - Visit landing page → Click "Get Started" → Signup → Dashboard → Start chatting

2. **Returning User**:
   - Visit landing page → Click "Sign In" → Login → Dashboard → Continue chatting

3. **Chat Management**:
   - Create new chats from sidebar
   - Edit chat titles (hover → edit icon)
   - Delete chats (hover → trash icon)
   - Switch between chats

## 🛠️ Technologies Used

### Backend
- **FastAPI** - Modern Python web framework
- **SQLite** - Lightweight database
- **bcrypt** - Password hashing
- **LangChain** - AI integration
- **Google Gemini** - AI model

### Frontend
- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **TailwindCSS** - Styling
- **Framer Motion** - Animations
- **Lucide Icons** - Icon library

## 📦 Deployment

### Backend (Vercel/Railway/Render)
1. Push code to GitHub
2. Connect repository
3. Set environment variables: `GOOGLE_API_KEY`
4. Deploy

### Frontend (Vercel)
1. Push code to GitHub
2. Import project to Vercel
3. Set root directory to `frontend`
4. Set environment variable: `NEXT_PUBLIC_API_URL`
5. Deploy

## 🔑 Environment Variables

### Backend `.env`
```
GOOGLE_API_KEY=your_google_api_key
```

### Frontend `.env.local`
```
NEXT_PUBLIC_API_URL=https://your-backend-url.com
```

## 📝 Database Schema

### Users Table
- id (INTEGER, PRIMARY KEY)
- email (TEXT, UNIQUE)
- password_hash (TEXT)
- name (TEXT)
- created_at (TEXT)

### Sessions Table
- id (INTEGER, PRIMARY KEY)
- user_id (INTEGER, FOREIGN KEY)
- token (TEXT, UNIQUE)
- created_at (TEXT)
- expires_at (TEXT)

### Chats Table
- id (INTEGER, PRIMARY KEY)
- user_id (INTEGER, FOREIGN KEY)
- title (TEXT)
- created_at (TEXT)

### Messages Table
- id (INTEGER, PRIMARY KEY)
- chat_id (INTEGER, FOREIGN KEY)
- sender (TEXT: 'user' or 'ai')
- text (TEXT)
- created_at (TEXT)

## 🎨 Design System

- **Primary Color**: Green (#22c55e)
- **Font**: Inter
- **Border Radius**: Rounded (8px-16px)
- **Shadows**: Subtle elevation
- **Animations**: Smooth transitions (0.3s)

## 📄 License

MIT

## 🤝 Contributing

Contributions welcome! Please feel free to submit a Pull Request.

---

Built with ❤️ using FastAPI and Next.js
