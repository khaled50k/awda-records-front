import React, { useEffect } from 'react';
import { useAppDispatch } from '../../store';
import { toggleSidebar } from '../../store/slices/uiSlice';
import { Button } from '../ui/button';
import { ThemeToggle } from '../ui/theme-toggle';
import { Search, Menu, LogOut, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '../../hooks/useAuth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';


export const Header: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user, logout, getProfile } = useAuth();

  // Debug logging
  console.log('Header - User data:', user);
  console.log('Header - User full name:', user && 'full_name' in user ? user.full_name : user?.user?.full_name);
  console.log('Header - User username:', user && 'username' in user ? user.username : user?.user?.username);

  // Load user profile if not already loaded
  useEffect(() => {
    if (!user) {
      console.log('Header - No user data, attempting to get profile...');
      getProfile();
    }
  }, [user, getProfile]);

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      // Redirect will be handled by the auth service
      console.log('Logged out successfully');
    } else {
      console.error('Logout failed:', result.error);
    }
  };

  const getUserInitials = (name?: string) => {
    if (!name) return 'م';
    return name.split(' ').map(n => n[0]).join('').slice(0, 2);
  };

  const getUserFullName = () => {
    if (user && 'full_name' in user) return user.full_name;
    if (user && 'user' in user && user.user?.full_name) return user.user.full_name;
    return 'Unknown User';
  };

  const getUserUsername = () => {
    if (user && 'username' in user) return user.username;
    if (user && 'user' in user && user.user?.username) return user.user.username;
    return 'username';
  };

  const getUserEmail = () => {
    if (user && 'email' in user) return user.email;
    if (user && 'user' in user && user.user?.email) return user.user.email;
    return 'admin@example.com';
  };

  return (
    <header className="h-16 w-full flex items-center sticky top-0 z-50 bg-card/95 dark:bg-card/90 backdrop-blur-sm border-l border-border/40 transition-all duration-300 shadow-sm">
      <div className="flex items-center justify-between w-full h-full px-4 lg:px-6">
        {/* Left side - Mobile menu and User Greeting */}
        <div className="flex items-center gap-3 flex-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => dispatch(toggleSidebar())}
            className="md:hidden p-2 hover:bg-muted"
          >
            <Menu className="h-5 w-5" />
          </Button>
          {/* User Greeting */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">
                مرحباً، {getUserFullName()}
              </p>
            </div>
          </div>
        </div>
        {/* Center - Page title (hidden on mobile) */}
        <div className="hidden lg:flex items-center justify-center flex-1">
        </div>
        {/* Right side - Actions */}
        <div className="flex items-center gap-2 flex-1 justify-end">
          {/* Theme Toggle */}
          <ThemeToggle />
          {/* Separator */}
          <div className="h-6 w-px bg-border mx-2 hidden sm:block" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0 hover:bg-muted">
                <Avatar className="h-9 w-9">
                  <AvatarImage src="" alt={getUserUsername()} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-bold text-sm">
                    {getUserInitials(getUserFullName())}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {getUserFullName()}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    @{getUserUsername()}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                <User className="ml-2 h-4 w-4" />
                <span>الملف الشخصي</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <span>الإعدادات</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="cursor-pointer text-red-600 focus:text-red-600"
                onClick={handleLogout}
              >
                <LogOut className="ml-2 h-4 w-4" />
                <span>تسجيل الخروج</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

        </div>
      </div>


    </header>
  );
};
