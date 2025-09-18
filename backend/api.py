import os
import sys
from typing import List, Dict, Any

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
import pandas as pd

# Ensure project root is on sys.path for src imports
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from src.pipeline.predict_pipeline import PredictPipeline  # type: ignore


class IssueIn(BaseModel):
    short_description: str = Field(..., min_length=1)
    category: str = Field(..., min_length=1)
    location: str = Field(..., min_length=1)


class PredictionOut(BaseModel):
    prediction: str
    confidence: float
    class_probabilities: Dict[str, float]
    model_used: str


def create_app() -> FastAPI:
    app = FastAPI(title="Civic Issue Priority API", version="1.0.0")

    model_name = os.getenv("PRIORITY_MODEL", "random_forest")
    pipeline: PredictPipeline | None = None

    @app.on_event("startup")
    def _load_pipeline() -> None:
        nonlocal pipeline
        pipeline = PredictPipeline(model_name=model_name)

    @app.get("/health")
    def health() -> Dict[str, Any]:
        return {"status": "ok", "model": model_name}

    @app.post("/predict", response_model=PredictionOut)
    def predict(issue: IssueIn) -> PredictionOut:
        try:
            assert pipeline is not None
            df = pd.DataFrame([{ 
                "short_description": issue.short_description,
                "category": issue.category,
                "location": issue.location,
            }])
            result = pipeline.predict(df)
            return PredictionOut(**result)
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    @app.post("/predict/batch", response_model=List[PredictionOut])
    def predict_batch(issues: List[IssueIn]) -> List[PredictionOut]:
        try:
            assert pipeline is not None
            data = [
                {
                    "short_description": it.short_description,
                    "category": it.category,
                    "location": it.location,
                }
                for it in issues
            ]
            df = pd.DataFrame(data)
            # Use existing batch logic by calling per-row predict for consistent output
            outputs: List[PredictionOut] = []
            for i in range(len(df)):
                res = pipeline.predict(df.iloc[[i]])
                outputs.append(PredictionOut(**res))
            return outputs
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    @app.post("/rank", response_model=List[Dict[str, Any]])
    def rank_by_high_probability(issues: List[IssueIn]) -> List[Dict[str, Any]]:
        try:
            assert pipeline is not None
            data = [
                {
                    "short_description": it.short_description,
                    "category": it.category,
                    "location": it.location,
                }
                for it in issues
            ]
            df = pd.DataFrame(data)
            results: List[Dict[str, Any]] = []
            for i in range(len(df)):
                res = pipeline.predict(df.iloc[[i]])
                results.append({
                    "input": data[i],
                    **res,
                })
            ranked = sorted(
                results,
                key=lambda r: r["class_probabilities"].get("High", 0.0),
                reverse=True,
            )
            return ranked
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    return app


app = create_app()


