#!/usr/bin/env python3
"""
Prediction Pipeline for Priority Prediction Model
Handles the complete prediction workflow:
Load Model → Transform New Data → Predict
"""

import os
import sys
import pandas as pd
import numpy as np
from datetime import datetime

# Add project root to path
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from src.logger import logging
from src.exception import CustomException
from src.utils.utils import load_object


class CustomData:
    """
    Container for a single civic issue's raw features and
    a helper to convert them into a pandas DataFrame aligned to training.
    """

    def __init__(self,
                 short_description: str,
                 category: str,
                 location: str,
                 **kwargs):
        # Accept extra kwargs for forward compatibility; ignore them here
        self.short_description = short_description
        self.category = category
        self.location = location

    def get_data_as_dataframe(self) -> pd.DataFrame:
        """
        Return a DataFrame with columns aligned exactly like training.
        Training used columns in this order:
        - short_description (text)
        - category (categorical)
        - location (categorical)
        """
        data = {
            "short_description": [self.short_description],
            "category": [self.category],
            "location": [self.location],
        }
        df = pd.DataFrame(data)
        # Ensure exact column order
        return df[["short_description", "category", "location"]]


class PredictPipeline:
    """
    Lightweight prediction pipeline that loads a trained model pipeline
    and produces predictions with class probabilities.
    """

    def __init__(self, artifacts_dir: str = "artifacts", model_name: str = "random_forest"):
        self.artifacts_dir = artifacts_dir
        self.models_dir = os.path.join(artifacts_dir, "models")
        self.preprocessors_dir = os.path.join(artifacts_dir, "preprocessors")

        self.model_name = model_name
        self.model = None
        self.label_encoder = None

        self._load_model_and_encoder()

    def _load_model_and_encoder(self):
        try:
            # Load the trained sklearn Pipeline (includes preprocessor + classifier)
            model_path = os.path.join(self.models_dir, f"{self.model_name}.pkl")
            if not os.path.exists(model_path):
                raise FileNotFoundError(f"Model artifact not found: {model_path}")
            self.model = load_object(model_path)
            logging.info(f"✓ Model loaded: {self.model_name}")

            # Best-effort: load label encoder if present
            le_path = os.path.join(self.preprocessors_dir, "label_encoder.pkl")
            if os.path.exists(le_path):
                try:
                    self.label_encoder = load_object(le_path)
                    logging.info("✓ Label encoder loaded")
                except Exception as e:
                    logging.warning(f"Could not load label encoder: {e}")
        except Exception as e:
            raise CustomException(e, sys)

    def _ensure_columns(self, df: pd.DataFrame) -> pd.DataFrame:
        required = ["short_description", "category", "location"]
        missing = [c for c in required if c not in df.columns]
        if missing:
            raise CustomException(f"Missing required columns: {missing}", sys)
        # Reorder to match training
        return df[required]

    def predict(self, df: pd.DataFrame) -> dict:
        """
        Run preprocessing + model prediction and return structured output.

        Returns keys: prediction, confidence, class_probabilities, model_used
        """
        try:
            if self.model is None:
                self._load_model_and_encoder()

            input_df = self._ensure_columns(df)

            # Predict and probabilities
            y_pred_encoded = self.model.predict(input_df)
            y_proba = self.model.predict_proba(input_df)

            # Extract classifier classes (encoded labels)
            if hasattr(self.model, "named_steps") and "classifier" in self.model.named_steps:
                encoded_classes = self.model.named_steps["classifier"].classes_
            else:
                # Fallback: infer from proba shape
                encoded_classes = np.arange(y_proba.shape[1])

            # Map encoded class ids to human-readable labels
            def decode_label(class_id: int) -> str:
                if self.label_encoder is not None:
                    try:
                        return str(self.label_encoder.inverse_transform([class_id])[0])
                    except Exception:
                        pass
                # Safe fallback
                mapping_fallback = {0: "High", 1: "Low", 2: "Medium"}
                return mapping_fallback.get(int(class_id), f"class_{class_id}")

            # Single-row expectation from test usage; handle generally anyway
            proba_row = y_proba[0]
            encoded_pred = int(y_pred_encoded[0])

            # Build probabilities dict
            class_probabilities = {}
            for j, class_id in enumerate(encoded_classes):
                label = decode_label(int(class_id))
                class_probabilities[label] = float(proba_row[j])

            prediction_label = decode_label(encoded_pred)
            confidence = float(np.max(proba_row))

            return {
                "prediction": prediction_label,
                "confidence": confidence,
                "class_probabilities": class_probabilities,
                "model_used": self.model_name,
            }
        except Exception as e:
            logging.error("Error during prediction")
            raise CustomException(e, sys)


# Explicit exports for test import
__all__ = ["CustomData", "PredictPipeline"]

class PredictionPipeline:
    """
    Complete prediction pipeline for priority prediction model
    """
    
    def __init__(self, artifacts_dir: str = "artifacts"):
        """
        Initialize the prediction pipeline
        
        Args:
            artifacts_dir (str): Directory containing saved models and preprocessors
        """
        self.artifacts_dir = artifacts_dir
        self.models_dir = os.path.join(artifacts_dir, "models")
        self.preprocessors_dir = os.path.join(artifacts_dir, "preprocessors")
        
        # Initialize components
        self.preprocessor = None
        self.label_encoder = None
        self.model = None
        self.model_name = None
        
        # Check if artifacts exist
        self._check_artifacts()
        
        logging.info("Prediction pipeline initialized successfully")

    def _check_artifacts(self):
        """
        Check if required artifacts exist
        """
        required_files = [
            os.path.join(self.models_dir, "random_forest.pkl"),
            os.path.join(self.models_dir, "xgb_model.pkl"),
            os.path.join(self.models_dir, "logistic_regression.pkl"),
            os.path.join(self.preprocessors_dir, "preprocessor.pkl"),
            os.path.join(self.preprocessors_dir, "label_encoder.pkl")
        ]
        
        missing_files = [f for f in required_files if not os.path.exists(f)]
        if missing_files:
            raise FileNotFoundError(f"Missing required artifacts: {missing_files}")

    def load_models(self, model_name: str = "random_forest"):
        """
        Load the specified model and preprocessors
        
        Args:
            model_name (str): Name of the model to load ('random_forest', 'xgb_model', 'logistic_regression')
        """
        try:
            logging.info(f"Loading model: {model_name}")
            
            # Load preprocessor
            preprocessor_path = os.path.join(self.preprocessors_dir, "preprocessor.pkl")
            self.preprocessor = load_object(preprocessor_path)
            logging.info("✓ Preprocessor loaded successfully")
            
            # Load label encoder
            label_encoder_path = os.path.join(self.preprocessors_dir, "label_encoder.pkl")
            self.label_encoder = load_object(label_encoder_path)
            logging.info("✓ Label encoder loaded successfully")
            
            # Load model
            model_path = os.path.join(self.models_dir, f"{model_name}.pkl")
            self.model = load_object(model_path)
            self.model_name = model_name
            logging.info(f"✓ Model {model_name} loaded successfully")
            
        except Exception as e:
            logging.error(f"Error loading model {model_name}")
            raise CustomException(e, sys)

    def predict_single(self, short_description: str, category: str, location: str):
        """
        Predict priority for a single issue
        
        Args:
            short_description (str): Issue description
            category (str): Issue category
            location (str): Issue location
            
        Returns:
            dict: Prediction results
        """
        try:
            if self.model is None:
                raise ValueError("Model not loaded. Call load_models() first.")
            
            # Create DataFrame for single prediction
            data = {
                'short_description': [short_description],
                'category': [category],
                'location': [location]
            }
            df = pd.DataFrame(data)
            
            # Make prediction (model includes preprocessor)
            prediction_encoded = self.model.predict(df)[0]
            prediction_proba = self.model.predict_proba(df)[0]
            
            # Get confidence score
            confidence = float(np.max(prediction_proba))
            
            # Get probability for each class
            # Since the model was trained with encoded labels, we need to map back to original labels
            # The model trainer uses LabelEncoder, so we need to get the classes from the model
            try:
                # Preferred: map via saved label encoder if available
                if self.label_encoder is not None and hasattr(self.model.named_steps['classifier'], 'classes_'):
                    encoded_classes = self.model.named_steps['classifier'].classes_
                    class_names = self.label_encoder.inverse_transform(encoded_classes)
                elif hasattr(self.model.named_steps['classifier'], 'classes_'):
                    encoded_classes = self.model.named_steps['classifier'].classes_
                    # Safe fallback mapping if encoder missing
                    fallback = {0: 'High', 1: 'Low', 2: 'Medium'}
                    class_names = np.array([fallback.get(int(i), f'class_{int(i)}') for i in encoded_classes])
                else:
                    class_names = np.array(['High', 'Low', 'Medium'])

                class_probabilities = {}
                for i, class_name in enumerate(class_names):
                    class_probabilities[str(class_name)] = float(prediction_proba[i])

                # Get prediction label
                if self.label_encoder is not None:
                    prediction = str(self.label_encoder.inverse_transform([prediction_encoded])[0])
                else:
                    prediction = str(class_names[prediction_encoded])

            except Exception as e:
                logging.warning(f"Could not map prediction classes: {e}")
                # Fallback to encoded prediction
                prediction = str(prediction_encoded)
                class_probabilities = {f"class_{i}": float(prob) for i, prob in enumerate(prediction_proba)}
            
            result = {
                'prediction': prediction,
                'confidence': confidence,
                'class_probabilities': class_probabilities,
                'model_used': self.model_name
            }
            
            logging.info(f"Prediction completed: {prediction} (confidence: {confidence:.3f})")
            return result
            
        except Exception as e:
            logging.error("Error in single prediction")
            raise CustomException(e, sys)

    def predict_batch(self, data_list: list):
        """
        Predict priority for multiple issues
        
        Args:
            data_list (list): List of dictionaries with keys 'short_description', 'category', 'location'
            
        Returns:
            list: List of prediction results
        """
        try:
            if self.model is None:
                raise ValueError("Model not loaded. Call load_models() first.")
            
            # Create DataFrame for batch prediction
            df = pd.DataFrame(data_list)
            
            # Validate required columns
            required_columns = ['short_description', 'category', 'location']
            missing_columns = [col for col in required_columns if col not in df.columns]
            if missing_columns:
                raise ValueError(f"Missing required columns: {missing_columns}")
            
            # Make predictions (model includes preprocessor)
            predictions_encoded = self.model.predict(df)
            predictions_proba = self.model.predict_proba(df)
            
            # Get classes for mapping
            try:
                if hasattr(self.model.named_steps['classifier'], 'classes_'):
                    encoded_classes = self.model.named_steps['classifier'].classes_
                    if self.label_encoder is not None:
                        classes = self.label_encoder.inverse_transform(encoded_classes)
                    else:
                        fallback = {0: 'High', 1: 'Low', 2: 'Medium'}
                        classes = np.array([fallback.get(int(i), f'class_{int(i)}') for i in encoded_classes])
                else:
                    classes = np.array(['High', 'Low', 'Medium'])
            except:
                classes = np.array(['High', 'Low', 'Medium'])
            
            # Prepare results
            results = []
            for i, (prediction_encoded, proba) in enumerate(zip(predictions_encoded, predictions_proba)):
                confidence = float(np.max(proba))
                
                # Get probability for each class
                class_probabilities = {}
                for j, class_name in enumerate(classes):
                    class_probabilities[class_name] = float(proba[j])
                
                # Get prediction label
                if self.label_encoder is not None:
                    prediction = str(self.label_encoder.inverse_transform([int(prediction_encoded)])[0])
                else:
                    prediction = str(classes[int(prediction_encoded)])
                
                result = {
                    'index': i,
                    'input': data_list[i],
                    'prediction': prediction,
                    'confidence': confidence,
                    'class_probabilities': class_probabilities,
                    'model_used': self.model_name
                }
                results.append(result)
            
            logging.info(f"Batch prediction completed for {len(data_list)} items")
            return results
            
        except Exception as e:
            logging.error("Error in batch prediction")
            raise CustomException(e, sys)

    def predict_from_csv(self, csv_path: str, output_path: str = None):
        """
        Predict priority for issues from a CSV file
        
        Args:
            csv_path (str): Path to input CSV file
            output_path (str): Path to save predictions (optional)
            
        Returns:
            pd.DataFrame: DataFrame with predictions
        """
        try:
            if self.model is None:
                raise ValueError("Model not loaded. Call load_models() first.")
            
            # Load CSV
            df = pd.read_csv(csv_path)
            logging.info(f"Loaded CSV with {len(df)} rows from {csv_path}")
            
            # Validate required columns
            required_columns = ['short_description', 'category', 'location']
            missing_columns = [col for col in required_columns if col not in df.columns]
            if missing_columns:
                raise ValueError(f"Missing required columns: {missing_columns}")
            
            # Make predictions (model includes preprocessor)
            predictions_encoded = self.model.predict(df[required_columns])
            predictions_proba = self.model.predict_proba(df[required_columns])
            
            # Get classes for mapping
            try:
                if hasattr(self.model.named_steps['classifier'], 'classes_'):
                    encoded_classes = self.model.named_steps['classifier'].classes_
                    if self.label_encoder is not None:
                        classes = self.label_encoder.inverse_transform(encoded_classes)
                    else:
                        fallback = {0: 'High', 1: 'Low', 2: 'Medium'}
                        classes = np.array([fallback.get(int(i), f'class_{int(i)}') for i in encoded_classes])
                else:
                    classes = np.array(['High', 'Low', 'Medium'])
            except:
                classes = np.array(['High', 'Low', 'Medium'])
            
            # Map predictions to class names
            predictions = classes[predictions_encoded]
            
            # Add predictions to DataFrame
            df['predicted_priority'] = predictions
            df['confidence'] = np.max(predictions_proba, axis=1)
            
            # Add individual class probabilities
            for i, class_name in enumerate(classes):
                df[f'prob_{class_name.lower()}'] = predictions_proba[:, i]
            
            # Save results if output path provided
            if output_path:
                df.to_csv(output_path, index=False)
                logging.info(f"Predictions saved to {output_path}")
            
            logging.info(f"CSV prediction completed for {len(df)} rows")
            return df
            
        except Exception as e:
            logging.error("Error in CSV prediction")
            raise CustomException(e, sys)

def main():
    """
    Main function to demonstrate prediction pipeline usage
    """
    try:
        # Initialize prediction pipeline
        pipeline = PredictionPipeline()
        
        # Load the best model (you can change this to any available model)
        pipeline.load_models("random_forest")
        
        print("\n" + "=" * 60)
        print("PREDICTION PIPELINE DEMO")
        print("=" * 60)
        
        # Example 1: Single prediction
        print("\n1. Single Prediction Example:")
        result = pipeline.predict_single(
            short_description="Street light not working on Main Street",
            category="Infrastructure",
            location="Downtown"
        )
        print(f"   Prediction: {result['prediction']}")
        print(f"   Confidence: {result['confidence']:.3f}")
        print(f"   Probabilities: {result['class_probabilities']}")
        
        # Example 2: Batch prediction
        print("\n2. Batch Prediction Example:")
        batch_data = [
            {
                "short_description": "Pothole on Oak Avenue",
                "category": "Roads",
                "location": "Residential"
            },
            {
                "short_description": "Broken bench found in park at highway, not severe",
                "category": "park",
                "location": "Highway"
            }
        ]
        
        batch_results = pipeline.predict_batch(batch_data)
        for result in batch_results:
            print(f"   Issue: {result['input']['short_description']}")
            print(f"   Prediction: {result['prediction']} (confidence: {result['confidence']:.3f})")
            print()
        
        print("=" * 60)
        print("PREDICTION PIPELINE DEMO COMPLETED")
        print("=" * 60)
        
    except Exception as e:
        print(f"Prediction pipeline demo failed: {e}")
        import traceback
        traceback.print_exc()
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main())
