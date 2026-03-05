import numpy as np
import pandas as pd
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OrdinalEncoder, StandardScaler
from sklearn.impute import SimpleImputer

def detect_feature_types(df: pd.DataFrame):
    numeric = df.select_dtypes(include=[np.number]).columns.tolist()
    categorical = df.select_dtypes(include=["object", "category", "bool"]).columns.tolist()
    return numeric, categorical

def build_preprocessor(df: pd.DataFrame):
    numeric_features, categorical_features = detect_feature_types(df)

    numeric_pipeline = Pipeline([
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler())
    ])

    categorical_pipeline = Pipeline([
        ("imputer", SimpleImputer(strategy="most_frequent")),
        ("encoder", OrdinalEncoder(handle_unknown="use_encoded_value", unknown_value=-1))
    ])

    preprocessor = ColumnTransformer([
        ("num", numeric_pipeline, numeric_features),
        ("cat", categorical_pipeline, categorical_features),
    ])

    return preprocessor
