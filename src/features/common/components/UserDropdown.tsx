import * as React from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Button } from "../../../components/ui/button.tsx";

interface UserDropdownProps {
    user: {
        user_metadata: any;
        email?: string | null;
    } | null;
    onSignOut: () => void;
}

export const UserDropdown = React.memo(({ user, onSignOut }: UserDropdownProps) => {
  // Keep all hooks at the top level of the component
  const avatarUrl = React.useMemo(() => {
    if (!user?.user_metadata) return null;
    
    // Google specific paths
    if (user.user_metadata.picture) return user.user_metadata.picture;
    if (user.user_metadata.avatar_url) return user.user_metadata.avatar_url;
    
    // Facebook specific path
    if (user.user_metadata.picture?.data?.url) return user.user_metadata.picture.data.url;
    
    // Microsoft specific paths
    if (user.user_metadata.photo) return user.user_metadata.photo;
    
    // Generic OAuth paths
    if (user.user_metadata.profile?.picture) return user.user_metadata.profile.picture;
    if (user.user_metadata.profile?.avatar_url) return user.user_metadata.profile.avatar_url;
    
    return null;
  }, [user?.user_metadata]);

  // Memoize the error handler to prevent recreating it on every render
  const handleImageError = React.useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    console.error('Avatar image failed to load:', avatarUrl);
    const target = e.target as HTMLImageElement;
    target.src = ''; // Clear broken image
    target.onerror = null; // Prevent infinite loop
  }, [avatarUrl]);

  console.log('Rendering UserDropdown');

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <div className="flex items-center space-x-3 cursor-pointer select-none">
          <div className="h-10 w-10 rounded-full bg-white/40 backdrop-blur-sm flex items-center justify-center border-2 border-white/30 overflow-hidden mr-2">
            {avatarUrl ? (
              <img 
                src={avatarUrl} 
                alt="User avatar" 
                className="h-full w-full object-cover"
                onError={handleImageError}
              />
            ) : (
              <span className="text-slate-600">מ</span>
            )}
          </div>
          <div className="text-right hidden md:block">
            <p className="text-slate-800 font-medium text-sm">{user?.email}</p>
            <p className="text-slate-600 text-xs">מנהל מערכת</p>
          </div>
        </div>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="relative min-w-[220px] bg-gradient-to-b from-white/95 to-white/90 rounded-xl p-3 
            shadow-[0_4px_20px_-1px_rgba(0,0,0,0.1)] 
            border border-slate-200
            backdrop-blur-lg backdrop-saturate-150
            animate-in fade-in-0 zoom-in-95
            data-[side=bottom]:slide-in-from-top-2
            data-[side=top]:slide-in-from-bottom-2
            z-[60]"
          sideOffset={5}
          align="end"
        >
          {/* Bubble Arrow - with matching border color */}
          <div className="absolute -top-[9px] right-[10px] w-[18px] h-[18px] rotate-45 
            bg-gradient-to-b from-white/95 to-white/90
            border-t border-l border-slate-200
            backdrop-blur-lg" 
          />

          {/* Content with increased relative z-index */}
          <div className="relative z-10">
            <div className="px-2 py-2 text-sm text-slate-600 border-b border-slate-200/60 mb-2">
              {user?.email} -מחובר כ
            </div>

            <DropdownMenu.Item className="outline-none">
              <Button
                variant="ghost"
                className="w-full justify-end text-red-600 hover:text-red-700 
                  hover:bg-red-50/80 active:bg-red-100/80
                  rounded-md px-4 py-2
                  transition-all duration-150"
                onClick={onSignOut}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="ml-2 mt-[2px]"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                התנתק
              </Button>
            </DropdownMenu.Item>
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
});