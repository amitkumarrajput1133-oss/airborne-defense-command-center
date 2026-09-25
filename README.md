# 🛰️ Airborne Defense Command Center (Digital Twin & SIL Simulation)

<div align="center">
  <img src="interceptor.png" alt="Unified Single-Body Kinetic Interceptor Technical Schematic" width="100%" />
</div>

---

## 🔬 Technical Subsystem Breakdown (USBI Architecture)

The **Unified Single-Body Kinetic Interceptor (USBI)** system integrates payload, guidance, and propulsion into a non-separable carbon-composite fuselage to eliminate multi-stage separation latency and maximize thrust-to-weight efficiency.
+-------------------------------------------------------------------------------------------------+
|                                 USBI COMPONENT LAYOUT MAP                                       |
+-------------------+--------------------+------------------------+-------------------------------+
| NOSE SECTION      | CONTROL SECTION    | AVIONICS & POWER       | PROPULSION & TAIL             |
| - Multi-Mode      | - Forward DACS     | - Guidance Computer    | - Solid Rocket Engine         |
|   Seeker (MMW/IR) |   Nozzle Ring      | - Distributed Avionics | - Ceramic Nozzle & TVC        |
| - Electro-Optical | - Miniature Solid  | - High-Density Power   | - Carbon Composite Casing     |
|   Aperture Window |   Motors           |   Module               | - Deployable Grid Fins        |
+-------------------+--------------------+------------------------+-------------------------------+

### 1. Seeker & Sensor Package (Nose Section)
* **Unified Multi-Mode Seeker (IR/Visible/Ka-Band MMW):** Combines radio-frequency millimeter-wave (35GHz Ka-Band) radar with electro-optical/infrared tracking for all-weather, high-jamming resistance during terminal homing.
* **Electro-Optical Aperture Window:** Heat-resistant quartz/sapphire aperture designed to withstand extreme aerothermal friction during high-Mach ascent.
* **Integrated Cryogenic Cooling System:** Rapidly cools infrared focal plane arrays to prevent thermal blinding from high-altitude atmospheric skin friction.

### 2. Divert & Attitude Control System (DACS)
* **Forward & Mid-Body DACS Nozzles:** A distributed ring of high-response lateral thruster nozzles that deliver instantaneous side-force pulses ($>30g$).
* **Miniature Solid Propellant DACS Motors:** Provides direct thrust vectoring in low-density, high-altitude air where aerodynamic control surfaces produce insufficient dynamic pressure ($q$).

### 3. Guidance, Avionics & Power Core
* **Unified Guidance & Navigation Computer:** Radiation-hardened FPGA/SoC executing real-time Kalman filtering and high-speed intercept trajectory computation.
* **Distributed Aerospace-Grade Electronics:** Shock-mounted avionics modules positioned along the central spine to balance mass distribution.
* **Battery Packs & Power Module:** High-discharge Lithium-Polymer energy module providing stable voltage during extreme lateral g-force pulses.
* **Umbilical Connector / Integration Interface:** MIL-STD-1760 compliant data and power interface connecting the interceptor directly to the launch platform (`VIPER-01`).

### 4. Main Propulsion & Thrust Vector Control (TVC)
* **Unified Carbon Composite Casing:** Filament-wound carbon-carbon shell structure housing the main solid propellant grain without heavy inter-stage joint rings.
* **Unified Propellant Grain:** High-impulse HTPB-based solid propellant optimized for rapid boost-to-intercept timelines.
* **Ceramic-Matrix Rear Nozzle:** High-temperature ceramic material capable of handling continuous $2000^\circ\text{C}+$ exhaust plumes.
* **TVC Actuators & Nozzle Mechanisms:** Electromechanical actuators controlling nozzle deflection for pitch and yaw vectoring during initial boost phase.

### 5. Airframe & Aerodynamic Control
* **Titanium Alloy & Composite Skin:** Lightweight structural shell providing thermal shielding and mechanical rigidity under high torsional loads.
* **Deployable Grid Fins:** Compact rear grid fins that deploy post-ejection for aerodynamic stabilization during mid-to-low altitude flight segments.

An executive-level **Software-In-The-Loop (SIL) simulation dashboard** for an air-launched 1.8m single-body kinetic interceptor operating in low-density, high-altitude atmospheric conditions.

---

## 🎯 Key Engineering Architecture
- **1.8m Single-Body Composite Casing:** Carbon-composite structural hull engineered to withstand $>30g$ lateral divert thrust without staging latency.
- **Low-Density Altitude Maneuverability:** Integrates a forward-ring **Mini-DACS (Divert & Attitude Control System)** utilizing cold/solid gas micro-thrusters to achieve instant $90^\circ$ turns where aerodynamic fins fail due to thin atmosphere.
- **Ka-Band MMW Radar Seeker:** High-frequency millimeter-wave target acquisition resistant to aerothermal optical blinding and ECM jamming.
- **Cinematic Auto-Patrol Radar Scope:** Real-time HTML5 Canvas tracking platform movement, threat vector homing, and interceptor ejection.

---

## 🏗️ Command Center Dashboard Layout

| Panel | Core Functionality |
| :--- | :--- |
| **Left Panel** | **Interactive Subsystem Blueprint:** Cutaway schematic with active hotspots (Seeker, Mini-DACS, AI Core, Motor) and dynamic material telemetry. |
| **Center Panel** | **Tactical Radar Scope:** Auto-patrol flight trajectory of `VIPER-01`, slow-motion threat homing, interceptor ejection, and ECM static jamming effects. |
| **Right Panel** | **Live Telemetry Stream:** Dynamic Mach velocity, distance-to-target tracking, and real-time Threat Assessment Gauge. |
| **Footer** | **Terminal Log:** Sequential event stream tracking system states in real time. |

---

## 🚀 Run Locally

### Prerequisites
- **Node.js** (v18 or higher)

### Setup Steps
1. **Install dependencies:**
   ```bash
   npm install
