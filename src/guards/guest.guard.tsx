import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../services/auth-context';

export function GuestGuard({ children }: { children: ReactNode }) {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return null;
  }

  return currentUser ? <Navigate to="/dashboard" replace /> : <>{children}</>;
}
