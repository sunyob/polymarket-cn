'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Market } from './data';

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export default function Home() {
  const { user, userData, isAuthenticated, toggleFavorite, isFavorite, refreshUserData } = useAuth();
  const [mounted, setMounted] = useState(false);
  
  const [markets, setMarkets] = useState<Market[]>([]);
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  const [betType, setBetType] = useState<'YES' | 'NO'>('YES');
  const [amount, setAmount] = useState<string>('100');
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [betting, setBetting] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchAiMarkets(1);
  }, []);

  const handleFavorite = async (market: Market) => {
    if (!isAuthenticated) {
      window.location.href = '/login?redirect=/';
      return;
    }
    await toggleFavorite(market);
    await refreshUserData();
  };

  const handleBet = async () => {
    if (!selectedMarket) return;
    if (!isAuthenticated) {
      window.location.href = '/login?redirect=/';
      return;
    }
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

  const fetchAiMarkets = async (page: number = 1) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/market/auto-create?page=${page}`);
      const data = await res.json();
      if (data.success && data.data) {
        setMarkets(data.data);
        setPagination(data.pagination);
        setCurrentPage(page);
      }
    } catch (err) {
      console.error('获取市场失败:', err);
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  };

  const goToPrevPage = () => {
    if (pagination?.hasPrev) {
      fetchAiMarkets(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (pagination?.hasNext) {
      fetchAiMarkets(currentPage + 1);
    }
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= (pagination?.totalPages || 1)) {
      fetchAiMarkets(page);
    }
  };

  const renderPageNumbers = () => {
    if (!pagination) return null;
    const pageNumbers = [];
    const maxVisible = 5;
    let startPage = Math.max(1, pagination.currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(pagination.totalPages, startPage + maxVisible - 1);
    
    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    if (startPage > 1) {
      pageNumbers.push(
        <button
          key="first"
          onClick={() => goToPage(1)}
          className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
        >
          1
        </button>
      );
      if (startPage > 2) {
        pageNumbers.push(<span key="ellipsis1" className="px-2 text-slate-400">...</span>);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => goToPage(i)}
          className={`px-3 py-1 rounded-lg transition-all ${
            i === pagination.currentPage
              ? 'bg-blue-600 text-white'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
        >
          {i}
        </button>
      );
    }

    if (endPage < pagination.totalPages) {
      if (endPage < pagination.totalPages - 1) {
        pageNumbers.push(<span key="ellipsis2" className="px-2 text-slate-400">...</span>);
      }
      pageNumbers.push(
        <button
          key="last"
          onClick={() => goToPage(pagination.totalPages)}
          className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
        >
          {pagination.totalPages}
        </button>
      );
    }

    return pageNumbers;
  };

  if (!mounted) {
    return (
      <main className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center">
        <div className="text-slate-500">加载中...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center space-x-6">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-black text-blue-600 tracking-wider">💡 polymarket-cn</span>
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full font-medium">预测市场</span>
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              <Link href="/my" className="flex items-center space-x-2 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl text-sm font-medium text-blue-700 transition-all">
                <span>👤</span>
                <span>{user?.phone.slice(0,3)}****{user?.phone.slice(7)}</span>
              </Link>
              <div className="bg-slate-100 px-4 py-2 rounded-xl text-sm font-semibold">
                💰 我的模拟资产: <span className="text-blue-600">¥{userData?.balance?.toLocaleString() || '0'}</span>
              </div>
            </>
          ) : (
            <Link href="/login" className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl text-sm font-medium text-white transition-all">
              <span>👤</span>
              <span>登录/注册</span>
            </Link>
          )}
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">全球焦点热点预测</h1>
            <p className="text-slate-500 mt-2">用真金白银的逻辑，看清未来的概率。</p>
            {pagination && (
              <p className="text-slate-400 text-sm mt-1">共 {pagination.totalItems} 条预测，第 {currentPage}/{pagination.totalPages} 页</p>
            )}
          </div>
          <button
            onClick={() => fetchAiMarkets(currentPage)}
            disabled={loading}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-2.5 px-6 rounded-xl shadow-sm transition-all disabled:opacity-50"
          >
            {loading ? '🔄 刷新中...' : '✨ 刷新今日 AI 热门盘口'}
          </button>
        </div>

        {initialLoad && (
          <div className="text-center py-12">
            <div className="animate-pulse text-slate-400">加载中...</div>
          </div>
        )}

        {!initialLoad && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {markets.map((market) => {
                const favorited = isFavorite(market.id);
                return (
                  <div key={market.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-xs font-bold text-blue-600 bg-blue-50 relative uppercase tracking-wider px-2.5 py-1 rounded-md">{market.category}</span>
                        <button
                          onClick={() => handleFavorite(market)}
                          className={`p-2 rounded-lg transition-all ${
                            favorited
                              ? 'bg-red-100 text-red-600'
                              : 'bg-slate-100 text-slate-400 hover:text-red-500 hover:bg-red-50'
                          }`}
                          title={favorited ? '取消收藏' : '收藏'}
                        >
                          <svg className="w-5 h-5" fill={favorited ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </button>
                      </div>
                      <h3 className="text-lg font-bold text-slate-800 leading-snug mb-4">{market.title}</h3>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-slate-400">交易量: ¥{market.volume.toLocaleString()}</span>
                        <span className="text-xs text-slate-400">截止日期: {market.endDate}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <button 
                          onClick={() => { setSelectedMarket(market); setBetType('YES'); }}
                          className="bg-green-50 hover:bg-green-100 border border-green-200 text-green-700 font-bold py-3 px-4 rounded-xl transition-all flex justify-between items-center"
                        >
                          <span>买 &quot;是&quot;</span>
                          <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-md">¥{market.yesPrice}</span>
                        </button>
                        <button 
                          onClick={() => { setSelectedMarket(market); setBetType('NO'); }}
                          className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-bold py-3 px-4 rounded-xl transition-all flex justify-between items-center"
                        >
                          <span>买 &quot;否&quot;</span>
                          <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-md">¥{market.noPrice}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {pagination && pagination.totalPages > 1 && (
              <div className="mt-8 flex justify-center items-center space-x-2">
                <button
                  onClick={goToPrevPage}
                  disabled={!pagination.hasPrev || loading}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    pagination.hasPrev && !loading
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      : 'bg-slate-50 text-slate-300 cursor-not-allowed'
                  }`}
                >
                  上一页
                </button>
                
                <div className="flex items-center space-x-2">
                  {renderPageNumbers()}
                </div>

                <button
                  onClick={goToNextPage}
                  disabled={!pagination.hasNext || loading}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    pagination.hasNext && !loading
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      : 'bg-slate-50 text-slate-300 cursor-not-allowed'
                  }`}
                >
                  下一页
                </button>
              </div>
            )}
          </>
        )}
      </div>

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
    </main>
  );
}
