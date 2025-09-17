import os
import sys
import dill
import logging
from src.exception import CustomException
from sklearn.model_selection import GridSearchCV
from sklearn.metrics import accuracy_score, f1_score

def save_object(file_path, obj):
    try:
        dir_path = os.path.dirname(file_path)
        os.makedirs(dir_path, exist_ok=True)

        with open(file_path, "wb") as file_obj:
            dill.dump(obj, file_obj)
        logging.info(f"Object saved at: {file_path}")

    except Exception as e:
        raise CustomException(e)

def load_object(file_path):
    try:
        with open(file_path, "rb") as file_obj:
            obj = dill.load(file_obj)
        logging.info(f"Object loaded from: {file_path}")
        return obj

    except Exception as e:
        raise CustomException(e)

def evaluate_models(X_train, y_train, X_test, y_test, models, params):
    try:
        report = {}

        for model_name, model in models.items():
            logging.info(f"Training model: {model_name}")

            param_grid = params.get(model_name, {})
            gs = GridSearchCV(model, param_grid, cv=3, n_jobs=-1)
            gs.fit(X_train, y_train)

            best_model = gs.best_estimator_
            y_train_pred = best_model.predict(X_train)
            y_test_pred = best_model.predict(X_test)

            train_acc = accuracy_score(y_train, y_train_pred)
            test_acc = accuracy_score(y_test, y_test_pred)

            logging.info(f"{model_name} best params: {gs.best_params_}")
            logging.info(f"{model_name} Train Accuracy: {train_acc:.4f} | Test Accuracy: {test_acc:.4f}")

            report[model_name] = {"best_model": best_model, "test_accuracy": test_acc}

        return report

    except Exception as e:
        raise CustomException(e)
