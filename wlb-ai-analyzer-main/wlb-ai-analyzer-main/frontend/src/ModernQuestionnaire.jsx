import { useState } from "react";
import { motion } from "framer-motion";
import { auth, db } from "./firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import axios from "axios";

import {
  Box,
  Typography,
  LinearProgress,
  Button,
  Container
} from "@mui/material";

import ArrowForwardIcon from "@mui/icons-material/ArrowForward";


const questions = [

{
  column: "FRUITS_VEGGIES",
  title: "Nutrition & Energy",
  priority: 3,
  description: "Does healthy eating improve your energy levels during work?",
  options:[
    {label:"Significantly",value:10},
    {label:"Moderately",value:8},
    {label:"Slightly",value:5},
    {label:"Not at all",value:2}
  ]
},

{
  column:"DAILY_STRESS",
  title:"Stress Impact",
  priority:5,
  description:"Does your stress affect your personal life?",
  options:[
    {label:"Severely",value:2},
    {label:"Moderately",value:5},
    {label:"Slightly",value:8},
    {label:"Not at all",value:10}
  ]
},

{
  column:"PLACES_VISITED",
  title:"Recreation Impact",
  priority:3,
  description:"Do recreational activities help you mentally relax?",
  options:[
    {label:"Completely",value:10},
    {label:"Somewhat",value:8},
    {label:"Slightly",value:5},
    {label:"Not at all",value:2}
  ]
},

{
  column:"CORE_CIRCLE",
  title:"Emotional Support",
  priority:4,
  description:"When you share problems, do you feel emotionally supported?",
  options:[
    {label:"Always",value:10},
    {label:"Often",value:8},
    {label:"Rarely",value:5},
    {label:"Never",value:2}
  ]
},

{
  column:"SUPPORTING_OTHERS",
  title:"Helping Others",
  priority:2,
  description:"Helping others makes you feel:",
  options:[
    {label:"Very fulfilled",value:10},
    {label:"Somewhat happy",value:8},
    {label:"Neutral",value:5},
    {label:"Emotionally drained",value:2}
  ]
},

{
  column:"SOCIAL_NETWORK",
  title:"Social Stress Reduction",
  priority:4,
  description:"Do social connections help reduce your stress?",
  options:[
    {label:"Yes significantly",value:10},
    {label:"Sometimes",value:8},
    {label:"Rarely",value:5},
    {label:"They increase stress",value:2}
    ]
},

{
  column:"ACHIEVEMENT",
  title:"Motivation from Achievements",
  priority:3,
  description:"Achievements make you feel:",
  options:[
    {label:"Highly motivated",value:10},
    {label:"Slightly motivated",value:8},
    {label:"Temporarily happy",value:5},
    {label:"No different",value:2}
  ]
},

{
  column:"DONATION",
  title:"Helping Society",
  priority:1,
  description:"Helping society makes you feel:",
  options:[
    {label:"Very fulfilled",value:10},
    {label:"Slightly happy",value:8},
    {label:"Neutral",value:5},
    {label:"No impact",value:2}
  ]
},

{
  column:"BMI_RANGE",
  title:"Health & Productivity",
  priority:4,
  description:"Does physical health affect your productivity?",
  options:[
    {label:"Strongly",value:10},
    {label:"Moderately",value:8},
    {label:"Slightly",value:5},
    {label:"Not at all",value:2}
  ]
},

{
  column:"TODO_COMPLETED",
  title:"Work Pressure",
  priority:4,
  description:"Unfinished tasks make you feel:",
  options:[
    {label:"Highly anxious",value:2},
    {label:"Slightly stressed",value:5},
    {label:"Neutral",value:8},
    {label:"Not concerned",value:10}
  ]
},

{
  column:"FLOW",
  title:"Focus Impact",
  priority:3,
  description:"When focused, work feels:",
  options:[
    {label:"Much easier",value:10},
    {label:"Slightly easier",value:8},
    {label:"Same",value:5},
    {label:"Still stressful",value:2}
  ]
},

{
  column:"DAILY_STEPS",
  title:"Exercise & Mood",
  priority:3,
  description:"Physical activity improves your mood:",
  options:[
    {label:"Significantly",value:10},
    {label:"Moderately",value:8},
    {label:"Slightly",value:5},
    {label:"Not at all",value:2}
  ]
},

{
  column:"LIVE_VISION",
  title:"Goal Clarity",
  priority:2,
  description:"Having clear goals helps reduce stress.",
  options:[
    {label:"Strongly agree",value:10},
    {label:"Agree",value:8},
    {label:"Disagree",value:5},
    {label:"Strongly disagree",value:2}
  ]
},

{
  column:"SLEEP_HOURS",
  title:"Sleep Productivity",
  priority:4,
  description:"Lack of sleep affects your productivity.",
  options:[
    {label:"Severely",value:2},
    {label:"Moderately",value:5},
    {label:"Slightly",value:8},
    {label:"Not at all",value:10}
  ]
},

{
  column:"LOST_VACATION",
  title:"Work Burnout",
  priority:5,
  description:"Missing breaks makes you feel:",
  options:[
    {label:"Burnt out",value:2},
    {label:"Slightly stressed",value:5},
    {label:"Neutral",value:8},
    {label:"No impact",value:10}
  ]
},

{
  column:"DAILY_SHOUTING",
  title:"Emotional Reactions",
  priority:5,
  description:"These emotional reactions affect relationships:",
  options:[
    {label:"Strongly",value:2},
    {label:"Moderately",value:5},
    {label:"Slightly",value:8},
    {label:"Not at all",value:10}
  ]
},

{
  column:"SUFFICIENT_INCOME",
  title:"Financial Stress",
  priority:3,
  description:"Financial pressure causes stress:",
  options:[
    {label:"Frequently",value:2},
    {label:"Sometimes",value:5},
    {label:"Rarely",value:8},
    {label:"Never",value:10}
  ]
},

{
  column:"PERSONAL_AWARDS",
  title:"Recognition Impact",
  priority:2,
  description:"Recognition improves motivation:",
  options:[
    {label:"Strongly",value:10},
    {label:"Moderately",value:8},
    {label:"Slightly",value:5},
    {label:"Not at all",value:2}
  ]
},

{
  column:"TIME_FOR_PASSION",
  title:"Hobby Disconnect",
  priority:3,
  description:"Hobbies help you disconnect from work:",
  options:[
    {label:"Completely",value:10},
    {label:"Somewhat",value:8},
    {label:"Slightly",value:5},
    {label:"Not at all",value:2}
  ]
},

{
  column:"WEEKLY_MEDITATION",
  title:"Meditation Effect",
  priority:3,
  description:"Meditation reduces your stress:",
  options:[
    {label:"Significantly",value:10},
    {label:"Slightly",value:8},
    {label:"Very little",value:5},
    {label:"Not at all",value:2}
  ]
},

{
  column: "AGE",
  title: "Age",
  description: "Please select your age range.",
  options: [
    { label: "Under 20", value: 2 },
    { label: "20–30", value: 5 },
    { label: "30–45", value: 8 },
    { label: "Above 45", value: 10 }
  ]
},

{
  column: "GENDER",
  title: "Gender",
  description: "Please select your gender.",
  options: [
    { label: "Male", value: 0 },
    { label: "Female", value: 1 }
  ]
}

];


export default function ModernQuestionnaire({ onComplete }) {

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});

  const current = questions[step];

  const selectOption = (value) => {
    setAnswers({
      ...answers,
      [current.column]: value
    });
  };

  const next = async () => {

  console.log("Next clicked", step);

  if (step < questions.length - 1) {
    setStep(step + 1);
    return;
  }

  console.log("Submitting answers", answers);

  try {

    const features = questions.map(q => ({
      column: q.column,
      value: answers[q.column] || 0,
      priority: q.priority
    }));

    console.log("Features:", features);

    const res = await axios.post(
      "http://127.0.0.1:8000/predict",
      { features }
    );

    console.log("Backend response:", res.data);

    const score = res.data.score;
    const label = res.data.label;

    const user = auth.currentUser;

    if (user) {

      await addDoc(collection(db, "analysis"), {
        userId: user.uid,
        inputs: answers,
        score,
        label,
        createdAt: serverTimestamp()
      });

      console.log("Saved to Firebase ✅");

    }

    if (onComplete) onComplete();

  } catch (err) {

    console.error("Submit error:", err);

  }

};

  const progress =
    ((step + 1) / questions.length) * 100;

  return (
    <Box
      sx={{
        minHeight: "100%",
        display: "flex",
        flexDirection: "column",
        background:
          "radial-gradient(circle at top, #1e1b4b, #020617)",
        color: "white"
      }}
    >

      <Container
        maxWidth="sm"
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          py: 4
        }}
      >

        {/* Header */}
        <Box>

          <Typography sx={{ opacity: 0.7 }}>
            {step + 1}/{questions.length}
          </Typography>

          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{ mt: 1 }}
          />

        </Box>

        {/* Space Added Here */}
        <Box sx={{ mt: 4 }}>

          <motion.div
            key={step}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >

            <Typography variant="h4" sx={{ mb: 2 }}>
              {current.title}
            </Typography>

            <Typography sx={{ mb: 3 }}>
              {current.description}
            </Typography>

            {current.options.map((opt, index) => {

              const selected =
                answers[current.column] === opt.value;

              return (
                <Box
                  key={index}
                  onClick={() => selectOption(opt.value)}
                  sx={{
                    mb: 2,
                    p: 2,
                    borderRadius: 3,
                    cursor: "pointer",
                    background: selected
                      ? "#6366f1"
                      : "#1e293b"
                  }}
                >
                  <Typography>{opt.label}</Typography>
                </Box>
              );
            })}

          </motion.div>

        </Box>

        {/* Button */}
        <Button
          fullWidth
          variant="contained"
          endIcon={<ArrowForwardIcon />}
          onClick={next}
        >
          {step === questions.length - 1
            ? "Submit"
            : "Continue"}
        </Button>

      </Container>

    </Box>
  );
}