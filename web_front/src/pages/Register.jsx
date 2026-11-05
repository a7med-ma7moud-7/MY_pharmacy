import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, User, Mail, Lock, AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const passwordStrength = useMemo(() => {
    if (!password) return { score: 0, label: '', color: 'bg-gray-200' };
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password) || /[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password) || password.length >= 12) score += 1;

    if (score <= 1) return { score: 25, label: 'ضعيفة', color: 'bg-rose-500' };
    if (score === 2) return { score: 50, label: 'متوسطة', color: 'bg-amber-500' };
    if (score === 3) return { score: 75, label: 'جيدة', color: 'bg-emerald-500' };
    return { score: 100, label: 'قوية جداً', color: 'bg-[#0f6848]' };
  }, [password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (password !== passwordConfirmation) {
      setError('كلمة المرور وتأكيد كلمة المرور غير متطابقين.');
      return;
    }

    setLoading(true);

    try {
      await register({
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });
      navigate('/');
    } catch (err) {
      console.error('Registration error:', err);
      const serverMsg =
        err.response?.data?.message ||
        (err.response?.data?.errors
          ? Object.values(err.response.data.errors).flat().join(' ')
          : null);
      setError(serverMsg || 'تعذر إنشاء الحساب، يرجى التحقق من البيانات المدخلة.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 bg-slate-50 min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full animate-fadeIn">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#0f6848] to-[#10ac84] p-8 text-center text-white relative">
            <div className="w-16 h-16 bg-white/15 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-extrabold font-almarai text-white mb-1">
              إنشاء حساب جديد
            </h2>
            <p className="text-white/80 text-sm m-0">
              انضم إلينا واستمتع بخدمات صيدليتي المتكاملة
            </p>
          </div>

          {/* Form Body */}
          <div className="p-6 sm:p-8">
            {error && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-sm flex items-center gap-2 animate-fadeIn">
                <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  الاسم بالكامل <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute right-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    autoFocus
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="محمد أحمد"
                    className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  البريد الإلكتروني <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute right-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  كلمة المرور <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute right-3.5 top-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pr-10 pl-10 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3.5 top-3 text-gray-400 hover:text-gray-600 border-0 bg-transparent p-0 flex items-center justify-center cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {password && (
                  <div className="mt-2">
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-gray-400">قوة كلمة المرور:</span>
                      <span className="font-bold text-gray-700">{passwordStrength.label}</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${passwordStrength.score}%` }}
                        className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  تأكيد كلمة المرور <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute right-3.5 top-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={passwordConfirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-main py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md disabled:opacity-50 mt-4"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>جاري إنشاء الحساب...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>إنشاء الحساب الآن</span>
                  </>
                )}
              </button>
            </form>

            {/* Login Link */}
            <div className="text-center mt-6 pt-4 border-t border-gray-100 text-xs text-gray-500">
              <span>لديك حساب بالفعل؟ </span>
              <Link to="/login" className="text-main font-bold hover:underline">
                تسجيل الدخول هنا
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
