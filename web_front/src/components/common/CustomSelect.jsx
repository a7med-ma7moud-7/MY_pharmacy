import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check } from 'lucide-react';

export default function CustomSelect({
  value,
  onChange,
  options = [],
  placeholder = 'اختر...',
  disabled = false,
  className = '',
  icon: Icon = null,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0, width: 200 });
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  const selectedOption = options.find((opt) => String(opt.value) === String(value ?? ''));

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const estimatedMenuHeight = Math.min(options.length * 42 + 16, 260);
    const openAbove = spaceBelow < estimatedMenuHeight && rect.top > estimatedMenuHeight;

    setMenuPos({
      top: openAbove ? rect.top - estimatedMenuHeight - 6 : rect.bottom + 6,
      left: rect.left,
      width: rect.width,
    });
  }, [options.length]);

  useEffect(() => {
    if (!isOpen) return;
    updatePosition();

    const handleClickOutside = (e) => {
      if (
        triggerRef.current?.contains(e.target) ||
        menuRef.current?.contains(e.target)
      ) {
        return;
      }
      setIsOpen(false);
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    window.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen, updatePosition]);

  const handleSelect = (optValue) => {
    setIsOpen(false);
    if (String(optValue) !== String(value ?? '')) {
      onChange(optValue);
    }
  };

  return (
    <div className="relative w-full">
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between gap-2 text-right transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${
          className ||
          'px-4 py-3 bg-slate-50 hover:bg-white border border-slate-200 rounded-2xl text-sm font-semibold text-slate-800'
        } ${isOpen ? 'bg-white border-[#0f6848] ring-2 ring-emerald-500/25' : ''}`}
      >
        <span className="flex items-center gap-2 min-w-0 truncate">
          {Icon && <Icon className="w-4 h-4 text-slate-400 shrink-0" />}
          <span className={`truncate ${selectedOption ? 'text-slate-800' : 'text-slate-400'}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </span>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[#0f6848]' : ''
          }`}
        />
      </button>

      {isOpen &&
        createPortal(
          <div
            ref={menuRef}
            dir="rtl"
            style={{
              position: 'fixed',
              top: `${menuPos.top}px`,
              left: `${menuPos.left}px`,
              minWidth: `${menuPos.width}px`,
              zIndex: 9999,
            }}
            className="bg-white border border-slate-200/90 rounded-2xl p-1.5 shadow-xl max-h-64 overflow-y-auto animate-fadeIn"
          >
            {options.map((opt) => {
              const isSelected = String(opt.value) === String(value ?? '');
              return (
                <button
                  key={String(opt.value)}
                  type="button"
                  onClick={() => handleSelect(opt.value)}
                  className={`w-full px-3 py-2.5 rounded-xl text-right text-sm flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-50 text-[#0f6848] font-bold'
                      : 'text-slate-700 hover:bg-slate-50 font-medium'
                  }`}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && <Check className="w-4 h-4 text-[#0f6848] shrink-0" />}
                </button>
              );
            })}
          </div>,
          document.body
        )}
    </div>
  );
}
