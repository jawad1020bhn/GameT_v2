# Premiere Manager: Enterprise Edition

A high-fidelity football management simulation engine built with React, TypeScript, and Vite. This project focuses on realistic data modeling, dynamic player evolution, and a living game world.

## 🚀 Features

### 1. Dynamic Team Role System (DTRS)
A comprehensive framework for player development and squad hierarchy.
- **Tier 1 (Foundation):** Academy Graduate, Emerging Talent, Squad Player, Workhorse.
- **Tier 2 (Established):** Consistent Performer, Mentor, Fan Favorite, Clutch Player, Tactical Anchor.
- **Tier 3 (Elite):** Team Leader, Franchise Player, Club Icon, Legacy Legend.
- **Specialized:** Wildcard, Enforcer, Captain Material, Super Sub, Veteran Presence.
- **Effects:** Roles dynamically influence Match Revenue, Merchandise Sales, Training Efficiency, Injury Resistance, and Tactical Adaptability.

### 2. High-Performance Simulation Engine
- **No Artificial Delays:** Simulation speed is bounded only by calculation time.
- **Calendar-Based Progression:** Visualizes day-by-day advancement rather than arbitrary percentage bars.
- **Zero-Blocking UI:** Uses efficient yielding to keep the interface responsive during heavy processing seasons.

### 3. Living World & Data Integrity
- **Procedural Generation:** Automatically fills incomplete squads with procedurally generated players to ensure valid competitions.
- **Dynamic Evolution:** Players grow and decline daily based on potential, age, and active Roles.
- **Financial Ecosystem:** Tracks wages, transfer budgets, merchandise income (boosted by Franchise Players/Fan Favorites), and facility maintenance.

### 4. Heartbeat Match Engine
- **Tactical Depth:** Interactions between formations and instructions (High Line vs Counter Attack).
- **Environmental Factors:** Weather effects (Rain, Snow, Heat) influence stamina and passing.
- **Role Integration:** "Home Atmosphere" bonuses from Fan Favorites, "Defensive Organization" from Tactical Anchors.

## 🛠️ Tech Stack
- **Frontend:** React 19, TailwindCSS
- **Build Tool:** Vite
- **Language:** TypeScript
- **State Management:** React Context API + useReducer

## 🎮 How to Run

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Start Development Server:**
    ```bash
    npm run dev
    ```

3.  **Open in Browser:**
    Navigate to `http://localhost:5173` (or the port shown in terminal).

## 📋 System Requirements
- Node.js (v18 or higher recommended)
- npm (v9 or higher)
