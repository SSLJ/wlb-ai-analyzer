import { useEffect, useState } from "react";
import { auth, db } from "./firebase";

import { collection, getDocs } from "firebase/firestore";

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
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

export default function Graphs() {

  const [data, setData] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {

    const user = auth.currentUser;
    if (!user) return;

    const snapshot = await getDocs(collection(db, "analysis"));

    const userData = [];

    snapshot.forEach(doc => {
      const item = doc.data();

      if (item.userId === user.uid && item.createdAt) {

        userData.push({
          score: item.score,
          date: new Date(
            item.createdAt.seconds * 1000
          ).toLocaleDateString()
        });

      }
    });

    // sort by time
    userData.sort((a, b) => new Date(a.date) - new Date(b.date));

    setData(userData);
  };

  if (data.length === 0)
    return (
      <Typography sx={{ mt: 3 }}>
        No graph data available yet.
      </Typography>
    );

  return (
    <Box sx={{ mt: 4 }}>

      <Typography variant="h5" sx={{ mb: 2 }}>
        Score Trend Over Time
      </Typography>

      <Card sx={{ borderRadius: 3, boxShadow: 4 }}>
        <CardContent>

          <ResponsiveContainer width="100%" height={300}>

            <LineChart data={data}>

              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="date" />

              <YAxis domain={[0, 100]} />

              <Tooltip />

              <Line
                type="monotone"
                dataKey="score"
                stroke="#667eea"
                strokeWidth={3}
              />

            </LineChart>

          </ResponsiveContainer>

        </CardContent>
      </Card>

    </Box>
  );
}