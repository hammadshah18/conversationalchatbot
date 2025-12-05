// API Base URL from environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Types
export interface Message {
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export interface Chat {
  chat_id: number;
  messages: Message[];
  created_at: string;
}

export interface ChatListItem {
  chat_id: number;
  preview: string;
  created_at: string;
}

// API Functions

/**
 * Get all chats
 */
export async function getChats(): Promise<ChatListItem[]> {
  try {
    // First try to get the latest chat to check if any exist
    const response = await fetch(`${API_BASE_URL}/`);
    if (!response.ok) {
      throw new Error('Failed to fetch chats');
    }
    const data = await response.json();
    
    // If we get a redirect_to, we need to fetch all chats differently
    // For now, we'll fetch from a sample chat to get the sidebar
    if (data.redirect_to) {
      // Extract chat_id if available
      const match = data.redirect_to.match(/\/chat\/(\d+)/);
      if (match) {
        const chatId = parseInt(match[1]);
        const chatResponse = await fetch(`${API_BASE_URL}/chat/${chatId}`);
        if (chatResponse.ok) {
          const chatData = await chatResponse.json();
          return (chatData.chats || []).map((chat: any) => ({
            chat_id: chat.id,
            preview: chat.title || 'New conversation',
            created_at: chat.created_at
          }));
        }
      }
    }
    return [];
  } catch (error) {
    console.error('Error fetching chats:', error);
    return [];
  }
}

/**
 * Get a specific chat by ID
 */
export async function getChat(id: number): Promise<Chat | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/chat/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch chat');
    }
    const data = await response.json();
    
    // Transform backend format to frontend format
    return {
      chat_id: data.current_chat,
      messages: (data.messages || []).map((msg: any) => ({
        sender: msg.sender,
        text: msg.text,
        timestamp: msg.created_at
      })),
      created_at: data.messages?.[0]?.created_at || new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching chat:', error);
    return null;
  }
}

/**
 * Create a new chat
 */
export async function createChat(): Promise<number | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/new_chat`);
    if (!response.ok) {
      throw new Error('Failed to create chat');
    }
    const data = await response.json();
    return data.chat_id;
  } catch (error) {
    console.error('Error creating chat:', error);
    return null;
  }
}

/**
 * Send a message to a chat
 */
export async function sendMessage(chatId: number, message: string): Promise<string | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/send/${chatId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to send message');
    }
    
    const data = await response.json();
    // Backend returns ai_message, not response
    return data.ai_message || data.response || null;
  } catch (error) {
    console.error('Error sending message:', error);
    return null;
  }
}

/**
 * Check backend health
 */
export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch (error) {
    console.error('Error checking health:', error);
    return false;
  }
}

/**
 * Delete a chat by ID
 */
export async function deleteChat(chatId: number): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/chat/${chatId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete chat');
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting chat:', error);
    return false;
  }
}

/**
 * Update chat title
 */
export async function updateChatTitle(chatId: number, title: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/chat/${chatId}/title`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update title');
    }
    
    return true;
  } catch (error) {
    console.error('Error updating title:', error);
    return false;
  }
}
