'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface Participation {
  id: string;
  title: string;
  category: string;
  betType: 'YES' | 'NO';
  betPrice: number;
  amount: number;
  status: 'ongoing' | 'resolved';
  action: string;
  participationTime: string;
}

export default function ParticipationsView() {
  const { userData } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const betTransactions = userData?.transactions?.filter(t => t.type === 'bet') || [];
  
  const participations: Participation[] = betTransactions.map(t => {
    const match = t.description.match(/「(.+?)」(买是|买否)\s*@¥([\d.]+)/);
    return {
      id: t.id,
      title: match ? match[1] : t.description,
      category: '预测市场',
      betType: match && match[2] === '买是' ? 'YES' : 'NO',
      betPrice: match ? parseFloat(match[3]) : 0,
      amount: t.amount,
      status: 'ongoing',
      action: '买入',
      participationTime: t.createdAt ? `${t.createdAt.split('T')[0]} ${t.createdAt.split('T')[1]?.slice(0, 8)}` : '',
    };
  });

  const ongoing = participations.filter(p => p.status === 'ongoing');
  const resolved = participations.filter(p => p.status === 'resolved');

  return (
    <div className="space-y-6">
      {ongoing.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-slate-800 mb-4">进行中</h2>
          <div className="space-y-3">
            {ongoing.map(participation => (
              <div key={participation.id} className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">{participation.category}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">参与: {participation.participationTime}</span>
                  </div>
                </div>
                <h3 className="font-semibold text-slate-800 mb-3">{participation.title}</h3>
                <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                  <div>
                    <div className="text-slate-500">行为</div>
                    <div className="font-bold text-blue-600">{participation.action}</div>
                  </div>
                  <div>
                    <div className="text-slate-500">下注方向</div>
                    <div className={`font-bold ${participation.betType === 'YES' ? 'text-green-600' : 'text-red-600'}`}>
                      {participation.betType === 'YES' ? '买是' : '买否'} @ ¥{participation.betPrice}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500">投入金额</div>
                    <div className="font-bold text-slate-800">¥{participation.amount.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {resolved.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-slate-800 mb-4">已结算</h2>
          <div className="space-y-3">
            {resolved.map(participation => (
              <div key={participation.id} className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm opacity-75">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">{participation.category}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">已结束</span>
                    <span className="text-xs text-slate-400 block">参与: {participation.participationTime}</span>
                  </div>
                </div>
                <h3 className="font-semibold text-slate-800 mb-3">{participation.title}</h3>
                <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                  <div>
                    <div className="text-slate-500">行为</div>
                    <div className="font-bold text-blue-600">{participation.action}</div>
                  </div>
                  <div>
                    <div className="text-slate-500">下注方向</div>
                    <div className={`font-bold ${participation.betType === 'YES' ? 'text-green-600' : 'text-red-600'}`}>
                      {participation.betType === 'YES' ? '买是' : '买否'} @ ¥{participation.betPrice}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500">投入金额</div>
                    <div className="font-bold text-slate-800">¥{participation.amount.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {participations.length === 0 && (
        <div className="text-center py-12">
          <div className="text-slate-400">暂无参与记录</div>
        </div>
      )}
    </div>
  );
}
