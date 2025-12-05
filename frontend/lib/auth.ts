// API Base URL from environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Auth types
export interface SignupData {
  email: string;
  password: string;
  name: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: {
    id: number;
    email: string;
    name: string;
  };
}

// Auth Functions

/**
 * User signup
 */
export async function signup(data: SignupData): Promise<AuthResponse | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || 'Signup failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Signup error:', error);
    throw error;
  }
}

/**
 * User login
 */
export async function login(data: LoginData): Promise<AuthResponse | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || 'Login failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

/**
 * User logout
 */
export async function logout(token: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });
    
    return response.ok;
  } catch (error) {
    console.error('Logout error:', error);
    return false;
  }
}

// Local storage helpers
export function saveAuthToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', token);
  }
}

export function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
}

export function clearAuthToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
  }
}

export function saveUserData(user: { id: number; email: string; name: string }): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('user_data', JSON.stringify(user));
  }
}

export function getUserData(): { id: number; email: string; name: string } | null {
  if (typeof window !== 'undefined') {
    const data = localStorage.getItem('user_data');
    return data ? JSON.parse(data) : null;
  }
  return null;
}

export function clearUserData(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('user_data');
  }
}

export function isAuthenticated(): boolean {
  return !!getAuthToken();
}
