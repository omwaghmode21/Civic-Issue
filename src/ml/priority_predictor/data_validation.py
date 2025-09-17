import os
import sys
import pandas as pd
from src.logger import logging
from src.exception import CustomException

class DataValidation:
    """
    Class to validate raw dataset before processing. Checks for missing values,
    duplicates, and invalid categories for priority prediction.
    """

    def __init__(self, expected_columns=None, expected_priorities=None):
        """
        expected_columns: list of columns expected in the dataset
        expected_priorities: list of valid priority labels
        """
        self.expected_columns = expected_columns or ["short_description", "category", "location", "admin_priority"]
        self.expected_priorities = expected_priorities or ["Low", "Medium", "High"]

    def validate_columns(self, df: pd.DataFrame):
        """
        Check if all expected columns are present in the dataset
        """
        logging.info("Validating dataset columns")
        missing_cols = [col for col in self.expected_columns if col not in df.columns]
        if missing_cols:
            raise CustomException(f"Missing expected columns: {missing_cols}", sys)
        logging.info("All expected columns are present")

    def validate_missing_values(self, df: pd.DataFrame):
        """
        Check for missing values in the dataset
        """
        logging.info("Checking for missing values")
        missing_count = df.isnull().sum()
        if missing_count.any():
            logging.warning(f"Missing values detected:\n{missing_count}")
            # Optionally, you can drop rows with missing values
            df = df.dropna().reset_index(drop=True)
            logging.info("Dropped rows with missing values")
        else:
            logging.info("No missing values found")
        return df

    def validate_duplicates(self, df: pd.DataFrame):
        """
        Check for duplicate rows in the dataset
        """
        logging.info("Checking for duplicate rows")
        duplicate_count = df.duplicated().sum()
        if duplicate_count > 0:
            logging.warning(f"{duplicate_count} duplicate rows detected. Dropping duplicates.")
            df = df.drop_duplicates().reset_index(drop=True)
        else:
            logging.info("No duplicate rows found")
        return df

    def validate_priority_labels(self, df: pd.DataFrame):
        """
        Ensure all priority labels are valid
        """
        logging.info("Validating admin_priority labels")
        invalid_labels = df[~df["admin_priority"].isin(self.expected_priorities)]
        if not invalid_labels.empty:
            raise CustomException(f"Invalid priority labels found: {invalid_labels['admin_priority'].unique()}", sys)
        logging.info("All priority labels are valid")

    def initiate_data_validation(self, file_path: str) -> pd.DataFrame:
        """
        Main method to run all validations on the dataset
        """
        logging.info("Starting data validation process")
        try:
            df = pd.read_csv(file_path)
            logging.info(f"Dataset loaded successfully from {file_path}")

            # Run validations
            self.validate_columns(df)
            df = self.validate_missing_values(df)
            df = self.validate_duplicates(df)
            self.validate_priority_labels(df)

            logging.info("Data validation completed successfully")
            return df

        except Exception as e:
            logging.error("Error occurred during data validation")
            raise CustomException(e, sys)


if __name__ == "__main__":
    try:
        raw_data_path = os.path.join("artifacts", "priority_raw.csv")
        validator = DataValidation()
        validated_df = validator.initiate_data_validation(raw_data_path)
        print(validated_df.head())
    except Exception as e:
        print(e)
