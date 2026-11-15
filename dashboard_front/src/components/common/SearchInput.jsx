import React from 'react';
import { Search, X } from 'lucide-react';

export const SearchInput = ({
  value,
  onChange,
  placeholder = 'ابحث...',
  style = {},
}) => {
  return (
    <div className="search-box" style={style}>
      <span className="search-box-icon">
        <Search size={18} />
      </span>
      <input
        type="text"
        className={`search-box-input ${value ? 'has-clear' : ''}`}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <button
          type="button"
          className="search-box-clear"
          onClick={() => onChange('')}
          title="مسح البحث"
          aria-label="مسح البحث"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};
