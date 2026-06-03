'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

export default function AssetsView() {
  const { user, userData, refreshUserData } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState('1000');
  const [recharging, setRecharging] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleRecharge = async () => {
    if (!mounted) return;
    const amount = parseFloat(rechargeAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('请输入有效的金额');
      return;
    }

    setRecharging(true);
    try {
      const res = await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id, amount }),
      });

      const data = await res.json();
      if (data.success) {
        alert(`充值成功！已充值 ¥${amount}`);
        await refreshUserData();
        setRechargeAmount('1000');
      } else {
        alert(data.message || '充值失败');
      }
    } catch (err) {
      console.error('充值失败:', err);
      alert('充值失败，请稍后重试');
    } finally {
      setRecharging(false);
    }
  };

  if (!mounted) {
    return null;
  }

  const totalInvested = userData?.transactions
    ?.filter(t => t.type === 'bet')
    .reduce((sum, t) => sum + t.amount, 0) || 0;

  const totalWon = userData?.transactions
    ?.filter(t => t.type === 'win')
    .reduce((sum, t) => sum + t.amount, 0) || 0;

  const totalProfit = totalWon - totalInvested;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-sm mb-1">可用余额</div>
          <div className="text-3xl font-bold text-slate-800">
            ¥{userData?.balance?.toLocaleString() || '0'}
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-sm mb-1">总投入</div>
          <div className="text-3xl font-bold text-slate-800">¥{totalInvested.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-sm mb-1">总收益</div>
          <div className={`text-3xl font-bold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {totalProfit >= 0 ? '+' : ''}¥{totalProfit.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-4">模拟充值</h3>
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <label className="block text-sm text-slate-500 mb-1">充值金额 (¥)</label>
            <input
              type="number"
              value={rechargeAmount}
              onChange={(e) => setRechargeAmount(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="请输入充值金额"
            />
          </div>
          <button
            onClick={handleRecharge}
            disabled={recharging}
            className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {recharging ? '充值中...' : '立即充值'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 p-6 pb-4 border-b border-slate-100">流水记录</h3>
        <div className="divide-y divide-slate-100">
          {userData?.transactions && userData.transactions.length > 0 ? (
            userData.transactions.slice().reverse().map((tx) => (
              <div key={tx.id} className="p-6 flex justify-between items-center">
                <div>
                  <div className="font-medium text-slate-800">{tx.description}</div>
                  <div className="text-sm text-slate-400">
                    {tx.createdAt ? `${tx.createdAt.split('T')[0]} ${tx.createdAt.split('T')[1]?.slice(0, 8)}` : ''}
                  </div>
                </div>
                <div className={`text-lg font-bold ${
                  tx.type === 'deposit' || tx.type === 'win' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {tx.type === 'deposit' || tx.type === 'win' ? '+' : '-'}¥{tx.amount.toLocaleString()}
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-slate-400">
              暂无流水记录
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
