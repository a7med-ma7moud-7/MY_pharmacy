import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  ExternalLink,
  Stethoscope,
  Pill,
  ThumbsUp,
  ThumbsDown,
  ShieldCheck,
  Database,
  Layers,
  AlertTriangle,
  Lock,
  LogIn,
  CheckCircle2,
} from 'lucide-react';
import { aiService } from '../../services/api';

const MODE_LABELS = {
  general: {
    ar: 'معرفة طبية عامة',
    en: 'General Medical Knowledge',
    icon: BookOpen,
    cls: 'bg-emerald-50 text-[#0f6848] border-emerald-200',
  },
  internal: {
    ar: 'سجلات حسابك الشخصية',
    en: 'Personal Account Records',
    icon: Database,
    cls: 'bg-sky-50 text-sky-700 border-sky-200',
  },
  combined: {
    ar: 'مدمج: سجلاتك + معرفة طبية عامة',
    en: 'Combined: Personal Records + Medical Knowledge',
    icon: Layers,
    cls: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  },
  emergency: {
    ar: 'إرشاد طوارئ عاجل',
    en: 'Urgent Medical Triage',
    icon: AlertTriangle,
    cls: 'bg-rose-50 text-rose-700 border-rose-300',
  },
  restricted: {
    ar: 'صلاحيات الوصول والخصوصية',
    en: 'Privacy & Access Control',
    icon: Lock,
    cls: 'bg-amber-50 text-amber-800 border-amber-200',
  },
};

export function RetrievalModeBadge({ mode, lang = 'ar' }) {
  if (!mode || !MODE_LABELS[mode]) return null;
  const info = MODE_LABELS[mode];
  const Icon = info.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${info.cls}`}
    >
      <Icon className="w-3 h-3" />
      <span>{lang === 'en' ? info.en : info.ar}</span>
    </span>
  );
}

export default function AiMessageExtras({
  msg,
  compact = false,
  onNavigate,
  onFeedbackSaved,
}) {
  const [feedbackType, setFeedbackType] = useState(msg.userFeedback || null);
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedNotice, setSubmittedNotice] = useState(false);

  const lang = msg.language === 'en' ? 'en' : 'ar';
  const references = Array.isArray(msg.references) ? msg.references : [];
  const showExpertLinks =
    Boolean(msg.expertAssistance?.recommended) ||
    Boolean(msg.isEmergency) ||
    msg.retrievalMode === 'combined';

  const handleFeedback = async (type, withComment = false) => {
    if (submitting) return;
    setFeedbackType(type);

    if (type === 'negative' && !withComment && !compact && !showCommentBox) {
      setShowCommentBox(true);
      return;
    }

    setSubmitting(true);
    try {
      await aiService.submitFeedback({
        feedback_type: type,
        ai_chat_message_id: msg.dbMessageId || null,
        comment: withComment && comment.trim() ? comment.trim() : null,
        retrieval_mode: msg.retrievalMode || 'general',
        language: lang,
      });
      setShowCommentBox(false);
      setSubmittedNotice(true);
      if (onFeedbackSaved) onFeedbackSaved(msg.id, type);
      setTimeout(() => setSubmittedNotice(false), 3000);
    } catch {
      // Keep UI responsive even if guest feedback rate-limits
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`mt-2.5 space-y-2.5 ${compact ? 'text-[11px]' : 'text-xs'}`}>
      {/* Guest Login Call-to-Action when Personal Data is Requested */}
      {msg.guestRestricted && (
        <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 flex flex-wrap items-center justify-between gap-2">
          <span className="text-amber-900 font-semibold text-xs">
            {lang === 'en'
              ? 'Sign in to view your prescriptions & appointments.'
              : 'سجل دخولك للاطلاع على روشتاتك ومواعيدك الطبية.'}
          </span>
          <Link
            to="/login"
            onClick={onNavigate}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0f6848] hover:bg-[#0b5037] text-white text-xs font-bold transition-colors"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>{lang === 'en' ? 'Sign In' : 'تسجيل الدخول'}</span>
          </Link>
        </div>
      )}

      {/* Authoritative Medical References */}
      {references.length > 0 && (
        <div className="p-3 rounded-2xl bg-slate-50/90 border border-slate-200/80 space-y-2">
          <div className="flex items-center gap-1.5 font-extrabold text-slate-700 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#0f6848]" />
            <span>
              {lang === 'en' ? 'Verified Medical References:' : 'المراجع والمصادر الطبية الموثقة:'}
            </span>
          </div>
          <div className="space-y-1.5">
            {references.map((ref, idx) => (
              <a
                key={`${ref.source_url}-${idx}`}
                href={ref.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start justify-between gap-2 p-2 rounded-xl bg-white border border-slate-200/70 hover:border-[#0f6848] hover:shadow-sm transition-all group"
              >
                <div className="min-w-0">
                  <div className="font-bold text-slate-800 group-hover:text-[#0f6848] truncate text-[11px]">
                    {ref.title || ref.source_name}
                  </div>
                  <div className="text-[10px] text-slate-500 flex items-center gap-1.5 flex-wrap">
                    <span>{ref.source_name}</span>
                    {ref.published_or_updated_at && (
                      <>
                        <span>•</span>
                        <span>
                          {lang === 'en' ? 'Updated:' : 'تحديث:'} {ref.published_or_updated_at}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0f6848] shrink-0 mt-0.5" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Expert Assistance Navigation (Find a Doctor / Find a Pharmacy) */}
      {showExpertLinks && (
        <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 flex flex-wrap items-center justify-between gap-2">
          <span className="text-[11px] font-bold text-slate-700">
            {lang === 'en'
              ? 'Need professional clinical or pharmacy assistance?'
              : 'هل تحتاج إلى استشارة طبية متخصصة أو صرف دواء؟'}
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to={msg.expertAssistance?.find_doctor_url || '/doctors'}
              onClick={onNavigate}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0f6848] hover:bg-[#0b5037] text-white text-[11px] font-bold transition-colors"
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>{lang === 'en' ? 'Find a Doctor' : 'ابحث عن طبيب'}</span>
            </Link>
            <Link
              to={msg.expertAssistance?.find_pharmacy_url || '/medicines'}
              onClick={onNavigate}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-100 text-[#0f6848] border border-emerald-300 text-[11px] font-bold transition-colors"
            >
              <Pill className="w-3.5 h-3.5" />
              <span>{lang === 'en' ? 'Find a Pharmacy' : 'تصفح الصيدلية'}</span>
            </Link>
          </div>
        </div>
      )}

      {/* User Feedback Controls (Main chat view) */}
      {!compact && msg.id !== 'welcome' && !msg.isError && (
        <div className="pt-0.5">
          <div className="flex items-center justify-end gap-2 text-[11px] text-slate-400">
            <span>{lang === 'en' ? 'Helpful?' : 'هل كانت الإجابة مفيدة؟'}</span>
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleFeedback('positive')}
              className={`p-1 rounded-lg border transition-colors cursor-pointer ${
                feedbackType === 'positive'
                  ? 'bg-emerald-50 border-emerald-300 text-[#0f6848]'
                  : 'border-transparent hover:bg-slate-100 text-slate-400 hover:text-slate-700'
              }`}
              title={lang === 'en' ? 'Helpful' : 'إجابة مفيدة'}
            >
              <ThumbsUp className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleFeedback('negative')}
              className={`p-1 rounded-lg border transition-colors cursor-pointer ${
                feedbackType === 'negative'
                  ? 'bg-rose-50 border-rose-300 text-rose-600'
                  : 'border-transparent hover:bg-slate-100 text-slate-400 hover:text-slate-700'
              }`}
              title={lang === 'en' ? 'Needs improvement' : 'تحتاج إلى تحسين'}
            >
              <ThumbsDown className="w-3.5 h-3.5" />
            </button>
            {submittedNotice && (
              <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                <CheckCircle2 className="w-3 h-3" />
                <span>{lang === 'en' ? 'Saved' : 'تم الحفظ'}</span>
              </span>
            )}
          </div>

          {showCommentBox && (
            <div className="mt-2 p-2.5 rounded-xl bg-white border border-slate-200 flex items-center gap-2">
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={
                  lang === 'en'
                    ? 'Optional: tell us what could be improved...'
                    : 'اختياري: وضح لنا سبب الملاحظة لتحسين الإجابات...'
                }
                className="flex-1 text-xs px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleFeedback('negative', true)}
                className="px-3 py-1.5 rounded-lg bg-[#0f6848] text-white text-xs font-bold cursor-pointer"
              >
                {lang === 'en' ? 'Send' : 'إرسال'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
