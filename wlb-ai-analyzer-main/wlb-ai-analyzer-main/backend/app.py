import joblib
import numpy as np
import pandas as pd
import requests

from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

from typing import Optional


# ================= FASTAPI APP =================

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ================= LOAD MODEL =================

model = joblib.load(r"C:\Users\HP\Desktop\React\wlb-analyser-main(ollama)\wlb-ai-analyzer-main\wlb-ai-analyzer-main\backend\model.pkl")
columns = joblib.load(r"C:\Users\HP\Desktop\React\wlb-analyser-main(ollama)\wlb-ai-analyzer-main\wlb-ai-analyzer-main\backend\columns.pkl")

columns = [col for col in columns if col != "Timestamp"]


# ================= OLLAMA SETTINGS =================

OLLAMA_URL = "http://localhost:11434/api/generate"
OLLAMA_MODEL = "llama3:8b"


# ================= REQUEST MODELS =================

class UserInput(BaseModel):
    features: list


class AIRequest(BaseModel):
    latest: dict
    previous: Optional[dict] = None


# ================= ROUTES =================

@app.get("/")
def home():
    return {"message": "Work Life Balance API Runn111ing 🚀"}


@app.get("/columns")
def get_columns():
    return {"columns": columns}


# ================= ML PREDICTION =================

@app.post("/predict")
def predict(data: UserInput):

    # extract numeric values from features
    values = []

    for f in data.features:
        if isinstance(f, dict):
            values.append(f["value"])
        else:
            values.append(f)

    # ensure correct length
    if len(values) != len(columns):
        raise ValueError(f"Expected {len(columns)} features but received {len(values)}")

    input_df = pd.DataFrame([values], columns=columns)

    prediction = int(model.predict(input_df)[0])

    labels = {
        0: "Bad",
        1: "Average",
        2: "Good"
    }

    if prediction == 0:
        score = np.random.uniform(20, 40)
    elif prediction == 1:
        score = np.random.uniform(40, 70)
    else:
        score = np.random.uniform(70, 95)

    return {
        "prediction": prediction,
        "label": labels[prediction],
        "score": round(score, 2)
    }


# ================= AI REPORT USING OLLAMA =================

@app.post("/ai-report")
def ai_report(data: AIRequest):

    latest = data.latest
    previous = data.previous

    prompt = f"""
    
You are a thoughtful, emotionally intelligent wellness coach speaking to a college student.

Respond in plain text only.
Do not use markdown.
Do not use bullet points.
Do not use headings.
Do not use symbols like # or *.
Write naturally in paragraphs like a human conversation.

Analyze everything carefully and provide:

1. A clear overall summary of their current lifestyle balance.
2. Compare current score with previous score and explain what it suggests.
3. Mention specific lifestyle areas that improved.
4. Mention specific lifestyle areas that declined.
5. Give practical but realistic advice.
6. Encourage them in a warm, supportive tone.

Be detailed but natural. Avoid generic phrases.
    
    Latest Score: {latest.get("score")}
    Previous Score: {previous.get("score") if previous else "None"}
    
    Latest Inputs:
    {latest.get("inputs")}
    
    Previous Inputs:
    {previous.get("inputs") if previous else "None"}
    
    Provide practical advice.
    """

    try:

        response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": "llama3:8b",
                "prompt": prompt,
                "stream": False
            }
        )

        print("OLLAMA STATUS:", response.status_code)
        print("OLLAMA RESPONSE:", response.text)

        result = response.json()

        return {"report": result["response"]}

    except Exception as e:
        print("🔥 AI ERROR:", e)
        return {"report": str(e)}