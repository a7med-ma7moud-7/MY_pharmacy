import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ArrowUp } from 'lucide-react';

export const ScrollToTop = () => {
  const { pathname, search } = useLocation();
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname, search]);

  useEffect(() => {
    const handleScroll = () => {
      setShowButton(window.scrollY > 360);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!showButton) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="العودة لأعلى الصفحة"
      title="العودة لأعلى الصفحة"
      className="fixed bottom-6 left-24 z-40 w-11 h-11 rounded-full bg-white text-[#0f6848] border border-emerald-200 shadow-lg hover:bg-[#0f6848] hover:text-white hover:scale-110 active:scale-95 transition-all flex items-center justify-center animate-fadeIn cursor-pointer"
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  );
};

export default ScrollToTop;

