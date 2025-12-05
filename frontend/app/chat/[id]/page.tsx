'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ChatSidebar from '@/components/ChatSidebar';
import ChatWindow from '@/components/ChatWindow';
import ChatInput from '@/components/ChatInput';
import { getChat, sendMessage, Message } from '@/lib/api';
import { isAuthenticated } from '@/lib/auth';

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const chatId = params?.id ? parseInt(params.id as string) : null;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [typingMessageIndex, setTypingMessageIndex] = useState<number | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check authentication
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    if (chatId) {
      loadChat();
    }
  }, [chatId, router]);

  const loadChat = async () => {
    if (!chatId) return;
    
    setIsFetching(true);
    setError('');
    
    try {
      const chat = await getChat(chatId);
      setIsFetching(false);
      
      if (chat) {
        setMessages(chat.messages || []);
      } else {
        setError('Unable to load chat. Please check if the backend is running.');
      }
    } catch (err) {
      setIsFetching(false);
      setError('Unable to connect to the server. Please check if the backend is running.');
    }
  };

  const handleSendMessage = async (message: string) => {
    if (!chatId || isLoading) return;

    // Add user message to UI
    const userMessage: Message = {
      sender: 'user',
      text: message,
      timestamp: new Date().toISOString(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Send message to backend
    const response = await sendMessage(chatId, message);
    
    setIsLoading(false);

    if (response) {
      // Add AI response to UI with typing animation
      const aiMessage: Message = {
        sender: 'ai',
        text: response,
        timestamp: new Date().toISOString(),
      };
      
      setMessages((prev) => {
        const newMessages = [...prev, aiMessage];
        // Set the last message (AI response) to show typing animation
        setTypingMessageIndex(newMessages.length - 1);
        return newMessages;
      });
    } else {
      // Handle error
      const errorMessage: Message = {
        sender: 'ai',
        text: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString(),
      };
      
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const handleChatDeleted = () => {
    router.push('/');
  };

  if (error) {
    return (
      <div className="flex h-full">
        <ChatSidebar currentChatId={chatId || undefined} onChatDeleted={handleChatDeleted} />
        <div className="flex-1 flex flex-col">
          <div className="flex-1 flex items-center justify-center bg-white dark:bg-gray-900">
            <div className="text-center max-w-md px-4">
              <div className="mb-4 text-red-500 text-5xl">⚠️</div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Connection Error
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => {
                    setError('');
                    loadChat();
                  }}
                  className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                >
                  Retry Connection
                </button>
                <button
                  onClick={() => router.push('/')}
                  className="px-6 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors"
                >
                  Back to Home
                </button>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-900 p-4">
            <div className="max-w-4xl mx-auto">
              <div className="px-4 py-3 bg-gray-200 dark:bg-gray-800 rounded-lg text-center text-sm text-gray-500 dark:text-gray-400">
                Chat unavailable - Please check backend connection
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isFetching) {
    return (
      <div className="flex h-full">
        <ChatSidebar currentChatId={chatId || undefined} onChatDeleted={handleChatDeleted} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading chat...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full relative">
      <ChatSidebar currentChatId={chatId || undefined} onChatDeleted={handleChatDeleted} />
      <div className="flex-1 flex flex-col">
        <ChatWindow messages={messages} isLoading={isLoading} typingMessageIndex={typingMessageIndex} />
        <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
      </div>
    </div>
  );
}
