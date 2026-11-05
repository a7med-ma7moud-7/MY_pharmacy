import React, { useState } from 'react';

/**
 * Clean SVG/Flex Bar Chart with RTL support and interactive hover highlight
 */
export const BarChart = ({
  data = [],
  title,
  subtitle,
  height = 240,
  barColor = '#0d9488',
}) => {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  if (!data || data.length === 0) {
    return (
      <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
        لا توجد بيانات بيانية كافية للعرض
      </div>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.value || 0), 1);
  const chartHeight = height - 60;

  return (
    <div
      className="card"
      style={{
        backgroundColor: '#ffffff',
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        boxShadow: 'var(--shadow-sm)',
        border: '1px solid var(--border-color)',
      }}
    >
      {(title || subtitle) && (
        <div style={{ marginBottom: '20px' }}>
          {title && (
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
              {title}
            </h3>
          )}
          {subtitle && (
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px', margin: 0 }}>
              {subtitle}
            </p>
          )}
        </div>
      )}

      {/* Bars Canvas */}
      <div
        style={{
          width: '100%',
          height: `${chartHeight}px`,
          display: 'flex',
          alignItems: 'flex-end',
          gap: '16px',
          paddingTop: '20px',
        }}
      >
        {data.map((item, idx) => {
          const heightPercent = Math.max((item.value / maxValue) * 100, 5);
          const isHovered = hoveredIdx === idx;
          return (
            <div
              key={idx}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                height: '100%',
                justifyContent: 'flex-end',
                position: 'relative',
              }}
              title={`${item.label}: ${item.value}`}
            >
              <div
                style={{
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  color: isHovered ? item.color || barColor : 'var(--text-muted)',
                  marginBottom: '6px',
                  transform: isHovered ? 'translateY(-2px) scale(1.08)' : 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                {Number(item.value || 0).toLocaleString()}
              </div>
              <div
                style={{
                  width: '100%',
                  maxWidth: '46px',
                  height: `${heightPercent}%`,
                  background: `linear-gradient(180deg, ${item.color || barColor} 0%, ${
                    item.color || barColor
                  }cc 100%)`,
                  borderRadius: '8px 8px 2px 2px',
                  transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                  cursor: 'pointer',
                  transform: isHovered ? 'scaleX(1.08)' : 'scaleX(1)',
                  boxShadow: isHovered ? `0 6px 16px ${item.color || barColor}40` : 'none',
                }}
              />
              <div
                style={{
                  fontSize: '0.75rem',
                  fontWeight: isHovered ? 700 : 500,
                  color: isHovered ? 'var(--text-main)' : 'var(--text-secondary)',
                  marginTop: '8px',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  maxWidth: '100%',
                  textAlign: 'center',
                }}
              >
                {item.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/**
 * Progress Distribution widget
 */
export const DistributionList = ({ data = [], title, subtitle }) => {
  const total = data.reduce((acc, curr) => acc + (curr.value || 0), 0) || 1;

  return (
    <div
      className="card"
      style={{
        backgroundColor: '#ffffff',
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        boxShadow: 'var(--shadow-sm)',
        border: '1px solid var(--border-color)',
      }}
    >
      {(title || subtitle) && (
        <div style={{ marginBottom: '20px' }}>
          {title && (
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
              {title}
            </h3>
          )}
          {subtitle && (
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px', margin: 0 }}>
              {subtitle}
            </p>
          )}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {data.map((item, idx) => {
          const percent = Math.round(((item.value || 0) / total) * 100);
          return (
            <div key={idx}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  {item.label}
                </span>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary-color)' }}>
                  {item.value} ({percent}%)
                </span>
              </div>
              <div
                style={{
                  width: '100%',
                  height: '9px',
                  backgroundColor: 'var(--slate-100)',
                  borderRadius: 'var(--radius-full)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${percent}%`,
                    height: '100%',
                    background: `linear-gradient(90deg, ${item.color || '#0d9488'}, #14b8a6)`,
                    borderRadius: 'var(--radius-full)',
                    transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default { BarChart, DistributionList };
