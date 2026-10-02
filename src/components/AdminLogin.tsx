import React, { FormEvent, useState } from 'react';
import { supabase } from '../supabaseClient';

interface AdminLoginProps {
  isUnauthorized: boolean;
  onSignOut: () => Promise<void>;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ isUnauthorized, onSignOut }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;
    } catch (signInError) {
      console.error('Admin sign-in failed:', signInError);
      setError('تعذر تسجيل الدخول. تحقق من البريد الإلكتروني وكلمة المرور.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main
      className="min-h-screen bg-[#fef8f4] text-[#1d1b19] flex items-center justify-center p-4"
      dir="rtl"
    >
      <section className="w-full max-w-md rounded-3xl border border-[#e7e1de] bg-white p-6 shadow-sm">
        <h1 className="text-xl font-bold text-[#43271a]">دخول لوحة التحكم</h1>
        <p className="mt-2 text-sm text-[#82746e]">
          سجّل الدخول بحساب مسؤول مصرح له للوصول إلى الطلبات والمنتجات.
        </p>

        {isUnauthorized ? (
          <div className="mt-5 flex flex-col gap-3">
            <p role="alert" className="rounded-xl bg-[#ffdad6] p-3 text-sm text-[#ba1a1a]">
              هذا الحساب لا يملك صلاحية مسؤول.
            </p>
            <button
              type="button"
              onClick={() => void onSignOut()}
              className="rounded-xl bg-[#43271a] px-4 py-2.5 text-sm font-semibold text-white"
            >
              تسجيل الخروج
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
            <label className="flex flex-col gap-1.5 text-sm font-medium text-[#50443f]">
              البريد الإلكتروني
              <input
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="rounded-xl border border-[#d4c3bc] px-3.5 py-2.5 text-[#1d1b19] outline-none focus:ring-2 focus:ring-[#43271a]"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium text-[#50443f]">
              كلمة المرور
              <input
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="rounded-xl border border-[#d4c3bc] px-3.5 py-2.5 text-[#1d1b19] outline-none focus:ring-2 focus:ring-[#43271a]"
              />
            </label>
            {error && (
              <p role="alert" className="rounded-xl bg-[#ffdad6] p-3 text-sm text-[#ba1a1a]">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-[#43271a] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
            >
              {isSubmitting ? 'جارٍ التحقق…' : 'تسجيل الدخول'}
            </button>
          </form>
        )}
      </section>
    </main>
  );
};
