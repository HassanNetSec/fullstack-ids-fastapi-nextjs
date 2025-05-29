# app.py
from fastapi import FastAPI, UploadFile, File
import pandas as pd
import numpy as np
import tensorflow as tf
import joblib
from io import StringIO

app = FastAPI()

# Load the saved model and scaler at startup
model = tf.keras.models.load_model("cicids_anomaly_model.h5")
scaler = joblib.load("scaler.save")

def preprocess_input(df):
    df.columns = df.columns.str.strip()
    df = df.loc[:, ~df.columns.duplicated()]
    df.replace([np.inf, -np.inf], np.nan, inplace=True)
    df.dropna(inplace=True)

    if 'Label' in df.columns:
        df.drop(columns=['Label'], inplace=True)

    for col in df.select_dtypes(include=['object']).columns:
        df[col] = df[col].astype('category').cat.codes

    X_scaled = scaler.transform(df)
    return df, X_scaled

@app.post("/detect_alert")
async def alert_detect(file: UploadFile = File(...)):
    content = await file.read()
    df = pd.read_csv(StringIO(content.decode("utf-8")))
    
    original_df, X_scaled = preprocess_input(df)

    predictions = model.predict(X_scaled)
    binary_preds = (predictions > 0.5).astype(int)

    original_df['Prediction'] = binary_preds
    counts = original_df['Prediction'].value_counts().to_dict()

    # Save to CSV
    original_df.to_csv("predicted_output.csv", index=False)

    return {
        "prediction_counts": counts,
        "message": "Prediction complete. Results saved to predicted_output.csv."
    }
