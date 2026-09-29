import math
from typing import List, Dict, Any, Optional

class InterceptionCalculator:
    """
    Abstract meeting-point calculation between:
    1) AI-predicted threat trajectory points
    2) Virtual interceptor deployment kinematics
    """

    def __init__(self, interceptor_speed: float = 7.5):
        self.interceptor_speed = interceptor_speed

    def calculate_meeting_point(
        self,
        interceptor_origin: Dict[str, float],
        predicted_trajectory: List[Dict[str, float]],
        current_sim_time: float,
        dt: float = 0.1
    ) -> Optional[Dict[str, Any]]:
        """
        Determines the earliest future point in the predicted path reachable by the interceptor.
        Condition: (dist(origin, target) / interceptor_speed) <= (t_target - current_sim_time)
        """
        if not predicted_trajectory:
            return None

        for pt in predicted_trajectory:
            dx = pt["x"] - interceptor_origin["x"]
            dy = pt["y"] - interceptor_origin["y"]
            dist_to_point = math.hypot(dx, dy)

            # Time needed for interceptor to travel to this point
            required_travel_time = dist_to_point / (self.interceptor_speed / dt)  # in seconds
            available_time = pt["t"] - current_sim_time

            # Check if reachable within the prediction horizon with a small clearance margin
            if available_time >= required_travel_time and available_time > 0.4:
                return {
                    "x": pt["x"],
                    "y": pt["y"],
                    "t": pt["t"],
                    "tti": round(available_time, 2),
                    "distance": round(dist_to_point, 1),
                    "step": pt.get("step", 0)
                }

        # If none strictly satisfies within available window, return an extrapolated midpoint along the trajectory
        fallback_idx = min(len(predicted_trajectory) - 1, max(0, len(predicted_trajectory) // 2))
        pt = predicted_trajectory[fallback_idx]
        dx = pt["x"] - interceptor_origin["x"]
        dy = pt["y"] - interceptor_origin["y"]
        dist = math.hypot(dx, dy)
        return {
            "x": pt["x"],
            "y": pt["y"],
            "t": pt["t"],
            "tti": round(dist / (self.interceptor_speed / dt), 2),
            "distance": round(dist, 1),
            "step": pt.get("step", 0)
        }
