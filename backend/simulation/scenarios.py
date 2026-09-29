from typing import Dict, Any

SCENARIOS: Dict[str, Dict[str, Any]] = {
    "straight": {
        "id": "straight",
        "name": "Scenario 1: Straight Trajectory",
        "description": "Incoming object follows a steady linear vector with near-zero acceleration. Optimal baseline for tracking convergence and standard intercept estimation.",
        "profile": "straight",
        "noise_level": 0.8,
        "default_speed": 1.0,
        "difficulty": "Nominal"
    },
    "variable": {
        "id": "variable",
        "name": "Scenario 2: Variable Path",
        "description": "Incoming object undergoes gradual harmonic curvature. Tests polynomial ML prediction adaptability against non-linear continuous flight paths.",
        "profile": "variable",
        "noise_level": 1.2,
        "default_speed": 1.0,
        "difficulty": "Moderate"
    },
    "noisy": {
        "id": "noisy",
        "name": "Scenario 3: Noisy Sensor Environment",
        "description": "Object maintains stable kinematic path, but synthetic radar observations have high Gaussian disturbance. Demonstrates Kalman noise filtering vs raw readings.",
        "profile": "straight",
        "noise_level": 2.6,
        "default_speed": 1.0,
        "difficulty": "High Sensor Noise"
    },
    "maneuvering": {
        "id": "maneuvering",
        "name": "Scenario 4: High-G Maneuver",
        "description": "Object performs discrete evasive angle shifts. Challenges real-time trajectory re-prediction and dynamic interception meeting point recalculation.",
        "profile": "maneuvering",
        "noise_level": 1.5,
        "default_speed": 1.0,
        "difficulty": "High Dynamic"
    }
}
