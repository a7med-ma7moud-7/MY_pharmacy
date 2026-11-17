import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function ThemeToggleButton({ variant = 'navbar', showLabel = false }) {
  const { isDark, toggleTheme } = useTheme();

  if (variant === 'surface') {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={isDark ? 'تفعيل الوضع الفاتح' : 'تفعيل الوضع الداكن'}
        title={isDark ? 'الوضع الفاتح (Light Mode)' : 'الوضع الداكن (Dark Mode)'}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer active:scale-95 bg-white dark:bg-[#11231d] text-slate-700 dark:text-emerald-300 border-slate-200 dark:border-emerald-500/25 hover:border-emerald-400"
      >
        {isDark ? (
          <Sun className="w-4 h-4 text-amber-400" />
        ) : (
          <Moon className="w-4 h-4 text-[#0f6848]" />
        )}
        {showLabel && <span>{isDark ? 'الوضع الفاتح' : 'الوضع الداكن'}</span>}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'تفعيل الوضع الفاتح' : 'تفعيل الوضع الداكن'}
      title={isDark ? 'الوضع الفاتح (Light Mode)' : 'الوضع الداكن (Dark Mode)'}
      className="relative p-2 sm:px-2.5 sm:py-2 bg-white/15 hover:bg-white/25 rounded-xl transition-all border border-white/20 flex items-center gap-1.5 cursor-pointer active:scale-95 text-white"
    >
      {isDark ? (
        <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300" />
      ) : (
        <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-100" />
      )}
      {showLabel && (
        <span className="text-xs font-bold text-white">
          {isDark ? 'الوضع الفاتح' : 'الوضع الداكن'}
        </span>
      )}
    </button>
  );
}
