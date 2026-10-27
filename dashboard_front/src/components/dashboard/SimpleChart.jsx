import React from 'react';

/**
 * Clean SVG Bar Chart with RTL support and interactive tooltips
 */
export const BarChart = ({
  data = [],
  title,
  subtitle,
  height = 240,
  barColor = '#0d9488',
}) => {
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

      {/* SVG Canvas */}
      <div style={{ width: '100%', height: `${chartHeight}px`, display: 'flex', alignItems: 'flex-end', gap: '16px' }}>
        {data.map((item, idx) => {
          const heightPercent = Math.max((item.value / maxValue) * 100, 4);
          return (
            <div
              key={idx}
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
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>
                {item.value}
              </div>
              <div
                style={{
                  width: '100%',
                  maxWidth: '44px',
                  height: `${heightPercent}%`,
                  backgroundColor: item.color || barColor,
                  borderRadius: '6px 6px 0 0',
                  transition: 'height 0.4s ease, opacity 0.2s ease',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
              />
              <div
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-secondary)',
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
 * Donut / Progress Distribution widget
 */
export const DistributionList = ({ data = [], title, subtitle }) => {
  const total = data.reduce((acc, curr) => acc + (curr.value || 0), 0) || 1;

  return (
    <div
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
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  {item.value} ({percent}%)
                </span>
              </div>
              <div
                style={{
                  width: '100%',
                  height: '8px',
                  backgroundColor: 'var(--bg-main)',
                  borderRadius: 'var(--radius-full)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${percent}%`,
                    height: '100%',
                    backgroundColor: item.color || '#0d9488',
                    borderRadius: 'var(--radius-full)',
                    transition: 'width 0.5s ease',
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
