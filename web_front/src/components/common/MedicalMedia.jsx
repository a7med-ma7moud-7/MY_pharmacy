import React, { useState } from 'react';
import {
    Pill,
    Sparkles,
    Stethoscope,
    Syringe,
    Droplets,
    ShieldPlus,
} from 'lucide-react';

/**
 * Checks whether an image URL/path is missing or points to a non-existent seeded placeholder
 * so we render crisp medical artwork without firing 404 requests.
 */
export const isPlaceholderImage = (src) => {
    if (!src || typeof src !== 'string') return true;
    const lower = src.toLowerCase();
    return (
        lower.includes('default.png') ||
        lower.includes('default.jpg') ||
        lower.endsWith('/asset/1.png') ||
        lower === 'asset/1.png'
    );
};

export const formatDoctorName = (name = '') => {
    const trimmed = String(name || '').trim();
    if (!trimmed) return 'طبيب استشاري';
    if (/^(د\.|دكتور\s)/u.test(trimmed)) return trimmed;
    return `د. ${trimmed}`;
};

const getMedicineTheme = (medicine = {}) => {
    const text = `${medicine.type || ''} ${medicine.name || ''}`.toLowerCase();
    if (text.includes('فوار') || text.includes('فيتامين') || text.includes('vitamin')) {
        return {
            bg: 'from-amber-50 via-orange-50/70 to-emerald-50/50',
            badgeBg: 'from-amber-500 to-orange-500',
            ring: 'ring-amber-200/70',
            accentText: 'text-amber-700',
            Icon: Sparkles,
        };
    }
    if (text.includes('شراب') || text.includes('قطرة') || text.includes('معلق')) {
        return {
            bg: 'from-sky-50 via-cyan-50/70 to-teal-50/50',
            badgeBg: 'from-sky-500 to-cyan-600',
            ring: 'ring-sky-200/70',
            accentText: 'text-sky-700',
            Icon: Droplets,
        };
    }
    if (text.includes('حقن') || text.includes('أمبول') || text.includes('انسولين')) {
        return {
            bg: 'from-indigo-50 via-blue-50/70 to-emerald-50/40',
            badgeBg: 'from-indigo-500 to-blue-600',
            ring: 'ring-indigo-200/70',
            accentText: 'text-indigo-700',
            Icon: Syringe,
        };
    }
    if (text.includes('مضاد') || text.includes('augmentin') || text.includes('أوجمنتين')) {
        return {
            bg: 'from-teal-50 via-emerald-50/80 to-cyan-50/60',
            badgeBg: 'from-teal-600 to-emerald-600',
            ring: 'ring-teal-200/70',
            accentText: 'text-teal-800',
            Icon: ShieldPlus,
        };
    }
    return {
        bg: 'from-emerald-50/90 via-teal-50/60 to-slate-50',
        badgeBg: 'from-[#0f6848] to-[#10ac84]',
        ring: 'ring-emerald-200/70',
        accentText: 'text-[#0f6848]',
        Icon: Pill,
    };
};

/**
 * Renders an uploaded medicine photo when available, or a sleek pharmaceutical illustration.
 */
export const MedicineArtwork = ({ medicine = {}, size = 'card', className = '' }) => {
    const [imgFailed, setImgFailed] = useState(false);
    const src = medicine?.image_url;
    const useFallback = imgFailed || isPlaceholderImage(src);

    if (!useFallback) {
        return (
            <img
                src={src}
                alt={medicine?.name || 'دواء'}
                loading="lazy"
                onError={() => setImgFailed(true)}
                className={className}
            />
        );
    }

    const theme = getMedicineTheme(medicine);
    const Icon = theme.Icon;

    // Extract English brand inside parentheses if available, e.g. "(Panadol Extra)"
    const englishMatch = String(medicine?.name || '').match(/\(([^)]+)\)/);
    const subtitle = englishMatch ? englishMatch[1] : medicine?.type || 'Rx Certified';

    if (size === 'thumb') {
        return (
            <div
                className={`bg-gradient-to-br ${theme.bg} flex items-center justify-center rounded-xl border border-emerald-100 shrink-0 ${className}`}
            >
                <div
                    className={`w-7 h-7 rounded-lg bg-gradient-to-br ${theme.badgeBg} text-white flex items-center justify-center shadow-sm`}
                >
                    <Icon className="w-4 h-4" />
                </div>
            </div>
        );
    }

    const isLarge = size === 'detail';

    return (
        <div
            className={`w-full h-full bg-gradient-to-br ${theme.bg} relative overflow-hidden flex flex-col items-center justify-center select-none ${
                isLarge ? 'min-h-[260px] rounded-2xl p-8' : 'p-5'
            }`}
        >
            {/* Subtle decorative medical pattern */}
            <div className="absolute -top-8 -left-8 w-28 h-28 rounded-full bg-white/55 blur-xl pointer-events-none" />
            <div className="absolute -bottom-10 -right-8 w-32 h-32 rounded-full bg-emerald-200/25 blur-xl pointer-events-none" />

            {/* Stylized Medicine Box / Blister Card */}
            <div
                className={`relative z-10 bg-white/90 backdrop-blur-sm rounded-3xl shadow-md ring-1 ${theme.ring} ${
                    isLarge ? 'px-9 py-7' : 'px-6 py-4'
                } flex flex-col items-center group-hover:scale-105 transition-transform duration-500`}
            >
                <div
                    className={`${
                        isLarge ? 'w-20 h-20 rounded-2xl' : 'w-14 h-14 rounded-2xl'
                    } bg-gradient-to-br ${theme.badgeBg} text-white flex items-center justify-center shadow-lg mb-2.5`}
                >
                    <Icon className={isLarge ? 'w-10 h-10' : 'w-7 h-7'} />
                </div>
                <span
                    dir="ltr"
                    className={`font-extrabold tracking-wide ${theme.accentText} ${
                        isLarge ? 'text-sm' : 'text-[11px]'
                    } max-w-[150px] truncate`}
                >
                    {subtitle}
                </span>
                <div className="flex items-center gap-1 mt-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span className="text-[10px] font-bold text-slate-400">صيدليتي • أصلي</span>
                </div>
            </div>
        </div>
    );
};

/**
 * Renders an uploaded doctor portrait when available, or a refined medical specialist avatar.
 */
export const DoctorAvatar = ({ doctor = {}, size = 'md', className = '' }) => {
    const [imgFailed, setImgFailed] = useState(false);
    const src = doctor?.image_url;
    const useFallback = imgFailed || isPlaceholderImage(src);

    if (!useFallback) {
        return (
            <img
                src={src}
                alt={doctor?.name || 'طبيب'}
                loading="lazy"
                onError={() => setImgFailed(true)}
                className={className}
            />
        );
    }

    const cleanName = String(doctor?.name || '')
        .replace(/^(د\.|دكتور)\s*/u, '')
        .trim();
    const parts = cleanName.split(/\s+/).filter(Boolean);
    const initials =
        parts.length >= 2
            ? `${parts[0][0]} ${parts[1][0]}`
            : cleanName.slice(0, 2) || 'د';

    const sizeStyles = {
        sm: 'w-12 h-12 rounded-xl text-xs',
        md: 'w-16 h-16 rounded-2xl text-sm',
        card: 'w-full h-full rounded-full text-base',
        xl: 'w-32 h-32 rounded-3xl text-2xl',
    }[size] || 'w-full h-full rounded-full text-base';

    return (
        <div
            className={`bg-gradient-to-br from-[#0b4f36] via-[#0f6848] to-[#10ac84] text-white flex flex-col items-center justify-center relative overflow-hidden select-none ${sizeStyles} ${className}`}
        >
            <div className="absolute -top-3 -right-3 w-12 h-12 rounded-full bg-white/15 pointer-events-none" />
            <Stethoscope
                className={`${
                    size === 'xl'
                        ? 'w-10 h-10 mb-1'
                        : size === 'sm'
                        ? 'w-4 h-4 mb-0.5'
                        : 'w-6 h-6 mb-0.5'
                } text-emerald-200 relative z-10`}
            />
            <span className="font-extrabold font-almarai tracking-tight leading-none relative z-10 text-white/95">
                {initials}
            </span>
        </div>
    );
};
