import os
import sys
from typing import List, Dict, Any

# Fix: avoid shadowing stdlib 'logging' by local backend/logging package
_SCRIPT_DIR = os.path.abspath(os.path.dirname(__file__))
if _SCRIPT_DIR in sys.path:
    try:
        sys.path.remove(_SCRIPT_DIR)
    except ValueError:
        pass

# Ensure project root is on sys.path for src imports
PROJECT_ROOT = os.path.abspath(os.path.join(_SCRIPT_DIR, '..'))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from flask import Flask, request, jsonify
import pandas as pd

from src.pipeline.predict_pipeline import PredictPipeline  # type: ignore


def create_app() -> Flask:
    app = Flask(__name__)

    model_name = os.getenv("PRIORITY_MODEL", "random_forest")
    # Initialize once at app creation (Flask 3 removed before_first_request)
    pipeline: PredictPipeline | None = PredictPipeline(model_name=model_name)

    @app.get("/health")
    def health():
        return jsonify({"status": "ok", "model": model_name})

    @app.post("/predict")
    def predict():
        try:
            assert pipeline is not None
            req = request.get_json(force=True) or {}
            short_description = req.get("short_description")
            category = req.get("category")
            location = req.get("location")
            if not all([short_description, category, location]):
                return jsonify({"error": "short_description, category, location are required"}), 400

            df = pd.DataFrame([{
                "short_description": short_description,
                "category": category,
                "location": location,
            }])
            result = pipeline.predict(df)
            return jsonify(result)
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @app.post("/predict/batch")
    def predict_batch():
        try:
            assert pipeline is not None
            req = request.get_json(force=True) or []
            if not isinstance(req, list) or len(req) == 0:
                return jsonify({"error": "Provide a non-empty list of issues"}), 400
            data = []
            for it in req:
                sd = it.get("short_description")
                cat = it.get("category")
                loc = it.get("location")
                if not all([sd, cat, loc]):
                    return jsonify({"error": "Each item needs short_description, category, location"}), 400
                data.append({"short_description": sd, "category": cat, "location": loc})

            # Call per-row for consistent output schema
            results: List[Dict[str, Any]] = []
            for item in data:
                res = pipeline.predict(pd.DataFrame([item]))
                results.append(res)
            return jsonify(results)
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @app.post("/rank")
    def rank_by_high_probability():
        try:
            assert pipeline is not None
            req = request.get_json(force=True) or []
            if not isinstance(req, list) or len(req) == 0:
                return jsonify({"error": "Provide a non-empty list of issues"}), 400

            data: List[Dict[str, Any]] = []
            for it in req:
                sd = it.get("short_description")
                cat = it.get("category")
                loc = it.get("location")
                if not all([sd, cat, loc]):
                    return jsonify({"error": "Each item needs short_description, category, location"}), 400
                data.append({"short_description": sd, "category": cat, "location": loc})

            results: List[Dict[str, Any]] = []
            for item in data:
                res = pipeline.predict(pd.DataFrame([item]))
                results.append({"input": item, **res})

            ranked = sorted(results, key=lambda r: r["class_probabilities"].get("High", 0.0), reverse=True)
            return jsonify(ranked)
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    return app


app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)


