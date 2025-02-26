import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext.tsx';
import { UserDropdown } from './UserDropdown.tsx';
import { ThemeSelector } from './ThemeSelector.tsx';

interface NavbarProps {
  user: {
    user_metadata: any;
    email?: string | null;
  } | null;
}

export const Navbar = React.memo(({ user }: NavbarProps) => {
 const location = useLocation();
  const { signOut } = useAuth();
    
  const handleSignOut = React.useCallback(async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }, [signOut]);

  return (
    <nav className="fixed top-0 left-0 right-0 h-[72px] z-50
      bg-[var(--theme-color-2)]
      backdrop-filter 
      backdrop-blur-lg       
      backdrop-opacity-80
      firefox:bg-opacity-90
      border-b 
      border-white/20
      px-6
      flex
      items-center
      justify-between
      shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)]
      transition-all 
      duration-300 
      ease-in-out">
      
      {/* Left side - Logo, Title and Dashboard Link */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center">
          <img src="/logo.svg" alt="Logo" className="h-8 w-8 mr-3" />
          <span className="text-xl font-semibold" style={{ color: 'var(--theme-color-1)' }}>מתכנן שיעורים לחדר אימרסיבי</span>
        </div>
      </div>      
      <div className="flex items-center gap-4">
        <ThemeSelector />
        {location.pathname !== "/" && (
          <a href="/" className="hover:opacity-80 transition-opacity" style={{ color: 'var(--theme-color-1)' }}>חזרה לדשבורד</a>
)}
      </div>
      {/* Right side - User Profile and Logout */}
      <div className="flex items-center space-x-4 mr-6">
        <UserDropdown user={user} onSignOut={handleSignOut} />
      </div>
    </nav>
  );
});
