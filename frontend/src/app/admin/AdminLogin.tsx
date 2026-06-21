import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '@/api/auth';
import { ApiError } from '@/api/client';

export function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate('/admin');
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 401
          ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة.'
          : 'تعذر تسجيل الدخول. تحقق من الاتصال وحاول مرة أخرى.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0B0E] flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-md bg-brand-navy border border-white/10 rounded-lg shadow-2xl p-8">
        <div className="text-center mb-8">
           <div className="w-16 h-16 bg-brand-gold/10 text-brand-gold rounded-full flex items-center justify-center mx-auto mb-4 border border-brand-gold/20">
             <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
             </svg>
           </div>
           <h2 className="text-2xl font-bold text-white">تسجيل الدخول للإدارة</h2>
           <p className="text-gray-400 mt-2 text-sm">لوحة تحكم أفق الألمنيوم</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-300 p-3 rounded text-sm text-center">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-300">البريد الإلكتروني</label>
            <input 
              type="email" 
              required
              dir="ltr"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full h-12 px-4 bg-black/20 border border-white/10 rounded focus:border-brand-gold text-white text-right" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-300">كلمة المرور</label>
            <input 
              type="password" 
              required
              dir="ltr"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full h-12 px-4 bg-black/20 border border-white/10 rounded focus:border-brand-gold text-white text-right" 
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full h-12 bg-brand-gold text-white font-bold rounded hover:bg-[#b8962e] transition-colors disabled:opacity-50"
          >
            {loading ? 'جاري التحقق...' : 'تسجيل الدخول'}
          </button>
        </form>

        <div className="mt-6 text-center">
           <a href="/" className="text-brand-silver hover:text-white text-sm transition-colors border-b border-transparent hover:border-white pb-1">العودة للموقع الرئيسي</a>
        </div>
      </div>
    </div>
  );
}
