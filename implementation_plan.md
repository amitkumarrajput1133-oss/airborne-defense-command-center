# AI-Based Airborne Threat Interception & Predictive Tracking Simulator

This document outlines the architecture and implementation steps for building the simulation application.

## Goal Description

Build a complete, polished, demo-ready software project for simulating airborne threat interception. The application consists of a React-based frontend for visualization and control, and a Python-based backend (FastAPI) for simulation physics, tracking, and AI trajectory prediction. It is designed to be an educational prototype running in a professional dark-themed dashboard.

## User Review Required

> [!IMPORTANT]
> Please review the proposed architecture and tech stack. The frontend will be built using Vite with React + TypeScript, Tailwind CSS, Recharts for telemetry graphs, and HTML5 Canvas for the radar visualization. The backend will use FastAPI, NumPy, and Scikit-learn (or simple predictive logic) for handling simulation states and predictions. Is this split acceptable?

## Open Questions

> [!WARNING]
> 1. Do you have a specific preference for the Scikit-learn model used for trajectory prediction (e.g., Linear Regression, Polynomial Regression, or a basic Multi-Layer Perceptron), or should I choose what works best for a smooth demo?
> 2. For the radar canvas, are you okay with a custom HTML5 Canvas implementation, or would you prefer D3.js or SVG for better scaling? (Canvas is generally more performant for continuous frame updates).

## Proposed Architecture

### Backend (Python / FastAPI)
- **Framework**: FastAPI
- **Math/ML**: NumPy, Scikit-Learn
- **Core Modules**:
  - `simulation.py`: Manages the true state of the threat and interceptor (positions, velocities) based on different scenarios (Straight, Variable, Random Noise, Maneuvering).
  - `tracking.py`: Implements a simple noise filter (e.g., Exponential Smoothing or a simplified Kalman Filter) on simulated observations.
  - `prediction.py`: ML-based trajectory prediction (e.g., Scikit-learn regression model) predicting future points based on recent history.
  - `interception.py`: Calculates the predicted interception point and controls virtual interceptor deployment logic.
  - `main.py`: Exposes WebSocket or polling endpoints to stream data continuously to the frontend.

### Frontend (React / TypeScript / Vite)
- **Framework**: React 18, Vite, TypeScript
- **Styling**: Tailwind CSS (Dark theme, sleek, professional UI).
- **Visualization**: HTML5 Canvas for the 2D radar view. Recharts for the Trajectory/Telemetry Graphs.
- **Core Modules**:
  - `Dashboard`: Main view with radar, telemetry panel, and trajectory graph.
  - `RadarSimulation`: Canvas-based visualizer rendering the fighter aircraft, threat, interceptor, and trajectories.
  - `ControlPanel`: Play, pause, reset, scenario selection, and manual "Deploy Interceptor" buttons.
  - `TelemetryPanel`: Live metrics and status indicators.
  - `EventLog`: Scrolling console for system events.
  - `SystemArchitecturePage`: Interactive diagram page.
  - `AIPipelinePage`: Educational explanation of the ML tracking pipeline.

## Implementation Steps

### Phase 1: Project Setup
1. Initialize the Python backend environment and FastAPI app.
2. Initialize the React frontend with Vite, Tailwind CSS, and necessary dependencies.
3. Establish WebSocket communication between frontend and backend.

### Phase 2: Backend Simulation & AI
1. Implement the physics simulation (threat movement models).
2. Implement the noisy sensor tracking module.
3. Build and train a lightweight regression model for trajectory prediction.
4. Implement interception point calculation.

### Phase 3: Frontend Layout & Controls
1. Create the main Dashboard layout.
2. Build the Control Panel and Telemetry Panel components.
3. Implement the scrolling Event Log.

### Phase 4: Radar Visualization & Charts
1. Implement the HTML5 Canvas Radar view to draw entities and predicted paths based on backend data.
2. Integrate Recharts for real-time tracking accuracy and position graphs.

### Phase 5: Educational Pages & Polish
1. Build the System Architecture page.
2. Build the AI / ML Pipeline page.
3. Add a "Demo Mode" that auto-plays a sequence.
4. Finalize styles (dark mode, crisp typography, no gamer aesthetics).

## Verification Plan

### Automated Tests
- Ensure the FastAPI server boots and accurately generates simulation steps.
- Verify the React app connects to the backend and renders without errors.

### Manual Verification
- Test each scenario (Straight, Variable, Noisy, Maneuvering) to ensure the AI prediction responds correctly.
- Verify the virtual interceptor successfully intersects the simulated threat in the demo.
