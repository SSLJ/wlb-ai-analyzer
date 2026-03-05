from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier
from sklearn.metrics import accuracy_score, f1_score, precision_score, recall_score, roc_auc_score

def get_random_forest():
    return RandomForestClassifier(
        n_estimators=200,
        random_state=42,
        class_weight="balanced"
    )

def get_xgboost():
    return XGBClassifier(
        n_estimators=300,
        max_depth=6,
        learning_rate=0.05,
        n_jobs=1,
        eval_metric="logloss"
    )

def evaluate(model, x_test, y_test):
    y_pred = model.predict(x_test)

    try:
        y_proba = model.predict_proba(x_test)[:, 1]
        roc = roc_auc_score(y_test, y_proba)
    except:
        roc = None

    return {
        "accuracy": accuracy_score(y_test, y_pred),
        "f1": f1_score(y_test, y_pred),
        "precision": precision_score(y_test, y_pred),
        "recall": recall_score(y_test, y_pred),
        "roc_auc": roc
    }
