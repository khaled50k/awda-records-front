
import React from 'react';
import { useSelector } from 'react-redux';
import { RootState, useAppDispatch } from '../../store';
import { toggleTheme } from '../../store/slices/uiSlice';
import { Button } from './button';
import { Moon, Sun } from 'lucide-react';

export const ThemeToggle: React.FC = () => {
  const dispatch = useAppDispatch();
  const { theme } = useSelector((state: RootState) => state.ui);

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => dispatch(toggleTheme())}
      className="w-9 h-9 p-0"
    >
      {theme === 'dark' ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};
