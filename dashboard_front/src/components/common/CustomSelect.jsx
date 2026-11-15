import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check } from 'lucide-react';

export const CustomSelect = ({
  value,
  onChange,
  options = [],
  placeholder = 'اختر...',
  disabled = false,
  variant = 'default', // 'default' | 'pill'
  triggerStyle = {},
  containerStyle = {},
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0, width: 180 });
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  const selectedOption = options.find((opt) => String(opt.value) === String(value ?? ''));

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const estimatedMenuHeight = Math.min(options.length * 40 + 16, 260);
    const openAbove = spaceBelow < estimatedMenuHeight && rect.top > estimatedMenuHeight;

    setMenuPos({
      top: openAbove ? rect.top - estimatedMenuHeight - 6 : rect.bottom + 6,
      left: rect.left,
      width: Math.max(rect.width, variant === 'pill' ? 165 : rect.width),
    });
  }, [options.length, variant]);

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
    <div style={{ position: 'relative', ...containerStyle }}>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={`custom-select-trigger ${variant === 'pill' ? 'is-pill' : ''} ${isOpen ? 'is-open' : ''}`}
        style={triggerStyle}
      >
        <span style={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          color: selectedOption ? 'inherit' : 'var(--slate-400)',
        }}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <span className="custom-select-chevron">
          <ChevronDown size={variant === 'pill' ? 14 : 16} />
        </span>
      </button>

      {isOpen &&
        createPortal(
          <div
            ref={menuRef}
            className="custom-select-menu"
            style={{
              top: `${menuPos.top}px`,
              left: `${menuPos.left}px`,
              minWidth: `${menuPos.width}px`,
            }}
          >
            {options.map((opt) => {
              const isSelected = String(opt.value) === String(value ?? '');
              return (
                <button
                  key={String(opt.value)}
                  type="button"
                  onClick={() => handleSelect(opt.value)}
                  className={`custom-select-option ${isSelected ? 'is-selected' : ''}`}
                >
                  <span>{opt.label}</span>
                  {isSelected && <Check size={15} style={{ flexShrink: 0 }} />}
                </button>
              );
            })}
          </div>,
          document.body
        )}
    </div>
  );
};
