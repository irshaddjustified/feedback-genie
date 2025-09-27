'use client';

import { useState, useEffect } from 'react';
import { authService, AppUser } from '@/lib/firebase';
import { PermissionManager } from '@/lib/permissions';

export function useFirebaseAuth() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      const user = await authService.signInWithEmail(email, password);
      setUser(user);
      return user;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign in failed';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setError(null);
      setLoading(true);
      const user = await authService.signInWithGoogle();
      setUser(user);
      return user;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Google sign in failed';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInAnonymously = async () => {
    try {
      setError(null);
      setLoading(true);
      const user = await authService.signInAnonymously();
      setUser(user);
      return user;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Anonymous sign in failed';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createAccount = async (email: string, password: string, displayName?: string) => {
    try {
      setError(null);
      setLoading(true);
      const user = await authService.createAccount(email, password, displayName);
      setUser(user);
      return user;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Account creation failed';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      await authService.signOut();
      setUser(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign out failed';
      setError(errorMessage);
      throw error;
    }
  };

  return {
    user,
    loading,
    error,
    signInWithEmail,
    signInWithGoogle,
    signInAnonymously,
    createAccount,
    signOut,
    isAuthenticated: !!user && !user.isAnonymous,
    isAdmin: PermissionManager.isAdmin(user)
  };
}
