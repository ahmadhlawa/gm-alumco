import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe } from 'lucide-react';
import { login } from '@/api/auth';
import { ApiError } from '@/api/client';
import { getNextPublicLanguage, useLanguage } from '@/i18n';

// Admin login copy — Hebrew + English only. Hebrew is the default. No Arabic.
const COPY = {
  he: {
    title: 'כניסה לניהול',
    subtitle: 'לוח הבקרה של T.A.S',
    email: 'דוא״ל',
    password: 'סיסמה',
    submit: 'התחברות',
    submitting: 'מתחבר…',
    backToSite: 'חזרה לאתר הראשי',
    invalid: 'הדוא״ל או הסיסמה שגויים.',
    failed: 'ההתחברות נכשלה. בדקו את החיבור ונסו שוב.',
    switchLanguage: 'מעבר לאנגלית',
  },
  en: {
    title: 'Admin sign in',
    subtitle: 'T.A.S control panel',
    email: 'Email',
    password: 'Password',
    submit: 'Sign in',
    submitting: 'Signing in…',
    backToSite: 'Back to main site',
    invalid: 'The email or password is incorrect.',
    failed: 'Sign in failed. Check your connection and try again.',
    switchLanguage: 'Switch to Hebrew',
  },
};

export function AdminLogin() {
  const { language, dir, setLanguage } = useLanguage();
  const copy = language === 'en' ? COPY.en : COPY.he;
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
      setError(err instanceof ApiError && err.status === 401 ? copy.invalid : copy.failed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0B0E] flex items-center justify-center p-4" dir={dir}>
      <div className="w-full max-w-md bg-brand-navy border border-white/10 rounded-lg shadow-2xl p-8">
        <div className="flex justify-end mb-2">
          <button
            type="button"
            onClick={() => setLanguage(getNextPublicLanguage(language))}
            aria-label={copy.switchLanguage}
            title={copy.switchLanguage}
            className="flex items-center gap-2 rounded border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-bold text-brand-silver transition-colors hover:bg-white/10 hover:text-white"
          >
            <Globe className="h-4 w-4" />
            <span>{language === 'he' ? 'EN' : 'HE'}</span>
          </button>
        </div>
        <div className="text-center mb-8">
           <div className="w-16 h-16 bg-brand-gold/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-brand-gold/20 p-2">
             <img src="/images/logo-TAS-navbar.png" alt="T.A.S" className="w-full h-full object-contain" />
           </div>
           <h2 className="text-2xl font-bold text-white">{copy.title}</h2>
           <p className="text-gray-400 mt-2 text-sm">{copy.subtitle}</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-300 p-3 rounded text-sm text-center">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-300">{copy.email}</label>
            <input
              type="email"
              required
              dir="ltr"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full h-12 px-4 bg-black/20 border border-white/10 rounded focus:border-brand-gold text-white"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-300">{copy.password}</label>
            <input
              type="password"
              required
              dir="ltr"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full h-12 px-4 bg-black/20 border border-white/10 rounded focus:border-brand-gold text-white"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-brand-gold text-white font-bold rounded hover:bg-[#b8962e] transition-colors disabled:opacity-50"
          >
            {loading ? copy.submitting : copy.submit}
          </button>
        </form>

        <div className="mt-6 text-center">
           <a href="/" className="text-brand-silver hover:text-white text-sm transition-colors border-b border-transparent hover:border-white pb-1">{copy.backToSite}</a>
        </div>
      </div>
    </div>
  );
}
