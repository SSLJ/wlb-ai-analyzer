import { useEffect, useState } from "react";
import { auth, db } from "./firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, CartesianGrid,
  ResponsiveContainer, Cell, LabelList,
} from "recharts";

const columnLabels = {
  FRUITS_VEGGIES:    "Nutrition",
  DAILY_STRESS:      "Stress",
  PLACES_VISITED:    "Recreation",
  CORE_CIRCLE:       "Relationships",
  SUPPORTING_OTHERS: "Helping Others",
  SOCIAL_NETWORK:    "Social Network",
  ACHIEVEMENT:       "Achievement",
  DONATION:          "Charity",
  BMI_RANGE:         "Physical Health",
  TODO_COMPLETED:    "Productivity",
  FLOW:              "Focus",
  DAILY_STEPS:       "Physical Activity",
  LIVE_VISION:       "Life Vision",
  SLEEP_HOURS:       "Sleep",
  LOST_VACATION:     "Work Breaks",
  DAILY_SHOUTING:    "Emotional Stability",
  SUFFICIENT_INCOME: "Financial Satisfaction",
  PERSONAL_AWARDS:   "Recognition",
  TIME_FOR_PASSION:  "Hobbies",
  WEEKLY_MEDITATION: "Meditation",
};

const BAR_COLORS = [
  "#4F46E5","#5B50E8","#665AEB","#7265EE","#7E6FF1",
  "#6B7EF0","#578EEF","#449DEE","#30ACED","#1DBBEC",
  "#19BFDF","#15C3D2","#11C7C5","#0ECBB8","#0ACFAB",
  "#06D39E","#10B981","#22BF82","#34C56B","#46CB54",
];

function scoreMeta(score) {
  if (score >= 75) return {
    color: "#10B981", bg: "#ECFDF5", badgeBg: "#D1FAE5",
    label: "Excellent",
    message: "Outstanding work-life balance! You're thriving across most wellness dimensions. Keep nurturing these habits — they're the foundation of long-term wellbeing and peak performance.",
  };
  if (score >= 50) return {
    color: "#3B82F6", bg: "#EFF6FF", badgeBg: "#DBEAFE",
    label: "Good",
    message: "You have a solid work-life balance with some room to grow. A few targeted improvements — especially in your lower-scoring areas — could make a meaningful difference to your daily energy and happiness.",
  };
  if (score >= 30) return {
    color: "#F59E0B", bg: "#FFFBEB", badgeBg: "#FEF3C7",
    label: "Fair",
    message: "Your balance needs attention in several areas. Small, consistent changes to sleep, stress management, and social connection can compound quickly. Consider prioritising the factors highlighted in the chart below.",
  };
  return {
    color: "#EF4444", bg: "#FEF2F2", badgeBg: "#FEE2E2",
    label: "Needs Attention",
    message: "Your work-life balance is under significant strain. It's important to take action now — start with the basics: sleep, nutrition, and setting clear work boundaries. Small steps each day can lead to major improvements over time.",
  };
}

const card = {
  background: "#fff", borderRadius: 18, padding: "24px 24px",
  border: "1px solid #EDEBE6",
  boxShadow: "0 1px 3px rgba(0,0,0,.04), 0 6px 22px rgba(0,0,0,.06)",
  marginBottom: 18,
};

// Custom angled X-axis tick for bar chart
function AngledTick({ x, y, payload }) {
  const words = payload.value.split(" ");
  return (
    <g transform={`translate(${x},${y})`}>
      {words.map((word, i) => (
        <text
          key={i}
          x={0}
          y={0}
          dy={14 + i * 12}
          textAnchor="middle"
          fill="#9CA3AF"
          fontSize={10}
          fontFamily="'Plus Jakarta Sans', sans-serif"
          fontWeight={500}
        >
          {word}
        </text>
      ))}
    </g>
  );
}

function BarTip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#fff", border: "1px solid #E5E7EB", borderRadius: 10,
      padding: "8px 12px", fontSize: 13, fontFamily: "'Plus Jakarta Sans',sans-serif",
      boxShadow: "0 4px 16px rgba(0,0,0,.08)",
    }}>
      <div style={{ fontWeight: 600, color: "#111827", marginBottom: 2 }}>{payload[0].payload.name}</div>
      <div style={{ color: "#6B7280" }}>Score: <b style={{ color: "#4F46E5" }}>{payload[0].value}</b> / 10</div>
    </div>
  );
}

function LineTip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const full = payload[0].payload.full;
  return (
    <div style={{
      background: "#fff", border: "1px solid #E5E7EB", borderRadius: 10,
      padding: "8px 12px", fontSize: 13, fontFamily: "'Plus Jakarta Sans',sans-serif",
      boxShadow: "0 4px 16px rgba(0,0,0,.08)",
    }}>
      <div style={{ fontWeight: 600, color: "#111827", marginBottom: 2 }}>{full}</div>
      <div style={{ color: "#6B7280" }}>Score: <b style={{ color: "#4F46E5" }}>{payload[0].value}%</b></div>
    </div>
  );
}

export default function Dashboard() {
  const [history, setHistory]     = useState([]);
  const [report, setReport]       = useState("");
  const [loadingAI, setLoadingAI] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;
      if (!user) return;
      const q = query(
        collection(db, "analysis"),
        where("userId", "==", user.uid),
        orderBy("createdAt", "asc")
      );
      const snap = await getDocs(q);
      setHistory(snap.docs.map(d => d.data()));
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!history.length) return;
    const latest   = history[history.length - 1];
    const previous = history.length > 1 ? history[history.length - 2] : null;
    setLoadingAI(true);
    fetch("http://127.0.0.1:8000/ai-report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ latest, previous }),
    })
      .then(r => r.json())
      .then(d  => { setReport(d.report); setLoadingAI(false); })
      .catch(() => { setReport("AI unavailable"); setLoadingAI(false); });
  }, [history]);

  if (!history.length) {
    return (
      <div style={{
        minHeight: "calc(100vh - 64px)", display: "flex",
        alignItems: "center", justifyContent: "center",
        fontFamily: "'Plus Jakarta Sans',sans-serif", color: "#9CA3AF",
      }}>
        No data yet — complete the assessment first.
      </div>
    );
  }

  const latest   = history[history.length - 1];
  const meta     = scoreMeta(latest.score);
  // Convert Firestore Timestamp to readable date for X axis
  const formatDate = (ts) => {
    if (!ts) return "—";
    const date = ts.toDate ? ts.toDate() : new Date(ts.seconds * 1000);
    return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  };
  const formatFull = (ts) => {
    if (!ts) return "—";
    const date = ts.toDate ? ts.toDate() : new Date(ts.seconds * 1000);
    return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  };
  const lineData = history.map((item) => ({
    name:  formatDate(item.createdAt),
    score: item.score,
    full:  formatFull(item.createdAt),
  }));
  const barData  = Object.keys(columnLabels).map(key => ({
    name:  columnLabels[key],
    value: latest.inputs?.[key] || 0,
  }));
  const tickStyle = { fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 11, fill: "#9CA3AF" };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:wght@500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap');
        .dash { max-width:900px; margin:0 auto; padding:36px 20px 60px; font-family:'Plus Jakarta Sans',sans-serif; }
        .dash-title { font-family:'Lora',serif; font-size:26px; font-weight:700; color:#111827; margin-bottom:24px; letter-spacing:-.3px; }
        .card-title { font-family:'Lora',serif; font-size:16px; font-weight:600; color:#111827; margin-bottom:18px; }

        .score-wrap { display:flex; align-items:flex-start; justify-content:space-between; flex-wrap:wrap; gap:20px; }
        .score-num  { font-family:'Lora',serif; font-size:64px; font-weight:700; line-height:1; letter-spacing:-3px; }
        .score-badge { display:inline-flex; padding:5px 14px; border-radius:99px; font-size:12px; font-weight:700; letter-spacing:.4px; margin-top:10px; }
        .score-right { font-size:14px; color:#4B5563; max-width:300px; line-height:1.7; padding-top:6px; }

        .ai-dots { display:flex; gap:5px; align-items:center; }
        .ai-d { width:7px; height:7px; border-radius:50%; background:#4F46E5; animation:aip 1.2s ease-in-out infinite; }
        .ai-d:nth-child(2){animation-delay:.18s} .ai-d:nth-child(3){animation-delay:.36s}
        @keyframes aip { 0%,80%,100%{opacity:.2;transform:scale(.8)} 40%{opacity:1;transform:scale(1)} }
        .ai-report { font-size:14px; color:#374151; line-height:1.8; white-space:pre-line; }
      `}</style>

      <div className="dash">
        <div className="dash-title">Your Wellness Dashboard</div>

        {/* ── Score card ── */}
        <div style={{ ...card, background: meta.bg, border: `1px solid ${meta.color}33` }}>
          <div className="score-wrap">
            <div>
              <div className="score-num" style={{ color: meta.color }}>{latest.score}%</div>
              <div className="score-badge" style={{ background: meta.badgeBg, color: meta.color }}>
                {meta.label}
              </div>
            </div>
            <div className="score-right">{meta.message}</div>
          </div>
        </div>

        {/* ── Score trend ── always shown, X axis = real date */}
        <div style={card}>
          <div style={{ display:"flex", alignItems:"baseline", justifyContent:"space-between", marginBottom:18 }}>
            <span className="card-title" style={{ marginBottom:0 }}>Progress Over Time</span>
            <span style={{ fontSize:12, color:"#9CA3AF", fontWeight:500 }}>
              {history.length === 1 ? "Complete again to see your trend" : `${history.length} assessments`}
            </span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={lineData} margin={{ top: 8, right: 16, left: -12, bottom: 0 }}>
              <CartesianGrid stroke="#F3F4F6" strokeDasharray="4 4" />
              <XAxis
                dataKey="name"
                tick={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:11, fill:"#9CA3AF" }}
                axisLine={false} tickLine={false}
                interval={0}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:11, fill:"#9CA3AF" }}
                axisLine={false} tickLine={false}
                tickFormatter={v => `${v}%`}
              />
              <Tooltip content={<LineTip />} />
              {/* Reference bands */}
              <Line dataKey="score" stroke="#4F46E5" strokeWidth={2.5}
                dot={{ fill:"#4F46E5", r: history.length === 1 ? 6 : 4, strokeWidth:2, stroke:"#fff" }}
                activeDot={{ r:7, fill:"#4F46E5" }}
                type="monotone"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* ── Bar chart — 20 factors ── */}
        <div style={card}>
          <div className="card-title">Balance Factors</div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={barData}
              margin={{ top: 4, right: 8, left: -14, bottom: 4 }}
              barCategoryGap="22%"
            >
              <CartesianGrid stroke="#F3F4F6" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="name" hide />
              <YAxis tick={tickStyle} axisLine={false} tickLine={false} domain={[0, 10]} ticks={[0,2,4,6,8,10]} />
              <Tooltip content={<BarTip />} cursor={{ fill: "#F5F7FF" }} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={28}>
                {barData.map((_, i) => (
                  <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                ))}
                <LabelList
                  content={({ x, y, width, height, index }) => {
                    const isShort = height < 24;
                    return (
                      <text
                        x={x + width / 2}
                        y={isShort ? y - 4 : y + 13}
                        textAnchor="middle"
                        fontSize={9} fontWeight={700}
                        fill={isShort ? "#9CA3AF" : "rgba(255,255,255,0.85)"}
                        fontFamily="'Plus Jakarta Sans', sans-serif"
                      >
                        {index + 1}
                      </text>
                    );
                  }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          {/* Numbered legend — 4 columns */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "8px 16px",
            marginTop: 18,
            paddingTop: 16,
            borderTop: "1px solid #F3F4F6",
          }}>
            {barData.map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 18, height: 18,
                  flexShrink: 0,
                  fontSize: 11,
                  fontWeight: 700,
                  color: BAR_COLORS[i % BAR_COLORS.length],
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}>
                  {i + 1}
                </span>
                <span style={{
                  fontSize: 12, color: "#4B5563", fontWeight: 500,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}>
                  {item.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── AI Wellness Coach ── */}
        <div style={{ ...card, background: "#FAFBFF", borderColor: "#E0E7FF", marginBottom: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 14 }}>
            <span style={{ fontSize: 18 }}>🤖</span>
            <span className="card-title" style={{ marginBottom: 0 }}>AI Wellness Coach</span>
          </div>
          {loadingAI ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div className="ai-dots">
                <div className="ai-d" /><div className="ai-d" /><div className="ai-d" />
              </div>
              <span style={{ fontSize: 13, color: "#9CA3AF" }}>Analyzing your responses…</span>
            </div>
          ) : (
            <div className="ai-report">{report}</div>
          )}
        </div>

      </div>
    </>
  );
}