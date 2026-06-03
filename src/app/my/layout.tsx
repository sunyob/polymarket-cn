'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

const tabs = [
  { key: 'participations', label: '参与', href: '/my/participations' },
  { key: 'favorites', label: '收藏', href: '/my/favorites' },
  { key: 'assets', label: '资产', href: '/my/assets' },
] as const;

function MyLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, logout } = useAuth();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated && !isAuthenticated) {
      router.push('/login?redirect=/my');
    }
  }, [hydrated, isAuthenticated, router]);

  if (!hydrated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-500">加载中...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-2xl mb-4">🔐</div>
          <p className="text-slate-600 mb-4">请先登录</p>
          <Link href="/login?redirect=/my" className="bg-blue-600 text-white px-6 py-2 rounded-lg">
            去登录
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center space-x-6">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-black text-blue-600 tracking-wider">💡 polymarket-cn</span>
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full font-medium">预测市场</span>
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl text-sm font-medium text-blue-700 transition-all">
            <span>🏠</span>
            <span>首页</span>
          </Link>
          <button
            onClick={logout}
            className="flex items-center space-x-2 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-xl text-sm font-medium text-red-700 transition-all"
          >
            <span>🚪</span>
            <span>退出</span>
          </button>
        </div>
      </nav>

      <div className="bg-white border-b border-slate-200 px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-xl font-bold text-slate-800 mb-2">
            👤 {user?.phone.slice(0,3)}****{user?.phone.slice(7)}
          </h1>
          <div className="flex space-x-1">
            {tabs.map(tab => {
              const isActive = pathname === tab.href;
              return (
                <Link
                  key={tab.key}
                  href={tab.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {children}
      </div>
    </div>
  );
}

export default function MyLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-500">加载中...</div>
      </div>
    }>
      <MyLayoutContent>{children}</MyLayoutContent>
    </Suspense>
  );
}
