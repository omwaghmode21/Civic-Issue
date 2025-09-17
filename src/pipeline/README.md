# ML Pipeline Usage Guide

This directory contains the main ML pipelines for the Priority Prediction system.

## Files

- `train_pipeline.py` - Complete training pipeline
- `predict_pipeline.py` - Complete prediction pipeline

## Training Pipeline

The training pipeline orchestrates the complete ML workflow:

**Ingestion → Validation → Transformation → Training → Save Model**

### Usage

```python
from src.pipeline.train_pipeline import TrainingPipeline

# Initialize training pipeline
raw_dataset_path = "notebooks/data/raw/Dummy_DataSet.csv"
pipeline = TrainingPipeline(raw_dataset_path)

# Run complete training pipeline
results = pipeline.run_training_pipeline()

print(f"Best model: {results['best_model_name']}")
print(f"Best accuracy: {results['results'][results['best_model_name']]:.4f}")
```

### Command Line

```bash
python src/pipeline/train_pipeline.py
```

## Prediction Pipeline

The prediction pipeline handles the complete prediction workflow:

**Load Model → Transform New Data → Predict**

### Usage

```python
from src.pipeline.predict_pipeline import PredictionPipeline

# Initialize prediction pipeline
pipeline = PredictionPipeline()

# Load the best model
pipeline.load_models("random_forest")  # or "xgb_model", "logistic_regression"

# Single prediction
result = pipeline.predict_single(
    short_description="Street light not working on Main Street",
    category="Infrastructure",
    location="Downtown"
)
print(f"Prediction: {result['prediction']}")
print(f"Confidence: {result['confidence']:.3f}")

# Batch prediction
batch_data = [
    {
        "short_description": "Pothole on Oak Avenue",
        "category": "Roads",
        "location": "Residential"
    },
    {
        "short_description": "Broken traffic signal",
        "category": "Traffic", 
        "location": "Commercial"
    }
]
batch_results = pipeline.predict_batch(batch_data)

# CSV prediction
csv_results = pipeline.predict_from_csv("input.csv", "output.csv")
```

### Command Line

```bash
python src/pipeline/predict_pipeline.py
```

## Generated Artifacts

The training pipeline generates the following artifacts in the `artifacts/` directory:

### Data Files
- `priority_raw.csv` - Raw dataset copy
- `priority_train.csv` - Training dataset
- `priority_test.csv` - Test dataset

### Models
- `models/random_forest.pkl` - Random Forest model
- `models/xgb_model.pkl` - XGBoost model  
- `models/logistic_regression.pkl` - Logistic Regression model

### Preprocessors
- `preprocessors/preprocessor.pkl` - Data preprocessor
- `preprocessors/label_encoder.pkl` - Label encoder

### Metadata
- `training_metadata.pkl` - Training metadata and results

## Model Performance

The pipeline trains three models and selects the best one:

- **Random Forest**: Usually performs best (~90% accuracy)
- **XGBoost**: Good performance (~88% accuracy)
- **Logistic Regression**: Baseline performance (~88% accuracy)

## Requirements

Make sure all dependencies are installed:

```bash
pip install -r requirements.txt
```

Required packages:
- pandas
- numpy
- scikit-learn
- xgboost
- dill (for model serialization)
