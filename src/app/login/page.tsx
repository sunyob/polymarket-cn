'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated } = useAuth();
  const [mounted, setMounted] = useState(false);
  const redirect = searchParams.get('redirect') || '/';

  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && isAuthenticated) {
      router.push(redirect);
    }
  }, [mounted, isAuthenticated, router, redirect]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => setCountdown(c => c - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [countdown]);

  const sendCode = async () => {
    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      setError('请输入正确的手机号码');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });

      const data = await res.json();
      if (data.success) {
        setCountdown(60);
        setError(`验证码已发送 (测试码: ${data.data?.code || '123456'})`);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('发送失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!phone || !code) {
      setError('请输入手机号和验证码');
      return;
    }

    setLoggingIn(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code }),
      });

      const data = await res.json();
      if (data.success) {
        login(data.data.user, data.data.userData, data.data.token);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('登录失败，请稍后重试');
    } finally {
      setLoggingIn(false);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-slate-800 mb-2">📱 polymarket-cn</h1>
          <p className="text-slate-500">手机号验证码登录</p>
        </div>

        {error && (
          <div className={`mb-4 p-3 rounded-lg text-sm ${error.includes('成功') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">手机号</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="请输入手机号"
              maxLength={11}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">验证码</label>
            <div className="flex space-x-3">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="请输入验证码"
                maxLength={6}
                className="flex-1 px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
              <button
                onClick={sendCode}
                disabled={loading || countdown > 0}
                className="px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-all"
              >
                {countdown > 0 ? `${countdown}s` : '获取验证码'}
              </button>
            </div>
          </div>

          <button
            onClick={handleLogin}
            disabled={loggingIn}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loggingIn ? '登录中...' : '登录 / 注册'}
          </button>

          <p className="text-center text-sm text-slate-400">
            登录即表示同意用户协议和隐私政策
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100">
          <Link href="/" className="block text-center text-blue-600 hover:text-blue-700 text-sm">
            ← 返回首页
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-500">加载中...</div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
