import os
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..')))
import pandas as pd
from sklearn.model_selection import train_test_split
from dataclasses import dataclass
from src.logger import logging
from src.exception import CustomException

@dataclass
class DataIngestionConfig:
    """
    Configuration for paths where data will be stored after ingestion.
    """
    train_data_path: str = os.path.join("artifacts", "priority_train.csv")
    test_data_path: str = os.path.join("artifacts", "priority_test.csv")
    raw_data_path: str = os.path.join("artifacts", "priority_raw.csv")


class DataIngestion:
    """
    Class to handle ingestion of the raw dataset for priority prediction.
    """

    def __init__(self, raw_dataset_path: str):
        self.ingestion_config = DataIngestionConfig()
        self.raw_dataset_path = raw_dataset_path

    def initiate_data_ingestion(self):
        """
        Reads the raw dataset, saves a copy in artifacts, performs train-test split,
        and returns paths to the train and test datasets.
        """
        logging.info("Entered Data Ingestion component")
        try:
            # Load dataset
            df = pd.read_csv(self.raw_dataset_path)
            logging.info(f"Dataset read successfully from {self.raw_dataset_path}. Shape: {df.shape}")

            # Ensure artifacts directory exists
            os.makedirs(os.path.dirname(self.ingestion_config.raw_data_path), exist_ok=True)

            # Save raw dataset copy
            df.to_csv(self.ingestion_config.raw_data_path, index=False, header=True)
            logging.info(f"Raw dataset saved at {self.ingestion_config.raw_data_path}")

            # Train-test split
            logging.info("Splitting dataset into train and test sets")
            train_set, test_set = train_test_split(df, test_size=0.2, random_state=42, stratify=df["admin_priority"])

            # Save train and test sets
            train_set.to_csv(self.ingestion_config.train_data_path, index=False, header=True)
            test_set.to_csv(self.ingestion_config.test_data_path, index=False, header=True)
            logging.info(f"Train dataset saved at {self.ingestion_config.train_data_path}")
            logging.info(f"Test dataset saved at {self.ingestion_config.test_data_path}")
            logging.info("Data ingestion completed successfully")

            return self.ingestion_config.train_data_path, self.ingestion_config.test_data_path

        except Exception as e:
            logging.error("Error occurred in Data Ingestion")
            raise CustomException(e, sys)