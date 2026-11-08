import { atom } from 'jotai';
import apiService from '../services/api';
import { API_URL } from '../config';

export interface User {
  id: number;
  email: string;
  name: string;
}

// Base atoms
export const userAtom = atom<User | null>(null);
export const authLoadingAtom = atom<boolean>(true);

// Derived atom for authentication status
export const isAuthenticatedAtom = atom((get) => {
  const user = get(userAtom);
  return !!user;
});

// Initialize auth - verify with backend
export const initializeAuthAtom = atom(null, async (get, set) => {
  try {  
    // Try to fetch user info from backend (cookie will be sent automatically)
    const response = await fetch(`${API_URL}/auth/me`, {
      credentials: 'include', // Include cookies
    });
    
    if (response.ok) {
      const user = await response.json();
      set(userAtom, user);
    } else {
      set(userAtom, null);
    }
  } catch (error) {
    console.error('Error initializing auth:', error);
    set(userAtom, null);
  } finally {
    set(authLoadingAtom, false);
  }
});

// Login action atom
export const loginAtom = atom(
  null,
  async (get, set, { email, password }: { email: string; password: string }) => {
    try {
      const response = await apiService.login(email, password);
      
      if (response.success && response.user) {
        // Cookie is set automatically by backend
        set(userAtom, response.user);
        return { success: true };
      } else {
        return { success: false, error: response.error || 'Login failed' };
      }
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to connect to server' 
      };
    }
  }
);

// Logout action atom
export const logoutAtom = atom(null, async (get, set) => {
  try {
    // Call backend logout to clear cookie
    await apiService.logout();
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    set(userAtom, null);
  }
});

