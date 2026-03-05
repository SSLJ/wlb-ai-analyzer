import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier


def train_model(data_path=r"C:\Users\HP\Desktop\React\wlb-prediction\data\Wellbeing_and_lifestyle_data_Kaggle.csv"):

    # Load dataset
    df = pd.read_csv(data_path)
    df = pd.read_csv(data_path)

    # REMOVE TIMESTAMP COLUMN
    if "Timestamp" in df.columns:
        df.drop(columns=["Timestamp"], inplace=True)

    encoders = {}

    # Encode categorical columns
    for col in df.columns:
        if df[col].dtype == 'object':
            le = LabelEncoder()
            df[col] = le.fit_transform(df[col])
            encoders[col] = le

    # Create target
    def label_score(x):
        if x < 600:
            return 0
        elif x < 700:
            return 1
        else:
            return 2

    df["TARGET"] = df["WORK_LIFE_BALANCE_SCORE"].apply(label_score)
    df.drop("WORK_LIFE_BALANCE_SCORE", axis=1, inplace=True)

    X = df.drop("TARGET", axis=1)
    y = df["TARGET"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y,
        test_size=0.30,
        random_state=42,
        stratify=y
    )

    model = RandomForestClassifier(
        n_estimators=500,
        max_depth=25,
        max_features="sqrt",
        random_state=42,
        n_jobs=-1
    )

    model.fit(X_train, y_train)

    # Save artifacts
    joblib.dump(model, "model.pkl")
    joblib.dump(encoders, "encoders.pkl")
    joblib.dump(X.columns.tolist(), "backend/columns.pkl")

    print("✅ Model trained and saved")