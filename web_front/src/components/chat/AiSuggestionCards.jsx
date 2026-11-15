import React from 'react';
import { Link } from 'react-router-dom';
import { Pill, Stethoscope, ArrowUpLeft, MapPin } from 'lucide-react';

export default function AiSuggestionCards({ suggestions, compact = false, onNavigate }) {
  if (!suggestions) return null;
  const medicines = suggestions.medicines || [];
  const doctors = suggestions.doctors || [];

  if (medicines.length === 0 && doctors.length === 0) return null;

  return (
    <div className={`mt-2.5 space-y-2 ${compact ? 'text-[11px]' : 'text-xs'}`}>
      {medicines.length > 0 && (
        <div className="space-y-1.5">
          <div className="text-[11px] font-extrabold text-[#0f6848] flex items-center gap-1.5 px-1">
            <Pill className="w-3.5 h-3.5" />
            <span>أدوية مطابقة في الصيدلية (اضغط للانتقال):</span>
          </div>
          <div className={`grid gap-2 ${compact ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
            {medicines.map((med) => (
              <Link
                key={`med-${med.id}`}
                to={med.url || `/medicines/${med.id}`}
                onClick={onNavigate}
                className="group flex items-center justify-between gap-2.5 p-2.5 rounded-xl bg-white border border-emerald-200/80 hover:border-[#0f6848] hover:shadow-md transition-all text-right"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#0f6848] flex items-center justify-center shrink-0 group-hover:bg-[#0f6848] group-hover:text-white transition-colors">
                    <Pill className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-extrabold text-slate-800 truncate group-hover:text-[#0f6848]">
                      {med.name}
                    </div>
                    <div className="text-[10px] text-slate-500 flex items-center gap-1.5 flex-wrap">
                      {med.type && <span>{med.type}</span>}
                      <span>•</span>
                      <span className="font-bold text-[#0f6848]">{med.price} ج.م</span>
                      <span className={med.in_stock ? 'text-emerald-600' : 'text-rose-500'}>
                        ({med.in_stock ? 'متوفر' : 'غير متوفر'})
                      </span>
                    </div>
                  </div>
                </div>
                <ArrowUpLeft className="w-4 h-4 text-slate-400 group-hover:text-[#0f6848] shrink-0 transition-transform group-hover:-translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {doctors.length > 0 && (
        <div className="space-y-1.5">
          <div className="text-[11px] font-extrabold text-sky-700 flex items-center gap-1.5 px-1">
            <Stethoscope className="w-3.5 h-3.5" />
            <span>أطباء متخصصون في المنصة (اضغط للانتقال):</span>
          </div>
          <div className={`grid gap-2 ${compact ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
            {doctors.map((doc) => (
              <Link
                key={`doc-${doc.id}`}
                to={doc.url || `/doctors/${doc.id}`}
                onClick={onNavigate}
                className="group flex items-center justify-between gap-2.5 p-2.5 rounded-xl bg-white border border-sky-200/80 hover:border-sky-600 hover:shadow-md transition-all text-right"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center shrink-0 group-hover:bg-sky-600 group-hover:text-white transition-colors">
                    <Stethoscope className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-extrabold text-slate-800 truncate group-hover:text-sky-700">
                      د. {doc.name}
                    </div>
                    <div className="text-[10px] text-slate-500 flex items-center gap-1.5 flex-wrap">
                      {doc.specialty && <span>{doc.specialty}</span>}
                      <span>•</span>
                      <span className="font-bold text-sky-700">{doc.price} ج.م</span>
                      {doc.location && (
                        <span className="inline-flex items-center gap-0.5 truncate">
                          <MapPin className="w-2.5 h-2.5" />
                          {doc.location}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <ArrowUpLeft className="w-4 h-4 text-slate-400 group-hover:text-sky-600 shrink-0 transition-transform group-hover:-translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
