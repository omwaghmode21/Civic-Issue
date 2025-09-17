# src/pipeline/model_trainer.py

import os
import sys
import pandas as pd
import numpy as np
from src.logger import logging
from src.exception import CustomException
from src.utils.utils import save_object
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, LabelEncoder
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier
from sklearn.utils.class_weight import compute_class_weight

class ModelTrainerConfig:
    """
    Configuration for model training paths
    """
    def __init__(self):
        self.model_dir = os.path.join("artifacts", "models")
        os.makedirs(self.model_dir, exist_ok=True)
        self.random_forest_path = os.path.join(self.model_dir, "random_forest.pkl")
        self.logistic_path = os.path.join(self.model_dir, "logistic_regression.pkl")
        self.xgb_path = os.path.join(self.model_dir, "xgb_model.pkl")

class ModelTrainer:
    def __init__(self):
        self.config = ModelTrainerConfig()

    def train_models(self, X_train, X_test, y_train, y_test):
        """
        Train multiple models with preprocessing pipeline and return best model
        """
        try:
            logging.info("Starting model training...")

            # Preprocessing
            text_transformer = TfidfVectorizer(stop_words="english")
            categorical_transformer = OneHotEncoder(handle_unknown="ignore")

            preprocessor = ColumnTransformer(
                transformers=[
                    ("text", text_transformer, "short_description"),
                    ("cat", categorical_transformer, ["category", "location"])
                ]
            )

            # Models (add class imbalance handling)
            models = {
                "Random Forest": RandomForestClassifier(
                    n_estimators=200,
                    random_state=42,
                    class_weight="balanced_subsample",
                ),
                "XGBoost": XGBClassifier(
                    use_label_encoder=False,
                    eval_metric="mlogloss",
                    objective="multi:softprob",
                    random_state=42,
                ),
                "Logistic Regression": LogisticRegression(
                    max_iter=1000,
                    class_weight="balanced",
                ),
            }

            results = {}
            trained_pipelines = {}

            # Compute class weights for y_train (used for XGBoost sample weights)
            unique_classes = np.unique(y_train)
            class_weights = compute_class_weight(
                class_weight="balanced", classes=unique_classes, y=y_train
            )
            class_weight_map = {cls: w for cls, w in zip(unique_classes, class_weights)}

            for name, clf in models.items():
                logging.info(f"Training {name}...")
                pipe = Pipeline([
                    ("preprocessor", preprocessor),
                    ("classifier", clf)
                ])
                if name == "XGBoost":
                    sample_weight = np.array([class_weight_map[c] for c in y_train])
                    pipe.fit(X_train, y_train, classifier__sample_weight=sample_weight)
                else:
                    pipe.fit(X_train, y_train)
                y_pred = pipe.predict(X_test)
                acc = accuracy_score(y_test, y_pred)
                results[name] = acc
                trained_pipelines[name] = pipe
                logging.info(f"{name} Accuracy: {acc:.4f}")
                logging.info(f"\n{classification_report(y_test, y_pred)}")

            # Select best model
            best_model_name = max(results, key=results.get)
            best_model = trained_pipelines[best_model_name]
            logging.info(f"Best Model: {best_model_name} with Accuracy: {results[best_model_name]:.4f}")

            # Save models
            save_object(self.config.random_forest_path, trained_pipelines["Random Forest"])
            save_object(self.config.xgb_path, trained_pipelines["XGBoost"])
            save_object(self.config.logistic_path, trained_pipelines["Logistic Regression"])
            logging.info("All models saved successfully in artifacts/models")

            return best_model_name, best_model, results

        except Exception as e:
            logging.error("Error occurred in model training")
            raise CustomException(e, sys)


if __name__ == "__main__":
    try:
        # Sample usage with raw CSV
        raw_data_path = os.path.join("artifacts", "priority_raw.csv")
        df = pd.read_csv(raw_data_path)

        X = df[["short_description", "category", "location"]]
        y = df["admin_priority"]
        label_encoder = LabelEncoder()
        y_encoded = label_encoder.fit_transform(y)

        X_train, X_test, y_train, y_test = train_test_split(
            X, y_encoded, test_size=0.3, random_state=42, stratify=y_encoded
        )

        trainer = ModelTrainer()
        best_model_name, best_model, results = trainer.train_models(X_train, X_test, y_train, y_test)
        print(f"Best Model: {best_model_name}")
        print(results)

    except Exception as e:
        print(e)
