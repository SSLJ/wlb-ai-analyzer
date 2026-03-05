import { auth, db } from "./firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useState, useEffect } from "react";
import axios from "axios";
import History from "./History";
import Graphs from "./Graphs";

import {
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Slider,
  Box,
  Chip,
  Grid,
  MenuItem,
  TextField
} from "@mui/material";

const columnLabels = {
  FRUITS_VEGGIES: "Fruit & Vegetable Intake",
  DAILY_STRESS: "Daily Stress Level",
  PLACES_VISITED: "Places Visited",
  CORE_CIRCLE: "Close Support Circle",
  SUPPORTING_OTHERS: "Helping Others",
  SOCIAL_NETWORK: "Social Network Strength",
  ACHIEVEMENT: "Sense of Achievement",
  DONATION: "Charitable Contribution",
  BMI_RANGE: "BMI Range",
  TODO_COMPLETED: "Tasks Completed",
  FLOW: "Flow State",
  DAILY_STEPS: "Daily Steps",
  LIVE_VISION: "Life Vision Clarity",
  SLEEP_HOURS: "Sleep Hours",
  LOST_VACATION: "Vacation Lost",
  DAILY_SHOUTING: "Daily Emotional Stress",
  SUFFICIENT_INCOME: "Financial Satisfaction",
  PERSONAL_AWARDS: "Personal Recognition",
  TIME_FOR_PASSION: "Time for Passion",
  WEEKLY_MEDITATION: "Meditation Frequency",
  AGE: "Age",
  GENDER: "Gender"
};

export default function Questionnaire() {

  const [columns, setColumns] = useState([]);
  const [form, setForm] = useState({});
  const [result, setResult] = useState(null);
  const [score, setScore] = useState(null);

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/columns")
      .then(res => {

        const filtered = res.data.columns.filter(
          col => col !== "Timestamp"
        );

        setColumns(filtered);

        const initial = {};
        filtered.forEach(col => {
          if (col === "AGE") initial[col] = "";
          else if (col === "GENDER") initial[col] = 0;
          else initial[col] = 0;
        });

        setForm(initial);
      });
  }, []);

  const handleChange = (col, value) => {
    setForm({
      ...form,
      [col]: value
    });
  };

  const handleSubmit = async () => {

    const features = Object.values(form);

    const res = await axios.post("http://127.0.0.1:8000/predict", {
      features: features
    });

    const label = res.data.label;
    const scoreValue = res.data.score;

    setResult(label);
    setScore(scoreValue);

    // 🔥 SAVE TO FIREBASE
    const user = auth.currentUser;

    if (user) {
      try {
        await addDoc(collection(db, "analysis"), {
          userId: user.uid,
          inputs: form,
          score: scoreValue,
          label: label,
          createdAt: serverTimestamp()
        });

        console.log("Saved to Firebase ✅");

      } catch (error) {
        console.error("Error saving:", error);
      }
    }

  };

  const getCategory = () => {
    if (!score) return "";

    if (score < 40) return "Bad";
    if (score < 60) return "Average";
    if (score < 80) return "Good";
    return "Excellent";
  };

  const getColor = () => {
    const category = getCategory();

    if (category === "Bad") return "error";
    if (category === "Average") return "warning";
    if (category === "Good") return "success";
    return "success";
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea, #764ba2)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2
      }}
    >
      <Container maxWidth={false}>

        <Card sx={{ borderRadius: 4, boxShadow: 6 }}>
          <CardContent>

            <Typography
              variant="h4"
              align="center"
              sx={{ mb: 4, fontWeight: "bold" }}
            >
              Work Life Balance AI Analyzer
            </Typography>

            <Grid container spacing={3}>

              {columns.map((col) => (

                <Grid item xs={12} md={6} key={col}>

                  {col === "GENDER" ? (

                    <TextField
                      select
                      fullWidth
                      label="Gender"
                      value={form[col]}
                      onChange={(e) => handleChange(col, e.target.value)}
                    >
                      <MenuItem value={0}>Male</MenuItem>
                      <MenuItem value={1}>Female</MenuItem>
                    </TextField>

                  ) : col === "AGE" ? (

                    <TextField
                      fullWidth
                      label="Age"
                      type="number"
                      value={form[col]}
                      placeholder="Enter your age"
                      onChange={(e) => handleChange(col, e.target.value)}
                    />

                  ) : (

                    <Box>
                      <Typography gutterBottom>
                        {columnLabels[col] || col}
                      </Typography>

                      <Slider
                        value={form[col] ?? 0}
                        step={1}
                        min={0}
                        max={10}
                        valueLabelDisplay="auto"
                        onChange={(e, value) => handleChange(col, value)}
                      />
                    </Box>

                  )}

                </Grid>

              ))}

            </Grid>

            <Button
              variant="contained"
              fullWidth
              size="large"
              sx={{
                mt: 4,
                borderRadius: 3,
                py: 1.5
              }}
              onClick={handleSubmit}
            >
              Analyze My Balance
            </Button>

            {result && (
              <Box sx={{ textAlign: "center", mt: 4 }}>

                <Typography variant="h5">
                  Your Work Life Balance
                </Typography>

                <Typography
                  variant="h3"
                  sx={{ fontWeight: "bold", mt: 2 }}
                >
                  {score ? `${score}%` : "--"}
                </Typography>

                <Chip
                  label={getCategory()}
                  color={getColor()}
                  sx={{ fontSize: 18, px: 3, py: 2, mt: 2 }}
                />

              </Box>
            )}

            {/* 🔥 HISTORY SECTION */}
            {result && <History />}
            {result && <Graphs />}

          </CardContent>
        </Card>

      </Container>
    </Box>
  );
}