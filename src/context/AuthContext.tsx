'use client';

import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { doc } from 'firebase/firestore';
import { useUser } from '@/firebase/provider';
import { useFirestore } from '@/firebase/provider';
import { useDoc } from '@/firebase/firestore/use-doc';
import type { UserProfile } from '@/lib/types';

// Define the shape of the context state
interface AuthContextState {
  userProfile: UserProfile | null;
  isUserProfileLoading: boolean;
  userProfileError: Error | null;
}

// Create the context
const AuthContext = createContext<AuthContextState | undefined>(undefined);

// Create the provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isUserLoading: isUserAuthLoading } = useUser();
  const firestore = useFirestore();

  const userDocRef = useMemo(() => {
    if (!user) return null;
    return doc(firestore, `users/${user.uid}`);
  }, [user, firestore]);

  const { data: userProfile, isLoading: isUserProfileLoading, error: userProfileError } = useDoc<UserProfile>(userDocRef);

  const contextValue = useMemo(() => ({
    userProfile,
    isUserProfileLoading: isUserAuthLoading || isUserProfileLoading,
    userProfileError,
  }), [userProfile, isUserAuthLoading, isUserProfileLoading, userProfileError]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Create a custom hook for using the auth context
export const useAuthContext = (): AuthContextState => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};