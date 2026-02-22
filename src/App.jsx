import { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function App() {
  const [chartData, setChartData] = useState([]);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [loading, setLoading] = useState(true);

  // コンポーネントがマウントされた時にAPIを叩く
  useEffect(() => {
    const fetchCryptoData = async () => {
      try {
        setLoading(true);
        // CoinGecko API: ビットコインの過去7日間の日足データを取得 (USD建て)
        const response = await axios.get(
          'https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=7&interval=daily'
        );

        const prices = response.data.prices;
        
        // データをRechartsで使いやすい形式に整形
        const formattedData = prices.slice(0, -1).map((item) => {
          const date = new Date(item[0]);
          return {
            date: `${date.getMonth() + 1}/${date.getDate()}`, // 例: "2/9"
            price: Math.round(item[1]), // 小数点以下を四捨五入
          };
        });

        const latestPrice = formattedData[formattedData.length - 1].price;
        setCurrentPrice(latestPrice);

        // --- AI予測のシミュレーション部分 ---
        // ※実際はここで過去データをAI APIに投げますが、今回はフロントエンドのみで動くよう
        // 最新価格をベースに擬似的な未来の予測データを2日分追加します。
        formattedData.push({
          date: '明日(予測)',
          predicted: Math.round(latestPrice * 1.015), // +1.5% 上昇と予測
        });
        formattedData.push({
          date: '明後日(予測)',
          predicted: Math.round(latestPrice * 1.03), // さらに上昇と予測
        });

        setChartData(formattedData);
      } catch (error) {
        console.error("データの取得に失敗しました", error);
        alert("APIの制限またはネットワークエラーが発生しました。");
      } finally {
        setLoading(false);
      }
    };

    fetchCryptoData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* ヘッダー部分 */}
        <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
              AI Crypto Predictor
            </h1>
            <p className="text-slate-400 mt-2">ビットコイン(BTC)の過去トレンドとAIによる未来予測</p>
          </div>
          <div className="text-left md:text-right">
            <p className="text-sm text-slate-400">現在の価格 (USD)</p>
            <p className="text-3xl font-mono font-bold text-white">
              {loading ? "Loading..." : `$${currentPrice.toLocaleString()}`}
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* 左側：チャートエリア */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-lg font-semibold mb-6 flex items-center justify-between">
              価格推移 & 予測チャート
              {loading && <span className="text-sm text-blue-400 animate-pulse">データを取得中...</span>}
            </h2>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="date" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
                  <YAxis 
                    domain={['dataMin - 1000', 'dataMax + 1000']} 
                    stroke="#94a3b8" 
                    tick={{ fill: '#94a3b8' }} 
                    tickFormatter={(value) => `$${value.toLocaleString()}`}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc' }}
                    itemStyle={{ color: '#38bdf8' }}
                    formatter={(value) => [`$${value.toLocaleString()}`, '価格']}
                  />
                  {/* 実際の価格（実線：青、予測データがある場所は途切れる） */}
                  <Line type="monotone" dataKey="price" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} connectNulls />
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

          {/* 右側：AI予測パネル */}
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
              className="mt-8 w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 px-4 rounded-xl transition duration-200 border border-slate-700"
              onClick={() => window.location.reload()}
            >
              データを更新
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default App;