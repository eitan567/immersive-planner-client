import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../ThemeContext.tsx';
import { Palette } from 'lucide-react';

const ThemeColors = ({ themeId }: { themeId: 'default' | 'purple' }) => {
  const colors = themeId === 'default'
    ? ['#fa4083', '#e3cbdc', '#fff4fc']
    : ['#f06094', '#c161a4', '#8d62a3', '#5d5e93', '#3b5578', '#2f4858'];

  return (
    <div className="theme-circles-stack">
      {colors.map((color, i) => (
        <div
          key={i}
          className="theme-circle"
          style={{
            backgroundColor: color,
            zIndex: colors.length - i
          }}
        />
      ))}
    </div>
  );
};

export const ThemeSelector = () => {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const themes = [
    { id: 'default', name: 'ערכת נושא מקורית' },
    { id: 'purple', name: 'ערכת נושא סגולה' },
  ] as const;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1 text-primary hover:text-secondary transition-colors duration-200"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <Palette className="h-5 w-5" />
        <span className="text-sm font-medium select-none">ערכת נושא</span>
      </button>

      {isOpen && (
        <div 
          className="absolute left-0 mt-2 w-72 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50"
          role="menu"
          aria-orientation="vertical"
        >
          <div className="py-1">
            {themes.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setTheme(t.id);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-3 text-sm hover:bg-secondary/10 transition-colors duration-200 flex items-center justify-between
                  ${theme === t.id ? 'text-primary font-semibold bg-secondary/5' : 'text-gray-700'}`}
                role="menuitem"
                aria-current={theme === t.id}
              >
                <span>{t.name}</span>
                <ThemeColors themeId={t.id} />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};