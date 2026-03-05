import { useEffect, useState } from "react";
import { auth, db } from "./firebase";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy
} from "firebase/firestore";

import {
  Box,
  Typography,
  Card,
  CardContent
} from "@mui/material";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend
} from "recharts";


// LABELS

const columnLabels = {
  FRUITS_VEGGIES: "Nutrition",
  DAILY_STRESS: "Stress",
  PLACES_VISITED: "Recreation",
  CORE_CIRCLE: "Relationships",
  SUPPORTING_OTHERS: "Helping Others",
  SOCIAL_NETWORK: "Social Network",
  ACHIEVEMENT: "Achievement",
  DONATION: "Charity",
  BMI_RANGE: "Physical Health",
  TODO_COMPLETED: "Productivity",
  FLOW: "Focus",
  DAILY_STEPS: "Physical Activity",
  LIVE_VISION: "Life Vision",
  SLEEP_HOURS: "Sleep",
  LOST_VACATION: "Work Breaks",
  DAILY_SHOUTING: "Emotional Stability",
  SUFFICIENT_INCOME: "Financial Satisfaction",
  PERSONAL_AWARDS: "Recognition",
  TIME_FOR_PASSION: "Hobbies",
  WEEKLY_MEDITATION: "Meditation",
  AGE: "Age",
  GENDER: "Gender"
};


//COLORS

const COLORS = [
  "#6366f1", "#22c55e", "#f59e0b", "#ef4444",
  "#14b8a6", "#8b5cf6", "#ec4899", "#06b6d4",
  "#84cc16", "#eab308", "#f97316", "#10b981",
  "#a855f7", "#3b82f6", "#f43f5e", "#0ea5e9",
  "#9333ea", "#059669", "#d946ef", "#65a30d",
  "#c2410c", "#334155"
];

export default function Dashboard() {

  const [history, setHistory] = useState([]);
  const [report, setReport] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);


  // HISTORY

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

      const data = snap.docs.map(doc => doc.data());

      setHistory(data);
    };

    fetchData();

  }, []);


  // AI REPORT

  useEffect(() => {

    if (!history.length) return;

    const latest = history[history.length - 1];

    const previous =
      history.length > 1
        ? history[history.length - 2]
        : null;

    setLoadingAI(true);

    fetch("http://127.0.0.1:8000/ai-report", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        latest,
        previous
      })
    })
      .then(res => res.json())
      .then(data => {
        setReport(data.report);
        setLoadingAI(false);
      })
      .catch(err => {
        console.error(err);
        setReport("AI unavailable");
        setLoadingAI(false);
      });

  }, [history]);


  if (!history.length)
    return <Typography>No data yet</Typography>;


  const latest = history[history.length - 1];


  // LINE GRAPH

  const lineData = history.map((item, i) => ({
    name: `Test ${i + 1}`,
    score: item.score
  }));


  // PIE DATA

  const pieData = Object.keys(columnLabels).map((key) => ({
    name: columnLabels[key],
    value: latest.inputs?.[key] || 0
  }));


  // UI

  return (
    <Box sx={{ p: 3 }}>

      <Typography variant="h4" sx={{ mb: 3 }}>
        Dashboard
      </Typography>


      {/* Score Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>

          <Typography variant="h3">
            {latest.score}%
          </Typography>

          <Typography>
            {latest.label}
          </Typography>

        </CardContent>
      </Card>


      {/* Line Chart */}
      <Card sx={{ mb: 3 }}>
        <CardContent>

          <Typography>Score Trend</Typography>

          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={lineData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line dataKey="score" stroke="#6366f1" />
            </LineChart>
          </ResponsiveContainer>

        </CardContent>
      </Card>


      {/* Pie Chart */}
      <Card sx={{ mb: 3 }}>
        <CardContent>

          <Typography>Balance Factors Overview</Typography>

          <ResponsiveContainer width="100%" height={400}>
            <PieChart>

              <Pie
                data={pieData}
                dataKey="value"
                outerRadius={130}
                label
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>

              <Tooltip />
              <Legend />

            </PieChart>
          </ResponsiveContainer>

        </CardContent>
      </Card>


      {/* AI REPORT */}
      <Card sx={{ borderRadius: 4 }}>
        <CardContent>

          <Typography variant="h5" sx={{ fontWeight: "bold" }}>
            AI Wellness Coach
          </Typography>

          <Typography
            sx={{
              mt: 2,
              whiteSpace: "pre-line",
              lineHeight: 1.7
            }}
          >
            {loadingAI
              ? "Analyzing your responses..."
              : report}
          </Typography>

        </CardContent>
      </Card>

    </Box>
  );
}