import React from 'react';

/**
 * Global fixed marbled-silk ambient background ("تشبيحات ضوئية متموجة")
 * shared across all website pages for a cohesive, calm, artistic surface.
 */
const SilkAmbientBg = () => {
    return (
        <div
            aria-hidden="true"
            className="fixed inset-0 -z-10 overflow-hidden pointer-events-none select-none"
            style={{
                background:
                    'linear-gradient(135deg, #dff1ea 0%, #f2f9f6 38%, #d6ede4 72%, #eef7f3 100%)',
            }}
        >
            {/* Drifting Organic Aurora Blobs */}
            <div
                style={{
                    position: 'absolute',
                    top: '-14%',
                    right: '-8%',
                    width: '560px',
                    height: '560px',
                    borderRadius: '50%',
                    background:
                        'radial-gradient(circle, rgba(15, 104, 72, 0.28) 0%, rgba(16, 172, 132, 0.12) 45%, transparent 72%)',
                    filter: 'blur(36px)',
                    animation: 'auroraWave1 14s ease-in-out infinite alternate',
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    bottom: '-18%',
                    left: '-8%',
                    width: '620px',
                    height: '620px',
                    borderRadius: '50%',
                    background:
                        'radial-gradient(circle, rgba(16, 172, 132, 0.28) 0%, rgba(20, 184, 166, 0.12) 48%, transparent 72%)',
                    filter: 'blur(40px)',
                    animation: 'auroraWave2 17s ease-in-out infinite alternate',
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    top: '28%',
                    left: '18%',
                    width: '440px',
                    height: '270px',
                    borderRadius: '50%',
                    background:
                        'radial-gradient(ellipse, rgba(52, 211, 153, 0.22) 0%, rgba(255, 255, 255, 0.45) 55%, transparent 75%)',
                    filter: 'blur(32px)',
                    animation: 'auroraWave1 19s ease-in-out infinite alternate-reverse',
                }}
            />

            {/* Flowing Diagonal Silk Light Ribbons */}
            <div
                style={{
                    position: 'absolute',
                    inset: '-25%',
                    background:
                        'repeating-linear-gradient(125deg, rgba(255, 255, 255, 0) 0px, rgba(255, 255, 255, 0.48) 90px, rgba(16, 172, 132, 0.11) 180px, rgba(255, 255, 255, 0) 290px)',
                    filter: 'blur(14px)',
                    animation: 'silkRibbonFlow 16s ease-in-out infinite alternate',
                }}
            />

            {/* Delicate Curved Silk Wave Veins */}
            <svg
                viewBox="0 0 1440 900"
                preserveAspectRatio="none"
                className="absolute inset-0 w-full h-full opacity-55"
            >
                <defs>
                    <linearGradient id="siteVeinGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#0f6848" stopOpacity="0.16" />
                        <stop offset="50%" stopColor="#10ac84" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#0f6848" stopOpacity="0.05" />
                    </linearGradient>
                    <linearGradient id="siteVeinGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
                        <stop offset="50%" stopColor="#34d399" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#ffffff" stopOpacity="0.1" />
                    </linearGradient>
                </defs>
                <path
                    d="M-120,180 C260,40 520,340 920,170 C1180,60 1360,210 1560,120"
                    fill="none"
                    stroke="url(#siteVeinGrad1)"
                    strokeWidth="2.2"
                />
                <path
                    d="M-100,720 C300,560 640,840 1040,650 C1260,545 1390,670 1560,610"
                    fill="none"
                    stroke="url(#siteVeinGrad1)"
                    strokeWidth="1.8"
                />
                <path
                    d="M-80,450 C340,290 720,610 1140,390 C1320,295 1430,380 1540,340"
                    fill="none"
                    stroke="url(#siteVeinGrad2)"
                    strokeWidth="2.6"
                />
            </svg>
        </div>
    );
};

export default SilkAmbientBg;
