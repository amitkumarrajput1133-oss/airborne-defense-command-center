import time
import math
import os
import sys
from typing import Dict, Any, List, Optional

# Ensure backend directory is in python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from simulation.physics import SimulationPhysics, ThreatProfile
from simulation.scenarios import SCENARIOS
from tracking.filter import KalmanTracker, ExponentialTracker
from prediction.model import TrajectoryPredictor
from interception.calculator import InterceptionCalculator

app = FastAPI(
    title="Airborne Threat Interception & Predictive Tracking Simulator",
    description="Educational simulation API for target tracking and trajectory interception.",
    version="1.0.0"
)

# Enable CORS for React frontend (Vite default ports 5173, 3000, etc.)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SimEngine:
    def __init__(self):
        self.physics = SimulationPhysics()
        self.tracker = KalmanTracker()
        self.exp_tracker = ExponentialTracker()
        self.predictor = TrajectoryPredictor()
        self.interceptor_calc = InterceptionCalculator()

        self.status = "INITIALIZED"  # INITIALIZED, RUNNING, PAUSED, INTERCEPTED
        self.speed_multiplier = 1.0
        self.ai_enabled = True
        self.use_kalman = True
        self.event_log: List[Dict[str, Any]] = []
        self.scenario_id = "straight"

        # Trajectory history buffers for charts
        self.history_limit = 120
        self.history_records: List[Dict[str, Any]] = []

        self.add_event("SYSTEM INITIALIZED", "Defense Simulation Core operational. Standby for sensor feeds.")

    def add_event(self, event_type: str, details: str):
        sim_timestamp = f"{int(self.physics.sim_time // 60):02d}:{int(self.physics.sim_time % 60):02d}.{int((self.physics.sim_time * 10) % 10)}"
        self.event_log.append({
            "id": len(self.event_log) + 1,
            "timestamp": sim_timestamp,
            "type": event_type,
            "details": details
        })
        if len(self.event_log) > 100:
            self.event_log.pop(0)

    def set_scenario(self, scenario_id: str):
        if scenario_id not in SCENARIOS:
            return
        self.scenario_id = scenario_id
        sc = SCENARIOS[scenario_id]
        self.physics.profile = sc["profile"]
        self.physics.noise_level = sc["noise_level"]
        self.reset()
        self.add_event("SCENARIO LOADED", f"Active profile: {sc['name']} ({sc['difficulty']})")

    def reset(self):
        self.physics.reset()
        self.tracker.reset(measurement_noise_std=4.5 * self.physics.noise_level)
        self.exp_tracker.reset()
        self.predictor.reset()
        self.status = "INITIALIZED"
        self.history_records.clear()
        self.add_event("SYSTEM RESET", "Radar coordinates and tracking state recalibrated.")

    def deploy_interceptor(self):
        if self.physics.interceptor_status == "STANDBY":
            # Calculate current best meeting point
            preds, _ = self.predictor.predict_future()
            origin = self.physics.fighter_pos
            meeting_pt = self.interceptor_calc.calculate_meeting_point(
                interceptor_origin=origin,
                predicted_trajectory=preds,
                current_sim_time=self.physics.sim_time,
                dt=self.physics.dt
            )
            target = meeting_pt if meeting_pt else self.physics.threat_pos
            self.physics.deploy_interceptor(target)
            self.add_event("INTERCEPTOR DEPLOYED", f"Virtual interceptor launched toward azimuth {target['x']:.1f}, {target['y']:.1f}")

    def step(self) -> Dict[str, Any]:
        t0 = time.perf_counter()

        if self.status == "INITIALIZED":
            self.status = "RUNNING"
            self.add_event("THREAT OBJECT DETECTED", f"Radar echo acquired at sector ({self.physics.threat_pos['x']:.1f}, {self.physics.threat_pos['y']:.1f})")

        # 1. Kinematics update
        self.physics.update_threat()

        # 2. Sensor measurement generation (Noisy observation)
        obs = self.physics.generate_noisy_observation()

        # 3. Filtering & Target State Tracking
        filtered_state = self.tracker.step(obs)
        exp_state = self.exp_tracker.step(obs)

        if self.tracker.obs_count == 2:
            self.add_event("TRACKING INITIALIZED", "State estimation filter established initial vector.")

        # 4. AI Trajectory Prediction
        self.predictor.add_observation(
            t=self.physics.sim_time,
            state=filtered_state if self.use_kalman else obs,
            ground_truth=self.physics.threat_pos
        )

        future_predictions = []
        prediction_error = 0.0
        if self.ai_enabled:
            future_predictions, prediction_error = self.predictor.predict_future()
            if self.predictor.total_predictions_made == 1:
                self.add_event("TRAJECTORY PREDICTION ACTIVE", "Polynomial ML model locked trajectory horizon.")

        # 5. Interception Meeting Point Estimation
        meeting_point = None
        if self.ai_enabled and future_predictions:
            meeting_point = self.interceptor_calc.calculate_meeting_point(
                interceptor_origin=self.physics.interceptor_pos,
                predicted_trajectory=future_predictions,
                current_sim_time=self.physics.sim_time,
                dt=self.physics.dt
            )

        # 6. Interceptor Kinematics Update
        was_standby = self.physics.interceptor_status == "STANDBY"
        self.physics.update_interceptor(updated_meeting_point=meeting_point)

        # 7. Check for Interception Success
        if self.physics.interception_achieved and self.status != "INTERCEPTED":
            self.status = "INTERCEPTED"
            self.add_event("SIMULATION INTERCEPTION SUCCESS", "Virtual interceptor successfully converged with threat object.")

        # Distance calculation
        threat_distance = math.hypot(
            self.physics.threat_pos["x"] - self.physics.fighter_pos["x"],
            self.physics.threat_pos["y"] - self.physics.fighter_pos["y"]
        )

        interceptor_distance_to_meeting = 0.0
        if meeting_point:
            interceptor_distance_to_meeting = math.hypot(
                self.physics.interceptor_pos["x"] - meeting_point["x"],
                self.physics.interceptor_pos["y"] - meeting_point["y"]
            )

        # Record point in history for bottom graphs
        history_entry = {
            "time": round(self.physics.sim_time, 2),
            "step": self.physics.step_count,
            "actual_x": round(self.physics.threat_pos["x"], 2),
            "actual_y": round(self.physics.threat_pos["y"], 2),
            "observed_x": obs["x"],
            "observed_y": obs["y"],
            "filtered_x": filtered_state["x"],
            "filtered_y": filtered_state["y"],
            "ai_pred_x": future_predictions[0]["x"] if future_predictions else filtered_state["x"],
            "ai_pred_y": future_predictions[0]["y"] if future_predictions else filtered_state["y"],
            "tracking_error": round(math.hypot(filtered_state["x"] - self.physics.threat_pos["x"],
                                               filtered_state["y"] - self.physics.threat_pos["y"]), 2),
            "confidence": filtered_state["confidence"]
        }
        self.history_records.append(history_entry)
        if len(self.history_records) > self.history_limit:
            self.history_records.pop(0)

        compute_time_ms = (time.perf_counter() - t0) * 1000.0

        return {
            "status": self.status,
            "sim_time": round(self.physics.sim_time, 2),
            "step_count": self.physics.step_count,
            "fighter": {
                "x": round(self.physics.fighter_pos["x"], 2),
                "y": round(self.physics.fighter_pos["y"], 2)
            },
            "threat": {
                "active": self.physics.threat_active,
                "x": round(self.physics.threat_pos["x"], 2),
                "y": round(self.physics.threat_pos["y"], 2),
                "vx": round(self.physics.threat_vel["vx"], 2),
                "vy": round(self.physics.threat_vel["vy"], 2),
                "speed": round(math.hypot(self.physics.threat_vel["vx"], self.physics.threat_vel["vy"]), 2),
                "distance_to_base": round(threat_distance, 1)
            },
            "observation": obs,
            "tracking": filtered_state,
            "prediction": {
                "active": self.ai_enabled,
                "error_rmse": prediction_error,
                "horizon_points": future_predictions
            },
            "interceptor": {
                "status": self.physics.interceptor_status,
                "x": round(self.physics.interceptor_pos["x"], 2),
                "y": round(self.physics.interceptor_pos["y"], 2),
                "vx": round(self.physics.interceptor_vel["vx"], 2),
                "vy": round(self.physics.interceptor_vel["vy"], 2),
                "speed": round(math.hypot(self.physics.interceptor_vel["vx"], self.physics.interceptor_vel["vy"]), 2),
                "distance_to_target": round(interceptor_distance_to_meeting, 1)
            },
            "meeting_point": meeting_point,
            "metrics": {
                "compute_time_ms": round(compute_time_ms, 3),
                "tracking_accuracy": round(max(0.0, 100.0 - history_entry["tracking_error"] * 2.2), 1),
                "observations_count": self.tracker.obs_count,
                "noise_level": self.physics.noise_level,
                "scenario": self.scenario_id
            },
            "latest_events": self.event_log[-8:]
        }


engine = SimEngine()


# --- Models ---
class SimControlRequest(BaseModel):
    action: Optional[str] = None  # "start", "pause", "reset", "deploy"
    profile: Optional[str] = None
    noise_level: Optional[float] = None
    speed_multiplier: Optional[float] = None
    ai_enabled: Optional[bool] = None
    scenario_id: Optional[str] = None


@app.get("/api/status")
def get_system_status():
    return {
        "system": "Airborne Threat Interception & Predictive Tracking Simulator",
        "status": "ONLINE",
        "engine_state": engine.status,
        "mode": "Educational Simulation",
        "ai_available": True,
        "active_scenario": engine.scenario_id
    }


@app.get("/api/scenarios")
def get_scenarios():
    return SCENARIOS


@app.get("/api/sim/state")
def get_sim_state():
    return engine.step()


@app.post("/api/sim/control")
def control_simulation(req: SimControlRequest):
    if req.action == "start":
        if engine.status in ["INITIALIZED", "PAUSED", "INTERCEPTED"]:
            if engine.status == "INTERCEPTED":
                engine.reset()
            engine.status = "RUNNING"
            engine.add_event("SIMULATION RESUMED", "Simulation clock running.")
    elif req.action == "pause":
        engine.status = "PAUSED"
        engine.add_event("SIMULATION PAUSED", "Simulation paused for analysis.")
    elif req.action == "reset":
        engine.reset()
    elif req.action == "deploy":
        engine.deploy_interceptor()

    if req.scenario_id:
        engine.set_scenario(req.scenario_id)

    if req.profile:
        engine.physics.profile = req.profile

    if req.noise_level is not None:
        engine.physics.noise_level = max(0.1, min(4.0, req.noise_level))
        engine.tracker.update_measurement_noise(engine.physics.noise_level)

    if req.speed_multiplier is not None:
        engine.speed_multiplier = max(0.2, min(10.0, req.speed_multiplier))

    if req.ai_enabled is not None:
        engine.ai_enabled = req.ai_enabled

    return {"status": engine.status, "message": "Parameters updated"}


@app.post("/api/sim/step")
def step_simulation():
    return engine.step()


@app.get("/api/sim/history")
def get_history():
    return engine.history_records


@app.get("/api/sim/events")
def get_events():
    return engine.event_log


@app.post("/api/pipeline/inspect")
def inspect_pipeline_step():
    """
    Educational inspection endpoint detailing each transformation stage.
    """
    # Generate one sample step
    true_pos = {"x": engine.physics.threat_pos["x"], "y": engine.physics.threat_pos["y"]}
    obs = engine.physics.generate_noisy_observation()
    filtered = engine.tracker.get_state_dict()
    preds, error = engine.predictor.predict_future()
    meeting = None
    if preds:
        meeting = engine.interceptor_calc.calculate_meeting_point(
            interceptor_origin=engine.physics.interceptor_pos,
            predicted_trajectory=preds,
            current_sim_time=engine.physics.sim_time
        )

    return {
        "stage_1_ground_truth": true_pos,
        "stage_2_sensor_observation": {
            "observed": obs,
            "noise_added": {
                "dx": round(obs["x"] - true_pos["x"], 2),
                "dy": round(obs["y"] - true_pos["y"], 2)
            }
        },
        "stage_3_noise_filter": {
            "algorithm": "Discrete Linear Kalman Filter",
            "estimated_state": filtered,
            "residual_correction": round(math.hypot(filtered["x"] - obs["x"], filtered["y"] - obs["y"]), 2)
        },
        "stage_4_feature_extraction": {
            "features": ["t_norm", "pos_x", "pos_y", "vel_x", "vel_y", "delta_t"],
            "history_window_samples": len(engine.predictor.history)
        },
        "stage_5_trajectory_prediction": {
            "algorithm": "Ridge Polynomial Regression (degree=2)",
            "prediction_horizon_steps": len(preds),
            "estimated_rmse": error,
            "next_5_points": preds[:5]
        },
        "stage_6_interception_decision": {
            "meeting_point": meeting,
            "interceptor_status": engine.physics.interceptor_status,
            "ready_to_engage": meeting is not None
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
