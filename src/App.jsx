import { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function App() {
  const [chartData, setChartData] = useState([]);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // AIの分析結果を保存するステート
  const [aiAnalysis, setAiAnalysis] = useState({
    trend: '...',
    confidence: 0,
    reasoning: ['AIモデルを読み込み中...']
  });

  useEffect(() => {
    const fetchAndPredict = async () => {
      try {
        setLoading(true);
        
        // 1. CoinGecko APIから過去データを取得
        const cgResponse = await axios.get(
          'https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=7&interval=daily'
        );
        
        const prices = cgResponse.data.prices;
        const historicalData = prices.slice(0, -1).map(item => ({
          date: `${new Date(item[0]).getMonth() + 1}/${new Date(item[0]).getDate()}`,
          price: Math.round(item[1]),
        }));

        const latestPrice = historicalData[historicalData.length - 1].price;
        setCurrentPrice(latestPrice);

        // 2. AI (Gemini API) に予測をリクエスト
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        
        if (!apiKey) {
          throw new Error("APIキーが設定されていません");
        }

        // AIへの命令（プロンプト）
        const prompt = `
          あなたはプロの仮想通貨アナリストです。以下の過去7日間のビットコイン価格(USD)データを分析してください。
          データ: ${JSON.stringify(historicalData.map(d => d.price))}
          
          分析結果を必ず以下のJSONフォーマットのみで出力してください。Markdownの装飾(バッククォート等)は一切含めないでください。
          {
            "trend": "UP" または "DOWN" または "NEUTRAL",
            "confidence": 予測の自信度(0〜100の数値),
            "reasoning": ["理由1(簡潔に)", "理由2(簡潔に)"],
            "predicted_prices": [明日の予測価格の数値, 明後日の予測価格の数値]
          }
        `;

       const geminiResponse = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
          {
            contents: [{ parts: [{ text: prompt }] }]
          }
        );

        // AIの返答からJSONを抽出してパース
        const aiText = geminiResponse.data.candidates[0].content.parts[0].text;
        const cleanJson = aiText.replace(/```json/g, '').replace(/```/g, '').trim();
        const aiResult = JSON.parse(cleanJson);

        // 3. AIの予測データをグラフ用のデータに結合
        const finalChartData = [...historicalData];
        finalChartData.push({
          date: '明日(予測)',
          predicted: aiResult.predicted_prices[0],
        });
        finalChartData.push({
          date: '明後日(予測)',
          predicted: aiResult.predicted_prices[1],
        });

        setChartData(finalChartData);
        setAiAnalysis({
          trend: aiResult.trend,
          confidence: aiResult.confidence,
          reasoning: aiResult.reasoning
        });

      } catch (error) {
        console.error("エラーが発生しました:", error);
        setAiAnalysis({
          trend: 'ERROR',
          confidence: 0,
          reasoning: ['APIキーの設定、またはネットワークを確認してください。']
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAndPredict();
  }, []);

  // トレンドに応じた色とアイコンを設定
  const getTrendStyle = (trend) => {
    switch(trend) {
      case 'UP': return { color: 'text-emerald-400', icon: '🚀', bg: 'bg-emerald-500' };
      case 'DOWN': return { color: 'text-rose-400', icon: '📉', bg: 'bg-rose-500' };
      default: return { color: 'text-amber-400', icon: '⚖️', bg: 'bg-amber-500' };
    }
  };

  const trendStyle = getTrendStyle(aiAnalysis.trend);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
              AI Crypto Predictor
            </h1>
            <p className="text-slate-400 mt-2">Gemini AI による高度なトレンド分析と価格予測</p>
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
              {loading && <span className="text-sm text-blue-400 animate-pulse">AIが分析中...</span>}
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
                  <Line type="monotone" dataKey="price" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} connectNulls />
                  <Line type="monotone" dataKey="predicted" stroke={aiAnalysis.trend === 'DOWN' ? '#fb7185' : '#10b981'} strokeWidth={3} strokeDasharray="5 5" dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex gap-6 mt-4 justify-center text-sm">
              <span className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-500 rounded-full"></div>実際の価格</span>
              <span className="flex items-center gap-2"><div className={`w-3 h-3 ${trendStyle.bg} rounded-full`}></div>AI予測トレンド</span>
            </div>
          </div>

          {/* 右側：AI予測パネル */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-semibold mb-2 text-purple-400 flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  {!loading && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>}
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
                </span>
                AI Analysis Result
              </h2>
              <p className="text-slate-400 text-sm mb-6">Gemini 1.5 Flashによるテクニカル分析</p>
              
              <div className="bg-slate-950 rounded-xl p-6 text-center border border-slate-800 mb-6 transition-all">
                <p className="text-sm text-slate-400 mb-2">短期トレンド予測</p>
                <p className={`text-5xl font-bold mb-2 ${trendStyle.color}`}>
                  {loading ? "..." : `${aiAnalysis.trend} ${trendStyle.icon}`}
                </p>
                <p className={`text-xs ${trendStyle.color} opacity-80`}>
                  自信度: {loading ? "-" : `${aiAnalysis.confidence}%`}
                </p>
              </div>

              <div className="space-y-3">
                {aiAnalysis.reasoning.map((reason, index) => (
                  <p key={index} className="text-sm text-slate-300 border-l-2 border-purple-500 pl-3 leading-relaxed">
                    {reason}
                  </p>
                ))}
              </div>
            </div>

            <button 
              className="mt-8 w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 px-4 rounded-xl transition duration-200 border border-slate-700 disabled:opacity-50"
              onClick={() => window.location.reload()}
              disabled={loading}
            >
              {loading ? "分析中..." : "データを更新"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;