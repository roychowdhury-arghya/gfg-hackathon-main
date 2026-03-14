import React, { useState, useEffect, useRef } from "react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from "recharts";
import { Send, Loader2, TrendingUp, Upload } from "lucide-react";

// ── Config ────────────────────────────────────────────────────────────────────
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

const COLORS = ["#3b82f6","#10b981","#f59e0b","#ef4444","#8b5cf6","#ec4899"];

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [fileId, setFileId]         = useState(null);
  const [fileInfo, setFileInfo]     = useState(null);   // {filename, row_count, columns}
  const [query, setQuery]           = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dashboard, setDashboard]   = useState(null);
  const [sqlCode, setSqlCode]       = useState(null);
  const [tableData, setTableData]   = useState(null);
  const [messages, setMessages]     = useState([]);
  const [error, setError]           = useState(null);

  const fileInputRef = useRef(null);
  const chatEndRef   = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Upload ──────────────────────────────────────────────────────────────────
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);
    setDashboard(null);
    setSqlCode(null);
    setTableData(null);

    try {
      const form = new FormData();
      form.append("file", file);

      const res = await fetch(`${API_BASE}/upload`, {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Upload failed");
      }

      const data = await res.json();
      setFileId(data.file_id);
      setFileInfo({
        filename: data.filename,
        row_count: data.row_count,
        columns: data.columns,
      });

      setMessages([
        {
          role: "system",
          content: `✅ Loaded "${data.filename}" — ${data.row_count} rows • ${data.columns.length} columns${data.cached ? " (cached)" : ""}`,
        },
      ]);
    } catch (err) {
      setError(err.message);
    }

    setIsUploading(false);
  };

  // ── Query ───────────────────────────────────────────────────────────────────
  const handleQuery = async (e) => {
    e.preventDefault();
    if (!query.trim() || !fileId) return;

    const userQuery = query;
    setQuery("");
    setError(null);
    setMessages((prev) => [...prev, { role: "user", content: userQuery }]);
    setIsProcessing(true);

    try {
      const res = await fetch(`${API_BASE}/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file_id: fileId, question: userQuery }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Query failed");
      }

      const data = await res.json();

      setSqlCode(data.sql);
      setTableData({ columns: data.columns, rows: data.results });

      if (data.dashboard) {
        setDashboard(data.dashboard);
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.dashboard.summary },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: `Returned ${data.row_count} rows.` },
        ]);
      }
    } catch (err) {
      setError(err.message);
    }

    setIsProcessing(false);
  };

  // ── Chart Render ────────────────────────────────────────────────────────────
  const renderChart = (chart, index) => {
    if (!tableData?.rows?.length) return null;

    const ChartComponent = {
      bar: BarChart, line: LineChart, pie: PieChart, area: AreaChart,
    }[chart.type] || BarChart;

    const isPie = chart.type === "pie";

    return (
      <div key={index} className="bg-white p-6 rounded-2xl border shadow-sm h-[400px]">
        <h3 className="font-semibold text-gray-800 mb-1">{chart.title}</h3>
        {chart.description && (
          <p className="text-xs text-gray-400 mb-3">{chart.description}</p>
        )}
        <ResponsiveContainer width="100%" height="85%">
          <ChartComponent data={tableData.rows}>
            <CartesianGrid strokeDasharray="3 3" />
            {!isPie && (
              <>
                <XAxis dataKey={chart.xAxisKey} tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
              </>
            )}
            <Tooltip />
            <Legend />
            {chart.type === "bar"  && <Bar  dataKey={chart.yAxisKey} fill="#3b82f6" radius={[4,4,0,0]} />}
            {chart.type === "line" && <Line dataKey={chart.yAxisKey} stroke="#3b82f6" strokeWidth={2} dot={false} />}
            {chart.type === "area" && <Area dataKey={chart.yAxisKey} stroke="#3b82f6" fill="#bfdbfe" strokeWidth={2} />}
            {chart.type === "pie"  && (
              <Pie data={tableData.rows} dataKey={chart.yAxisKey} nameKey={chart.xAxisKey} outerRadius={110}>
                {tableData.rows.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
            )}
          </ChartComponent>
        </ResponsiveContainer>
      </div>
    );
  };

  // ── UI ──────────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen bg-gray-50 font-sans">

      {/* SIDEBAR */}
      <aside className="w-96 border-r bg-white flex flex-col shadow-sm">

        {/* Header */}
        <div className="p-6 border-b">
          <h1 className="text-lg font-bold text-gray-900 mb-1">Instant BI</h1>
          <p className="text-xs text-gray-400">Ask anything about your data</p>
        </div>

        {/* Upload */}
        <div className="p-4 border-b">
          <button
            onClick={() => fileInputRef.current.click()}
            disabled={isUploading}
            className="w-full border-2 border-dashed border-gray-200 hover:border-blue-400 rounded-xl p-5 flex flex-col items-center gap-2 transition-colors"
          >
            {isUploading
              ? <Loader2 className="animate-spin text-blue-500" size={20} />
              : <Upload size={20} className="text-gray-400" />
            }
            <span className="text-sm text-gray-500">
              {isUploading ? "Uploading…" : fileInfo ? `📄 ${fileInfo.filename}` : "Upload CSV or Excel"}
            </span>
            {fileInfo && (
              <span className="text-xs text-gray-400">
                {fileInfo.row_count} rows • {fileInfo.columns.length} cols
              </span>
            )}
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".csv,.xlsx,.xls"
            className="hidden"
          />
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-auto p-4 space-y-3">
          {messages.map((m, i) => (
            <div key={i} className={m.role === "user" ? "text-right" : ""}>
              <div
                className={`inline-block px-3 py-2 rounded-xl text-sm max-w-[85%] ${
                  m.role === "user"
                    ? "bg-blue-600 text-white"
                    : m.role === "system"
                    ? "bg-gray-100 text-gray-500 text-xs"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}
          {isProcessing && (
            <div className="flex gap-2 items-center text-sm text-gray-400">
              <Loader2 className="animate-spin" size={14} />
              Analyzing your data…
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleQuery} className="p-4 border-t flex gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={fileId ? "Ask about your data…" : "Upload a file first"}
            disabled={!fileId || isProcessing}
            className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-50 disabled:text-gray-400"
          />
          <button
            type="submit"
            disabled={!fileId || isProcessing || !query.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 text-white px-4 rounded-lg transition-colors"
          >
            <Send size={15} />
          </button>
        </form>
      </aside>

      {/* MAIN PANEL */}
      <main className="flex-1 overflow-auto p-8">

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">
            ❌ {error}
          </div>
        )}

        {/* Empty state */}
        {!dashboard && !tableData && (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
            <div className="text-5xl mb-4">📊</div>
            <p className="text-lg font-medium text-gray-500">Upload a dataset and ask a question</p>
            <p className="text-sm mt-1">e.g. "Show total revenue by region"</p>
          </div>
        )}

        {/* Dashboard */}
        {dashboard && (
          <div className="space-y-8 mb-10">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{dashboard.title}</h2>
              <p className="text-gray-500 mt-1">{dashboard.summary}</p>
            </div>

            {/* Charts */}
            <div className="grid md:grid-cols-2 gap-6">
              {dashboard.charts?.map(renderChart)}
            </div>

            {/* Insights */}
            {dashboard.insights?.length > 0 && (
              <div className="grid md:grid-cols-3 gap-4">
                {dashboard.insights.map((insight, i) => (
                  <div key={i} className="bg-white border rounded-xl p-5 shadow-sm">
                    <TrendingUp className="text-blue-500 mb-2" size={18} />
                    <p className="text-sm text-gray-700">{insight}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SQL + Raw Table */}
        {sqlCode && (
          <div className="space-y-4">
            <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto">
              <p className="text-xs text-gray-400 mb-2 font-mono uppercase tracking-widest">Generated SQL</p>
              <pre className="text-green-400 text-sm font-mono whitespace-pre-wrap">{sqlCode}</pre>
            </div>

            {tableData?.rows?.length > 0 && (
              <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
                <p className="text-xs text-gray-400 px-4 py-2 border-b font-mono uppercase tracking-widest">
                  Results — {tableData.rows.length} rows
                </p>
                <div className="overflow-x-auto max-h-72">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        {tableData.columns.map((col) => (
                          <th key={col} className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {tableData.rows.slice(0, 100).map((row, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          {tableData.columns.map((col) => (
                            <td key={col} className="px-4 py-2 text-gray-700 whitespace-nowrap">
                              {row[col] ?? "—"}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}