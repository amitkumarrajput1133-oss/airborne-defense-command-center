import math
import numpy as np
from typing import Dict, Any, List, Optional

class KalmanTracker:
    """
    Discrete 2D Kalman Filter for Target State Estimation:
    State Vector X = [x_pos, y_pos, x_vel, y_vel]^T
    Measurement Vector Z = [x_meas, y_meas]^T
    """

    def __init__(self, dt: float = 0.1, process_noise_std: float = 0.5, measurement_noise_std: float = 4.0):
        self.dt = dt
        self.initialized = False
        self.obs_count = 0

        # State transition matrix F
        self.F = np.array([
            [1.0, 0.0, dt,  0.0],
            [0.0, 1.0, 0.0, dt ],
            [0.0, 0.0, 1.0, 0.0],
            [0.0, 0.0, 0.0, 1.0]
        ], dtype=float)

        # Measurement observation matrix H
        self.H = np.array([
            [1.0, 0.0, 0.0, 0.0],
            [0.0, 1.0, 0.0, 0.0]
        ], dtype=float)

        # Process noise covariance matrix Q (Discrete white noise model)
        q_var = process_noise_std ** 2
        dt2 = (dt ** 2) / 2.0
        self.Q = np.array([
            [dt2**2, 0.0,    dt2*dt, 0.0   ],
            [0.0,    dt2**2, 0.0,    dt2*dt],
            [dt2*dt, 0.0,    dt**2,  0.0   ],
            [0.0,    dt2*dt, 0.0,    dt**2 ]
        ], dtype=float) * q_var

        # Measurement noise covariance matrix R
        r_var = measurement_noise_std ** 2
        self.R = np.eye(2, dtype=float) * r_var

        # Initial state and covariance
        self.x = np.zeros(4, dtype=float)
        self.P = np.eye(4, dtype=float) * 500.0  # High initial uncertainty

        # Metrics
        self.last_residual_norm = 0.0
        self.confidence = 50.0

    def reset(self, measurement_noise_std: float = 4.0):
        self.initialized = False
        self.obs_count = 0
        self.x = np.zeros(4, dtype=float)
        self.P = np.eye(4, dtype=float) * 500.0
        r_var = (measurement_noise_std ** 2)
        self.R = np.eye(2, dtype=float) * r_var
        self.confidence = 50.0

    def update_measurement_noise(self, noise_level: float):
        r_var = (4.5 * noise_level) ** 2
        self.R = np.eye(2, dtype=float) * r_var

    def step(self, obs: Dict[str, float]) -> Dict[str, Any]:
        """
        Processes a new simulated observation (x, y) through Kalman predict & update cycle.
        """
        z = np.array([obs["x"], obs["y"]], dtype=float)

        if not self.initialized:
            # Cold-start initialization
            self.x = np.array([z[0], z[1], 0.0, 0.0], dtype=float)
            self.P = np.eye(4, dtype=float) * 50.0
            self.initialized = True
            self.obs_count = 1
            self.confidence = 65.0
            return self.get_state_dict()

        # 1. TIME UPDATE (PREDICT)
        x_pred = self.F @ self.x
        P_pred = self.F @ self.P @ self.F.T + self.Q

        # 2. MEASUREMENT UPDATE (CORRECT)
        y = z - (self.H @ x_pred)  # Measurement residual / innovation
        S = self.H @ P_pred @ self.H.T + self.R  # Residual covariance
        K = P_pred @ self.H.T @ np.linalg.inv(S)  # Optimal Kalman Gain

        self.x = x_pred + (K @ y)
        I = np.eye(4, dtype=float)
        self.P = (I - K @ self.H) @ P_pred

        self.obs_count += 1
        self.last_residual_norm = float(np.linalg.norm(y))

        # Calculate tracking confidence:
        # Based on covariance matrix trace and residual consistency
        cov_trace = float(np.trace(self.P[:2, :2]))
        base_conf = max(40.0, min(99.0, 100.0 - (cov_trace * 1.5) - (self.last_residual_norm * 1.8)))
        # Warm-up weighting
        warmup = min(1.0, self.obs_count / 10.0)
        self.confidence = round(base_conf * warmup + (1.0 - warmup) * 55.0, 1)

        return self.get_state_dict()

    def get_state_dict(self) -> Dict[str, Any]:
        speed = float(math.hypot(self.x[2], self.x[3]))
        heading_deg = float(math.degrees(math.atan2(self.x[3], self.x[2]))) % 360.0
        return {
            "x": round(float(self.x[0]), 2),
            "y": round(float(self.x[1]), 2),
            "vx": round(float(self.x[2]), 2),
            "vy": round(float(self.x[3]), 2),
            "speed": round(speed, 2),
            "heading_deg": round(heading_deg, 1),
            "confidence": self.confidence,
            "observations_count": self.obs_count,
            "covariance_trace": round(float(np.trace(self.P)), 3)
        }


class ExponentialTracker:
    """
    Exponential Smoothing Filter (Alpha-Beta filter)
    Used for educational comparison with Kalman Filter.
    """

    def __init__(self, alpha: float = 0.65, beta: float = 0.4, dt: float = 0.1):
        self.alpha = alpha
        self.beta = beta
        self.dt = dt
        self.x = 0.0
        self.y = 0.0
        self.vx = 0.0
        self.vy = 0.0
        self.initialized = False

    def reset(self):
        self.initialized = False

    def step(self, obs: Dict[str, float]) -> Dict[str, float]:
        if not self.initialized:
            self.x = obs["x"]
            self.y = obs["y"]
            self.vx = 0.0
            self.vy = 0.0
            self.initialized = True
            return {"x": round(self.x, 2), "y": round(self.y, 2), "vx": round(self.vx, 2), "vy": round(self.vy, 2)}

        # Predict
        x_pred = self.x + self.vx * self.dt
        y_pred = self.y + self.vy * self.dt

        # Residual
        rx = obs["x"] - x_pred
        ry = obs["y"] - y_pred

        # Update
        self.x = x_pred + self.alpha * rx
        self.y = y_pred + self.alpha * ry
        self.vx = self.vx + (self.beta / self.dt) * rx
        self.vy = self.vy + (self.beta / self.dt) * ry

        return {
            "x": round(self.x, 2),
            "y": round(self.y, 2),
            "vx": round(self.vx, 2),
            "vy": round(self.vy, 2)
        }
