'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Plus, MessageSquare, ChevronLeft, ChevronRight, Trash2, Edit2, Check, X } from 'lucide-react';
import { getChats, createChat, deleteChat, updateChatTitle, ChatListItem } from '@/lib/api';

interface ChatSidebarProps {
  currentChatId?: number;
  onChatDeleted?: () => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ currentChatId, onChatDeleted }) => {
  const router = useRouter();
  const [chats, setChats] = useState<ChatListItem[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editingChatId, setEditingChatId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    try {
      const chatList = await getChats();
      setChats(chatList);
      setError('');
    } catch (err) {
      setError('Unable to load chats');
      console.error('Error loading chats:', err);
    }
  };

  const handleNewChat = async () => {
    if (isCreating) return;
    
    setIsCreating(true);
    try {
      const chatId = await createChat();
      setIsCreating(false);
      
      if (chatId) {
        await loadChats();
        router.push(`/chat/${chatId}`);
      } else {
        setError('Unable to create chat. Check backend connection.');
      }
    } catch (err) {
      setIsCreating(false);
      setError('Unable to create chat. Check backend connection.');
    }
  };

  const handleChatClick = (chatId: number) => {
    router.push(`/chat/${chatId}`);
  };

  const handleDeleteChat = async (chatId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm('Are you sure you want to delete this chat?')) {
      return;
    }

    const success = await deleteChat(chatId);
    if (success) {
      await loadChats();
      
      // If deleted chat was current, redirect to home
      if (chatId === currentChatId) {
        onChatDeleted?.();
        router.push('/');
      }
    }
  };

  const handleEditClick = (chatId: number, currentTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingChatId(chatId);
    setEditTitle(currentTitle);
  };

  const handleSaveTitle = async (chatId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (editTitle.trim() === '') {
      setEditingChatId(null);
      return;
    }

    const success = await updateChatTitle(chatId, editTitle.trim());
    if (success) {
      await loadChats();
      setEditingChatId(null);
    }
  };

  const handleCancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingChatId(null);
    setEditTitle('');
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (date.toDateString() === today.toDateString()) {
        return 'Today';
      } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
      } else {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
    } catch {
      return '';
    }
  };

  return (
    <>
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? '0px' : '280px' }}
        className="bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden"
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleNewChat}
            disabled={isCreating}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">
              {isCreating ? 'Creating...' : 'New Chat'}
            </span>
          </motion.button>
          
          {error && (
            <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-xs text-red-600 dark:text-red-400">
              {error}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {chats.length === 0 && !error ? (
            <div className="text-center py-8 px-4">
              <MessageSquare className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No chats yet
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {chats.map((chat) => (
                <motion.div
                  key={chat.chat_id}
                  whileHover={{ scale: 1.02 }}
                  className={`relative group w-full text-left px-3 py-3 rounded-lg transition-colors ${
                    currentChatId === chat.chat_id
                      ? 'bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <div 
                    onClick={() => handleChatClick(chat.chat_id)}
                    className="cursor-pointer"
                  >
                    <div className="flex items-start space-x-3">
                      <MessageSquare className={`w-4 h-4 mt-1 flex-shrink-0 ${
                        currentChatId === chat.chat_id
                          ? 'text-primary-600 dark:text-primary-400'
                          : 'text-gray-400 dark:text-gray-500'
                      }`} />
                      <div className="flex-1 min-w-0">
                        {editingChatId === chat.chat_id ? (
                          <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="text"
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              className="flex-1 text-sm px-2 py-1 bg-white dark:bg-gray-700 border border-primary-400 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                              autoFocus
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  handleSaveTitle(chat.chat_id, e as any);
                                }
                              }}
                            />
                            <button
                              onClick={(e) => handleSaveTitle(chat.chat_id, e)}
                              className="p-1 hover:bg-primary-100 dark:hover:bg-primary-900/40 rounded"
                            >
                              <Check className="w-3 h-3 text-green-600" />
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                            >
                              <X className="w-3 h-3 text-red-600" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <p className={`text-sm font-medium truncate ${
                              currentChatId === chat.chat_id
                                ? 'text-primary-900 dark:text-primary-100'
                                : 'text-gray-900 dark:text-gray-100'
                            }`}>
                              {chat.preview || 'New conversation'}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {formatDate(chat.created_at)}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {editingChatId !== chat.chat_id && (
                    <div className="absolute right-2 top-3 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => handleEditClick(chat.chat_id, chat.preview, e)}
                        className="p-1 hover:bg-primary-100 dark:hover:bg-primary-900/40 rounded"
                        title="Edit title"
                      >
                        <Edit2 className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteChat(chat.chat_id, e)}
                        className="p-1 hover:bg-red-100 dark:hover:bg-red-900/40 rounded"
                        title="Delete chat"
                      >
                        <Trash2 className="w-3 h-3 text-red-600 dark:text-red-400" />
                      </button>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.aside>

      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute top-20 left-0 z-10 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-r-lg shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        style={{ left: isCollapsed ? '0' : '280px' }}
      >
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        )}
      </button>
    </>
  );
};

export default ChatSidebar;
