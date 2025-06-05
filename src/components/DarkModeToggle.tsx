
import React, { useEffect } from 'react';
import { useAtom } from 'jotai';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { darkModeAtom } from '@/atoms/tableState';

export const DarkModeToggle: React.FC = () => {
  const [darkMode, setDarkMode] = useAtom(darkModeAtom);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setDarkMode(!darkMode)}
      className="relative"
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};
