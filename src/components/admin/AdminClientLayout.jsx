'use client';

import { AuthProvider } from '../../contexts/AuthContext';

export default function AdminClientLayout({ children }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
