import React, { useState, useEffect, useRef } from "react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from "recharts";
import {
  Send, Database, LayoutDashboard, MessageSquare,
  Upload, Loader2, AlertCircle, TrendingUp, Info, ChevronRight, Download,
  Zap, BarChart2, ArrowRight, Github, Twitter, Linkedin, Sun, Moon,
  Maximize2, X, Menu, PanelLeftClose
} from "lucide-react";

// ── Config ─────────────────────────────────────────────────────────────────────
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

// ── Theme tokens ───────────────────────────────────────────────────────────────
const T = {
  light: {
    bg: "#fafafa", bg2: "#ffffff", bg3: "#f5f5ff", bg4: "#f0f0f8",
    border: "#e8e8f0", border2: "#c7d2fe",
    text: "#0d0b1a", text2: "#555", text3: "#999", text4: "#bbb",
    navBg: "rgba(250,250,250,0.92)",
    heroBg: "linear-gradient(160deg,#fafafa 55%,#f0f0ff 100%)",
    sectionBg: "#ffffff", sectionBg2: "#fafafa",
    footerBg: "#0d0b1a", footerText: "#555", footerLink: "#666",
    cardBg: "#ffffff", cardHoverShadow: "0 20px 60px rgba(99,102,241,0.1)",
    inputBg: "#f7f7fb", inputBorder: "#e8e8f0",
    msgUser: "#0d0b1a", msgAi: "#ffffff", msgAiText: "#333",
    msgSys: "#f0f0ff", msgSysText: "#6366f1", msgSysBorder: "#e0e7ff",
    emptyIcon: "#ffffff", sidebarBg: "#ffffff",
    toggleBg: "#f0f0f8", toggleColor: "#555",
    errorBg: "#fff1f2", errorBorder: "#fecdd3", errorText: "#e11d48", errorBody: "#be123c",
    chartGrid: "#f1f1f8", chartTick: "#bbb", chartCard: "#ffffff", chartCardBorder: "#e8e8f0",
    infoIconBg: "#f5f5ff",
    exportBtn: "#ffffff", exportBtnBorder: "#e8e8f0", exportBtnText: "#555",
    insightBg: "#ffffff", insightIcon: "#f5f5ff",
    suggBg: "#f5f5ff", suggText: "#555",
  },
  dark: {
    bg: "#0d0b1a", bg2: "#12102a", bg3: "#1a1740", bg4: "#1e1b3a",
    border: "#2a2750", border2: "#4f46e5",
    text: "#f0efff", text2: "#b0aed0", text3: "#6b69a0", text4: "#4a4870",
    navBg: "rgba(13,11,26,0.92)",
    heroBg: "linear-gradient(160deg,#0d0b1a 55%,#1a1740 100%)",
    sectionBg: "#12102a", sectionBg2: "#0d0b1a",
    footerBg: "#080714", footerText: "#3a3860", footerLink: "#4a4870",
    cardBg: "#1a1740", cardHoverShadow: "0 20px 60px rgba(99,102,241,0.2)",
    inputBg: "#1a1740", inputBorder: "#2a2750",
    msgUser: "#6366f1", msgAi: "#1a1740", msgAiText: "#d0cef5",
    msgSys: "#1e1b3a", msgSysText: "#818cf8", msgSysBorder: "#2a2750",
    emptyIcon: "#1a1740", sidebarBg: "#12102a",
    toggleBg: "#1a1740", toggleColor: "#b0aed0",
    errorBg: "#2d0a14", errorBorder: "#7f1d1d", errorText: "#f87171", errorBody: "#fca5a5",
    chartGrid: "#1e1b3a", chartTick: "#4a4870", chartCard: "#1a1740", chartCardBorder: "#2a2750",
    infoIconBg: "#1e1b3a",
    exportBtn: "#1a1740", exportBtnBorder: "#2a2750", exportBtnText: "#b0aed0",
    insightBg: "#1a1740", insightIcon: "#1e1b3a",
    suggBg: "#1e1b3a", suggText: "#9090c0",
  }
};

// ── Animated background canvas ─────────────────────────────────────────────────
function AnimatedBg({ dark }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let w, h, orbs, raf;
    const resize = () => {
      w = canvas.width = canvas.offsetWidth;
      h = canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);
    orbs = Array.from({ length: 5 }, (_, i) => ({
      x: Math.random() * w, y: Math.random() * h,
      r: 180 + Math.random() * 160,
      dx: (Math.random() - 0.5) * 0.4,
      dy: (Math.random() - 0.5) * 0.4,
      hue: [250, 270, 160, 30, 320][i],
    }));
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      orbs.forEach(o => {
        o.x += o.dx; o.y += o.dy;
        if (o.x < -o.r) o.x = w + o.r;
        if (o.x > w + o.r) o.x = -o.r;
        if (o.y < -o.r) o.y = h + o.r;
        if (o.y > h + o.r) o.y = -o.r;
        const g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r);
        const a = dark ? 0.13 : 0.07;
        g.addColorStop(0, `hsla(${o.hue},70%,60%,${a})`);
        g.addColorStop(1, `hsla(${o.hue},70%,60%,0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { window.removeEventListener("resize", resize); cancelAnimationFrame(raf); };
  }, [dark]);
  return (
    <canvas ref={canvasRef} style={{
      position: "fixed", inset: 0, width: "100%", height: "100%",
      pointerEvents: "none", zIndex: 0
    }} />
  );
}

// ── Theme toggle ───────────────────────────────────────────────────────────────
function ThemeToggle({ dark, onToggle }) {
  return (
    <button
      onClick={onToggle}
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
      style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        width: 38, height: 38, borderRadius: 10,
        background: dark ? "#1a1740" : "#f0f0f8",
        border: `1.5px solid ${dark ? "#2a2750" : "#e8e8f0"}`,
        cursor: "pointer", transition: "all 0.2s", flexShrink: 0,
        color: dark ? "#b0aed0" : "#555",
      }}
    >
      {dark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SPLASH SCREEN
// ─────────────────────────────────────────────────────────────────────────────
function SplashScreen({ onDone }) {
  const [visible, setVisible] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  useEffect(() => {
    setTimeout(() => setVisible(true), 80);
    const t1 = setTimeout(() => setFadeOut(true), 2000);
    const t2 = setTimeout(() => onDone(), 2600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "linear-gradient(135deg,#0f0c29 0%,#1a1040 50%,#0f0c29 100%)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      transition: "opacity 0.6s ease", opacity: fadeOut ? 0 : 1,
      pointerEvents: fadeOut ? "none" : "all", fontFamily: "'Syne', sans-serif",
    }}>
      <style>{`
        @keyframes sp-ping { 0%{transform:scale(0.8);opacity:1} 100%{transform:scale(1.4);opacity:0} }
        @keyframes sp-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes sp-load { from{width:0%} to{width:100%} }
      `}</style>
      <div style={{ position:"absolute", width:480, height:480, borderRadius:"50%", border:"1px solid rgba(99,102,241,0.15)", animation:"sp-ping 3s ease-out infinite" }} />
      <div style={{ position:"absolute", width:320, height:320, borderRadius:"50%", border:"1px solid rgba(99,102,241,0.25)", animation:"sp-ping 3s ease-out infinite 0.5s" }} />
      <div style={{ opacity: visible?1:0, transform: visible?"translateY(0)":"translateY(28px)", transition:"all 0.9s cubic-bezier(0.16,1,0.3,1)", display:"flex", flexDirection:"column", alignItems:"center", gap:22 }}>
        <div style={{ width:88, height:88, background:"linear-gradient(135deg,#6366f1,#8b5cf6)", borderRadius:26, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 0 56px rgba(99,102,241,0.5)", animation:"sp-float 3s ease-in-out infinite" }}>
          <BarChart2 size={44} color="white" />
        </div>
        <div style={{ textAlign:"center" }}>
          <div style={{ fontSize:50, fontWeight:800, color:"#fff", fontFamily:"'Playfair Display',Georgia,serif", lineHeight:1, marginBottom:10 }}>
            Instant<span style={{ color:"#818cf8" }}>BI</span>
          </div>
          <div style={{ fontSize:12, color:"rgba(255,255,255,0.38)", fontFamily:"'DM Sans',sans-serif", fontWeight:300, letterSpacing:4, textTransform:"uppercase" }}>
            AI — Powered Analytics
          </div>
        </div>
        <div style={{ width:160, height:2, background:"rgba(255,255,255,0.08)", borderRadius:99, overflow:"hidden", marginTop:6 }}>
          <div style={{ height:"100%", background:"linear-gradient(90deg,#6366f1,#a78bfa)", borderRadius:99, animation:"sp-load 1.9s ease forwards" }} />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LANDING PAGE
// ─────────────────────────────────────────────────────────────────────────────
function LandingPage({ onUseTool, dark, onToggleDark }) {
  const [scrolled, setScrolled] = useState(false);
  const t = dark ? T.dark : T.light;

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: t.bg, fontFamily: "'Syne', sans-serif", color: t.text, overflowX: "hidden", position: "relative", transition: "background 0.4s, color 0.4s" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,800;0,900;1,700&family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .land-navlink { font-size: 14px; font-weight: 600; color: ${t.text2}; text-decoration: none; cursor: pointer; transition: color 0.2s; background: none; border: none; font-family: inherit; }
        .land-navlink:hover { color: #6366f1; }
        .land-cta { background: linear-gradient(135deg,#6366f1,#8b5cf6); color: white; border: none; padding: 13px 28px; border-radius: 13px; font-size: 14px; font-weight: 700; font-family: inherit; cursor: pointer; transition: all 0.3s; box-shadow: 0 8px 28px rgba(99,102,241,0.35); display: inline-flex; align-items: center; gap: 8px; }
        .land-cta:hover { transform: translateY(-2px); box-shadow: 0 14px 40px rgba(99,102,241,0.45); }
        .land-ghost { background: transparent; color: ${t.text2}; border: 1.5px solid ${t.border}; padding: 13px 28px; border-radius: 13px; font-size: 14px; font-weight: 600; font-family: inherit; cursor: pointer; transition: all 0.3s; }
        .land-ghost:hover { border-color: #6366f1; color: #6366f1; background: ${t.bg3}; }
        .land-card { background: ${t.cardBg}; border: 1px solid ${t.border}; border-radius: 22px; padding: 30px; transition: all 0.3s; }
        .land-card:hover { transform: translateY(-5px); box-shadow: ${t.cardHoverShadow}; border-color: ${t.border2}; }
        @keyframes l-spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes l-orbit { from{transform:rotate(0deg) translateX(110px) rotate(0deg)} to{transform:rotate(360deg) translateX(110px) rotate(-360deg)} }
        @keyframes l-float { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-14px) scale(1.02)} }
        .l-logo { animation: l-float 4s ease-in-out infinite; }
        .l-ring { animation: l-spin 22s linear infinite; }
        .l-dot1 { position:absolute; width:12px; height:12px; border-radius:50%; background:#6366f1; top:50%; left:50%; margin:-6px; animation:l-orbit 4s linear infinite; }
        .l-dot2 { position:absolute; width:9px; height:9px; border-radius:50%; background:#10b981; top:50%; left:50%; margin:-4.5px; animation:l-orbit 4s linear infinite; animation-delay:-2s; }
        footer a { color:${t.footerLink}; text-decoration:none; font-size:13px; font-family:'DM Sans',sans-serif; transition:color 0.2s; }
        footer a:hover { color:#6366f1; }
      `}</style>

      <AnimatedBg dark={dark} />

      {/* NAVBAR */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        padding: "0 56px", height: 66,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: scrolled ? t.navBg : "transparent",
        backdropFilter: scrolled ? "blur(18px)" : "none",
        borderBottom: scrolled ? `1px solid ${t.border}` : "none",
        transition: "all 0.3s"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <BarChart2 size={18} color="white" />
          </div>
          <span style={{ fontWeight: 800, fontSize: 19, letterSpacing: "-0.5px" }}>Instant<span style={{ color: "#6366f1" }}>BI</span></span>
        </div>
        <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
          <button className="land-navlink" onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}>Features</button>
          <button className="land-navlink" onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}>How it works</button>
          <button className="land-navlink">Docs</button>
          <ThemeToggle dark={dark} onToggle={onToggleDark} />
          <button className="land-cta" style={{ padding: "9px 20px", fontSize: 13 }} onClick={onUseTool}>Use Tool</button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ paddingTop: 148, paddingBottom: 100, padding: "148px 56px 100px", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: t.bg3, border: `1px solid ${t.border2}`, borderRadius: 99, padding: "5px 14px 5px 7px", marginBottom: 24 }}>
              <div style={{ width: 20, height: 20, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Zap size={10} color="white" />
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#6366f1" }}>Powered by FastAPI + AI</span>
            </div>
            <h1 style={{ fontSize: 58, fontWeight: 900, fontFamily: "'Playfair Display', Georgia, serif", lineHeight: 1.04, marginBottom: 22, color: t.text }}>
              Turn Data Into<br /><span style={{ color: "#6366f1" }}>Instant Insights</span>
            </h1>
            <p style={{ fontSize: 17, color: t.text2, lineHeight: 1.75, marginBottom: 36, maxWidth: 460, fontFamily: "'DM Sans', sans-serif", fontWeight: 300 }}>
              Upload any CSV or Excel file, ask a question in plain English, and instantly get a beautiful interactive dashboard — powered by your own backend.
            </p>
            <div style={{ display: "flex", gap: 13, flexWrap: "wrap" }}>
              <button className="land-cta" onClick={onUseTool}>
                Try It Now <ArrowRight size={15} />
              </button>
              <button className="land-ghost" onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}>
                See How It Works
              </button>
            </div>
          </div>

          {/* Hero Visual */}
          <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", height: 380 }}>
            <div style={{ position: "absolute", width: 260, height: 260, borderRadius: "50%", border: `1px solid ${t.border}`, opacity: 0.5 }} className="l-ring" />
            <div className="l-dot1" />
            <div className="l-dot2" />
            <div className="l-logo" style={{ width: 110, height: 110, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", borderRadius: 30, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 20px 60px rgba(99,102,241,0.4)", position: "relative", zIndex: 2 }}>
              <BarChart2 size={54} color="white" />
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{ padding: "80px 56px", background: t.sectionBg, position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#6366f1", letterSpacing: 3, textTransform: "uppercase", marginBottom: 12, fontFamily: "'DM Sans', sans-serif" }}>Features</p>
            <h2 style={{ fontSize: 38, fontWeight: 800, fontFamily: "'Playfair Display', Georgia, serif", color: t.text }}>Everything You Need</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 22 }}>
            {[
              { icon: <Upload size={22} color="#6366f1" />, title: "CSV & Excel Upload", desc: "Drag and drop any spreadsheet. Our backend auto-detects schema and prepares it for querying instantly." },
              { icon: <MessageSquare size={22} color="#10b981" />, title: "Natural Language Queries", desc: "Ask questions like 'Show revenue by region' and get SQL-powered results with AI-generated dashboards." },
              { icon: <LayoutDashboard size={22} color="#f59e0b" />, title: "Auto Dashboards", desc: "Bar, line, area, and pie charts are rendered automatically from backend chart specifications." },
              { icon: <Database size={22} color="#8b5cf6" />, title: "Generated SQL", desc: "See the exact SQL query your question was translated into. Full transparency into data operations." },
              { icon: <TrendingUp size={22} color="#ec4899" />, title: "AI Insights", desc: "Key business insights are extracted and highlighted alongside every chart for faster decision-making." },
              { icon: <Download size={22} color="#ef4444" />, title: "Export Results", desc: "Download your query results as a CSV with one click, ready for further analysis or reporting." },
            ].map((f, i) => (
              <div key={i} className="land-card">
                <div style={{ width: 46, height: 46, background: t.bg3, borderRadius: 13, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>{f.icon}</div>
                <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 9, color: t.text }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: t.text2, lineHeight: 1.7, fontFamily: "'DM Sans', sans-serif", fontWeight: 300 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" style={{ padding: "80px 56px", background: t.sectionBg2, position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#6366f1", letterSpacing: 3, textTransform: "uppercase", marginBottom: 12, fontFamily: "'DM Sans', sans-serif" }}>How It Works</p>
            <h2 style={{ fontSize: 38, fontWeight: 800, fontFamily: "'Playfair Display', Georgia, serif", color: t.text }}>Three Simple Steps</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {[
              { n: "01", title: "Upload Your Dataset", desc: "Click the upload area and select a CSV or Excel file. It's sent to the FastAPI backend via POST /upload." },
              { n: "02", title: "Ask Your Question", desc: "Type any business question in natural language. It's sent to POST /query with your file ID." },
              { n: "03", title: "Explore Your Dashboard", desc: "Your results arrive as SQL, a data table, and a fully rendered dashboard with charts and insights." },
            ].map((s, i) => (
              <div key={i} style={{ display: "flex", gap: 24, alignItems: "flex-start", background: t.cardBg, border: `1px solid ${t.border}`, borderRadius: 20, padding: "24px 28px", transition: "all 0.3s" }}>
                <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 44, fontWeight: 900, color: "#6366f1", opacity: 0.2, lineHeight: 1, flexShrink: 0, width: 56 }}>{s.n}</div>
                <div>
                  <h3 style={{ fontWeight: 700, fontSize: 17, marginBottom: 7, color: t.text }}>{s.title}</h3>
                  <p style={{ fontSize: 14, color: t.text2, lineHeight: 1.65, fontFamily: "'DM Sans', sans-serif", fontWeight: 300 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BAND */}
      <section style={{ padding: "72px 56px", background: "linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%)", position: "relative", zIndex: 1, textAlign: "center" }}>
        <h2 style={{ fontSize: 40, fontWeight: 800, color: "white", fontFamily: "'Playfair Display', Georgia, serif", marginBottom: 16 }}>Ready to explore your data?</h2>
        <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 16, marginBottom: 32, fontFamily: "'DM Sans', sans-serif", fontWeight: 300 }}>No setup required. Just upload a file and start asking questions.</p>
        <button className="land-cta" style={{ background: "white", color: "#6366f1", boxShadow: "0 10px 36px rgba(0,0,0,0.2)" }} onClick={onUseTool}>
          Launch Instant BI <ArrowRight size={15} />
        </button>
      </section>

      {/* FOOTER */}
      <footer style={{ background: t.footerBg, padding: "40px 56px", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div style={{ width: 28, height: 28, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center" }}><BarChart2 size={14} color="white" /></div>
            <span style={{ fontWeight: 800, fontSize: 15, color: "#f0efff", letterSpacing: "-0.3px" }}>Instant<span style={{ color: "#818cf8" }}>BI</span></span>
          </div>
          <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Contact</a>
          </div>
          <div style={{ display: "flex", gap: 14 }}>
            {[<Github size={16} />, <Twitter size={16} />, <Linkedin size={16} />].map((icon, i) => (
              <a key={i} href="#" style={{ width: 34, height: 34, borderRadius: 9, border: `1px solid ${t.footerText}`, display: "flex", alignItems: "center", justifyContent: "center", color: t.footerLink, transition: "all 0.2s" }}>{icon}</a>
            ))}
          </div>
        </div>
        <div style={{ textAlign: "center", marginTop: 28, fontSize: 12, color: t.footerText, fontFamily: "'DM Sans', sans-serif" }}>
          © {new Date().getFullYear()} InstantBI · Built with React + FastAPI
        </div>
      </footer>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TOOL PAGE  — OLD_APP UI + NEW_APP FastAPI backend logic
// Features: Mobile responsive, follow-up queries, fullscreen chart mode
// ─────────────────────────────────────────────────────────────────────────────
function ToolPage({ onBack, dark, onToggleDark }) {
  // ── State ──────────────────────────────────────────────────────────────────
  const [fileId, setFileId]             = useState(null);
  const [fileInfo, setFileInfo]         = useState(null);
  const [query, setQuery]               = useState("");
  const [isUploading, setIsUploading]   = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dashboard, setDashboard]       = useState(null);
  const [sqlCode, setSqlCode]           = useState(null);
  const [tableData, setTableData]       = useState(null);
  const [messages, setMessages]         = useState([]);
  const [error, setError]               = useState(null);
  // follow-up: keep full conversation history for context
  const [queryHistory, setQueryHistory] = useState([]);
  // fullscreen chart
  const [fullscreenChart, setFullscreenChart] = useState(null); // { chart, index }
  // mobile: sidebar open/close
  const [sidebarOpen, setSidebarOpen]   = useState(false);
  // responsive breakpoint
  const [isMobile, setIsMobile]         = useState(window.innerWidth < 768);

  const fileInputRef = useRef(null);
  const chatEndRef   = useRef(null);
  const t = dark ? T.dark : T.light;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  // Close sidebar on mobile when clicking main area
  useEffect(() => {
    if (!isMobile) setSidebarOpen(false);
  }, [isMobile]);

  // Escape key closes fullscreen
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") setFullscreenChart(null); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // ── Upload via POST /upload ────────────────────────────────────────────────
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    setError(null);
    setDashboard(null);
    setSqlCode(null);
    setTableData(null);
    setQueryHistory([]);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(`${API_BASE}/upload`, { method: "POST", body: form });
      if (!res.ok) { const err = await res.json(); throw new Error(err.detail || "Upload failed"); }
      const data = await res.json();
      setFileId(data.file_id);
      setFileInfo({ filename: data.filename, row_count: data.row_count, columns: data.columns });
      setMessages([{ role: "system", content: `Dataset loaded: ${data.row_count} rows • ${data.columns.length} columns${data.cached ? " (cached)" : ""}` }]);
      if (isMobile) setSidebarOpen(false);
    } catch (err) { setError(err.message); }
    setIsUploading(false);
  };

  // ── Query via POST /query (with follow-up conversation context) ────────────
  const handleQuery = async (e) => {
    e.preventDefault();
    if (!query.trim() || !fileId) return;

    const userQuery = query;
    setQuery("");
    setError(null);
    setMessages(prev => [...prev, { role: "user", content: userQuery }]);
    setIsProcessing(true);
    if (isMobile) setSidebarOpen(false);

    // Build follow-up context: send prior Q&A so backend can refine
    const contextNote = queryHistory.length > 0
      ? `\n\nPrevious queries for context:\n${queryHistory.map((h, i) => `${i + 1}. Q: ${h.question} → Summary: ${h.summary}`).join("\n")}`
      : "";

    try {
      const res = await fetch(`${API_BASE}/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          file_id: fileId,
          question: userQuery + contextNote,
        }),
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.detail || "Query failed"); }
      const data = await res.json();
      setSqlCode(data.sql);
      setTableData({ columns: data.columns, rows: data.results });
      if (data.dashboard) {
        setDashboard(data.dashboard);
        setMessages(prev => [...prev, { role: "assistant", content: data.dashboard.summary }]);
        setQueryHistory(prev => [...prev, { question: userQuery, summary: data.dashboard.summary }]);
      } else {
        setMessages(prev => [...prev, { role: "assistant", content: `Returned ${data.row_count} rows.` }]);
        setQueryHistory(prev => [...prev, { question: userQuery, summary: `${data.row_count} rows returned` }]);
      }
    } catch (err) { setError(err.message); }
    setIsProcessing(false);
  };

  // ── Chart renderer ─────────────────────────────────────────────────────────
  const renderChart = (chart, index, isFullscreen = false) => {
    if (!tableData?.rows?.length) return null;
    const isPie = chart.type === "pie";
    const ChartComponent = { bar: BarChart, line: LineChart, pie: PieChart, area: AreaChart }[chart.type] || BarChart;
    const chartData = tableData.rows;
    const chartHeight = isFullscreen ? Math.min(window.innerHeight - 200, 520) : 240;

    return (
      <div
        key={index}
        style={{ background: t.chartCard, borderRadius: isFullscreen ? 0 : 18, padding: isFullscreen ? 0 : 24, border: isFullscreen ? "none" : `1px solid ${t.chartCardBorder}`, boxShadow: isFullscreen ? "none" : "0 4px 20px rgba(0,0,0,0.06)", transition: "background 0.4s, border-color 0.4s", height: isFullscreen ? "100%" : "auto" }}
      >
        {!isFullscreen && (
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 18 }}>
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: t.text, letterSpacing: "-0.2px", marginBottom: 3, fontFamily: "'Syne', sans-serif" }}>{chart.title}</h3>
              <p style={{ fontSize: 10, color: t.text4, fontWeight: 600, textTransform: "uppercase", letterSpacing: 1, fontFamily: "'DM Sans', sans-serif" }}>{chart.description || "Visualization"}</p>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button
                onClick={() => setFullscreenChart({ chart, index })}
                title="Fullscreen"
                style={{ background: t.infoIconBg, border: "none", padding: "5px 7px", borderRadius: 7, cursor: "pointer", display: "flex", alignItems: "center" }}
              >
                <Maximize2 size={12} color="#6366f1" />
              </button>
              <div style={{ background: t.infoIconBg, padding: "5px 7px", borderRadius: 7 }}>
                <Info size={12} color="#6366f1" />
              </div>
            </div>
          </div>
        )}
        <ResponsiveContainer width="100%" height={chartHeight}>
          <ChartComponent data={chartData} margin={{ top: 8, right: 24, left: 0, bottom: 16 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={t.chartGrid} />
            {!isPie && (
              <>
                <XAxis dataKey={chart.xAxisKey} fontSize={10} tickLine={false} axisLine={false} tick={{ fill: t.chartTick }} dy={8} interval={0} angle={chartData.length > 8 ? -35 : 0} textAnchor={chartData.length > 8 ? "end" : "middle"} height={chartData.length > 8 ? 50 : 30} />
                <YAxis fontSize={10} tickLine={false} axisLine={false} tick={{ fill: t.chartTick }} dx={-8} />
              </>
            )}
            <Tooltip cursor={{ fill: dark ? "rgba(99,102,241,0.06)" : "#f8f8ff" }} contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 8px 32px rgba(0,0,0,0.15)", padding: 12, background: t.bg2, color: t.text }} />
            <Legend verticalAlign="top" align="right" iconType="circle" />
            {chart.type === "pie"  && <Pie data={chartData} dataKey={chart.yAxisKey} nameKey={chart.xAxisKey} outerRadius={isFullscreen ? 160 : 95} innerRadius={isFullscreen ? 80 : 55} paddingAngle={4} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>{chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie>}
            {chart.type === "area" && <Area type="monotone" dataKey={chart.yAxisKey} stroke={COLORS[0]} strokeWidth={2.5} fill={COLORS[0]} fillOpacity={0.15} />}
            {chart.type === "line" && <Line type="monotone" dataKey={chart.yAxisKey} stroke={COLORS[1]} strokeWidth={2.5} dot={{ r: 3.5, fill: COLORS[1], strokeWidth: 2, stroke: t.bg2 }} activeDot={{ r: 5 }} />}
            {chart.type === "bar"  && <Bar dataKey={chart.yAxisKey} radius={[5, 5, 0, 0]} barSize={chartData.length > 10 ? 16 : 28}>{chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Bar>}
          </ChartComponent>
        </ResponsiveContainer>
      </div>
    );
  };

  // ── Follow-up suggestion chips ─────────────────────────────────────────────
  const followUpSuggestions = queryHistory.length > 0 ? [
    "Filter by top 5 only",
    "Show as percentage",
    "Compare with previous period",
    "Break down by category",
  ] : ["Show sales trends", "Top products by revenue", "Distribution of customers"];

  // ── Sidebar content (shared between mobile overlay and desktop) ────────────
  const sidebarContent = (
    <>
      {/* Header */}
      <div style={{ padding: "20px 20px 16px", borderBottom: `1px solid ${t.border}` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <button
            style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: t.text3, fontFamily: "inherit", fontWeight: 600, transition: "color 0.2s", padding: 0 }}
            onClick={onBack}
            onMouseEnter={e => e.currentTarget.style.color = "#6366f1"}
            onMouseLeave={e => e.currentTarget.style.color = t.text3}
          >
            <ChevronRight size={12} style={{ transform: "rotate(180deg)" }} /> Back to Home
          </button>
          <div style={{ display: "flex", gap: 8 }}>
            <ThemeToggle dark={dark} onToggle={onToggleDark} />
            {isMobile && (
              <button onClick={() => setSidebarOpen(false)} style={{ background: t.bg4, border: `1px solid ${t.border}`, borderRadius: 9, padding: "5px 7px", cursor: "pointer", display: "flex", alignItems: "center" }}>
                <X size={15} color={t.text3} />
              </button>
            )}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <div style={{ width: 34, height: 34, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center" }}><BarChart2 size={17} color="white" /></div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 15, letterSpacing: "-0.4px", color: t.text }}>Instant<span style={{ color: "#6366f1" }}>BI</span></div>
            <div style={{ fontSize: 9, color: t.text4, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif" }}>AI Analytics Engine</div>
          </div>
        </div>

        {/* Upload zone */}
        <div
          onClick={() => fileInputRef.current.click()}
          style={{ cursor: "pointer", border: `2px dashed ${fileInfo ? t.border2 : t.border}`, borderRadius: 16, padding: "20px 14px", display: "flex", flexDirection: "column", alignItems: "center", gap: 9, background: fileInfo ? t.bg3 : t.bg4, transition: "all 0.3s" }}
          onMouseEnter={e => !fileInfo && (e.currentTarget.style.borderColor = "#a5b4fc")}
          onMouseLeave={e => !fileInfo && (e.currentTarget.style.borderColor = t.border)}
        >
          <div style={{ width: 40, height: 40, borderRadius: 11, background: fileInfo ? (dark ? "#1e1b3a" : "#ede9fe") : t.bg4, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {isUploading ? <Loader2 size={17} color="#6366f1" style={{ animation: "t-spin 1s linear infinite" }} /> : <Upload size={17} color={fileInfo ? "#6366f1" : t.text4} />}
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: t.text, marginBottom: 3 }}>{isUploading ? "Uploading…" : fileInfo ? "Dataset Ready ✓" : "Import CSV or Excel"}</div>
            <div style={{ fontSize: 11, color: t.text4, fontFamily: "'DM Sans', sans-serif" }}>{fileInfo ? `${fileInfo.row_count} records · ${fileInfo.columns.length} columns` : "Click or drag and drop your file"}</div>
          </div>
        </div>
        <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".csv,.xlsx,.xls" style={{ display: "none" }} />
      </div>

      {/* Chat */}
      <div className="ts" style={{ flex: 1, overflowY: "auto", padding: "14px 16px" }}>
        {messages.length === 0 && !isProcessing && (
          <div style={{ paddingTop: 16, textAlign: "center" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: t.text4, letterSpacing: 2, textTransform: "uppercase", marginBottom: 12 }}>Quick Suggestions</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {followUpSuggestions.map((s, i) => (
                <button key={i} className="t-sugg" onClick={() => setQuery(s)}>{s}</button>
              ))}
            </div>
          </div>
        )}

        {/* Follow-up context indicator */}
        {queryHistory.length > 0 && messages.length > 0 && (
          <div style={{ margin: "8px 0 12px", padding: "7px 12px", background: t.bg3, borderRadius: 10, border: `1px solid ${t.border2}`, display: "flex", alignItems: "center", gap: 7 }}>
            <MessageSquare size={11} color="#6366f1" />
            <span style={{ fontSize: 10, color: "#6366f1", fontWeight: 700, fontFamily: "'DM Sans', sans-serif" }}>
              Follow-up mode — {queryHistory.length} query{queryHistory.length > 1 ? " history" : " in context"}
            </span>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: msg.role === "user" ? "flex-end" : "flex-start", marginBottom: 12 }}>
            <div style={{
              maxWidth: "88%", padding: "10px 14px", fontSize: 13, lineHeight: 1.6, fontFamily: "'DM Sans', sans-serif",
              borderRadius: msg.role === "user" ? "14px 14px 4px 14px" : msg.role === "system" ? "12px" : "14px 14px 14px 4px",
              background: msg.role === "user" ? t.msgUser : msg.role === "system" ? t.msgSys : t.msgAi,
              color: msg.role === "user" ? "white" : msg.role === "system" ? t.msgSysText : t.msgAiText,
              border: msg.role === "system" ? `1px solid ${t.msgSysBorder}` : msg.role === "assistant" ? `1px solid ${t.border}` : "none",
            }}>{msg.content}</div>
            <span style={{ fontSize: 9, color: t.text4, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginTop: 3 }}>{msg.role}</span>
          </div>
        ))}

        {/* Follow-up suggestion chips after assistant responds */}
        {queryHistory.length > 0 && !isProcessing && (
          <div style={{ marginTop: 8, marginBottom: 4 }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: t.text4, letterSpacing: 2, textTransform: "uppercase", marginBottom: 7 }}>Refine your query</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {followUpSuggestions.map((s, i) => (
                <button key={i} className="t-sugg" onClick={() => setQuery(s)}>{s}</button>
              ))}
            </div>
          </div>
        )}

        {isProcessing && (
          <div style={{ display: "flex", marginBottom: 12 }}>
            <div style={{ background: t.bg2, border: `1px solid ${t.border}`, borderRadius: 14, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
              <Loader2 size={13} color="#6366f1" style={{ animation: "t-spin 1s linear infinite" }} />
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: t.text2, textTransform: "uppercase", letterSpacing: 0.5, fontFamily: "'DM Sans', sans-serif" }}>Analyzing…</div>
                <div style={{ fontSize: 9, color: t.text4, fontFamily: "monospace" }}>FastAPI Backend</div>
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div style={{ padding: "12px 16px 16px", borderTop: `1px solid ${t.border}`, background: t.sidebarBg, transition: "background 0.4s" }}>
        <form onSubmit={handleQuery} style={{ display: "flex", gap: 9, alignItems: "center" }}>
          <input
            value={query} onChange={e => setQuery(e.target.value)}
            placeholder={fileId ? (queryHistory.length > 0 ? "Ask a follow-up question…" : "Ask about your data…") : "Upload a file first"}
            disabled={!fileId || isProcessing}
            style={{ flex: 1, background: t.inputBg, border: `1.5px solid ${t.inputBorder}`, borderRadius: 12, padding: "10px 14px", fontSize: 13, fontFamily: "'DM Sans', sans-serif", outline: "none", transition: "border-color 0.2s, background 0.4s", color: t.text, opacity: (!fileId || isProcessing) ? 0.5 : 1 }}
            onFocus={e => e.target.style.borderColor = "#a5b4fc"}
            onBlur={e => e.target.style.borderColor = t.inputBorder}
          />
          <button type="submit" className="t-send" disabled={!query.trim() || isProcessing || !fileId}>
            <Send size={14} color="white" />
          </button>
        </form>
        <p style={{ textAlign: "center", fontSize: 10, color: t.text4, marginTop: 9, fontFamily: "'DM Sans', sans-serif" }}>
          FastAPI · AI Analytics Engine
        </p>
      </div>
    </>
  );

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Syne', sans-serif", background: t.bg, overflow: "hidden", position: "relative", transition: "background 0.4s" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,800;0,900;1,700&family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .ts::-webkit-scrollbar { display: none; } .ts { -ms-overflow-style:none; scrollbar-width:none; }
        .t-send { background:linear-gradient(135deg,#6366f1,#8b5cf6); border:none; border-radius:11px; padding:9px 11px; cursor:pointer; transition:all 0.2s; flex-shrink:0; }
        .t-send:hover { transform:scale(1.06); } .t-send:disabled { background:${t.border}; cursor:not-allowed; transform:none; }
        .t-sugg { width:100%; text-align:left; background:${t.suggBg}; border:1px solid transparent; border-radius:11px; padding:9px 13px; font-size:13px; color:${t.suggText}; cursor:pointer; transition:all 0.2s; font-family:inherit; }
        .t-sugg:hover { background:${t.bg2}; border-color:${t.border2}; color:#6366f1; }
        .t-back { background:none; border:none; cursor:pointer; display:flex; align-items:center; gap:5px; font-size:12px; color:${t.text3}; font-family:inherit; font-weight:600; transition:color 0.2s; padding:0; }
        .t-back:hover { color:#6366f1; }
        @keyframes t-spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes t-pulse { 0%,100%{opacity:0.08} 50%{opacity:0.18} }
        .mob-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.5); z-index:10; backdrop-filter:blur(4px); }
        .mob-sidebar { position:fixed; left:0; top:0; bottom:0; width:320px; z-index:11; display:flex; flex-direction:column; transform:translateX(0); transition:transform 0.3s cubic-bezier(0.16,1,0.3,1); }
        .mob-sidebar-hidden { transform:translateX(-100%); }
      `}</style>

      <AnimatedBg dark={dark} />

      {/* ── MOBILE: top bar ── */}
      {isMobile && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 9, height: 56, background: t.sidebarBg, borderBottom: `1px solid ${t.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", backdropFilter: "blur(12px)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <button onClick={() => setSidebarOpen(true)} style={{ background: t.bg4, border: `1px solid ${t.border}`, borderRadius: 9, padding: "6px 8px", cursor: "pointer", display: "flex", alignItems: "center" }}>
              <Menu size={16} color={t.text2} />
            </button>
            <div style={{ fontWeight: 800, fontSize: 15, color: t.text }}>Instant<span style={{ color: "#6366f1" }}>BI</span></div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <ThemeToggle dark={dark} onToggle={onToggleDark} />
            {fileId && (
              <button
                onClick={() => setSidebarOpen(true)}
                style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", border: "none", borderRadius: 9, padding: "7px 12px", cursor: "pointer", fontSize: 11, fontWeight: 700, color: "white", fontFamily: "inherit" }}
              >
                Ask
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── MOBILE: sidebar overlay ── */}
      {isMobile && sidebarOpen && (
        <>
          <div className="mob-overlay" onClick={() => setSidebarOpen(false)} />
          <div className="mob-sidebar" style={{ background: t.sidebarBg, borderRight: `1px solid ${t.border}` }}>
            {sidebarContent}
          </div>
        </>
      )}

      {/* ── DESKTOP: sidebar ── */}
      {!isMobile && (
        <aside style={{ position: "relative", zIndex: 2, width: 350, background: t.sidebarBg, borderRight: `1px solid ${t.border}`, display: "flex", flexDirection: "column", flexShrink: 0, transition: "background 0.4s, border-color 0.4s" }}>
          {sidebarContent}
        </aside>
      )}

      {/* ── MAIN PANEL ── */}
      <main style={{ position: "relative", zIndex: 1, flex: 1, overflowY: "auto", paddingTop: isMobile ? 56 : 0 }}>

        {/* Error */}
        {error && (
          <div style={{ margin: "24px 24px 0", background: t.errorBg, border: `1px solid ${t.errorBorder}`, borderRadius: 16, padding: "16px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9, fontWeight: 700, color: t.errorText, marginBottom: 7, fontSize: 13 }}><AlertCircle size={15} /> Analytics Engine Error</div>
            <p style={{ fontSize: 13, color: t.errorBody, lineHeight: 1.6, fontFamily: "'DM Sans', sans-serif" }}>{error}</p>
            <button onClick={() => setError(null)} style={{ marginTop: 9, fontSize: 11, fontWeight: 700, color: t.errorText, background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>Dismiss</button>
          </div>
        )}

        {/* Empty state */}
        {!dashboard && !tableData && (
          <div style={{ height: "100%", minHeight: "80vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40, textAlign: "center" }}>
            <div style={{ position: "relative", marginBottom: 24 }}>
              <div style={{ position: "absolute", inset: -20, background: "#6366f1", borderRadius: "50%", filter: "blur(60px)", opacity: 0.1, animation: "t-pulse 3s ease-in-out infinite" }} />
              <div style={{ position: "relative", width: 88, height: 88, background: t.emptyIcon, borderRadius: 24, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 32px rgba(0,0,0,0.1)", border: `1px solid ${t.border}` }}>
                <Database size={38} color="#6366f1" />
              </div>
            </div>
            <h2 style={{ fontSize: isMobile ? 20 : 26, fontWeight: 800, fontFamily: "'Playfair Display', Georgia, serif", color: t.text, marginBottom: 10 }}>Intelligence on Demand</h2>
            <p style={{ color: t.text3, lineHeight: 1.75, maxWidth: 360, fontFamily: "'DM Sans', sans-serif", fontSize: 14 }}>Upload a CSV or Excel dataset, then ask any business question to generate a beautiful interactive dashboard.</p>
            <button
              onClick={() => isMobile ? setSidebarOpen(true) : fileInputRef.current.click()}
              style={{ marginTop: 24, display: "inline-flex", alignItems: "center", gap: 7, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "white", border: "none", padding: "12px 24px", borderRadius: 12, fontWeight: 700, fontSize: 13, fontFamily: "'Syne', sans-serif", cursor: "pointer", boxShadow: "0 6px 24px rgba(99,102,241,0.3)" }}
            >
              <Upload size={14} /> Upload your dataset
            </button>
          </div>
        )}

        {/* Dashboard */}
        {dashboard && (
          <div style={{ padding: isMobile ? "20px 16px 56px" : "32px 40px 72px", maxWidth: 1160, margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 32, flexWrap: "wrap", gap: 18 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 9 }}>
                  <div style={{ height: 3, width: 20, background: "#6366f1", borderRadius: 99 }} />
                  <span style={{ fontSize: 10, fontWeight: 700, color: t.text4, letterSpacing: 2, textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif" }}>Generated Report</span>
                </div>
                <h2 style={{ fontSize: isMobile ? 22 : 32, fontWeight: 800, color: t.text, fontFamily: "'Playfair Display', Georgia, serif", lineHeight: 1.08, marginBottom: 9 }}>{dashboard.title}</h2>
                <p style={{ color: t.text2, fontSize: 14, maxWidth: 560, lineHeight: 1.65, fontFamily: "'DM Sans', sans-serif" }}>{dashboard.summary}</p>
              </div>

              {/* Download Report button */}
              <button
                onClick={() => {
                  if (!dashboard) return;
                  const date = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
                  const insightsHtml = (dashboard.insights || []).map((ins, i) =>
                    `<div class="insight"><span class="ins-num">${String(i + 1).padStart(2, "0")}</span><p>${ins}</p></div>`
                  ).join("");
                  const chartsHtml = (dashboard.charts || []).map(c =>
                    `<div class="chart-desc"><div class="chart-type">${c.type.toUpperCase()} CHART</div><div class="chart-title">${c.title || ""}</div>${c.description ? `<p class="chart-p">${c.description}</p>` : ""}<p class="chart-p">Plotting <strong>${c.yAxisKey}</strong> against <strong>${c.xAxisKey}</strong>.</p></div>`
                  ).join("");
                  const maxRows = 50;
                  const rows = (tableData?.rows || []).slice(0, maxRows);
                  const cols = tableData?.columns || [];
                  const theadHtml = cols.map(c => `<th>${c}</th>`).join("");
                  const tbodyHtml = rows.map(r => `<tr>${cols.map(c => `<td>${r[c] ?? "—"}</td>`).join("")}</tr>`).join("");
                  const tableHtml = cols.length ? `<table><thead><tr>${theadHtml}</tr></thead><tbody>${tbodyHtml}</tbody></table>${(tableData?.rows?.length || 0) > maxRows ? `<p class="note">Showing first ${maxRows} of ${tableData.rows.length} rows.</p>` : ""}` : "<p class='note'>No results available.</p>";
                  const followUpHistoryHtml = queryHistory.length > 1
                    ? `<div class="section"><div class="section-title">Query History</div>${queryHistory.map((h, i) => `<div class="chart-desc"><div class="chart-type">Query ${i + 1}</div><div class="chart-title">${h.question}</div><p class="chart-p">${h.summary}</p></div>`).join("")}</div>`
                    : "";
                  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>${dashboard.title} — InstantBI Report</title><style>@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@300;400;500;700&display=swap');*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}body{font-family:'DM Sans',sans-serif;background:#fff;color:#1a1a2e;padding:56px 64px;max-width:900px;margin:0 auto}.header{border-bottom:3px solid #6366f1;padding-bottom:28px;margin-bottom:36px}.brand{display:flex;align-items:center;gap:10px;margin-bottom:28px}.brand-icon{width:36px;height:36px;background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:9px;display:flex;align-items:center;justify-content:center}.brand-name{font-family:'Playfair Display',serif;font-size:20px;font-weight:800;color:#0d0b1a}.brand-name span{color:#6366f1}.meta{font-size:11px;font-weight:700;color:#6366f1;letter-spacing:2px;text-transform:uppercase;margin-bottom:10px}h1{font-family:'Playfair Display',serif;font-size:34px;font-weight:800;color:#0d0b1a;line-height:1.1;margin-bottom:12px}.summary{font-size:15px;color:#444;line-height:1.75;font-weight:300;max-width:640px}.date{font-size:11px;color:#aaa;margin-top:10px;letter-spacing:1px}.section{margin-bottom:40px}.section-title{font-size:10px;font-weight:700;color:#6366f1;letter-spacing:3px;text-transform:uppercase;margin-bottom:16px;padding-bottom:8px;border-bottom:1px solid #e8e8f0}.insight{display:flex;gap:16px;align-items:flex-start;margin-bottom:14px;background:#f5f5ff;border-radius:12px;padding:14px 18px}.ins-num{font-family:'Playfair Display',serif;font-size:28px;font-weight:900;color:#6366f1;opacity:.25;line-height:1;flex-shrink:0;width:36px}.insight p{font-size:13px;color:#333;line-height:1.65;padding-top:4px}.chart-desc{background:#fafafa;border:1px solid #e8e8f0;border-radius:12px;padding:18px 22px;margin-bottom:12px}.chart-type{font-size:9px;font-weight:700;color:#8b5cf6;letter-spacing:2.5px;text-transform:uppercase;margin-bottom:4px}.chart-title{font-size:15px;font-weight:700;color:#0d0b1a;margin-bottom:6px}.chart-p{font-size:13px;color:#555;line-height:1.6;font-weight:300}table{width:100%;border-collapse:collapse;font-size:12px}thead tr{background:#6366f1;color:white}thead th{padding:10px 13px;text-align:left;font-weight:700;font-size:10px;letter-spacing:.5px;text-transform:uppercase}tbody tr:nth-child(even){background:#f5f5ff}tbody tr:nth-child(odd){background:#fff}tbody td{padding:9px 13px;color:#333;border-bottom:1px solid #eee}.note{font-size:11px;color:#aaa;margin-top:8px}.footer{margin-top:56px;padding-top:20px;border-top:1px solid #e8e8f0;display:flex;justify-content:space-between;font-size:11px;color:#bbb}@media print{body{padding:32px 40px}}</style></head><body><div class="header"><div class="brand"><div class="brand-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg></div><div class="brand-name">Instant<span>BI</span></div></div><div class="meta">Analytics Report</div><h1>${dashboard.title}</h1><p class="summary">${dashboard.summary}</p><p class="date">Generated on ${date}</p></div>${insightsHtml ? `<div class="section"><div class="section-title">Key Insights</div>${insightsHtml}</div>` : ""}${chartsHtml ? `<div class="section"><div class="section-title">Visualizations</div>${chartsHtml}</div>` : ""}${followUpHistoryHtml}<div class="section"><div class="section-title">Results Table</div>${tableHtml}</div><div class="footer"><span>InstantBI · AI Analytics Engine</span><span>${date}</span></div><script>window.onload=()=>{window.print();}<\/script></body></html>`;
                  const blob = new Blob([html], { type: "text/html" });
                  const url = URL.createObjectURL(blob);
                  window.open(url, "_blank");
                  setTimeout(() => URL.revokeObjectURL(url), 10000);
                }}
                style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 18px", background: t.exportBtn, border: `1.5px solid ${t.exportBtnBorder}`, borderRadius: 12, fontSize: 12, fontWeight: 700, color: t.exportBtnText, cursor: "pointer", fontFamily: "'Syne', sans-serif", transition: "all 0.2s" }}
              >
                <Download size={13} /> Download Report
              </button>
            </div>

            {/* Insights */}
            {dashboard.insights?.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill,minmax(190px,1fr))", gap: 13, marginBottom: 30 }}>
                {dashboard.insights.map((insight, idx) => (
                  <div key={idx} style={{ background: t.insightBg, borderRadius: 16, padding: 18, border: `1px solid ${t.border}`, display: "flex", flexDirection: "column", gap: 9, transition: "background 0.4s" }}>
                    <div style={{ width: 38, height: 38, background: t.insightIcon, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <TrendingUp size={16} color="#6366f1" />
                    </div>
                    <p style={{ fontSize: 12, color: t.text2, fontWeight: 500, lineHeight: 1.6, fontFamily: "'DM Sans', sans-serif" }}>{insight}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Charts */}
            <div style={{ display: "grid", gridTemplateColumns: (!isMobile && dashboard.charts?.length > 1) ? "repeat(2,1fr)" : "1fr", gap: 20 }}>
              {dashboard.charts?.map((chart, index) => renderChart(chart, index))}
            </div>
          </div>
        )}

        {/* SQL + Raw Table */}
        {sqlCode && (
          <div style={{ padding: isMobile ? "0 16px 56px" : "0 40px 48px", maxWidth: 1160, margin: "0 auto" }}>
            <div style={{ background: dark ? "#0d0b1a" : "#1a1a2e", borderRadius: 16, padding: "18px 20px", overflowX: "auto", marginBottom: 16 }}>
              <p style={{ fontSize: 9, color: "#6b69a0", marginBottom: 8, fontFamily: "monospace", textTransform: "uppercase", letterSpacing: 2 }}>Generated SQL</p>
              <pre style={{ color: "#a5f3a0", fontSize: 13, fontFamily: "monospace", whiteSpace: "pre-wrap", margin: 0 }}>{sqlCode}</pre>
            </div>
            {tableData?.rows?.length > 0 && (
              <div style={{ background: t.chartCard, border: `1px solid ${t.chartCardBorder}`, borderRadius: 16, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
                <p style={{ fontSize: 9, color: t.text4, padding: "10px 16px", borderBottom: `1px solid ${t.border}`, fontFamily: "monospace", textTransform: "uppercase", letterSpacing: 2 }}>
                  Results — {tableData.rows.length} rows
                </p>
                <div style={{ overflowX: "auto", maxHeight: 288 }}>
                  <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: t.bg4, position: "sticky", top: 0 }}>
                        {tableData.columns.map(col => (
                          <th key={col} style={{ padding: "8px 14px", textAlign: "left", fontSize: 10, fontWeight: 700, color: t.text3, textTransform: "uppercase", letterSpacing: 1, whiteSpace: "nowrap", fontFamily: "'DM Sans', sans-serif" }}>{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {tableData.rows.slice(0, 100).map((row, i) => (
                        <tr key={i} style={{ borderTop: `1px solid ${t.border}` }}
                          onMouseEnter={e => e.currentTarget.style.background = t.bg3}
                          onMouseLeave={e => e.currentTarget.style.background = ""}
                        >
                          {tableData.columns.map(col => (
                            <td key={col} style={{ padding: "8px 14px", color: t.text2, whiteSpace: "nowrap", fontFamily: "'DM Sans', sans-serif" }}>
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

        {/* Mobile quick-ask FAB when sidebar is closed */}
        {isMobile && fileId && !sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            style={{ position: "fixed", bottom: 24, right: 20, zIndex: 8, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", border: "none", borderRadius: "50%", width: 52, height: 52, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 28px rgba(99,102,241,0.45)", cursor: "pointer" }}
          >
            <Send size={20} color="white" />
          </button>
        )}
      </main>

      {/* ── FULLSCREEN CHART OVERLAY ── */}
      {fullscreenChart && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)", display: "flex", flexDirection: "column" }}
          onClick={() => setFullscreenChart(null)}
        >
          <div
            style={{ flex: 1, margin: isMobile ? "60px 12px 12px" : "60px 40px 40px", background: t.chartCard, borderRadius: 24, padding: 32, display: "flex", flexDirection: "column", boxShadow: "0 24px 80px rgba(0,0,0,0.4)" }}
            onClick={e => e.stopPropagation()}
          >
            {/* Fullscreen header */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#6366f1", letterSpacing: 2, textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif", marginBottom: 6 }}>
                  {fullscreenChart.chart.type.toUpperCase()} CHART
                </div>
                <h3 style={{ fontSize: isMobile ? 18 : 24, fontWeight: 800, color: t.text, fontFamily: "'Playfair Display', Georgia, serif" }}>
                  {fullscreenChart.chart.title}
                </h3>
                {fullscreenChart.chart.description && (
                  <p style={{ fontSize: 13, color: t.text3, marginTop: 5, fontFamily: "'DM Sans', sans-serif" }}>{fullscreenChart.chart.description}</p>
                )}
              </div>
              <button
                onClick={() => setFullscreenChart(null)}
                style={{ background: t.bg4, border: `1px solid ${t.border}`, borderRadius: 11, padding: "8px 10px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: t.text2, fontFamily: "inherit", flexShrink: 0 }}
              >
                <X size={14} /> Close
              </button>
            </div>
            {/* Chart fills the rest */}
            <div style={{ flex: 1, minHeight: 0 }}>
              {renderChart(fullscreenChart.chart, fullscreenChart.index, true)}
            </div>
          </div>
          <p style={{ textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 11, paddingBottom: 16, fontFamily: "'DM Sans', sans-serif" }}>Press Esc or click outside to close</p>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ROOT
// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState("splash");
  const [dark, setDark] = useState(false);
  const toggleDark = () => setDark(d => !d);

  return (
    <>
      {screen === "splash"   && <SplashScreen onDone={() => setScreen("landing")} />}
      {screen === "landing"  && <LandingPage onUseTool={() => setScreen("tool")} dark={dark} onToggleDark={toggleDark} />}
      {screen === "tool"     && <ToolPage onBack={() => setScreen("landing")} dark={dark} onToggleDark={toggleDark} />}
    </>
  );
}
