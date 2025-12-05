'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import { getChats, createChat } from '@/lib/api';

export default function DashboardPage() {
  const router = useRouter();
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    const initializeChat = async () => {
      try {
        // Get existing chats
        const chats = await getChats();
        
        if (chats.length > 0) {
          // Redirect to the most recent chat
          router.push(`/chat/${chats[0].chat_id}`);
        } else {
          // Create a new chat if none exist
          const newChatId = await createChat();
          if (newChatId) {
            router.push(`/chat/${newChatId}`);
          } else {
            setError('Unable to create chat. Please check if the backend is running.');
          }
        }
      } catch (err) {
        console.error('Dashboard error:', err);
        setError('Unable to connect to the server. Please check if the backend is running.');
      }
    };

    initializeChat();
  }, [router]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-white dark:bg-gray-900">
        <div className="text-center max-w-md px-4">
          <div className="mb-4 text-red-500 text-5xl">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Backend Connection Error
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
            Please make sure your backend server is running on the configured URL.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => {
                setError('');
                window.location.reload();
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
    );
  }

  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    </div>
  );
}
