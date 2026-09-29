import math
import numpy as np
from typing import List, Dict, Any, Tuple
from collections import deque

try:
    from sklearn.linear_model import Ridge
    from sklearn.preprocessing import PolynomialFeatures
    from sklearn.pipeline import make_pipeline
    SKLEARN_AVAILABLE = True
except ImportError:
    SKLEARN_AVAILABLE = False


class TrajectoryPredictor:
    """
    ML Trajectory Predictor using Scikit-Learn Polynomial Ridge Regression.
    Learns dynamic curvature and motion trends from recent filtered tracking history.
    Predicts future coordinates (x_future, y_future) over horizon steps.
    """

    def __init__(self, history_window: int = 25, horizon_steps: int = 40, dt: float = 0.1):
        self.history_window = history_window
        self.horizon_steps = horizon_steps
        self.dt = dt
        self.history: deque = deque(maxlen=history_window)
        self.active = True
        self.last_prediction_error = 0.0
        self.total_predictions_made = 0

    def reset(self):
        self.history.clear()
        self.last_prediction_error = 0.0
        self.total_predictions_made = 0

    def add_observation(self, t: float, state: Dict[str, Any], ground_truth: Dict[str, float] = None):
        """
        Record filtered state into rolling memory.
        """
        item = {
            "t": t,
            "x": state["x"],
            "y": state["y"],
            "vx": state.get("vx", 0.0),
            "vy": state.get("vy", 0.0),
            "gt_x": ground_truth["x"] if ground_truth else state["x"],
            "gt_y": ground_truth["y"] if ground_truth else state["y"]
        }
        self.history.append(item)

    def predict_future(self) -> Tuple[List[Dict[str, float]], float]:
        """
        Fits model to rolling history and projects trajectory forward.
        Returns:
            predicted_points: List of future points [{x, y, t, step}, ...]
            error_metric: estimated prediction error (RMSE units)
        """
        if len(self.history) < 4 or not self.active:
            # Fallback linear projection if too few points
            return self._linear_fallback(), 0.0

        times = np.array([pt["t"] for pt in self.history]).reshape(-1, 1)
        x_vals = np.array([pt["x"] for pt in self.history])
        y_vals = np.array([pt["y"] for pt in self.history])

        # Normalize time origin to avoid numerical instability
        t_base = times[0, 0]
        t_norm = times - t_base

        predicted_pts: List[Dict[str, float]] = []

        if SKLEARN_AVAILABLE:
            try:
                # Degree 2 polynomial capture acceleration and curve without overfitting
                poly_degree = 2 if len(self.history) >= 8 else 1
                model_x = make_pipeline(PolynomialFeatures(degree=poly_degree), Ridge(alpha=0.1))
                model_y = make_pipeline(PolynomialFeatures(degree=poly_degree), Ridge(alpha=0.1))

                model_x.fit(t_norm, x_vals)
                model_y.fit(t_norm, y_vals)

                # Compute training fit error (RMSE)
                pred_x_hist = model_x.predict(t_norm)
                pred_y_hist = model_y.predict(t_norm)
                err_x = x_vals - pred_x_hist
                err_y = y_vals - pred_y_hist
                rmse = float(np.sqrt(np.mean(err_x**2 + err_y**2)))
                self.last_prediction_error = round(rmse, 2)

                # Predict forward
                last_t_norm = t_norm[-1, 0]
                last_t_real = times[-1, 0]

                future_t_norm = np.array([last_t_norm + i * self.dt for i in range(1, self.horizon_steps + 1)]).reshape(-1, 1)
                pred_fut_x = model_x.predict(future_t_norm)
                pred_fut_y = model_y.predict(future_t_norm)

                for i in range(self.horizon_steps):
                    px = float(pred_fut_x[i])
                    py = float(pred_fut_y[i])
                    predicted_pts.append({
                        "x": round(px, 2),
                        "y": round(py, 2),
                        "t": round(last_t_real + (i + 1) * self.dt, 2),
                        "step": i + 1
                    })

                self.total_predictions_made += 1
                return predicted_pts, self.last_prediction_error

            except Exception:
                return self._linear_fallback(), 1.0

        return self._linear_fallback(), 0.5

    def _linear_fallback(self) -> List[Dict[str, float]]:
        if not self.history:
            return []
        last = self.history[-1]
        pts = []
        for i in range(1, self.horizon_steps + 1):
            pts.append({
                "x": round(last["x"] + last["vx"] * (i * self.dt), 2),
                "y": round(last["y"] + last["vy"] * (i * self.dt), 2),
                "t": round(last["t"] + (i * self.dt), 2),
                "step": i
            })
        return pts
