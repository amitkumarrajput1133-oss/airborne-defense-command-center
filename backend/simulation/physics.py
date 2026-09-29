import math
import random
from typing import Dict, List, Tuple

class ThreatProfile:
    STRAIGHT = "straight"
    VARIABLE = "variable"
    MANEUVERING = "maneuvering"
    RANDOM_NOISE = "random_noise"

class SimulationPhysics:
    """
    Abstract mathematical simulation for airborne entities.
    Normalized coordinates: 0 to 1000.
    Radar center: (500, 500), radius: 460.
    Safe, non-weaponized educational physics model.
    """

    def __init__(self, profile: str = ThreatProfile.STRAIGHT, noise_level: float = 1.0):
        self.profile = profile
        self.noise_level = noise_level  # 0.2 to 3.0 scale
        self.reset()

    def reset(self):
        # Fighter aircraft initial defensive station
        self.fighter_pos = {"x": 280.0, "y": 720.0}
        self.fighter_vel = {"vx": 0.5, "vy": -0.2}

        # Threat initial state (incoming from top-right heading towards defended sector)
        self.threat_pos = {"x": 840.0, "y": 140.0}
        self.threat_vel = {"vx": -3.8, "vy": 3.2}
        self.threat_acc = {"ax": 0.0, "ay": 0.0}

        # Interceptor virtual state
        self.interceptor_pos = {"x": self.fighter_pos["x"], "y": self.fighter_pos["y"]}
        self.interceptor_vel = {"vx": 0.0, "vy": 0.0}
        self.interceptor_speed = 7.5  # Cruising simulation speed units/tick
        self.interceptor_status = "STANDBY"  # STANDBY, DEPLOYED, INTERCEPTED, EXPIRED

        # Meeting point
        self.meeting_point = None
        self.tti = 0.0  # Time to intercept in seconds/steps

        # Timers and counters
        self.step_count = 0
        self.sim_time = 0.0  # In seconds (e.g. dt = 0.1s)
        self.dt = 0.1
        self.maneuver_timer = 0
        self.interception_achieved = False
        self.threat_active = True

    def update_threat(self):
        if not self.threat_active or self.interception_achieved:
            return

        self.step_count += 1
        self.sim_time += self.dt
        t = self.sim_time

        # Profile dynamics
        if self.profile == ThreatProfile.STRAIGHT:
            # Constant velocity with minor atmospheric drift
            self.threat_acc["ax"] = 0.0
            self.threat_acc["ay"] = 0.0

        elif self.profile == ThreatProfile.VARIABLE:
            # Smooth sinusoidal curvature
            self.threat_acc["ax"] = 0.45 * math.sin(0.4 * t)
            self.threat_acc["ay"] = 0.35 * math.cos(0.35 * t)

        elif self.profile == ThreatProfile.MANEUVERING:
            # Periodic discrete evasive turns
            self.maneuver_timer += 1
            if self.maneuver_timer % 35 == 0:
                # Direction shift
                angle_offset = random.choice([-0.8, 0.8, -1.2, 1.2])
                speed = math.hypot(self.threat_vel["vx"], self.threat_vel["vy"])
                curr_angle = math.atan2(self.threat_vel["vy"], self.threat_vel["vx"])
                new_angle = curr_angle + angle_offset
                self.threat_vel["vx"] = speed * math.cos(new_angle)
                self.threat_vel["vy"] = speed * math.sin(new_angle)
                self.threat_acc["ax"] = 0.0
                self.threat_acc["ay"] = 0.0
            else:
                self.threat_acc["ax"] = 0.15 * math.sin(0.8 * t)
                self.threat_acc["ay"] = 0.15 * math.cos(0.8 * t)

        elif self.profile == ThreatProfile.RANDOM_NOISE:
            # Brownian perturbations
            self.threat_acc["ax"] = (random.random() - 0.5) * 1.2
            self.threat_acc["ay"] = (random.random() - 0.5) * 1.2

        # Numerical integration (Euler)
        self.threat_vel["vx"] += self.threat_acc["ax"] * self.dt
        self.threat_vel["vy"] += self.threat_acc["ay"] * self.dt

        # Speed normalization clamp
        current_speed = math.hypot(self.threat_vel["vx"], self.threat_vel["vy"])
        target_speed = 4.8
        if current_speed > 0.01:
            ratio = min(max(current_speed, 3.0), 6.5) / current_speed
            self.threat_vel["vx"] *= ratio
            self.threat_vel["vy"] *= ratio

        self.threat_pos["x"] += self.threat_vel["vx"]
        self.threat_pos["y"] += self.threat_vel["vy"]

        # Check bounds (radar border)
        if (self.threat_pos["x"] < 50 or self.threat_pos["x"] > 950 or
            self.threat_pos["y"] < 50 or self.threat_pos["y"] > 950):
            # Slow turn back toward center
            dx = 500 - self.threat_pos["x"]
            dy = 500 - self.threat_pos["y"]
            angle = math.atan2(dy, dx)
            self.threat_vel["vx"] = 4.0 * math.cos(angle)
            self.threat_vel["vy"] = 4.0 * math.sin(angle)

    def deploy_interceptor(self, target_point: Dict[str, float]):
        """Deploy virtual interceptor toward targeted meeting point."""
        if self.interceptor_status == "STANDBY":
            self.interceptor_status = "DEPLOYED"
            self.interceptor_pos = {"x": self.fighter_pos["x"], "y": self.fighter_pos["y"]}
            self.meeting_point = target_point

    def update_interceptor(self, updated_meeting_point: Dict[str, float] = None):
        if self.interceptor_status != "DEPLOYED" or self.interception_achieved:
            return

        if updated_meeting_point:
            self.meeting_point = updated_meeting_point

        target = self.meeting_point or self.threat_pos

        dx = target["x"] - self.interceptor_pos["x"]
        dy = target["y"] - self.interceptor_pos["y"]
        dist = math.hypot(dx, dy)

        # Proportional pursuit vector towards meeting point
        if dist > 0.001:
            self.interceptor_vel["vx"] = (dx / dist) * self.interceptor_speed
            self.interceptor_vel["vy"] = (dy / dist) * self.interceptor_speed
        else:
            self.interceptor_vel["vx"] = 0.0
            self.interceptor_vel["vy"] = 0.0

        self.interceptor_pos["x"] += self.interceptor_vel["vx"]
        self.interceptor_pos["y"] += self.interceptor_vel["vy"]

        # Check simulated interception condition (abstract encounter radius: 18 units)
        threat_dist = math.hypot(
            self.interceptor_pos["x"] - self.threat_pos["x"],
            self.interceptor_pos["y"] - self.threat_pos["y"]
        )

        if threat_dist <= 20.0 or (dist <= 12.0 and threat_dist <= 30.0):
            self.interception_achieved = True
            self.interceptor_status = "INTERCEPTED"
            self.threat_active = False

    def generate_noisy_observation(self) -> Dict[str, float]:
        """Simulate radar sensor measurement with Gaussian noise."""
        sigma = 4.5 * self.noise_level
        obs_x = self.threat_pos["x"] + random.gauss(0, sigma)
        obs_y = self.threat_pos["y"] + random.gauss(0, sigma)
        return {"x": round(obs_x, 2), "y": round(obs_y, 2)}
