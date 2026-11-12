import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, TrendingUp } from 'lucide-react';

export const StatCard = ({
    title,
    value,
    icon: Icon,
    color = 'primary',
    subtext,
    linkText,
    linkTo,
    index = 0,
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [animatedNum, setAnimatedNum] = useState(0);
    const cardRef = useRef(null);

    // Parse numeric value & optional suffix (e.g. "12,500 ج.م" or 42)
    const rawStr = String(value ?? '0');
    const numericMatch = rawStr.match(/^[\d,.\s]+/);
    const isNumeric = Boolean(numericMatch);
    const targetNumber = isNumeric
        ? Number(numericMatch[0].replace(/,/g, '').trim()) || 0
        : 0;
    const suffix = isNumeric ? rawStr.slice(numericMatch[0].length) : '';

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), index * 80);
        return () => clearTimeout(timer);
    }, [index]);

    useEffect(() => {
        if (!isVisible || !isNumeric) return;
        let frameId;
        const duration = 1100;
        const start = performance.now();

        const tick = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setAnimatedNum(Math.round(eased * targetNumber));
            if (progress < 1) {
                frameId = requestAnimationFrame(tick);
            }
        };

        frameId = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frameId);
    }, [isVisible, isNumeric, targetNumber]);

    const colorMap = {
        primary: {
            bg: 'rgba(13, 148, 136, 0.08)',
            text: '#0d9488',
            gradient: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)',
            border: 'rgba(13, 148, 136, 0.22)',
            glow: 'rgba(13, 148, 136, 0.12)',
        },
        blue: {
            bg: 'rgba(37, 99, 235, 0.08)',
            text: '#2563eb',
            gradient: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
            border: 'rgba(37, 99, 235, 0.22)',
            glow: 'rgba(37, 99, 235, 0.12)',
        },
        success: {
            bg: 'rgba(16, 185, 129, 0.08)',
            text: '#10b981',
            gradient: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
            border: 'rgba(16, 185, 129, 0.22)',
            glow: 'rgba(16, 185, 129, 0.12)',
        },
        warning: {
            bg: 'rgba(245, 158, 11, 0.08)',
            text: '#f59e0b',
            gradient: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
            border: 'rgba(245, 158, 11, 0.22)',
            glow: 'rgba(245, 158, 11, 0.12)',
        },
        purple: {
            bg: 'rgba(139, 92, 246, 0.08)',
            text: '#8b5cf6',
            gradient: 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)',
            border: 'rgba(139, 92, 246, 0.22)',
            glow: 'rgba(139, 92, 246, 0.12)',
        },
        rose: {
            bg: 'rgba(244, 63, 94, 0.08)',
            text: '#f43f5e',
            gradient: 'linear-gradient(135deg, #e11d48 0%, #fb7185 100%)',
            border: 'rgba(244, 63, 94, 0.22)',
            glow: 'rgba(244, 63, 94, 0.12)',
        },
    };

    const scheme = colorMap[color] || colorMap.primary;
    const displayValue = isNumeric
        ? `${animatedNum.toLocaleString()}${suffix}`
        : value;

    return (
        <div
            ref={cardRef}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
                backgroundColor: '#ffffff',
                borderRadius: 'var(--radius-lg)',
                padding: '24px',
                boxShadow: isHovered ? `var(--shadow-md), 0 8px 28px ${scheme.glow}` : 'var(--shadow-sm)',
                border: `1px solid ${isHovered ? scheme.border : 'var(--slate-200)'}`,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
                position: 'relative',
                overflow: 'hidden',
                transform: isVisible
                    ? isHovered
                        ? 'translateY(-5px)'
                        : 'translateY(0)'
                    : 'translateY(22px)',
                opacity: isVisible ? 1 : 0,
            }}
        >
            {/* Top accent line with gradient */}
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    left: 0,
                    height: isHovered ? '4px' : '3px',
                    background: scheme.gradient,
                    transition: 'height 0.3s ease',
                    pointerEvents: 'none',
                }}
            />

            {/* Decorative background circle */}
            <div
                style={{
                    position: 'absolute',
                    top: '-24px',
                    left: '-24px',
                    width: '110px',
                    height: '110px',
                    borderRadius: '50%',
                    background: scheme.bg,
                    opacity: isHovered ? 0.8 : 0.25,
                    transform: isHovered ? 'scale(1.15)' : 'scale(1)',
                    transition: 'all 0.4s ease',
                    pointerEvents: 'none',
                }}
            />

            <div
                style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    marginBottom: '16px',
                    position: 'relative',
                    zIndex: 1,
                }}
            >
                <div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--slate-500)' }}>
                        {title}
                    </span>
                    <div
                        style={{
                            fontSize: '1.85rem',
                            fontWeight: 800,
                            color: 'var(--slate-800)',
                            marginTop: '4px',
                            letterSpacing: '-0.5px',
                        }}
                    >
                        {displayValue}
                    </div>
                </div>

                {Icon && (
                    <div
                        style={{
                            width: '50px',
                            height: '50px',
                            borderRadius: 'var(--radius-md)',
                            background: isHovered ? scheme.gradient : scheme.bg,
                            color: isHovered ? '#ffffff' : scheme.text,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
                            transform: isHovered ? 'scale(1.08) rotate(-4deg)' : 'scale(1)',
                            boxShadow: isHovered ? `0 6px 16px ${scheme.glow}` : 'none',
                        }}
                    >
                        <Icon size={24} />
                    </div>
                )}
            </div>

            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderTop: '1px solid var(--slate-100)',
                    paddingTop: '12px',
                    marginTop: '8px',
                    position: 'relative',
                    zIndex: 1,
                }}
            >
                {subtext && (
                    <span
                        style={{
                            fontSize: '0.78rem',
                            color: 'var(--slate-400)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                        }}
                    >
                        <TrendingUp size={12} style={{ color: scheme.text }} />
                        {subtext}
                    </span>
                )}

                {linkTo && linkText && (
                    <Link
                        to={linkTo}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            color: scheme.text,
                            textDecoration: 'none',
                            marginRight: 'auto',
                            transition: 'gap 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.gap = '8px';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.gap = '4px';
                        }}
                    >
                        <span>{linkText}</span>
                        <ArrowLeft size={14} />
                    </Link>
                )}
            </div>
        </div>
    );
};

export default StatCard;
