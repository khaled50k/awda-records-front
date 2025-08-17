import React, { useEffect, useCallback } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../store';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { toggleSidebar, setSidebarOpen } from '../../store/slices/uiSlice';
import { Menu, Stethoscope, User, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { useAuth } from '../../hooks/useAuth';
import { useRoutes } from '../../hooks/useRoutes';

export const Sidebar: React.FC = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { sidebarOpen } = useSelector((state: RootState) => state.ui);
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { routes, userRole, isAuthenticated, getUserRoleInfo } = useRoutes();

  // Close sidebar on ESC key (mobile only)
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && sidebarOpen && window.innerWidth < 768) {
      dispatch(setSidebarOpen(false));
    }
  }, [dispatch, sidebarOpen]);

  useEffect(() => {
    if (sidebarOpen && window.innerWidth < 768) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [sidebarOpen, handleKeyDown]);

  // Backdrop for mobile
  const showMobileSidebar = sidebarOpen && typeof window !== 'undefined' && window.innerWidth < 768;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Get role display information from the hook
  const { display: userRoleDisplay, type: userTypeDisplay, permissions: permissionsDisplay } = getUserRoleInfo;

  return (
    <>
      {/* Backdrop overlay for mobile */}
      {showMobileSidebar && (
        <div
          className="fixed inset-0 z-30 bg-black/40 dark:bg-black/70 backdrop-blur-sm md:hidden"
          onClick={() => dispatch(setSidebarOpen(false))}
          aria-label="إغلاق القائمة الجانبية"
        />
      )}
      <aside
        className={cn(
          // Desktop: relative, Mobile: fixed overlay
          "h-full bg-card/95 dark:bg-card/90 backdrop-blur-sm border-l border-border/40 transition-all duration-300 z-40 shadow-2xl flex flex-col",
          sidebarOpen ? 'w-64' : 'w-20',
          'md:relative md:z-10',
          // Hide on mobile unless open
          showMobileSidebar ? 'fixed top-0 right-0 md:static md:block' : 'hidden md:block',
          'md:h-full h-screen',
          'overflow-hidden'
        )}
        style={{ minWidth: sidebarOpen ? '16rem' : '5rem', maxWidth: sidebarOpen ? '16rem' : '5rem' }}
      >
        {/* Logo and Toggle */}
        <div className="p-4 border-b border-border/30" style={{ maxHeight: '63px' }}>
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg">
                  <Stethoscope className="text-primary-foreground w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-foreground">النظام الطبي</h1>
                  <p className="text-xs text-muted-foreground">{userRoleDisplay}</p>
                </div>
              </div>
            )}
            <button
              onClick={() => dispatch(toggleSidebar())}
              className={cn(
                "p-2.5 rounded-xl hover:bg-accent/80 transition-all duration-200 hover:shadow-md",
                !sidebarOpen && "mx-auto"
              )}
            >
              <Menu className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {routes.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center p-3 rounded-xl transition-all duration-200 group relative",
                    isActive 
                      ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm backdrop-blur-sm' 
                      : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground hover:shadow-sm',
                    !sidebarOpen && "justify-center"
                  )}
                >
                  <item.icon className={cn(
                    "w-5 h-5 transition-all duration-200",
                    sidebarOpen ? 'ml-3' : '',
                    isActive && "text-primary"
                  )} />
                  {sidebarOpen && (
                    <span className="font-medium flex-1 text-sm">{item.label}</span>
                  )}
                  {/* Tooltip for collapsed state */}
                  {!sidebarOpen && (
                    <div className="absolute right-20 bg-popover text-popover-foreground px-3 py-2 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap z-50 shadow-xl border pointer-events-none">
                      {item.label}
                      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 translate-x-1 w-2 h-2 bg-popover rotate-45 border-l border-b border-border"></div>
                    </div>
                  )}
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* Profile Section */}
        <div className="p-4 border-t border-border/30">
          {sidebarOpen ? (
            <div className="space-y-3">
              <NavLink
                to="/profile"
                className={cn(
                  "flex items-center p-3 rounded-xl transition-all duration-200 hover:bg-accent/60",
                  location.pathname === '/profile' && "bg-primary/10 text-primary"
                )}
              >
                <User className="w-5 h-5 ml-3" />
                <span className="font-medium text-sm">الملف الشخصي</span>
              </NavLink>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="w-full"
              >
                <LogOut className="w-4 h-4 ml-2" />
                تسجيل الخروج
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              <NavLink
                to="/profile"
                className="p-2.5 rounded-xl hover:bg-accent/60 transition-all duration-200"
              >
                <User className="w-5 h-5 text-muted-foreground" />
              </NavLink>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="p-2"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
