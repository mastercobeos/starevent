import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, LayoutDashboard, Package } from 'lucide-react';

export default function AdminLayout({ children }) {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-background">
      <header
        className="sticky top-0 z-50 backdrop-blur-md border-b border-white/10"
        style={{
          background: 'linear-gradient(135deg, hsl(var(--navbar) / 0.12) 0%, hsl(var(--navbar) / 0.18) 50%, hsl(var(--navbar) / 0.12) 100%)',
          backdropFilter: 'blur(12px) saturate(180%)',
          WebkitBackdropFilter: 'blur(12px) saturate(180%)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14 sm:h-16">
          <Link to="/admin" className="flex items-center gap-3">
            <img src="/logo.png" alt="Star Event Rental" className="h-8 sm:h-10 w-auto" />
            <span className="text-white font-bold text-base sm:text-lg hidden sm:inline">Admin Panel</span>
          </Link>

          <nav className="flex items-center gap-1 sm:gap-4">
            <Link
              to="/admin"
              className="flex items-center gap-1.5 text-white/70 hover:text-white transition-colors px-2 sm:px-3 py-2 rounded-lg hover:bg-white/10 text-sm"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">Reservations</span>
            </Link>
            <Link
              to="/admin/inventory"
              className="flex items-center gap-1.5 text-white/70 hover:text-white transition-colors px-2 sm:px-3 py-2 rounded-lg hover:bg-white/10 text-sm"
            >
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">Inventory</span>
            </Link>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 text-white/70 hover:text-white transition-colors px-2 sm:px-3 py-2 rounded-lg hover:bg-white/10 text-sm ml-2"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </nav>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">{children}</main>
    </div>
  );
}
