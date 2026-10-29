import React, { useState } from 'react';
import { Bot, Send, AlertCircle, Sparkles, HelpCircle, Check, Copy, Loader2, ArrowRight } from 'lucide-react';
import { askAi } from '../services/api';

export default function AIChat() {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const suggestedQuestions = [
    'ما هي الجرعة الآمنة للباراسيتامول للبالغين؟',
    'ما الفرق بين أدوية الحساسية من الجيل الأول والثاني؟',
    'نصائح صيدلانية لتناول المضادات الحيوية بفعالية',
    'ما هي أفضل طريقة لتخزين أدوية الإنسولين في المنزل؟',
  ];

  const handleSubmit = async (e, customQuery) => {
    if (e) e.preventDefault();
    const query = customQuery || question;
    if (!query.trim()) return;

    if (customQuery) {
      setQuestion(customQuery);
    }

    setLoading(true);
    setError(null);
    setAnswer(null);

    try {
      const res = await askAi(query);
      if (res.data && res.data.answer) {
        setAnswer(res.data.answer);
      } else {
        setAnswer(res.data?.message || 'تم استلام رد المساعد بنجاح');
      }
    } catch (err) {
      console.error('AI Chat Error:', err);
      setError(err.response?.data?.message || err.message || 'حدث خطأ أثناء التواصل مع مساعد الذكاء الاصطناعي');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!answer) return;
    navigator.clipboard.writeText(answer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3.5 bg-gradient-to-br from-[#0f6848] via-[#10ac84] to-[#0d9488] text-white rounded-3xl mb-4 shadow-xl">
            <Bot className="w-8 h-8" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-almarai text-gray-900 mb-2">
            مساعد الصيدلي الذكي (AI)
          </h1>
          <p className="text-gray-500 text-sm sm:text-base max-w-lg mx-auto leading-relaxed m-0">
            اطرح أي استفسار طبي أو دوائي وسيقوم مساعدنا الذكي بتقديم إرشادات ومعلومات صيدلانية فورية
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden mb-8 transition-all">
          {/* Query Bar */}
          <div className="p-6 bg-gradient-to-r from-emerald-50/60 to-teal-50/40 border-b border-gray-100">
            <form onSubmit={(e) => handleSubmit(e)} className="flex items-center gap-2.5">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="اسأل عن أي شيء طبي: الجرعات، التفاعلات، الأعراض، أو البدائل..."
                  required
                  disabled={loading}
                  className="w-full pr-4 pl-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none shadow-sm transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !question.trim()}
                className="btn-main px-6 py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-md disabled:opacity-40 active:scale-95 transition-all shrink-0"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4 rtl:rotate-180" />
                    <span className="hidden sm:inline">اسأل الآن</span>
                  </>
                )}
              </button>
            </form>

            {/* Suggested Prompts */}
            <div className="mt-4 pt-3 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-gray-400 font-bold flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>أسئلة شائعة:</span>
              </span>
              {suggestedQuestions.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSubmit(null, q)}
                  className="bg-white hover:bg-emerald-100/70 hover:text-emerald-900 text-gray-600 px-3.5 py-1.5 rounded-full border border-gray-200 shadow-2xs transition-all text-xs font-medium hover:scale-102"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Results Area */}
          <div className="p-6 sm:p-8">
            {loading && (
              <div className="py-14 text-center text-gray-500 animate-fadeIn">
                <div className="w-14 h-14 bg-emerald-100 text-[#0f6848] rounded-2xl flex items-center justify-center mx-auto mb-4 animate-bounce shadow-inner">
                  <Sparkles className="w-7 h-7 text-emerald-600" />
                </div>
                <h4 className="font-extrabold text-gray-800 text-lg mb-1">
                  جاري تحليل استفسارك وصياغة الرد الطبي...
                </h4>
                <p className="text-xs text-gray-400 max-w-sm mx-auto m-0">
                  يقوم المساعد الذكي بمراجعة البيانات الصيدلانية الموثقة لتوفير أفضل إرشاد ممكن.
                </p>
              </div>
            )}

            {error && (
              <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-sm flex items-center gap-2.5 animate-fadeIn">
                <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
                <span>{error}</span>
              </div>
            )}

            {answer && !loading && (
              <div className="bg-gradient-to-br from-emerald-50/40 via-white to-teal-50/20 rounded-2xl border border-emerald-100 p-6 sm:p-7 shadow-sm animate-scaleIn">
                <div className="flex items-center justify-between pb-4 border-b border-emerald-100/80 mb-5">
                  <div className="flex items-center gap-2.5 text-[#0f6848] font-bold text-sm">
                    <div className="p-1.5 bg-emerald-100 rounded-lg">
                      <Sparkles className="w-4 h-4 text-emerald-700" />
                    </div>
                    <span className="text-base font-extrabold font-almarai">إجابة الصيدلي الذكي</span>
                  </div>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-emerald-700 bg-white px-3.5 py-1.5 rounded-xl border border-gray-200 shadow-2xs hover:border-emerald-300 transition-all active:scale-95"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700 font-bold">تم النسخ</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-gray-400" />
                        <span>نسخ الرد</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="text-gray-800 text-sm sm:text-base leading-relaxed whitespace-pre-line font-normal">
                  {answer}
                </div>

                <div className="mt-6 pt-4 border-t border-emerald-100/60 text-xs text-gray-500 flex items-start gap-2.5 bg-white/80 p-3.5 rounded-2xl border border-gray-100">
                  <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">
                    <strong>تنبيه طبي وقانوني:</strong> إجابات المساعد الذكي للأغراض التثقيفية والإرشادية فقط، ولا تغني مطلقاً عن الاستشارة المباشرة للطبيب المعالج أو الصيدلي المتخصص.
                  </span>
                </div>
              </div>
            )}

            {!answer && !loading && !error && (
              <div className="py-16 text-center">
                <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-4 text-slate-400">
                  <Bot className="w-10 h-10" />
                </div>
                <h3 className="text-base font-bold text-gray-700 mb-1">ابدأ استشارتك الآن</h3>
                <p className="text-xs text-gray-400 max-w-sm mx-auto m-0">
                  اكتب سؤالك في الحقل أعلاه أو اضغط على أحد الأسئلة المقترحة للحصول على رد فوري
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
