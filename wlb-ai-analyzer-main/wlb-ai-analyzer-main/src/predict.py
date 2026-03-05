# src/predict.py
"""
Predict + produce Work-Life Balance (WLB) score.

Examples (run from project root):
  # simple probability-based WLB
  python -m src.predict --model models/xgb_model.joblib --input data/test.csv --out predictions_wlb.csv

  # use composite WLB (model + features) with custom weights
  python -m src.predict --model models/xgb_model.joblib --input data/test.csv --out predictions_wlb.csv --composite --w_model 0.5 --w_features 0.5

Notes:
 - If input CSV contains the original target column (e.g. Attrition), the script will drop it automatically.
 - Composite requires feature columns like stress_score, productivity_score, num_meetings and job_hours_per_week (or meetings_per_hour).
"""

import argparse
import os
import joblib
import pandas as pd
import numpy as np

def safe_read_csv(path):
    return pd.read_csv(path)

def get_expected_columns_from_pipeline(pipeline):
    """
    Try to detect expected feature names used by the pipeline.
    Returns a list of column names or None if not found.
    """
    try:
        # If pipeline was saved with a ColumnTransformer as 'preprocess' step
        if hasattr(pipeline, "named_steps") and "preprocess" in pipeline.named_steps:
            preproc = pipeline.named_steps["preprocess"]
            if hasattr(preproc, "feature_names_in_"):
                return list(preproc.feature_names_in_)
        # fallback: model itself may have feature_names_in_
        if hasattr(pipeline, "feature_names_in_"):
            return list(pipeline.feature_names_in_)
    except Exception:
        return None
    return None

def align_input_df(df_raw, expected_cols):
    """
    Reindex input DataFrame to expected columns.
    Missing columns are filled with NaN. Extra columns are dropped.
    If expected_cols is None, return df_raw unchanged.
    """
    if expected_cols is None:
        return df_raw.copy()
    df = df_raw.copy()
    missing = [c for c in expected_cols if c not in df.columns]
    if missing:
        # fill missing with NaN
        for c in missing:
            df[c] = np.nan
    # keep only expected columns in that order
    df = df.reindex(columns=expected_cols)
    return df

def safe_minmax_norm(series):
    s = pd.to_numeric(series, errors="coerce")
    if s.isnull().all():
        return pd.Series(np.zeros(len(s)), index=s.index)
    mn = s.min(skipna=True)
    mx = s.max(skipna=True)
    if pd.isna(mn) or pd.isna(mx) or np.isclose(mx, mn):
        return pd.Series(np.zeros(len(s)), index=s.index)
    return (s - mn) / (mx - mn)

def compute_meetings_per_hour(df):
    # prefer meetings_per_hour if present
    if "meetings_per_hour" in df.columns:
        return pd.to_numeric(df["meetings_per_hour"], errors="coerce")
    # else attempt to compute from num_meetings and job_hours_per_week
    if "num_meetings" in df.columns and "job_hours_per_week" in df.columns:
        nm = pd.to_numeric(df["num_meetings"], errors="coerce")
        hrs = pd.to_numeric(df["job_hours_per_week"], errors="coerce").replace(0, np.nan)
        return (nm / hrs).replace([np.inf, -np.inf], np.nan)
    # missing -> zeros
    return pd.Series(np.zeros(len(df)), index=df.index)

def bucket_wlb(score):
    # score in 0..100
    if pd.isna(score):
        return "Unknown"
    s = float(score)
    if s < 30: return "High Risk"
    if s < 50: return "Medium Risk"
    if s < 70: return "Low Risk"
    return "Healthy"

def main(args):
    if not os.path.exists(args.model):
        raise FileNotFoundError(f"Model not found: {args.model}")
    if not os.path.exists(args.input):
        raise FileNotFoundError(f"Input file not found: {args.input}")

    print("Loading model:", args.model)
    model = joblib.load(args.model)

    print("Reading input:", args.input)
    df_raw = safe_read_csv(args.input)

    # Drop target column if present (common column name is Attrition)
    if args.drop_target and args.drop_target in df_raw.columns:
        print(f"Dropping target column from input: {args.drop_target}")
        df_raw = df_raw.drop(columns=[args.drop_target])

    # Align input to expected columns (best-effort)
    expected_cols = get_expected_columns_from_pipeline(model)
    if expected_cols is not None:
        print("Aligning input to expected columns (best-effort).")
    df_aligned = align_input_df(df_raw, expected_cols)

    # Run predictions
    print("Running model.predict ...")
    preds = model.predict(df_aligned)
    probs = None
    try:
        probs = model.predict_proba(df_aligned)[:, 1]  # probability of class 1 (Left)
    except Exception:
        probs = None

    out = df_raw.copy()  # keep original columns for context
    out["prediction"] = preds
    # numeric predictions as ints
    try:
        out["prediction"] = out["prediction"].astype(int)
    except Exception:
        out["prediction"] = out["prediction"]

    if probs is not None:
        out["probability"] = probs

    # ---------- Compute WLB score ----------
    if args.composite:
        # Composite: mix model component with feature components
        # model_component = 1 - P(left)  (higher = better)
        if probs is not None:
            model_component = 1.0 - np.array(probs)
        else:
            # fallback coarse model component from prediction
            model_component = np.where(out["prediction"] == 0, 0.75, 0.25)

        # feature components
        stress = out["stress_score"] if "stress_score" in out.columns else None
        prod = out["productivity_score"] if "productivity_score" in out.columns else None
        mph = compute_meetings_per_hour(out)

        # normalize features to 0..1 (higher=better for productivity; invert stress & meetings)
        stress_comp = 1.0 - safe_minmax_norm(stress) if stress is not None else pd.Series(np.zeros(len(out)), index=out.index)
        prod_comp = safe_minmax_norm(prod) if prod is not None else pd.Series(np.zeros(len(out)), index=out.index)
        meet_comp = 1.0 - safe_minmax_norm(mph) if mph is not None else pd.Series(np.zeros(len(out)), index=out.index)

        # Compose weights
        w_model = float(args.w_model)
        w_features = float(args.w_features)
        # split feature weight into components (adjustable)
        w_stress = float(args.w_stress) * w_features
        w_prod = float(args.w_prod) * w_features
        w_meet = float(args.w_meet) * w_features

        # Ensure sums add roughly to 1 (not enforced strictly here)
        composite = (w_model * model_component +
                     w_stress * stress_comp.values +
                     w_prod * prod_comp.values +
                     w_meet * meet_comp.values)

        # scale composite to 0..100
        out["wlb_score"] = (composite * 100.0).round(3)
        out["wlb_method"] = "composite"
    else:
        # Simple probability-based score: wlb = (1 - P(left)) * 100
        if probs is not None:
            out["wlb_score"] = ((1.0 - np.array(probs)) * 100.0).round(3)
            out["wlb_method"] = "probability"
        else:
            # fallback: map preds to coarse scores
            out["wlb_score"] = out["prediction"].map({0: 75, 1: 25})
            out["wlb_method"] = "coarse_prediction"

    # Add human-readable label and risk bucket
    label_map = {0: "Stayed", 1: "Left"}
    out["predicted_label"] = out["prediction"].map(label_map).fillna(out["prediction"].astype(str))
    out["wlb_risk"] = out["wlb_score"].apply(bucket_wlb)

    # Optionally round probability
    if "probability" in out.columns:
        out["probability"] = out["probability"].round(6)

    # Save
    print("Writing output to:", args.out)
    out.to_csv(args.out, index=False)
    print("Done. WLB scores added. Columns now include: prediction, probability (if available), wlb_score, predicted_label, wlb_risk")

if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--model", required=True, help="Path to saved joblib pipeline (e.g. models/xgb_model.joblib)")
    p.add_argument("--input", required=True, help="CSV with input features (one row per sample)")
    p.add_argument("--out", default="predictions_wlb.csv", help="Output CSV path")
    p.add_argument("--drop-target", default="Attrition", help="Name of target column in input to drop (e.g. Attrition)")
    p.add_argument("--composite", action="store_true", help="Compute composite WLB (model + features) instead of probability-only")
    # composite weights (they are fractions used to split the feature weight)
    p.add_argument("--w_model", type=float, default=0.5, help="Weight for model component (0..1)")
    p.add_argument("--w_features", type=float, default=0.5, help="Total weight for all feature components (0..1)")
    p.add_argument("--w_stress", type=float, default=0.25, help="Relative fraction of feature weight for stress (0..1)")
    p.add_argument("--w_prod", type=float, default=0.5, help="Relative fraction of feature weight for productivity (0..1)")
    p.add_argument("--w_meet", type=float, default=0.25, help="Relative fraction of feature weight for meetings (0..1)")
    args = p.parse_args()
    main(args)
