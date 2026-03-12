'use client';

import { AuthProvider } from '../../contexts/AuthContext';
import { ToastProvider } from '../ui/Toast';
import { ConfirmProvider } from '../ui/ConfirmModal';

export default function AdminClientLayout({ children }) {
  return (
    <AuthProvider>
      <ToastProvider>
        <ConfirmProvider>
          {children}
        </ConfirmProvider>
      </ToastProvider>
    </AuthProvider>
  );
}
