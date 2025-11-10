"use client";

import React from 'react';
import { AuthProvider as RawAuthProvider } from './contexts/AuthContext';

const AuthProvider = RawAuthProvider as unknown as React.ComponentType<{ children: React.ReactNode }>;

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}