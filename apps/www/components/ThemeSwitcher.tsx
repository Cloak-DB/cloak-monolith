'use client';

import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

interface ThemeSwitcherProps {
  isScrolled?: boolean;
  isMobile?: boolean;
}

export function ThemeSwitcher(
  props: ThemeSwitcherProps = { isScrolled: false, isMobile: false }
) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const prefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches;
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    setTheme(initialTheme);
    document.documentElement.classList.toggle('dark', initialTheme === 'dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  if (!mounted) {
    return (
      <div className="h-full px-6 flex items-center">
        <div className="w-5 h-5" />
      </div>
    );
  }

  if (props.isMobile) {
    return (
      <button
        onClick={toggleTheme}
        className="w-full px-6 py-5 flex items-center justify-between font-black text-lg uppercase hover:bg-orange-500 hover:text-black hover:shadow-[inset_6px_0px_0px_rgba(0,0,0,0.2)] dark:hover:shadow-[inset_6px_0px_0px_rgba(255,255,255,0.1)] hover:translate-x-2 transition-all duration-300 ease-out text-left group"
        aria-label="Toggle theme"
      >
        <span>Theme</span>
        <span className="flex items-center gap-2 text-sm">
          {theme === 'light' ? (
            <>
              <Moon
                size={18}
                strokeWidth={2.5}
                className="group-hover:rotate-12 transition-transform duration-300"
              />
              Dark
            </>
          ) : (
            <>
              <Sun
                size={18}
                strokeWidth={2.5}
                className="group-hover:rotate-12 transition-transform duration-300"
              />
              Light
            </>
          )}
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="h-full px-6 flex items-center hover:bg-orange-500 hover:text-black dark:hover:bg-orange-500 dark:hover:text-black hover:shadow-[inset_4px_4px_0px_rgba(0,0,0,0.2)] dark:hover:shadow-[inset_4px_4px_0px_rgba(255,255,255,0.1)] hover:scale-105 transition-all duration-300 ease-out group"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <Moon
          size={props.isScrolled ? 18 : 20}
          strokeWidth={2.5}
          className="group-hover:rotate-12 transition-transform duration-300"
        />
      ) : (
        <Sun
          size={props.isScrolled ? 18 : 20}
          strokeWidth={2.5}
          className="group-hover:rotate-12 transition-transform duration-300"
        />
      )}
    </button>
  );
}
