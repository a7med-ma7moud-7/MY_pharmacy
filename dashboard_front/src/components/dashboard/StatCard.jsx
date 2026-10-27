import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const StatCard = ({
  title,
  value,
  icon: Icon,
  color = 'primary',
  subtext,
  linkText,
  linkTo,
}) => {
  const colorMap = {
    primary: {
      bg: 'rgba(13, 148, 136, 0.1)',
      text: '#0d9488',
      gradient: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)',
      border: 'rgba(13, 148, 136, 0.2)',
    },
    blue: {
      bg: 'rgba(37, 99, 235, 0.1)',
      text: '#2563eb',
      gradient: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
      border: 'rgba(37, 99, 235, 0.2)',
    },
    success: {
      bg: 'rgba(16, 185, 129, 0.1)',
      text: '#10b981',
      gradient: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
      border: 'rgba(16, 185, 129, 0.2)',
    },
    warning: {
      bg: 'rgba(245, 158, 11, 0.1)',
      text: '#f59e0b',
      gradient: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
      border: 'rgba(245, 158, 11, 0.2)',
    },
    purple: {
      bg: 'rgba(139, 92, 246, 0.1)',
      text: '#8b5cf6',
      gradient: 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)',
      border: 'rgba(139, 92, 246, 0.2)',
    },
    rose: {
      bg: 'rgba(244, 63, 94, 0.1)',
      text: '#f43f5e',
      gradient: 'linear-gradient(135deg, #e11d48 0%, #fb7185 100%)',
      border: 'rgba(244, 63, 94, 0.2)',
    },
  };

  const scheme = colorMap[color] || colorMap.primary;

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        boxShadow: 'var(--shadow-sm)',
        border: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'transform 0.2s, box-shadow 0.2s',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
      }}
    >
      {/* Top accent line */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          left: 0,
          height: '3px',
          background: scheme.gradient,
        }}
      />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            {title}
          </span>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>
            {value}
          </div>
        </div>

        {Icon && (
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: scheme.bg,
              color: scheme.text,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
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
          borderTop: '1px solid var(--border-color)',
          paddingTop: '12px',
          marginTop: '8px',
        }}
      >
        {subtext && (
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
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
