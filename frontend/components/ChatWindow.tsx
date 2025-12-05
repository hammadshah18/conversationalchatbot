'use client';

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MessageBubble from './MessageBubble';
import Loader from './Loader';
import { Message } from '@/lib/api';

interface ChatWindowProps {
  messages: Message[];
  isLoading: boolean;
  typingMessageIndex?: number | null;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ messages, isLoading, typingMessageIndex = null }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-900 px-4 py-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <AnimatePresence>
          {messages.length === 0 && !isLoading ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center h-full text-center py-20"
            >
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mb-4">
                <span className="text-3xl">💬</span>
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                Start a conversation
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                Send a message to begin chatting with AI
              </p>
            </motion.div>
          ) : (
            messages.map((msg, index) => (
              <MessageBubble
                key={index}
                sender={msg.sender}
                text={msg.text}
                timestamp={msg.timestamp}
                isTyping={typingMessageIndex === index}
              />
            ))
          )}
        </AnimatePresence>
        
        {isLoading && (
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
              <span className="text-xs">🤖</span>
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-2xl rounded-tl-sm">
              <Loader />
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default ChatWindow;
