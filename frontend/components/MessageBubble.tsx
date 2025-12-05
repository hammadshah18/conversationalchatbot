'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { User, Bot } from 'lucide-react';
import TypingAnimation from './TypingAnimation';
import FormattedText from './FormattedText';

interface MessageBubbleProps {
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  isTyping?: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ sender, text, timestamp, isTyping = false }) => {
  const isUser = sender === 'user';

  const formatTimestamp = (ts: string) => {
    try {
      const date = new Date(ts);
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch {
      return '';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
    >
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isUser 
          ? 'bg-primary-600 dark:bg-primary-500' 
          : 'bg-gray-200 dark:bg-gray-700'
      }`}>
        {isUser ? (
          <User className="w-5 h-5 text-white" />
        ) : (
          <Bot className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        )}
      </div>
      
      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[75%]`}>
        <div className={`px-4 py-2 rounded-2xl ${
          isUser
            ? 'bg-primary-600 text-white rounded-tr-sm'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-tl-sm'
        }`}>
          {isTyping && !isUser ? (
            <TypingAnimation text={text} speed={20} />
          ) : isUser ? (
            <p className="text-sm whitespace-pre-wrap break-words">{text}</p>
          ) : (
            <FormattedText text={text} className="text-sm" />
          )}
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 px-1">
          {formatTimestamp(timestamp)}
        </span>
      </div>
    </motion.div>
  );
};

export default MessageBubble;
