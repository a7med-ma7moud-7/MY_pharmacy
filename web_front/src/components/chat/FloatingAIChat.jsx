import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, Minimize2 } from 'lucide-react';
import { aiService } from '../../services/api';

const FloatingAIChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: 'أهلاً بك! أنا الصيدلي الذكي (AI). كيف يمكنني مساعدتك اليوم في الاستفسار عن الأدوية، الجرعات أو النصائح الطبية؟',
    },
  ]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!inputQuestion.trim() || loading) return;

    const userText = inputQuestion.trim();
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: userText,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuestion('');
    setLoading(true);

    try {
      const res = await aiService.askAI(userText);
      const answer = res.data?.answer || res.data?.message || 'عذراً، لم أتمكن من الحصول على إجابة في الوقت الحالي.';

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ai',
          text: answer,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ai',
          text: 'حدث خطأ في الاتصال بالخدمة الذكية، يرجى المحاولة بعد قليل.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button with Ping Effect */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
          </span>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-2xl transition-all duration-300 active:scale-90 ${
            isOpen 
              ? 'bg-rose-600 hover:bg-rose-700 rotate-90' 
              : 'bg-gradient-to-r from-[#0f6848] to-[#10ac84] hover:scale-108 hover:shadow-emerald-900/30'
          }`}
          title="مساعد الصيدلي الذكي (AI)"
          aria-label="مساعد الصيدلي الذكي"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Bot className="w-7 h-7" />}
        </button>
      </div>

      {/* Chat Window Popup */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 w-[calc(100vw-32px)] sm:w-96 h-[520px] max-h-[80vh] bg-white rounded-3xl shadow-2xl border border-gray-100 flex flex-col z-50 overflow-hidden animate-scaleIn">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#0f6848] to-[#10ac84] text-white p-4 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/15 backdrop-blur-md rounded-2xl">
                <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm font-almarai leading-tight text-white m-0">
                  الصيدلي الذكي (AI)
                </h4>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-[11px] text-emerald-100 font-medium">متصل ومتاح للإجابة</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors"
              title="إغلاق"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/70">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-[#0f6848] text-white rounded-br-none'
                      : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                  }`}
                >
                  <p className="m-0 whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start animate-fadeIn">
                <div className="bg-white text-gray-600 text-xs px-4 py-2.5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-2">
                  <span className="flex gap-1">
                    <span className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </span>
                  <span className="font-medium text-emerald-800">الصيدلي يفكر في الإجابة...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 flex items-center gap-2 shadow-inner">
            <input
              type="text"
              value={inputQuestion}
              onChange={(e) => setInputQuestion(e.target.value)}
              placeholder="اكتب استفسارك الطبي أو اسم الدواء..."
              disabled={loading}
              className="flex-1 px-4 py-2.5 text-xs sm:text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-slate-50/50 focus:bg-white transition-all"
            />
            <button
              type="submit"
              disabled={loading || !inputQuestion.trim()}
              className="bg-[#0f6848] hover:bg-[#10ac84] active:scale-95 text-white p-2.5 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shrink-0"
              title="إرسال"
            >
              <Send className="w-4 h-4 rtl:rotate-180" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default FloatingAIChat;
