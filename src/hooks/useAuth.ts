import { useAtomValue, useSetAtom } from 'jotai';
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  userAtom,
  isAuthenticatedAtom,
  authLoadingAtom,
  initializeAuthAtom,
  loginAtom,
  logoutAtom
} from '../store/authAtoms';
import { useFlavorPath } from '../flavors/FlavorContext';

export const useAuth = () => {
  const user = useAtomValue(userAtom);
  const isAuthenticated = useAtomValue(isAuthenticatedAtom);
  const loading = useAtomValue(authLoadingAtom);
  const initializeAuth = useSetAtom(initializeAuthAtom);
  const login = useSetAtom(loginAtom);
  const setLogout = useSetAtom(logoutAtom);
  const navigate = useNavigate();
  const flavorPath = useFlavorPath();
  const queryClient = useQueryClient();

  // Initialize auth on mount
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const handleLogout = async () => {
    // Clear Jotai atoms and backend cookie
    await setLogout();
    queryClient.clear();
    // Back to the login page of the industry site we are currently on
    navigate(flavorPath('login'));
  };

  return {
    user,
    isAuthenticated,
    loading,
    login: async (email: string, password: string) => {
      const result = await login({ email, password });
      queryClient.clear();
      return result;
    },
    logout: handleLogout,
  };
};

