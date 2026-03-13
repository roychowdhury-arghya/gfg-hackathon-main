import React, { useState, useEffect, useRef } from 'react';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell 
} from 'recharts';
import { 
  Send, Database, LayoutDashboard, MessageSquare, 
  Upload, Loader2, AlertCircle, TrendingUp, Info, ChevronRight, Download
} from 'lucide-react';

// --- Constants & Config ---
const apiKey = import.meta.env.VITE_GEMINI_API_KEY; // Environment handles this

/**
 * UPDATED MODEL STRATEGY:
 * The preview environment is strictly tuned to specific versions.
 * We prioritize the 2.5-flash-preview then fallback to stable 1.5 versions.
 */
const MODELS = [
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-1.5-flash-8b"
];

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function App() {
  // --- State ---
  const [csvData, setCsvData] = useState(null);
  const [headers, setHeaders] = useState([]);
  const [query, setQuery] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [dashboard, setDashboard] = useState(null);
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState(null);
  const [activeModel, setActiveModel] = useState(MODELS[0]);
  
  const fileInputRef = useRef(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // --- CSV Handling ---
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const rows = text.split('\n').filter(row => row.trim() !== '');
        if (rows.length < 2) throw new Error("CSV is empty or lacks data.");

        const headers = rows[0].split(',').map(h => h.trim());
        const data = rows.slice(1).map(row => {
          const values = row.split(',');
          const obj = {};
          headers.forEach((h, i) => {
            const val = values[i]?.trim();
            obj[h] = isNaN(val) || val === "" ? val : parseFloat(val);
          });
          return obj;
        });

        setCsvData(data);
        setHeaders(headers);
        setMessages([{
          role: 'system',
          content: `Successfully loaded data with ${data.length} records and ${headers.length} columns.`
        }]);
        setError(null);
        setDashboard(null);
      } catch (err) {
        setError("Error parsing CSV. Please check formatting.");
      }
    };
    reader.readAsText(file);
  };

  const callGemini = async (prompt, modelIndex = 0, retryCount = 0) => {
    const currentModel = MODELS[modelIndex];
    setActiveModel(currentModel);
    
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${currentModel}:generateContent?key=${apiKey}`;

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
              type: "OBJECT",
              properties: {
                title: { type: "STRING" },
                summary: { type: "STRING" },
                insights: { type: "ARRAY", items: { type: "STRING" } },
                charts: {
                  type: "ARRAY",
                  items: {
                    type: "OBJECT",
                    properties: {
                      type: { type: "STRING", enum: ["bar", "line", "pie", "area"] },
                      title: { type: "STRING" },
                      xAxisKey: { type: "STRING" },
                      yAxisKey: { type: "STRING" },
                      description: { type: "STRING" }
                    },
                    required: ["type", "title", "xAxisKey", "yAxisKey"]
                  }
                }
              },
              required: ["title", "summary", "charts"]
            }
          }
        })
      });

      const result = await response.json();

      if (!response.ok) {
        if ((response.status === 404 || response.status === 400) && modelIndex < MODELS.length - 1) {
          return callGemini(prompt, modelIndex + 1, 0);
        }
        if ((response.status === 429 || response.status >= 500) && retryCount < 3) {
          const delay = Math.pow(2, retryCount) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
          return callGemini(prompt, modelIndex, retryCount + 1);
        }
        throw new Error(result.error?.message || `API Error: ${response.status}`);
      }

      const content = result.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!content) throw new Error("API returned an empty response.");
      
      return JSON.parse(content);
    } catch (err) {
      if (modelIndex < MODELS.length - 1 && (err.message.includes("not found") || err.message.includes("not supported"))) {
        return callGemini(prompt, modelIndex + 1, 0);
      }
      throw err;
    }
  };

  const handleQuery = async (e) => {
    e.preventDefault();
    if (!query.trim() || !csvData) return;

    const userQuery = query;
    setQuery("");
    setMessages(prev => [...prev, { role: 'user', content: userQuery }]);
    setIsProcessing(true);
    setError(null);

    const sampleData = JSON.stringify(csvData.slice(0, 3));
    const systemPrompt = `
      You are an expert Data Analyst. Given a CSV dataset schema and a user query, generate a structured BI dashboard configuration.
      Dataset Schema: [${headers.join(', ')}]
      Sample Data: ${sampleData}

      User Query: "${userQuery}"

      Instructions:
      1. Select 1 to 4 charts (bar, line, pie, area).
      2. Ensure xAxisKey and yAxisKey exactly match the provided schema.
      3. Provide 2-4 actionable insights based on the data context.
    `;

    try {
      const dashboardConfig = await callGemini(systemPrompt);
      setDashboard(dashboardConfig);
      setMessages(prev => [...prev, { role: 'assistant', content: dashboardConfig.summary }]);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const renderChart = (chart, index) => {
    // Determine the type of chart to render
    const isPie = chart.type === 'pie';
    const ChartComponent = {
      bar: BarChart,
      line: LineChart,
      pie: PieChart,
      area: AreaChart
    }[chart.type] || BarChart;

    return (
      <div key={index} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[420px] transition-all hover:shadow-md">
        <div className="flex items-center justify-between mb-6">
          <div className="flex flex-col">
            <h3 className="font-bold text-slate-800 tracking-tight">{chart.title}</h3>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest mt-0.5">{chart.description || 'Visualization'}</p>
          </div>
          <div className="bg-slate-50 p-2 rounded-lg">
             <Info size={14} className="text-slate-400" />
          </div>
        </div>
        <div className="flex-1 w-full min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <ChartComponent data={csvData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              {!isPie && (
                <>
                  <XAxis 
                    dataKey={chart.xAxisKey} 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{ fill: '#94a3b8' }} 
                    dy={10}
                  />
                  <YAxis 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{ fill: '#94a3b8' }} 
                    dx={-10}
                  />
                </>
              )}
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: 'none', 
                  boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                  padding: '12px'
                }} 
              />
              <Legend verticalAlign="top" align="right" iconType="circle" />
              
              {chart.type === 'pie' && (
                <Pie 
                  data={csvData} 
                  dataKey={chart.yAxisKey} 
                  nameKey={chart.xAxisKey} 
                  outerRadius={100} 
                  innerRadius={60}
                  paddingAngle={5}
                  label
                >
                  {csvData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
              )}

              {chart.type === 'area' && (
                <Area 
                  type="monotone" 
                  dataKey={chart.yAxisKey} 
                  stroke="#3b82f6" 
                  strokeWidth={3} 
                  fill="#3b82f6" 
                  fillOpacity={0.1} 
                />
              )}

              {chart.type === 'line' && (
                <Line 
                  type="monotone" 
                  dataKey={chart.yAxisKey} 
                  stroke="#3b82f6" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} 
                  activeDot={{ r: 6 }} 
                />
              )}

              {chart.type === 'bar' && (
                <Bar 
                  dataKey={chart.yAxisKey} 
                  fill="#3b82f6" 
                  radius={[6, 6, 0, 0]} 
                  barSize={32} 
                />
              )}
            </ChartComponent>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-[#fcfdfe] text-slate-900 font-sans overflow-hidden">
      <aside className="w-[380px] border-r border-slate-100 bg-white flex flex-col shadow-[20px_0_40px_-20px_rgba(0,0,0,0.02)] z-20">
        <div className="p-8 pb-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-blue-600 p-2.5 rounded-2xl shadow-lg shadow-blue-100">
              <LayoutDashboard className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-slate-900">Instant BI</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">AI Analytics Engine</p>
            </div>
          </div>

          <div 
            onClick={() => fileInputRef.current.click()} 
            className={`group cursor-pointer w-full flex flex-col items-center justify-center gap-3 px-6 py-10 border-2 border-dashed rounded-3xl transition-all ${csvData ? 'border-blue-100 bg-blue-50/30' : 'border-slate-200 hover:border-blue-400 hover:bg-slate-50'}`}
          >
            <div className={`p-3 rounded-full transition-colors ${csvData ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600'}`}>
              <Upload size={24} />
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-slate-700">{csvData ? "Dataset Ready" : "Import CSV File"}</p>
              <p className="text-xs text-slate-400 mt-1">{csvData ? `${csvData.length} records detected` : "Drag and drop your data here"}</p>
            </div>
          </div>
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".csv" className="hidden" />
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 scrollbar-hide">
          {messages.length === 0 && !isProcessing && (
            <div className="py-10 text-center">
               <p className="text-xs font-semibold text-slate-300 uppercase tracking-widest mb-4">Quick Suggestions</p>
               <div className="flex flex-col gap-2">
                 {['Show sales trends', 'Top products by revenue', 'Distribution of customers'].map((s, idx) => (
                   <button 
                    key={idx} 
                    onClick={() => { setQuery(s); }}
                    className="text-xs text-left px-4 py-3 bg-slate-50 rounded-xl text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-colors border border-transparent hover:border-blue-100"
                   >
                     {s}
                   </button>
                 ))}
               </div>
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-slate-900 text-white rounded-tr-none' : 'bg-white text-slate-700 rounded-tl-none border border-slate-100 shadow-sm'}`}>
                {msg.content}
              </div>
              <span className="text-[9px] text-slate-300 font-bold uppercase mt-1 px-1">{msg.role}</span>
            </div>
          ))}
          {isProcessing && (
            <div className="flex justify-start">
              <div className="bg-white p-4 rounded-2xl animate-pulse flex items-center gap-3 border border-slate-100 shadow-sm">
                <Loader2 className="animate-spin text-blue-500" size={16} />
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Analyzing Data</span>
                  <span className="text-[8px] text-slate-300 font-mono italic">{activeModel}</span>
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="p-6 bg-white border-t border-slate-50">
          <form onSubmit={handleQuery} className="relative group">
            <input 
              value={query} 
              onChange={(e) => setQuery(e.target.value)} 
              placeholder={csvData ? "Ask me anything about your data..." : "Please upload data first"} 
              disabled={!csvData || isProcessing} 
              className="w-full bg-slate-50 border-none rounded-2xl pl-5 pr-14 py-4 focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all disabled:opacity-50 text-sm font-medium placeholder:text-slate-400" 
            />
            <button 
              type="submit" 
              disabled={!query.trim() || isProcessing} 
              className="absolute right-2 top-2 p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-slate-200 transition-all shadow-md shadow-blue-200 disabled:shadow-none active:scale-95"
            >
              <Send size={18} />
            </button>
          </form>
          <p className="text-[10px] text-center text-slate-400 mt-4 font-medium italic">Gemini 2.5 Flash Processing • Low Latency Mode</p>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-[#fcfdfe] relative">
        {error && (
          <div className="m-8 bg-red-50 border border-red-100 text-red-800 p-6 rounded-3xl flex flex-col gap-3 animate-in fade-in slide-in-from-top-4 duration-500 shadow-sm">
            <div className="flex items-center gap-3 font-bold text-red-600">
              <div className="bg-red-100 p-1.5 rounded-lg"><AlertCircle size={20} /></div>
              Analytics Engine Halted
            </div>
            <p className="text-sm leading-relaxed opacity-90">{error}</p>
            <div className="mt-2 text-[10px] uppercase font-black text-red-400 tracking-[0.2em] border-t border-red-100 pt-4 flex justify-between items-center">
              <span>All fallback models exhausted</span>
              <button onClick={() => setError(null)} className="hover:text-red-600 transition-colors">Dismiss</button>
            </div>
          </div>
        )}
        
        {!dashboard ? (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center max-w-lg mx-auto space-y-8 animate-in fade-in duration-700">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 blur-[80px] opacity-10 rounded-full animate-pulse"></div>
              <div className="relative w-24 h-24 bg-white rounded-[32px] flex items-center justify-center shadow-xl border border-slate-50">
                <Database className="text-blue-600" size={40} />
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Intelligence on Demand</h2>
              <p className="text-slate-500 leading-relaxed font-medium">
                Connect your spreadsheets to transform raw rows into executive-level visual insights. Ask complex questions, find trends, and uncover hidden patterns in seconds.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-10 max-w-7xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-6 rounded-full bg-blue-600"></span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Generated Report</span>
                </div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tighter leading-none">{dashboard.title}</h2>
                <p className="text-slate-500 text-lg max-w-3xl leading-relaxed font-medium">{dashboard.summary}</p>
              </div>
              <button className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl text-sm font-bold hover:bg-slate-50 transition-all shadow-sm">
                <Download size={16} /> Export View
              </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dashboard.insights?.map((insight, idx) => (
                <div key={idx} className="group bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-4 hover:border-blue-200 hover:shadow-lg transition-all duration-300">
                  <div className="bg-blue-50 w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                    <TrendingUp size={20} />
                  </div>
                  <p className="text-sm text-slate-600 font-semibold leading-relaxed tracking-tight">{insight}</p>
                </div>
              ))}
            </div>

            <div className={`grid grid-cols-1 ${dashboard.charts.length > 1 ? 'lg:grid-cols-2' : ''} gap-10 pb-20`}>
              {dashboard.charts.map((chart, index) => renderChart(chart, index))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}