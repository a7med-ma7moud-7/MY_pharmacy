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
  const cardRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), index * 80);
    return () => clearTimeout(timer);
  }, [index]);

  const colorMap = {
    primary: {
      bg: 'rgba(13, 148, 136, 0.08)',
      text: '#0d9488',
      gradient: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)',
      border: 'rgba(13, 148, 136, 0.15)',
      glow: 'rgba(13, 148, 136, 0.08)',
    },
    blue: {
      bg: 'rgba(37, 99, 235, 0.08)',
      text: '#2563eb',
      gradient: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
      border: 'rgba(37, 99, 235, 0.15)',
      glow: 'rgba(37, 99, 235, 0.08)',
    },
    success: {
      bg: 'rgba(16, 185, 129, 0.08)',
      text: '#10b981',
      gradient: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
      border: 'rgba(16, 185, 129, 0.15)',
      glow: 'rgba(16, 185, 129, 0.08)',
    },
    warning: {
      bg: 'rgba(245, 158, 11, 0.08)',
      text: '#f59e0b',
      gradient: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
      border: 'rgba(245, 158, 11, 0.15)',
      glow: 'rgba(245, 158, 11, 0.08)',
    },
    purple: {
      bg: 'rgba(139, 92, 246, 0.08)',
      text: '#8b5cf6',
      gradient: 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)',
      border: 'rgba(139, 92, 246, 0.15)',
      glow: 'rgba(139, 92, 246, 0.08)',
    },
    rose: {
      bg: 'rgba(244, 63, 94, 0.08)',
      text: '#f43f5e',
      gradient: 'linear-gradient(135deg, #e11d48 0%, #fb7185 100%)',
      border: 'rgba(244, 63, 94, 0.15)',
      glow: 'rgba(244, 63, 94, 0.08)',
    },
  };

  const scheme = colorMap[color] || colorMap.primary;

  return (
    <div
      ref={cardRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        backgroundColor: '#ffffff',
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        boxShadow: isHovered ? `var(--shadow-md), 0 0 30px ${scheme.glow}` : 'var(--shadow-sm)',
        border: `1px solid ${isHovered ? scheme.border : 'var(--slate-200)'}`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
        transform: isVisible
          ? (isHovered ? 'translateY(-4px)' : 'translateY(0)')
          : 'translateY(20px)',
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
        }}
      />

      {/* Decorative background circles */}
      <div style={{
        position: 'absolute',
        top: '-20px',
        left: '-20px',
        width: '100px',
        height: '100px',
        borderRadius: '50%',
        background: scheme.bg,
        opacity: isHovered ? 0.6 : 0,
        transition: 'opacity 0.4s ease',
        pointerEvents: 'none',
      }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--slate-500)' }}>
            {title}
          </span>
          <div style={{
            fontSize: '1.9rem',
            fontWeight: 800,
            color: 'var(--slate-800)',
            marginTop: '4px',
            transition: 'color 0.3s ease',
          }}>
            {value}
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
              transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: isHovered ? 'scale(1.08) rotate(-3deg)' : 'scale(1)',
              boxShadow: isHovered ? `0 4px 12px ${scheme.glow}` : 'none',
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
        }}
      >
        {subtext && (
          <span style={{ fontSize: '0.78rem', color: 'var(--slate-400)', display: 'flex', alignItems: 'center', gap: '4px' }}>
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
              fontWeight: 600,
              color: scheme.text,
              textDecoration: 'none',
              marginRight: 'auto',
              transition: 'gap 0.2s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.gap = '8px'; }}
            onMouseLeave={(e) => { e.currentTarget.style.gap = '4px'; }}
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
