import pandas as pd
from sklearn.model_selection import train_test_split

def load_csv(path: str):
    return pd.read_csv(path)

def prepare_data(df: pd.DataFrame, target: str):
    if target not in df.columns:
        raise ValueError(f'Target column {target} not found in dataframe')
    x = df.drop(columns=[target])
    y= df[target]
    return x, y

def train_test(df, target="Attrition", test_size=0.2, random_state=42):
    x, y = prepare_data(df, target)
    return train_test_split(x, y, test_size=test_size, random_state=random_state, stratify=y)