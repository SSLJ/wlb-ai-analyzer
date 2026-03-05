import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score

# Encode categorical columns
df=pd.read_csv(r"C:\Users\HP\Desktop\React\wlb-prediction\data\Wellbeing_and_lifestyle_data_Kaggle.csv")
le = LabelEncoder()
for col in df.columns:
    if df[col].dtype == 'object':
        df[col] = le.fit_transform(df[col])

# Create 3-class target
def label_score(x):
    if x < 600:
        return 0   # Bad
    elif x < 700:
        return 1   # Average
    else:
        return 2   # Good

df["TARGET"] = df["WORK_LIFE_BALANCE_SCORE"].apply(label_score)
df.drop("WORK_LIFE_BALANCE_SCORE", axis=1, inplace=True)

x_rf = df.drop("TARGET", axis=1)
y_rf = df["TARGET"]

X_train_rf, X_test_rf, y_train_rf, y_test_rf = train_test_split(
    x_rf, y_rf,
    test_size=0.30,
    random_state=42,
    stratify=y_rf
)

model = RandomForestClassifier(
    n_estimators=500,
    max_depth=25,
    max_features="sqrt",
    random_state=42,
    n_jobs=-1
)

model.fit(X_train_rf, y_train_rf)
y_pred_rf = model.predict(X_test_rf)