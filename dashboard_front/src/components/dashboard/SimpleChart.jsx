import React, { useState, useEffect } from 'react';

/**
 * Animated Bar Chart with RTL support, background gridlines, and hover tooltip
 */
export const BarChart = ({
    data = [],
    title,
    subtitle,
    height = 240,
    barColor = '#0d9488',
}) => {
    const [hoveredIdx, setHoveredIdx] = useState(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setMounted(true), 80);
        return () => clearTimeout(t);
    }, []);

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
                    gap: '14px',
                    paddingTop: '24px',
                    position: 'relative',
                    backgroundImage:
                        'linear-gradient(to top, rgba(226, 232, 240, 0.55) 1px, transparent 1px)',
                    backgroundSize: '100% 25%',
                }}
            >
                {data.map((item, idx) => {
                    const heightPercent = Math.max((item.value / maxValue) * 100, 6);
                    const isHovered = hoveredIdx === idx;
                    const activeColor = item.color || barColor;

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
                        >
                            {/* Floating Value Pill */}
                            <div
                                style={{
                                    fontSize: '0.73rem',
                                    fontWeight: 700,
                                    color: isHovered ? '#ffffff' : 'var(--text-muted)',
                                    backgroundColor: isHovered ? 'var(--slate-900)' : 'transparent',
                                    padding: isHovered ? '2px 8px' : '0',
                                    borderRadius: '6px',
                                    marginBottom: '6px',
                                    transform: isHovered ? 'translateY(-3px) scale(1.06)' : 'none',
                                    transition: 'all 0.2s ease',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {Number(item.value || 0).toLocaleString()}
                            </div>

                            {/* Animated Bar */}
                            <div
                                style={{
                                    width: '100%',
                                    maxWidth: '44px',
                                    height: mounted ? `${heightPercent}%` : '0%',
                                    background: `linear-gradient(180deg, ${activeColor} 0%, ${activeColor}bb 100%)`,
                                    borderRadius: '10px 10px 3px 3px',
                                    transition: `height 0.65s cubic-bezier(0.22, 1, 0.36, 1) ${idx * 60}ms, transform 0.25s ease, box-shadow 0.25s ease`,
                                    cursor: 'pointer',
                                    transform: isHovered ? 'scaleX(1.1)' : 'scaleX(1)',
                                    boxShadow: isHovered ? `0 8px 20px ${activeColor}45` : 'none',
                                }}
                            />

                            <div
                                style={{
                                    fontSize: '0.75rem',
                                    fontWeight: isHovered ? 700 : 600,
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
 * Animated SVG Donut Chart with Legend
 */
export const DonutChart = ({ data = [], title, subtitle, centerLabel = 'الإجمالي' }) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setMounted(true), 100);
        return () => clearTimeout(t);
    }, []);

    const palette = ['#0d9488', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444'];
    const total = data.reduce((sum, item) => sum + (Number(item.value) || 0), 0);
    const radius = 58;
    const circumference = 2 * Math.PI * radius;

    let cumulative = 0;
    const segments = data.map((item, idx) => {
        const val = Number(item.value) || 0;
        const fraction = total > 0 ? val / total : 0;
        const dashArray = `${fraction * circumference} ${circumference}`;
        const dashOffset = -cumulative * circumference;
        cumulative += fraction;
        return {
            ...item,
            val,
            percent: total > 0 ? Math.round(fraction * 100) : 0,
            color: item.color || palette[idx % palette.length],
            dashArray,
            dashOffset,
        };
    });

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
                <div style={{ marginBottom: '18px' }}>
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

            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-around',
                    gap: '20px',
                    flexWrap: 'wrap',
                }}
            >
                {/* SVG Donut */}
                <div style={{ position: 'relative', width: '150px', height: '150px' }}>
                    <svg viewBox="0 0 150 150" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                        <circle
                            cx="75"
                            cy="75"
                            r={radius}
                            fill="none"
                            stroke="var(--slate-100)"
                            strokeWidth="18"
                        />
                        {segments.map((seg, idx) => (
                            <circle
                                key={idx}
                                cx="75"
                                cy="75"
                                r={radius}
                                fill="none"
                                stroke={seg.color}
                                strokeWidth="18"
                                strokeDasharray={mounted ? seg.dashArray : `0 ${circumference}`}
                                strokeDashoffset={seg.dashOffset}
                                strokeLinecap="butt"
                                style={{
                                    transition: 'stroke-dasharray 0.8s cubic-bezier(0.22, 1, 0.36, 1)',
                                }}
                            />
                        ))}
                    </svg>
                    <div
                        style={{
                            position: 'absolute',
                            inset: 0,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            textAlign: 'center',
                        }}
                    >
                        <span style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--slate-800)', lineHeight: 1 }}>
                            {total.toLocaleString()}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--slate-400)', fontWeight: 600, marginTop: '3px' }}>
                            {centerLabel}
                        </span>
                    </div>
                </div>

                {/* Legend */}
                <div style={{ flex: 1, minWidth: '180px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {segments.map((seg, idx) => (
                        <div
                            key={idx}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                fontSize: '0.82rem',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span
                                    style={{
                                        width: '10px',
                                        height: '10px',
                                        borderRadius: '50%',
                                        backgroundColor: seg.color,
                                        display: 'inline-block',
                                    }}
                                />
                                <span style={{ fontWeight: 600, color: 'var(--slate-700)' }}>{seg.label}</span>
                            </div>
                            <span style={{ fontWeight: 700, color: 'var(--slate-800)' }}>
                                {seg.val} <span style={{ color: 'var(--slate-400)', fontSize: '0.75rem' }}>({seg.percent}%)</span>
                            </span>
                        </div>
                    ))}
                </div>
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
                                        transition: 'width 0.7s cubic-bezier(0.22, 1, 0.36, 1)',
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

export default { BarChart, DonutChart, DistributionList };
