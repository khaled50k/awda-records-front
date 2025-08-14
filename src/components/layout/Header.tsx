import React from 'react';
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
  const { user, logout } = useAuth();

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

  return (
    <header className="h-16 w-full flex items-center sticky top-0 z-50 bg-card/95 dark:bg-card/90 backdrop-blur-sm border-l border-border/40 transition-all duration-300 shadow-sm">
      <div className="flex items-center justify-between w-full h-full px-4 lg:px-6">
        {/* Left side - Mobile menu and Search */}
        <div className="flex items-center gap-3 flex-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => dispatch(toggleSidebar())}
            className="md:hidden p-2 hover:bg-muted"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="hidden sm:flex items-center gap-2 flex-1 max-w-md">
        
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
          {/* User Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0 hover:bg-muted">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user?.profile_image} alt={user?.username || 'User'} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-bold text-sm">
                    {getUserInitials(user?.username)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.username || 'مدير النظام'}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email || 'admin@example.com'}
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
          {/* Mobile user info */}
          <div className="sm:hidden flex items-center gap-2">
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">
                {user?.username || 'مدير النظام'}
              </p>
              <p className="text-xs text-muted-foreground">
                {user?.email || 'admin@example.com'}
              </p>
            </div>
          </div>
        </div>
      </div>


    </header>
  );
};
