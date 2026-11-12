import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ArrowUp } from 'lucide-react';

export const ScrollToTop = () => {
    const { pathname, search } = useLocation();
    const [showButton, setShowButton] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [pathname, search]);

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            setShowButton(scrollTop > 340);
            if (docHeight > 0) {
                setProgress(Math.min(100, Math.max(0, (scrollTop / docHeight) * 100)));
            } else {
                setProgress(0);
            }
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    if (!showButton) return null;

    const radius = 20;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="العودة لأعلى الصفحة"
            title="العودة لأعلى الصفحة"
            className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-white/95 backdrop-blur-md text-[#0f6848] shadow-xl border border-slate-200/80 hover:bg-[#0f6848] hover:text-white hover:scale-110 active:scale-95 transition-all flex items-center justify-center animate-scaleIn cursor-pointer group"
        >
            <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 48 48">
                <circle
                    cx="24"
                    cy="24"
                    r={radius}
                    fill="none"
                    stroke="rgba(15, 104, 72, 0.14)"
                    strokeWidth="2.5"
                />
                <circle
                    cx="24"
                    cy="24"
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-150"
                />
            </svg>
            <ArrowUp className="w-4 h-4 relative z-10 group-hover:-translate-y-0.5 transition-transform" />
        </button>
    );
};

export default ScrollToTop;
