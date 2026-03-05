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

export default function History() {

  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {

  const user = auth.currentUser;
  if (!user) return;

  console.log("Current User:", user.uid);

  const snapshot = await getDocs(collection(db, "analysis"));

  const data = [];

  snapshot.forEach(doc => {
    const item = doc.data();

    console.log("Doc:", item);

    // Filter only current user
    if (item.userId === user.uid) {
      data.push({
        id: doc.id,
        ...item
      });
    }
  });

  console.log("Filtered Data:", data);

  // Sort manually by date
  data.sort((a, b) => {
    if (!a.createdAt || !b.createdAt) return 0;
    return b.createdAt.seconds - a.createdAt.seconds;
  });

  setHistory(data);
};

  if (history.length === 0)
    return (
      <Typography sx={{ mt: 3 }}>
        No history available yet.
      </Typography>
    );

  const latest = history[0];
  const previous = history[1];

  let comparisonText = "";

  if (previous) {
    const diff = latest.score - previous.score;

    if (diff > 0)
      comparisonText = `Improved by ${diff.toFixed(1)}%`;
    else if (diff < 0)
      comparisonText = `Declined by ${Math.abs(diff).toFixed(1)}%`;
    else
      comparisonText = "No change from last time";
  }

  return (
    <Box sx={{ mt: 4 }}>

      <Typography variant="h5" sx={{ mb: 2 }}>
        Your Progress
      </Typography>

      <Card sx={{ borderRadius: 3, boxShadow: 4 }}>
        <CardContent>

          <Typography variant="h6">
            Latest Score: {latest.score}%
          </Typography>

          {previous && (
            <Typography variant="body1" sx={{ mt: 1 }}>
              Previous Score: {previous.score}%
            </Typography>
          )}

          {previous && (
            <Typography
              variant="body1"
              sx={{ mt: 2, fontWeight: "bold" }}
            >
              {comparisonText}
            </Typography>
          )}

        </CardContent>
      </Card>

    </Box>
  );
}