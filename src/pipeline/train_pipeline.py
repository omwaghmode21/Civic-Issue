#!/usr/bin/env python3
"""
Training Pipeline for Priority Prediction Model
Orchestrates the complete ML training workflow:
Ingestion → Validation → Transformation → Training → Save Model
"""

import os
import sys
import pandas as pd
from datetime import datetime

# Add project root to path
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from src.logger import logging
from src.exception import CustomException
from src.ml.priority_predictor.data_ingestion import DataIngestion
from src.ml.priority_predictor.data_validation import DataValidation
from src.ml.priority_predictor.data_transformation import DataTransformation
from src.ml.priority_predictor.model_trainer import ModelTrainer
from src.utils.utils import save_object

class TrainingPipeline:
    """
    Complete training pipeline for priority prediction model
    """
    
    def __init__(self, raw_dataset_path: str):
        """
        Initialize the training pipeline
        
        Args:
            raw_dataset_path (str): Path to the raw dataset CSV file
        """
        self.raw_dataset_path = raw_dataset_path
        self.artifacts_dir = "artifacts"
        self.models_dir = os.path.join(self.artifacts_dir, "models")
        self.preprocessors_dir = os.path.join(self.artifacts_dir, "preprocessors")
        
        # Create necessary directories
        os.makedirs(self.models_dir, exist_ok=True)
        os.makedirs(self.preprocessors_dir, exist_ok=True)
        
        # Initialize components
        self.data_ingestion = DataIngestion(raw_dataset_path)
        self.data_validation = DataValidation()
        self.data_transformation = DataTransformation()
        self.model_trainer = ModelTrainer()
        
        logging.info("Training pipeline initialized successfully")

    def run_training_pipeline(self):
        """
        Execute the complete training pipeline
        
        Returns:
            dict: Training results including best model info and metrics
        """
        try:
            logging.info("=" * 50)
            logging.info("STARTING TRAINING PIPELINE")
            logging.info("=" * 50)
            
            # Step 1: Data Ingestion
            logging.info("Step 1: Data Ingestion")
            train_data_path, test_data_path = self.data_ingestion.initiate_data_ingestion()
            logging.info(f"✓ Data ingestion completed. Train: {train_data_path}, Test: {test_data_path}")
            
            # Step 2: Data Validation
            logging.info("Step 2: Data Validation")
            raw_data_path = os.path.join(self.artifacts_dir, "priority_raw.csv")
            validated_df = self.data_validation.initiate_data_validation(raw_data_path)
            logging.info(f"✓ Data validation completed. Shape: {validated_df.shape}")
            
            # Step 3: Data Transformation
            logging.info("Step 3: Data Transformation")
            X_transformed, y_transformed = self.data_transformation.transform_data(validated_df, fit=True)
            logging.info(f"✓ Data transformation completed. Features: {X_transformed.shape}, Labels: {y_transformed.shape}")
            
            # Step 4: Train-Test Split for Model Training
            logging.info("Step 4: Preparing train-test split for model training")
            from sklearn.model_selection import train_test_split
            
            # Use the original train/test splits from ingestion
            train_df = pd.read_csv(train_data_path)
            test_df = pd.read_csv(test_data_path)
            
            # Prepare features and labels for model training (without transformation)
            X_train = train_df[["short_description", "category", "location"]]
            y_train = train_df["admin_priority"]
            X_test = test_df[["short_description", "category", "location"]]
            y_test = test_df["admin_priority"]
            
            # Encode labels for model training
            from sklearn.preprocessing import LabelEncoder
            label_encoder = LabelEncoder()
            y_train_encoded = label_encoder.fit_transform(y_train)
            y_test_encoded = label_encoder.transform(y_test)
            
            logging.info(f"✓ Train-test split prepared. Train: {X_train.shape}, Test: {X_test.shape}")
            
            # Step 5: Model Training
            logging.info("Step 5: Model Training")
            best_model_name, best_model, results = self.model_trainer.train_models(
                X_train, X_test, y_train_encoded, y_test_encoded
            )
            logging.info(f"✓ Model training completed. Best model: {best_model_name}")
            
            # Step 6: Save Preprocessors
            logging.info("Step 6: Saving Preprocessors")
            preprocessor_path = os.path.join(self.preprocessors_dir, "preprocessor.pkl")
            label_encoder_path = os.path.join(self.preprocessors_dir, "label_encoder.pkl")
            
            self.data_transformation.save_preprocessor(preprocessor_path)
            self.data_transformation.save_label_encoder(label_encoder_path)
            logging.info(f"✓ Preprocessors saved successfully")
            
            # Step 7: Save Training Metadata
            logging.info("Step 7: Saving Training Metadata")
            training_metadata = {
                "timestamp": datetime.now().isoformat(),
                "raw_dataset_path": self.raw_dataset_path,
                "best_model_name": best_model_name,
                "model_results": results,
                "feature_shape": X_transformed.shape,
                "label_shape": y_transformed.shape,
                "train_shape": X_train.shape,
                "test_shape": X_test.shape
            }
            
            metadata_path = os.path.join(self.artifacts_dir, "training_metadata.pkl")
            save_object(metadata_path, training_metadata)
            logging.info(f"✓ Training metadata saved to {metadata_path}")
            
            # Final Summary
            logging.info("=" * 50)
            logging.info("TRAINING PIPELINE COMPLETED SUCCESSFULLY")
            logging.info("=" * 50)
            logging.info(f"Best Model: {best_model_name}")
            logging.info(f"Best Accuracy: {results[best_model_name]:.4f}")
            logging.info(f"All Models: {results}")
            logging.info(f"Artifacts saved in: {self.artifacts_dir}")
            
            return {
                "success": True,
                "best_model_name": best_model_name,
                "best_model": best_model,
                "results": results,
                "metadata": training_metadata
            }
            
        except Exception as e:
            logging.error("Error occurred in training pipeline")
            logging.error(str(e))
            raise CustomException(e, sys)

def main():
    """
    Main function to run the training pipeline
    """
    try:
        # Define raw dataset path
        raw_dataset_path = os.path.join("notebooks", "data", "raw", "Dummy_DataSet.csv")
        
        # Check if raw dataset exists
        if not os.path.exists(raw_dataset_path):
            raise FileNotFoundError(f"Raw dataset not found at: {raw_dataset_path}")
        
        # Initialize and run training pipeline
        pipeline = TrainingPipeline(raw_dataset_path)
        results = pipeline.run_training_pipeline()
        
        print("\n" + "=" * 60)
        print("TRAINING PIPELINE COMPLETED SUCCESSFULLY!")
        print("=" * 60)
        print(f"Best Model: {results['best_model_name']}")
        print(f"Best Accuracy: {results['results'][results['best_model_name']]:.4f}")
        print(f"All Model Results:")
        for model_name, accuracy in results['results'].items():
            print(f"  - {model_name}: {accuracy:.4f}")
        print(f"\nArtifacts saved in: artifacts/")
        print("=" * 60)
        
    except Exception as e:
        print(f"Training pipeline failed: {e}")
        import traceback
        traceback.print_exc()
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main())
