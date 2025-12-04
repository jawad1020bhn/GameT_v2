import React, { createContext, useContext, useReducer, ReactNode, useState, useEffect, useRef } from 'react';
import { GameState, League, Club, GameMessage, View, NewsItem, Negotiation, TransferOffer, Tactics, ManagerProfile } from '../types';
import { INITIAL_LEAGUES_DATA, INITIAL_DATE, START_YEAR } from '../constants';
import { REAL_WORLD_LEAGUES } from '../services/real_world_data';
import { DataIntegrityService } from '../services/DataIntegrityService';
import { processDay, addDays, calculatePlayerValue, transitionSeason } from '../services/engine';

type Action =
    | { type: 'START_GAME'; payload: { clubId: number } }
    | { type: 'CREATE_MANAGER'; payload: ManagerProfile }
    | { type: 'UPDATE_STATE'; payload: GameState }
    | { type: 'SET_SIMULATION'; payload: Partial<GameState['simulation']> }
    | { type: 'MARK_READ'; payload: number }
    | { type: 'START_NEGOTIATION'; payload: { playerId: number, sellingClubId: number } }
    | { type: 'SUBMIT_OFFER'; payload: { negotiationId: string, offer: TransferOffer } }
    | { type: 'WITHDRAW_NEGOTIATION'; payload: string }
    | { type: 'UPDATE_TACTICS'; payload: Partial<Tactics> }
    | { type: 'APPLY_SHOUT'; payload: { type: Tactics['temporary_boost']['type'] } }
    | { type: 'START_NEW_SEASON' }
    | { type: 'RESET_GAME' };

interface GameContextType {
    state: GameState;
    dispatch: React.Dispatch<Action>;
    currentView: View;
    setCurrentView: (v: View) => void;
    playerClub: Club | undefined;
    simulatePeriod: (days: number) => Promise<void>;
    saveGame: () => void;
    loadGame: () => void;
    resetGame: () => void;
    deleteSave: () => void;
    hasSave: boolean;
}

const initialManager: ManagerProfile = {
    name: "New Manager",
    age: 40,
    nationality: "Unknown",
    style: "tactician",
    stats: {
        man_management: 50,
        tactical_knowledge: 50,
        youth_development: 50,
        financial_acumen: 50,
        media_handling: 50
    },
    reputation: 50,
    avatar_id: 1,
    id: 0,
    currentClubId: null,
    history: []
};

const initialState: GameState = {
    currentDate: INITIAL_DATE,
    currentSeasonStartYear: START_YEAR,
    playerClubId: null,
    manager: initialManager,
    leagues: (() => {
        // Transform array to object map
        const leagueMap: { [key: string]: League } = {};
        const processedLeagues = DataIntegrityService.processLeagues(REAL_WORLD_LEAGUES);
        processedLeagues.forEach(l => {
            leagueMap[l.name] = l;
        });
        return leagueMap;
    })(),
    messages: [],
    news: [
        {
            id: 1,
            date: "2025-06-15",
            headline: "2025/26 SEASON LOADING",
            content: "The fixture list for the new campaign has been released. Fans are eager to see who will dethrone the champions.",
            image_type: 'match'
        },
        {
            id: 2,
            date: "2025-06-16",
            headline: "SUMMER WINDOW OPEN",
            content: "Clubs can now officially register new players. Spending is expected to reach record highs this summer.",
            image_type: 'transfer'
        }
    ],
    social_feed: [],
    negotiations: [],
    aiManagers: [],
    recent_transfers: [],
    isProcessing: false,
    simulation: {
        isActive: false,
        type: 'day',
        progress: 0,
        statusText: '',
        recentEvents: []
    }
};

const gameReducer = (state: GameState, action: Action): GameState => {
    switch (action.type) {
        case 'START_GAME':
            const leagues = { ...state.leagues };
            for (const key in leagues) {
                const club = leagues[key].clubs.find(c => c.id === action.payload.clubId);
                if (club) {
                    club.tactics = {
                        formation: "4-3-3",
                        instructions: {
                            line_height: 50,
                            passing_directness: 50,
                            pressing_intensity: 50,
                            tempo: 50
                        },
                        lineup: club.players.sort((a, b) => b.overall - a.overall).slice(0, 11).map(p => p.id),
                        familiarity: 70
                    };
                }
            }

            return {
                ...state,
                leagues,
                playerClubId: action.payload.clubId,
                messages: [{
                    id: 1,
                    date: INITIAL_DATE,
                    sender: "Board of Directors",
                    subject: "Official Appointment",
                    body: `Welcome to the club, ${state.manager.name}. We are currently in pre-season. The league campaign begins on August 15th. Use this time to evaluate the squad. We have high hopes for your tenure.`,
                    read: false,
                    type: 'email'
                }]
            };
        case 'CREATE_MANAGER':
            return {
                ...state,
                manager: action.payload
            };
        case 'UPDATE_STATE':
            return action.payload;
        case 'SET_SIMULATION':
            return {
                ...state,
                simulation: { ...state.simulation, ...action.payload }
            };
        case 'MARK_READ':
            return {
                ...state,
                messages: state.messages.map(m => m.id === action.payload ? { ...m, read: true } : m)
            };
        case 'START_NEGOTIATION': {
            if (state.negotiations.find(n => n.playerId === action.payload.playerId && n.status === 'active')) return state;
            const player = Object.values(state.leagues).flatMap(l => l.clubs).flatMap(c => c.players).find(p => p.id === action.payload.playerId);
            if (!player) return state;
            const trueValue = calculatePlayerValue(player);
            const aiValuation = {
                min_fee: Math.floor(trueValue * (1 + Math.random() * 0.2)),
                patience: 100,
                agent_patience: 100,
                demanded_wage: Math.floor(player.salary * (1.2 + Math.random() * 0.3)),
                demanded_role: player.squad_role
            };
            const newNeg: Negotiation = {
                id: `neg_${Date.now()}`,
                playerId: action.payload.playerId,
                sellingClubId: action.payload.sellingClubId,
                buyingClubId: state.playerClubId!,
                status: 'active',
                stage: 'club_fee',
                ai_valuation: aiValuation,
                last_updated: state.currentDate,
                next_response_date: state.currentDate
            };
            return { ...state, negotiations: [...state.negotiations, newNeg] };
        }
        case 'SUBMIT_OFFER': {
            return {
                ...state,
                negotiations: state.negotiations.map(n => {
                    if (n.id === action.payload.negotiationId) {
                        return {
                            ...n,
                            latest_offer: action.payload.offer,
                            next_response_date: addDays(state.currentDate, 1),
                            last_updated: state.currentDate
                        };
                    }
                    return n;
                })
            };
        }
        case 'WITHDRAW_NEGOTIATION':
            return {
                ...state,
                negotiations: state.negotiations.filter(n => n.id !== action.payload)
            };
        case 'UPDATE_TACTICS': {
            const leagues = { ...state.leagues };
            let found = false;
            for (const key in leagues) {
                const club = leagues[key].clubs.find(c => c.id === state.playerClubId);
                if (club) {
                    if (!club.tactics) club.tactics = {} as Tactics;
                    club.tactics = { ...club.tactics, ...action.payload };
                    club.tactics.familiarity = Math.max(10, club.tactics.familiarity - 2);
                    found = true;
                    break;
                }
            }
            if (!found) return state;
            return { ...state, leagues };
        }
        case 'APPLY_SHOUT': {
            const leagues = { ...state.leagues };
            for (const key in leagues) {
                const club = leagues[key].clubs.find(c => c.id === state.playerClubId);
                if (club && club.tactics) {
                    club.tactics.temporary_boost = {
                        type: action.payload.type,
                        expires: 0
                    };
                }
            }
            return { ...state, leagues };
        }
        case 'START_NEW_SEASON': {
            const nextState = transitionSeason(state);
            delete nextState.seasonGala;
            return nextState;
        }
        case 'RESET_GAME':
            return JSON.parse(JSON.stringify(initialState));
        default:
            return state;
    }
};

const SAVE_KEY = 'pm_save_data';

const GameContext = createContext<GameContextType | null>(null);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(gameReducer, initialState);
    const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
    const [hasSave, setHasSave] = useState(false);

    const stateRef = useRef(state);
    useEffect(() => { stateRef.current = state; }, [state]);

    useEffect(() => {
        const saved = localStorage.getItem(SAVE_KEY);
        setHasSave(!!saved);
    }, []);

    const saveGame = () => {
        try {
            localStorage.setItem(SAVE_KEY, JSON.stringify(state));
            setHasSave(true);
            alert("Game Saved Successfully!");
        } catch (e) {
            console.error("Save failed", e);
            alert("Failed to save game. Storage might be full.");
        }
    };

    const loadGame = () => {
        try {
            const saved = localStorage.getItem(SAVE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                dispatch({ type: 'UPDATE_STATE', payload: parsed });
            }
        } catch (e) {
            console.error("Load failed", e);
            alert("Failed to load game save.");
        }
    };

    const resetGame = () => {
        dispatch({ type: 'RESET_GAME' });
    };

    const deleteSave = () => {
        localStorage.removeItem(SAVE_KEY);
        setHasSave(false);
    };

    const simulatePeriod = async (days: number) => {
        dispatch({
            type: 'SET_SIMULATION',
            payload: {
                isActive: true,
                type: days === 1 ? 'day' : 'week',
                progress: 0,
                statusText: 'Processing...',
                recentEvents: []
            }
        });

        let currentState = state;

        for (let i = 0; i < days; i++) {
            // Backend Optimization: Yield to event loop to allow UI repaint, but no artificial delay
            await new Promise(resolve => setTimeout(resolve, 0));

            dispatch({
                type: 'SET_SIMULATION',
                payload: {
                    progress: (i / days) * 100,
                    statusText: `Simulating ${currentState.currentDate}`
                }
            });

            // Process Shouts via Ref
            const latestGlobalState = stateRef.current;
            let latestPlayerClub: Club | undefined;
            Object.values(latestGlobalState.leagues).forEach(l => {
                const c = (l as League).clubs.find(c => c.id === state.playerClubId);
                if (c) latestPlayerClub = c;
            });
            if (latestPlayerClub && latestPlayerClub.tactics && latestPlayerClub.tactics.temporary_boost) {
                Object.values(currentState.leagues).forEach(l => {
                    const c = (l as League).clubs.find(c => c.id === state.playerClubId);
                    if (c && c.tactics) {
                        c.tactics.temporary_boost = latestPlayerClub!.tactics!.temporary_boost;
                    }
                });
            }

            // Run Logic (Optimized: No throttling)
            const result = processDay(currentState);
            currentState = result.newState;

            dispatch({
                type: 'SET_SIMULATION',
                payload: {
                    recentEvents: result.events,
                    liveStats: currentState.simulation.liveStats
                }
            });

            if (currentState.seasonGala) {
                dispatch({ type: 'UPDATE_STATE', payload: currentState });
                dispatch({ type: 'SET_SIMULATION', payload: { isActive: false, progress: 100 } });
                return;
            }
        }

        // Finalize immediately
        dispatch({ type: 'UPDATE_STATE', payload: currentState });
        dispatch({ type: 'SET_SIMULATION', payload: { isActive: false } });
    };

    const findPlayerClub = (): Club | undefined => {
        if (!state.playerClubId) return undefined;
        for (const key in state.leagues) {
            const found = state.leagues[key].clubs.find(c => c.id === state.playerClubId);
            if (found) return found;
        }
        return undefined;
    };

    return (
        <GameContext.Provider value={{ state, dispatch, currentView, setCurrentView, playerClub: findPlayerClub(), simulatePeriod, saveGame, loadGame, resetGame, deleteSave, hasSave }}>
            {children}
        </GameContext.Provider>
    );
};

export const useGame = () => {
    const context = useContext(GameContext);
    if (!context) throw new Error("useGame must be used within GameProvider");
    return context;
};