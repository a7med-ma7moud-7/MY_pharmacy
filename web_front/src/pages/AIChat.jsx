import React, { useState } from 'react';
import { Bot, Send, AlertCircle, Sparkles, HelpCircle, Check, Copy, Loader2 } from 'lucide-react';
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
    <div className="py-12 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-gradient-to-r from-[#0f6848] to-[#10ac84] text-white rounded-2xl mb-3 shadow-md">
            <Bot className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold font-almarai text-gray-900 mb-2">
            مساعد الصيدلي الذكي (AI)
          </h1>
          <p className="text-gray-500 text-sm max-w-lg mx-auto">
            اطرح أي استفسار طبي أو دوائي وسيقوم مساعدنا الذكي بتقديم إجابات وإرشادات صيدلانية فورية
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          {/* Search/Query Bar */}
          <div className="p-6 bg-emerald-50/40 border-b border-gray-100">
            <form onSubmit={(e) => handleSubmit(e)} className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="اسأل عن أي شيء طبي، مثل: جرعات الأدوية، التفاعلات، أو الأعراض..."
                  required
                  disabled={loading}
                  className="w-full pr-4 pl-4 py-3.5 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none shadow-sm transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !question.trim()}
                className="btn-main px-6 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md disabled:opacity-50 shrink-0"
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
              <span className="text-gray-400 font-semibold flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5 text-main" />
                <span>أسئلة شائعة:</span>
              </span>
              {suggestedQuestions.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSubmit(null, q)}
                  className="bg-white hover:bg-emerald-50 hover:text-main text-gray-600 px-3 py-1.5 rounded-full border border-gray-200 transition-all text-xs"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Results Area */}
          <div className="p-6 sm:p-8">
            {loading && (
              <div className="py-12 text-center text-gray-500">
                <div className="w-12 h-12 bg-emerald-100 text-main rounded-full flex items-center justify-center mx-auto mb-3 animate-pulse">
                  <Sparkles className="w-6 h-6 text-emerald-600" />
                </div>
                <p className="font-bold text-gray-800 text-base mb-1">جاري تحليل سؤالك وصياغة الرد الطبي...</p>
                <p className="text-xs text-gray-400">يقوم الذكاء الاصطناعي بمراجعة المصادر الصيدلانية المعتمدة</p>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center gap-2">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {answer && !loading && (
              <div className="bg-emerald-50/30 rounded-2xl border border-emerald-100 p-6 animate-fadeIn">
                <div className="flex items-center justify-between pb-4 border-b border-emerald-100/60 mb-4">
                  <div className="flex items-center gap-2 text-main font-bold text-sm">
                    <Sparkles className="w-5 h-5 text-emerald-600" />
                    <span>إجابة الصيدلي الذكي</span>
                  </div>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-main bg-white px-3 py-1 rounded-lg border border-gray-200 transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600 font-semibold">تم النسخ</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>نسخ الرد</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="text-gray-800 text-sm md:text-base leading-relaxed whitespace-pre-line font-normal">
                  {answer}
                </div>

                <div className="mt-6 pt-4 border-t border-emerald-100/60 text-xs text-gray-500 flex items-start gap-2 bg-white/60 p-3 rounded-xl">
                  <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <span>
                    <strong>تنبيه طبي:</strong> إجابات المساعد الذكي للأغراض التثقيفية والإرشادية فقط، ولا تغني عن الاستشارة المباشرة للطبيب المعالج أو الصيدلي المتخصص.
                  </span>
                </div>
              </div>
            )}

            {!answer && !loading && !error && (
              <div className="py-14 text-center">
                <Bot className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-gray-700 mb-1">ابدأ المحادثة الآن</h3>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">
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
