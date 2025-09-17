# src/ml/priority_predictor/data_transformation.py

import os
import sys
import pandas as pd
import numpy as np
from sklearn.preprocessing import OneHotEncoder, LabelEncoder
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from src.logger import logging
from src.exception import CustomException

class DataTransformation:
    """
    Class to handle data transformation:
    - Text vectorization using TF-IDF
    - One-hot encoding of categorical features
    - Optional: scaling or other feature engineering
    """

    def __init__(self):
        self.preprocessor = None
        self.label_encoder = LabelEncoder()

    def create_preprocessor(self, categorical_features, text_feature):
        """
        Create a ColumnTransformer for preprocessing
        """
        try:
            logging.info("Creating ColumnTransformer for preprocessing")

            text_transformer = TfidfVectorizer(stop_words="english", max_features=500)
            categorical_transformer = OneHotEncoder(handle_unknown="ignore")

            self.preprocessor = ColumnTransformer(
                transformers=[
                    ("text", text_transformer, text_feature),
                    ("cat", categorical_transformer, categorical_features)
                ]
            )
            logging.info("Preprocessor created successfully")

        except Exception as e:
            logging.error("Error in creating preprocessor")
            raise CustomException(e, sys)

    def transform_data(self, df: pd.DataFrame, fit: bool = True):
        """
        Transform the dataset using the preprocessor
        Returns X (features) and y (labels)
        """
        try:
            logging.info("Starting data transformation")

            # Encode labels
            y = self.label_encoder.fit_transform(df["admin_priority"]) if fit else self.label_encoder.transform(df["admin_priority"])
            
            # Define features
            X = df[["short_description", "category", "location"]]
            categorical_features = ["category", "location"]
            text_feature = "short_description"

            # Create preprocessor if not exists
            if self.preprocessor is None:
                self.create_preprocessor(categorical_features, text_feature)

            # Fit or transform
            X_transformed = self.preprocessor.fit_transform(X) if fit else self.preprocessor.transform(X)

            logging.info("Data transformation completed successfully")
            return X_transformed, y

        except Exception as e:
            logging.error("Error occurred during data transformation")
            raise CustomException(e, sys)

    def save_preprocessor(self, file_path):
        """
        Save the preprocessor for inference
        """
        try:
            import dill
            os.makedirs(os.path.dirname(file_path), exist_ok=True)
            with open(file_path, "wb") as f:
                dill.dump(self.preprocessor, f)
            logging.info(f"Preprocessor saved to {file_path}")
        except Exception as e:
            logging.error("Error saving preprocessor")
            raise CustomException(e, sys)

    def save_label_encoder(self, file_path):
        """
        Save the label encoder for inference
        """
        try:
            import dill
            os.makedirs(os.path.dirname(file_path), exist_ok=True)
            with open(file_path, "wb") as f:
                dill.dump(self.label_encoder, f)
            logging.info(f"Label encoder saved to {file_path}")
        except Exception as e:
            logging.error("Error saving label encoder")
            raise CustomException(e, sys)


if __name__ == "__main__":
    try:
        raw_data_path = os.path.join("artifacts", "priority_raw.csv")
        df = pd.read_csv(raw_data_path)

        from .data_validation import DataValidation
        validator = DataValidation()
        df = validator.initiate_data_validation(raw_data_path)

        transformer = DataTransformation()
        X, y = transformer.transform_data(df)

        print(f"Transformed feature shape: {X.shape}")
        print(f"Label shape: {y.shape}")

        # Save preprocessor and label encoder
        transformer.save_preprocessor(os.path.join("artifacts", "preprocessor.pkl"))
        transformer.save_label_encoder(os.path.join("artifacts", "label_encoder.pkl"))

    except Exception as e:
        print(e)
