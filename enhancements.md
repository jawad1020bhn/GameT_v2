# Game Enhancement Proposals

Based on a comprehensive code review, the following improvements are recommended to deepen gameplay and resolve architectural debt.

## 1. Critical Architecture Refactor
**Issue:** Logic Duplication ("Split-Brain Simulation")
*   `services/engine.ts` and `services/advanced_engine.ts` both implement player growth (`updatePlayersDaily` vs `processDailyPlayerGrowth`) and economic updates.
*   `engine.ts` calls `AdvancedEngine.processDailyEvents`, causing potential double-counting of growth/decline events.

**Recommendation:**
*   **Merge Engines:** Migrate the superior AI logic (Transfer Market, Manager Movement) from `advanced_engine.ts` into `engine.ts`.
*   **Deprecate:** Delete `advanced_engine.ts` to ensure a single source of truth for the simulation loop.

## 2. Gameplay Mechanics (Depth)

### Active Mentorship
*   **Current:** `RoleService` provides a passive "Team Training" boost from all Mentors.
*   **Proposed:** Add a "Mentorship" interface in the Squad view.
    *   Allow manual pairing of a Senior Player (Mentor) and a Junior Player (Mentee).
    *   Effect: Mentee gains specific attributes or personality traits from the Mentor over time.

### Financial Engineering (Loans)
*   **Current:** Clubs pay interest on debt but cannot actively borrow money.
*   **Proposed:** Add "Bank Services" to `Headquarters`.
    *   Allow requesting loans (Short-term/Long-term) to inject cash for transfers/upgrades.
    *   Dynamic interest rates based on `Club.reputation`.

### Scouting "Fog of War"
*   **Current:** Scouting reveals players in a list, presumably with full stats visible (or slightly masked).
*   **Proposed:** Implement a true knowledge level (0-100%).
    *   **0%:** Attributes Hidden (shown as range 1-99).
    *   **50%:** Attributes range narrowed (e.g., 70-80).
    *   **100%:** Exact attributes revealed.
    *   Scouting Assignments slowly increase knowledge.

## 3. UI/UX Enhancements

### Dynamic Dashboard
*   **Current:** The "Next Match" card uses a static background image.
*   **Proposed:** Live Widgets.
    *   **Form Guide:** Visual `W-D-L-W-W` ticker.
    *   **Mini-Table:** Top 5 + User position.
    *   **Dynamic Backgrounds:** Change based on competition (UCL vs League).

### Interactive World Map
*   **Current:** `WorldNetwork.tsx` exists.
*   **Proposed:** Make nodes clickable to view a "Club Snapshot" overlay (Top players, budget, history).

## 4. Data Quality
*   **Names:** While improved, the name databases in `constants.ts` are still generic.
*   **Proposed:** Add distinct name lists for South America (Brazil/Argentina differentiation) and Asia to improve immersion.
