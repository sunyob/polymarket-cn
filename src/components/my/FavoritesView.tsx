'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Market } from '@/app/data';

export default function FavoritesView() {
  const { user, userData, toggleFavorite, isFavorite, refreshUserData } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  const [betType, setBetType] = useState<'YES' | 'NO'>('YES');
  const [amount, setAmount] = useState<string>('100');
  const [betting, setBetting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleFavorite = async (market: Market) => {
    if (!mounted) return;
    await toggleFavorite(market);
    await refreshUserData();
  };

  const handleBet = async () => {
    if (!mounted || !selectedMarket) return;
    const betAmount = parseFloat(amount);
    if (isNaN(betAmount) || betAmount <= 0) {
      alert('请输入有效的金额');
      return;
    }
    if (betAmount > (userData?.balance || 0)) {
      alert('资金不足');
      return;
    }

    setBetting(true);
    try {
      const price = betType === 'YES' ? selectedMarket.yesPrice : selectedMarket.noPrice;
      const res = await fetch('/api/bet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          marketId: selectedMarket.id,
          marketTitle: selectedMarket.title,
          betType,
          amount: betAmount,
          price,
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert(`下注成功！已买入 ${betAmount} 元 "${betType}"`);
        await refreshUserData();
        setSelectedMarket(null);
        setAmount('100');
      } else {
        alert(data.message || '下注失败');
      }
    } catch (err) {
      console.error('下注失败:', err);
      alert('下注失败，请稍后重试');
    } finally {
      setBetting(false);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="space-y-3">
      {userData?.favorites && userData.favorites.length > 0 ? (
        userData.favorites.map((favorite) => (
          <div key={favorite.id} className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <div>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">{favorite.category}</span>
                <span className="text-xs text-slate-400 ml-2">收藏于 {favorite.addedAt}</span>
              </div>
              <button
                onClick={() => handleFavorite(favorite)}
                className={`p-2 rounded-lg transition-all ${
                  isFavorite(favorite.id)
                    ? 'bg-red-100 text-red-600'
                    : 'bg-slate-100 text-slate-400 hover:text-red-500 hover:bg-red-50'
                }`}
                title={isFavorite(favorite.id) ? '取消收藏' : '收藏'}
              >
                <svg className="w-5 h-5" fill={isFavorite(favorite.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
            </div>
            <h3 className="font-semibold text-slate-800 mb-3">{favorite.title}</h3>
            <div className="flex justify-between items-center text-sm mb-3">
              <div className="flex space-x-4">
                <span className="text-slate-500">
                  是: <span className="text-green-600 font-bold">¥{favorite.yesPrice}</span>
                </span>
                <span className="text-slate-500">
                  否: <span className="text-red-600 font-bold">¥{favorite.noPrice}</span>
                </span>
              </div>
              <div className="text-slate-400 text-xs">
                交易量: ¥{favorite.volume.toLocaleString()}
              </div>
            </div>
            <div className="text-xs text-slate-400 mb-3">截止日期: {favorite.endDate}</div>
            
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => { setSelectedMarket(favorite); setBetType('YES'); }}
                className="bg-green-50 hover:bg-green-100 border border-green-200 text-green-700 font-bold py-2.5 px-4 rounded-xl transition-all flex justify-between items-center"
              >
                <span>买 &quot;是&quot;</span>
                <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded-md">¥{favorite.yesPrice}</span>
              </button>
              <button 
                onClick={() => { setSelectedMarket(favorite); setBetType('NO'); }}
                className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-bold py-2.5 px-4 rounded-xl transition-all flex justify-between items-center"
              >
                <span>买 &quot;否&quot;</span>
                <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded-md">¥{favorite.noPrice}</span>
              </button>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📭</div>
          <div className="text-slate-400 mb-4">暂无收藏</div>
          <div className="text-sm text-slate-500">去首页发现感兴趣的预测并收藏吧！</div>
        </div>
      )}

      {selectedMarket && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-xl font-bold mb-2">确认交易仓位</h3>
            <p className="text-slate-500 text-sm mb-4">{selectedMarket.title}</p>
            
            <div className="flex bg-slate-100 p-1.5 rounded-xl mb-4">
              <button 
                onClick={() => setBetType('YES')}
                className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${betType === 'YES' ? 'bg-green-600 text-white' : 'text-slate-600'}`}
              >
                看好 (YES ¥{selectedMarket.yesPrice})
              </button>
              <button 
                onClick={() => setBetType('NO')}
                className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${betType === 'NO' ? 'bg-red-600 text-white' : 'text-slate-600'}`}
              >
                看空 (NO ¥{selectedMarket.noPrice})
              </button>
            </div>

            <div className="mb-6">
              <label className="block text-xs font-bold uppercase text-slate-400 mb-2">下注金额 (¥)</label>
              <input 
                type="number" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full text-2xl font-bold border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-slate-400 mt-2">预计可获得对应预测份额: {Math.floor(parseFloat(amount) / (betType === 'YES' ? selectedMarket.yesPrice : (selectedMarket.noPrice || 0)))} 股</p>
            </div>

            <div className="flex space-x-3">
              <button onClick={() => setSelectedMarket(null)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition-all">取消</button>
              <button onClick={handleBet} disabled={betting} className={`flex-1 font-bold py-3 rounded-xl text-white transition-all ${betType === 'YES' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} disabled:opacity-50`}>
                {betting ? '下注中...' : '确认买入'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
