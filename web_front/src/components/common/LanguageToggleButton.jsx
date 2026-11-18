import React from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function LanguageToggleButton({ variant = 'navbar' }) {
  const { isEn, toggleLanguage } = useLanguage();

  if (variant === 'capsule') {
    return (
      <button
        type="button"
        onClick={toggleLanguage}
        data-no-i18n="true"
        aria-label={isEn ? 'Switch to Arabic' : 'Switch to English'}
        title={isEn ? 'التبديل إلى العربية' : 'Switch to English'}
        className="h-8 px-2.5 rounded-full text-[11px] font-extrabold tracking-wide text-white/95 hover:text-white hover:bg-white/15 transition-all flex items-center justify-center cursor-pointer active:scale-95"
      >
        <span>{isEn ? 'عربي' : 'EN'}</span>
      </button>
    );
  }

  if (variant === 'surface-capsule') {
    return (
      <button
        type="button"
        onClick={toggleLanguage}
        data-no-i18n="true"
        aria-label={isEn ? 'Switch to Arabic' : 'Switch to English'}
        title={isEn ? 'التبديل إلى العربية' : 'Switch to English'}
        className="h-8 px-2.5 rounded-full text-[11px] font-extrabold tracking-wide text-slate-700 dark:text-emerald-300 hover:bg-white dark:hover:bg-white/10 transition-all flex items-center justify-center cursor-pointer active:scale-95"
      >
        <span>{isEn ? 'عربي' : 'EN'}</span>
      </button>
    );
  }

  if (variant === 'surface') {
    return (
      <button
        type="button"
        onClick={toggleLanguage}
        data-no-i18n="true"
        aria-label={isEn ? 'Switch to Arabic' : 'Switch to English'}
        title={isEn ? 'التبديل إلى العربية' : 'Switch to English'}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold border transition-all cursor-pointer active:scale-95 bg-white dark:bg-[#11231d] text-slate-700 dark:text-emerald-300 border-slate-200 dark:border-emerald-500/25 hover:border-emerald-400"
      >
        <Globe className="w-3.5 h-3.5 text-[#0f6848] dark:text-emerald-300" />
        <span>{isEn ? 'عربي' : 'EN'}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      data-no-i18n="true"
      aria-label={isEn ? 'Switch to Arabic' : 'Switch to English'}
      title={isEn ? 'التبديل إلى العربية' : 'Switch to English'}
      className="relative px-2.5 py-2 bg-white/15 hover:bg-white/25 rounded-xl transition-all border border-white/20 flex items-center gap-1.5 cursor-pointer active:scale-95 text-white text-xs font-extrabold"
    >
      <Globe className="w-4 h-4 text-emerald-200" />
      <span>{isEn ? 'عربي' : 'EN'}</span>
    </button>
  );
}
