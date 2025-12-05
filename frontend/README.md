# AI Chatbot Frontend

A modern, responsive chatbot frontend built with Next.js 14, TypeScript, and TailwindCSS.

## 🚀 Features

- ✅ Next.js 14 App Router
- ✅ TypeScript (100% type-safe)
- ✅ TailwindCSS for styling
- ✅ Framer Motion animations
- ✅ Dark/Light theme toggle
- ✅ Responsive design
- ✅ Chat history sidebar
- ✅ Real-time messaging
- ✅ Professional UI similar to ChatGPT/Gemini

## 📦 Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   
   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   
   Update the `NEXT_PUBLIC_API_URL` in `.env.local` with your backend URL:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.vercel.app
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
frontend/
├── app/
│   ├── layout.tsx          # Root layout with theme provider
│   ├── page.tsx            # Home page (redirects to chat)
│   └── chat/
│       └── [id]/
│           └── page.tsx    # Chat page
├── components/
│   ├── ChatWindow.tsx      # Main chat display
│   ├── ChatSidebar.tsx     # Chat list sidebar
│   ├── MessageBubble.tsx   # Individual message component
│   ├── ChatInput.tsx       # Message input box
│   ├── Loader.tsx          # Loading animation
│   └── Navbar.tsx          # Top navigation bar
├── lib/
│   └── api.ts             # API integration functions
├── styles/
│   └── globals.css        # Global styles
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

## 🔗 API Integration

The frontend connects to the FastAPI backend using the following endpoints:

- `GET /` - Get all chats
- `GET /new_chat` - Create new chat
- `GET /chat/{chat_id}` - Get chat by ID
- `POST /send/{chat_id}` - Send message
- `GET /health` - Health check

All API calls are handled through the `lib/api.ts` module.

## 🎨 Theme

The app supports both light and dark modes:
- Toggle using the button in the navbar
- Preference is saved in localStorage
- Respects system theme preference by default

## 🚢 Deployment on Vercel

1. **Push your code to GitHub**

2. **Import to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Select the `frontend` folder as the root directory

3. **Configure environment variables:**
   - Add `NEXT_PUBLIC_API_URL` with your backend URL

4. **Deploy:**
   - Click "Deploy"
   - Your frontend will be live in minutes!

## 🛠️ Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 📝 Environment Variables

- `NEXT_PUBLIC_API_URL` - Backend API URL (required)

## 🎯 Key Technologies

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **TailwindCSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Lucide React** - Icon library

## 📄 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
