import React from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';

export const Pagination = ({ currentPage, lastPage, onPageChange, total, _perPage }) => {
  if (!lastPage || lastPage <= 1) return null;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 20px',
      borderTop: '1px solid var(--slate-100)',
      background: '#ffffff',
      fontSize: '0.85rem',
      color: 'var(--slate-600)',
      flexWrap: 'wrap',
      gap: '12px',
    }}>
      <div>
        <span>عرض صفحة </span>
        <strong style={{ color: 'var(--slate-800)' }}>{currentPage}</strong>
        <span> من </span>
        <strong style={{ color: 'var(--slate-800)' }}>{lastPage}</strong>
        {total !== undefined && (
          <span style={{ marginRight: '8px', color: 'var(--slate-400)' }}>
            (إجمالي العناصر: {total})
          </span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="btn btn-secondary btn-sm"
          style={{ padding: '6px 10px', opacity: currentPage <= 1 ? 0.5 : 1 }}
        >
          <ChevronRight size={16} />
          <span>السابق</span>
        </button>

        {Array.from({ length: Math.min(lastPage, 5) }, (_, i) => {
          let pageNum = i + 1;
          if (lastPage > 5 && currentPage > 3) {
            pageNum = currentPage - 2 + i;
            if (pageNum > lastPage) pageNum = lastPage - (4 - i);
          }
          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 700,
                fontSize: '0.825rem',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: currentPage === pageNum ? 'var(--primary-600)' : 'transparent',
                color: currentPage === pageNum ? '#ffffff' : 'var(--slate-700)',
                border: currentPage === pageNum ? 'none' : '1px solid var(--slate-200)',
              }}
            >
              {pageNum}
            </button>
          );
        })}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= lastPage}
          className="btn btn-secondary btn-sm"
          style={{ padding: '6px 10px', opacity: currentPage >= lastPage ? 0.5 : 1 }}
        >
          <span>التالي</span>
          <ChevronLeft size={16} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
