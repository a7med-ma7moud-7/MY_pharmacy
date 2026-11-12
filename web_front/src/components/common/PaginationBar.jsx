import React from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';

const PaginationBar = ({ currentPage = 1, lastPage = 1, total = 0, onPageChange }) => {
    if (!lastPage || lastPage <= 1) return null;

    const getPages = () => {
        const pages = [];
        const delta = 2;
        const left = Math.max(1, currentPage - delta);
        const right = Math.min(lastPage, currentPage + delta);

        if (left > 1) {
            pages.push(1);
            if (left > 2) pages.push('...');
        }

        for (let i = left; i <= right; i++) {
            pages.push(i);
        }

        if (right < lastPage) {
            if (right < lastPage - 1) pages.push('...');
            pages.push(lastPage);
        }

        return pages;
    };

    const pages = getPages();

    return (
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/80 backdrop-blur-md border border-slate-100 rounded-2xl px-6 py-4 shadow-sm">
            <p className="text-sm font-bold text-slate-500">
                صفحة <span className="text-[#0f6848] font-black">{currentPage}</span> من{' '}
                <span className="text-slate-800 font-black">{lastPage}</span>
                {total > 0 && (
                    <span className="mr-2 text-xs text-slate-400">
                        (إجمالي {total} عنصر)
                    </span>
                )}
            </p>

            <div className="flex items-center gap-1.5">
                <button
                    type="button"
                    disabled={currentPage <= 1}
                    onClick={() => onPageChange(currentPage - 1)}
                    className="w-10 h-10 rounded-xl flex items-center justify-center border border-slate-200 bg-white text-slate-600 hover:border-[#0f6848] hover:text-[#0f6848] disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer"
                    aria-label="الصفحة السابقة"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>

                {pages.map((page, idx) =>
                    page === '...' ? (
                        <span
                            key={`dots-${idx}`}
                            className="w-9 h-10 flex items-center justify-center text-slate-400 font-bold select-none"
                        >
                            ...
                        </span>
                    ) : (
                        <button
                            key={page}
                            type="button"
                            onClick={() => onPageChange(page)}
                            className={`min-w-[40px] h-10 px-3 rounded-xl font-black text-sm transition-all cursor-pointer ${
                                page === currentPage
                                    ? 'bg-gradient-to-br from-[#0f6848] to-[#14875e] text-white shadow-md shadow-[#0f6848]/25 scale-105'
                                    : 'bg-white border border-slate-200 text-slate-600 hover:border-[#0f6848]/40 hover:bg-[#0f6848]/5 hover:text-[#0f6848]'
                            }`}
                        >
                            {page}
                        </button>
                    )
                )}

                <button
                    type="button"
                    disabled={currentPage >= lastPage}
                    onClick={() => onPageChange(currentPage + 1)}
                    className="w-10 h-10 rounded-xl flex items-center justify-center border border-slate-200 bg-white text-slate-600 hover:border-[#0f6848] hover:text-[#0f6848] disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer"
                    aria-label="الصفحة التالية"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default PaginationBar;

