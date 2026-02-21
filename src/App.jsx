import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// 仮のチャートデータ（後でAPIから取得したデータに置き換えます）
// price: 実際の過去価格, predicted: AIが予測した未来の価格
const mockData = [
  { date: '1日前', price: 42000 },
  { date: '今日', price: 43500 },
  { date: '明日', predicted: 44200 },
  { date: '明後日', predicted: 45000 },
];

function App() {
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* ヘッダー部分 */}
        <header className="mb-10 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
              AI Crypto Predictor
            </h1>
            <p className="text-slate-400 mt-2">ビットコイン(BTC)の過去トレンドとAIによる未来予測</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-400">現在の価格</p>
            <p className="text-3xl font-mono font-bold text-white">$43,500</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* 左側：チャートエリア (2カラム分) */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-lg font-semibold mb-6">価格推移 & 予測チャート</h2>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="date" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
                  <YAxis domain={['auto', 'auto']} stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc' }}
                    itemStyle={{ color: '#38bdf8' }}
                  />
                  {/* 実際の価格（実線：青） */}
                  <Line type="monotone" dataKey="price" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} />
                  {/* AI予測価格（点線：緑） */}
                  <Line type="monotone" dataKey="predicted" stroke="#10b981" strokeWidth={3} strokeDasharray="5 5" dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex gap-6 mt-4 justify-center text-sm">
              <span className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-500 rounded-full"></div>実際の価格</span>
              <span className="flex items-center gap-2"><div className="w-3 h-3 bg-emerald-500 rounded-full"></div>AI予測トレンド</span>
            </div>
          </div>

          {/* 右側：AI予測パネル (1カラム分) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-semibold mb-2 text-emerald-400">AI Analysis Result</h2>
              <p className="text-slate-400 text-sm mb-6">過去7日間の値動きに基づく予測</p>
              
              <div className="bg-slate-950 rounded-xl p-6 text-center border border-slate-800 mb-6">
                <p className="text-sm text-slate-400 mb-2">短期トレンド予測</p>
                <p className="text-5xl font-bold text-emerald-400 mb-2">UP 🚀</p>
                <p className="text-xs text-emerald-500/80">自信度: 85%</p>
              </div>

              <div className="space-y-3">
                <p className="text-sm text-slate-300 border-l-2 border-blue-500 pl-3">
                  直近のサポートラインを反発しており、買い圧力が強まっています。
                </p>
                <p className="text-sm text-slate-300 border-l-2 border-blue-500 pl-3">
                  MACDがゴールデンクロスを形成する兆候が見られます。
                </p>
              </div>
            </div>

            <button 
              className="mt-8 w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-xl transition duration-200"
              onClick={() => alert("ここにAPI再フェッチのロジックを入れます")}
            >
              最新データで再予測
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default App;
