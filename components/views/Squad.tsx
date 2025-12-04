
import React, { useState, useMemo } from 'react';
import { useGame } from '../../context/GameContext';
import { Player } from '../../types';
import { PlayerModal } from '../modals/PlayerModal';
import { calculateWinProbability } from '../../services/engine';

const getPositionColor = (pos: string) => {
  switch(pos) {
    case 'GK': return 'text-yellow-500';
    case 'DEF': return 'text-blue-400';
    case 'MID': return 'text-emerald-400';
    case 'FWD': 
    case 'ST': return 'text-rose-400';
    default: return 'text-white';
  }
};

const getRatingColor = (rating: number) => {
  if (rating >= 90) return 'bg-emerald-600 text-white';
  if (rating >= 80) return 'bg-emerald-800 text-white';
  if (rating >= 70) return 'bg-neutral-700 text-white';
  return 'bg-neutral-800 text-neutral-400';
};

// --- TACTICAL BOARD COMPONENT ---
const FORMATIONS = {
    "4-3-3": {
        positions: [
            { role: 'GK', top: 90, left: 50 },
            { role: 'LB', top: 75, left: 15 }, { role: 'CB', top: 75, left: 40 }, { role: 'CB', top: 75, left: 60 }, { role: 'RB', top: 75, left: 85 },
            { role: 'CM', top: 50, left: 30 }, { role: 'CDM', top: 60, left: 50 }, { role: 'CM', top: 50, left: 70 },
            { role: 'LW', top: 25, left: 15 }, { role: 'ST', top: 20, left: 50 }, { role: 'RW', top: 25, left: 85 }
        ]
    },
    "4-4-2": {
        positions: [
            { role: 'GK', top: 90, left: 50 },
            { role: 'LB', top: 75, left: 15 }, { role: 'CB', top: 75, left: 40 }, { role: 'CB', top: 75, left: 60 }, { role: 'RB', top: 75, left: 85 },
            { role: 'LM', top: 45, left: 15 }, { role: 'CM', top: 50, left: 40 }, { role: 'CM', top: 50, left: 60 }, { role: 'RM', top: 45, left: 85 },
            { role: 'ST', top: 20, left: 40 }, { role: 'ST', top: 20, left: 60 }
        ]
    },
    "3-5-2": {
        positions: [
             { role: 'GK', top: 90, left: 50 },
             { role: 'CB', top: 75, left: 30 }, { role: 'CB', top: 80, left: 50 }, { role: 'CB', top: 75, left: 70 },
             { role: 'LWB', top: 50, left: 10 }, { role: 'CDM', top: 60, left: 40 }, { role: 'CDM', top: 60, left: 60 }, { role: 'RWB', top: 50, left: 90 }, { role: 'CAM', top: 40, left: 50 },
             { role: 'ST', top: 20, left: 40 }, { role: 'ST', top: 20, left: 60 }
        ]
    },
     "5-3-2": {
        positions: [
            { role: 'GK', top: 90, left: 50 },
            { role: 'LWB', top: 65, left: 10 }, { role: 'CB', top: 75, left: 30 }, { role: 'CB', top: 75, left: 50 }, { role: 'CB', top: 75, left: 70 }, { role: 'RWB', top: 65, left: 90 },
            { role: 'CM', top: 50, left: 30 }, { role: 'CM', top: 50, left: 50 }, { role: 'CM', top: 50, left: 70 },
            { role: 'ST', top: 20, left: 40 }, { role: 'ST', top: 20, left: 60 }
        ]
    },
    "4-2-3-1": {
        positions: [
            { role: 'GK', top: 90, left: 50 },
            { role: 'LB', top: 75, left: 15 }, { role: 'CB', top: 75, left: 40 }, { role: 'CB', top: 75, left: 60 }, { role: 'RB', top: 75, left: 85 },
            { role: 'CDM', top: 60, left: 40 }, { role: 'CDM', top: 60, left: 60 },
            { role: 'LAM', top: 35, left: 20 }, { role: 'CAM', top: 35, left: 50 }, { role: 'RAM', top: 35, left: 80 },
            { role: 'ST', top: 15, left: 50 }
        ]
    }
};

const TacticalBoard = ({ club, onUpdate }: { club: any, onUpdate: (t: any) => void }) => {
    const { state } = useGame();
    const tactics = club.tactics || { 
        formation: "4-3-3", 
        instructions: { line_height: 50, passing_directness: 50, pressing_intensity: 50, tempo: 50 },
        lineup: [],
        familiarity: 80
    };

    const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);

    // Find next opponent for win prob calc
    let opponent = null;
    const league = state.leagues[club.leagueId];
    const nextMatch = league.fixtures.find(f => !f.played && (f.homeClubId === club.id || f.awayClubId === club.id));
    if (nextMatch) {
        const oppId = nextMatch.homeClubId === club.id ? nextMatch.awayClubId : nextMatch.homeClubId;
        opponent = league.clubs.find(c => c.id === oppId);
    }

    const winProb = opponent ? calculateWinProbability(club, opponent) : 0.5;

    const handleFormationChange = (fmt: string) => {
        onUpdate({ ...tactics, formation: fmt });
    };

    const handleInstructionChange = (key: string, val: number) => {
        onUpdate({ ...tactics, instructions: { ...tactics.instructions, [key]: val } });
    };

    const handlePlayerAssign = (playerId: number) => {
        if (selectedSlotIndex === null) return;
        const newLineup = [...tactics.lineup];
        
        // If player already in lineup, swap
        const existingIndex = newLineup.indexOf(playerId);
        if (existingIndex !== -1) {
            newLineup[existingIndex] = newLineup[selectedSlotIndex];
        }
        newLineup[selectedSlotIndex] = playerId;
        
        onUpdate({ ...tactics, lineup: newLineup });
        setSelectedSlotIndex(null);
    };

    const currentPositions = FORMATIONS[tactics.formation as keyof typeof FORMATIONS]?.positions || FORMATIONS["4-3-3"].positions;

    return (
        <div className="h-full flex flex-col lg:flex-row gap-6 overflow-hidden animate-in fade-in duration-300">
            
            {/* LEFT: PITCH & SELECTION */}
            <div className="flex-1 flex flex-col bg-neutral-900 rounded-xl border border-white/10 shadow-2xl relative overflow-hidden">
                
                {/* Roster Overlay (When slot selected) */}
                {selectedSlotIndex !== null && (
                    <div className="absolute inset-0 z-20 bg-neutral-950/95 backdrop-blur flex flex-col animate-in slide-in-from-bottom-10">
                        <div className="p-4 border-b border-white/10 flex justify-between items-center">
                            <h3 className="font-bold text-white font-oswald uppercase tracking-wide">Select Player</h3>
                            <button onClick={() => setSelectedSlotIndex(null)} className="text-neutral-400 hover:text-white">✕</button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
                            {club.players.sort((a: Player, b: Player) => b.overall - a.overall).map((p: Player) => {
                                const isSelected = tactics.lineup.includes(p.id);
                                return (
                                    <div 
                                        key={p.id} 
                                        onClick={() => handlePlayerAssign(p.id)}
                                        className={`p-3 border-b border-white/5 flex items-center justify-between hover:bg-neutral-800 cursor-pointer ${isSelected ? 'opacity-50' : ''}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className={`font-bold text-xs w-8 ${getPositionColor(p.position)}`}>{p.position}</span>
                                            <span className="text-white font-bold">{p.name}</span>
                                            {p.injury_status.type !== 'none' && <span className="text-rose-500 text-xs">⚠</span>}
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-xs text-neutral-500">Fit: {Math.round(p.fitness)}%</div>
                                            <div className={`w-8 h-6 rounded flex items-center justify-center text-xs font-bold ${getRatingColor(p.overall)}`}>{p.overall}</div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* The Pitch */}
                <div className="flex-1 relative bg-[#1a472a] m-4 rounded border border-white/10 shadow-inner overflow-hidden select-none">
                    {/* Pitch Markings */}
                    <div className="absolute inset-0 flex flex-col justify-between p-4">
                        <div className="h-px w-full bg-white/20"></div>
                        <div className="h-32 w-64 border border-white/20 border-t-0 self-center"></div>
                        <div className="h-px w-full bg-white/20"></div>
                    </div>
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/grass.png')] opacity-30"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border border-white/20"></div>

                    {/* Player Nodes */}
                    {currentPositions.map((pos, idx) => {
                        const playerId = tactics.lineup[idx];
                        const player = club.players.find((p: Player) => p.id === playerId);

                        return (
                            <div 
                                key={idx}
                                onClick={() => setSelectedSlotIndex(idx)}
                                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group transition-all hover:scale-110 z-10"
                                style={{ top: `${pos.top}%`, left: `${pos.left}%` }}
                            >
                                <div className={`
                                    w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center border-2 shadow-lg relative transition-colors
                                    ${player ? (player.fitness < 70 ? 'bg-orange-900 border-orange-500' : 'bg-neutral-800 border-neutral-500 group-hover:border-white') : 'bg-neutral-900/50 border-dashed border-neutral-500'}
                                `}>
                                    {player ? (
                                        <span className="text-xs md:text-sm font-bold text-white">{player.overall}</span>
                                    ) : (
                                        <span className="text-neutral-500 text-xs">+</span>
                                    )}
                                    
                                    {/* Role Label */}
                                    <div className="absolute -bottom-4 bg-neutral-900/80 px-2 rounded text-[8px] text-white font-bold uppercase whitespace-nowrap border border-black/50">
                                        {player ? player.name.split(' ').pop() : pos.role}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Formation Selector */}
                <div className="h-16 border-t border-white/10 bg-neutral-950 flex items-center justify-center gap-4 px-6">
                    <label className="text-neutral-400 text-xs font-bold uppercase">Formation</label>
                    <select 
                        className="bg-neutral-800 text-white text-sm font-bold px-4 py-2 rounded border border-white/10 focus:border-white outline-none"
                        value={tactics.formation}
                        onChange={(e) => handleFormationChange(e.target.value)}
                    >
                        {Object.keys(FORMATIONS).map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                </div>
            </div>

            {/* RIGHT: CONTROLS & ANALYTICS */}
            <div className="w-full lg:w-96 flex flex-col gap-6">
                
                {/* Sliders Card */}
                <div className="bg-neutral-900 rounded-xl border border-white/10 p-6 shadow-lg">
                    <h3 className="text-white font-bold font-oswald uppercase tracking-widest text-sm mb-6 flex items-center gap-2">
                        <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                        Team Instructions
                    </h3>
                    
                    <div className="space-y-6">
                        {[
                            { id: 'pressing_intensity', label: 'Pressing Intensity', minLabel: 'Stand Off', maxLabel: 'Gegenpress' },
                            { id: 'tempo', label: 'Tempo', minLabel: 'Patient', maxLabel: 'Urgent' },
                            { id: 'passing_directness', label: 'Passing Directness', minLabel: 'Short', maxLabel: 'Long' },
                            { id: 'line_height', label: 'Defensive Line', minLabel: 'Deep', maxLabel: 'High' }
                        ].map(setting => (
                            <div key={setting.id}>
                                <div className="flex justify-between text-xs font-bold text-neutral-400 uppercase mb-2">
                                    <span>{setting.label}</span>
                                    <span className="text-emerald-400">{(tactics.instructions as any)[setting.id]}%</span>
                                </div>
                                <input 
                                    type="range" 
                                    className="w-full accent-emerald-500 h-1 bg-neutral-700 rounded-lg appearance-none cursor-pointer"
                                    value={(tactics.instructions as any)[setting.id]}
                                    onChange={(e) => handleInstructionChange(setting.id, Number(e.target.value))}
                                />
                                <div className="flex justify-between text-[8px] text-neutral-600 uppercase font-bold mt-1">
                                    <span>{setting.minLabel}</span>
                                    <span>{setting.maxLabel}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Enterprise Analytics Card */}
                <div className="bg-neutral-900 rounded-xl border border-white/10 p-6 shadow-lg flex-1 flex flex-col">
                     <h3 className="text-white font-bold font-oswald uppercase tracking-widest text-sm mb-4 flex items-center gap-2">
                        <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                        Match Forecast
                    </h3>

                    <div className="flex-1 flex flex-col justify-center items-center text-center space-y-6">
                        
                        {/* Win Probability Gauge */}
                        <div className="relative w-32 h-32">
                             <svg className="w-full h-full" viewBox="0 0 36 36">
                                <path
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    fill="none"
                                    stroke="#262626"
                                    strokeWidth="2"
                                />
                                <path
                                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                    fill="none"
                                    stroke={winProb > 0.5 ? "#10b981" : winProb > 0.3 ? "#eab308" : "#ef4444"}
                                    strokeWidth="2"
                                    strokeDasharray={`${winProb * 100}, 100`}
                                    className="animate-[spin_1s_ease-out_reverse]"
                                />
                             </svg>
                             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                                 <div className="text-2xl font-bold text-white">{(winProb * 100).toFixed(0)}%</div>
                                 <div className="text-[8px] text-neutral-500 uppercase font-bold">Win Prob</div>
                             </div>
                        </div>

                        <div className="w-full">
                            <div className="flex justify-between text-xs font-bold uppercase text-neutral-400 mb-1">
                                <span>Tactical Familiarity</span>
                                <span className="text-blue-400">{Math.round(tactics.familiarity)}%</span>
                            </div>
                            <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-blue-500 transition-all duration-500"
                                    style={{ width: `${tactics.familiarity}%` }}
                                ></div>
                            </div>
                            <p className="text-[10px] text-neutral-500 mt-2 leading-tight">
                                Changing instructions drastically reduces familiarity. Consistent training restores it.
                            </p>
                        </div>

                        {opponent && (
                             <div className="bg-neutral-950 p-3 rounded border border-neutral-800 w-full text-left">
                                 <span className="text-[10px] text-neutral-500 uppercase font-bold block mb-1">Next Opponent</span>
                                 <span className="text-white font-bold">{opponent.name}</span>
                                 <span className="text-xs text-neutral-400 block mt-1">Style: {opponent.style_identity.play_style}</span>
                             </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export const Squad: React.FC = () => {
  const { playerClub, dispatch } = useGame();
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [mode, setMode] = useState<'roster' | 'tactics'>('roster');

  if (!playerClub) return null;

  const sortedPlayers = [...playerClub.players].sort((a, b) => {
      if (b.position === 'GK' && a.position !== 'GK') return 1;
      return b.overall - a.overall;
  });

  const handleTacticsUpdate = (newTactics: any) => {
      dispatch({ type: 'UPDATE_TACTICS', payload: newTactics });
  };

  return (
    <div className="p-4 md:p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
            <h2 className="text-3xl font-bold text-white font-oswald uppercase tracking-wider">Squad Management</h2>
            <p className="text-xs text-neutral-400 font-mono">First Team Overview</p>
        </div>
        <div className="flex bg-neutral-900 p-1 rounded-lg border border-neutral-800">
             <button 
                onClick={() => setMode('roster')}
                className={`px-4 py-2 text-xs font-bold uppercase rounded transition-all ${mode === 'roster' ? 'bg-neutral-700 text-white shadow' : 'text-neutral-500 hover:text-white'}`}
             >
                 Roster List
             </button>
             <button 
                onClick={() => setMode('tactics')}
                className={`px-4 py-2 text-xs font-bold uppercase rounded transition-all flex items-center gap-2 ${mode === 'tactics' ? 'bg-emerald-600 text-white shadow' : 'text-neutral-500 hover:text-white'}`}
             >
                 <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                 Tactics Board
             </button>
        </div>
      </div>

      {mode === 'tactics' ? (
          <div className="flex-1 overflow-hidden">
              <TacticalBoard club={playerClub} onUpdate={handleTacticsUpdate} />
          </div>
      ) : (
          <div className="bg-neutral-900 border border-white/10 rounded-t-lg overflow-hidden flex-1 flex flex-col shadow-2xl animate-in fade-in duration-300">
            <div className="overflow-x-auto custom-scrollbar flex-1 flex flex-col">
                <div className="min-w-[800px] flex-1 flex flex-col">
                    <div className="grid grid-cols-12 bg-neutral-950 p-4 text-xs font-bold uppercase tracking-widest text-neutral-500 border-b border-white/5 sticky top-0 z-10">
                      <div className="col-span-1 text-center">Pos</div>
                      <div className="col-span-3">Name</div>
                      <div className="col-span-1 text-center">Age</div>
                      <div className="col-span-1 text-center">OVR</div>
                      <div className="col-span-1 text-center">Fit</div>
                      <div className="col-span-1 text-center">Mor</div>
                      <div className="col-span-2 text-center">Value</div>
                      <div className="col-span-2 text-center">Wage/Wk</div>
                    </div>
                    
                    <div className="flex-1">
                      {sortedPlayers.map((player: Player) => (
                        <div 
                          key={player.id} 
                          onClick={() => setSelectedPlayer(player)}
                          className="grid grid-cols-12 p-3 items-center hover:bg-neutral-800 border-b border-white/5 transition-colors group cursor-pointer h-14 active:bg-neutral-700"
                        >
                          <div className={`col-span-1 text-center font-bold text-sm ${getPositionColor(player.position)}`}>
                            {player.position}
                          </div>
                          <div className="col-span-3 font-bold text-neutral-200 group-hover:text-white flex items-center gap-2">
                            {player.name}
                            {player.injury_status.type !== "none" && (
                              <span className="px-1.5 py-0.5 bg-red-900/50 text-red-400 text-[10px] border border-red-800 rounded uppercase tracking-wide truncate max-w-[60px]">
                                INJ
                              </span>
                            )}
                            {player.squad_role === 'star' && <span className="text-yellow-500">★</span>}
                          </div>
                          <div className="col-span-1 text-center text-neutral-500 font-mono">{player.age}</div>
                          <div className="col-span-1 flex justify-center">
                            <span className={`w-8 h-6 flex items-center justify-center rounded text-xs font-bold ${getRatingColor(player.overall)}`}>
                              {player.overall}
                            </span>
                          </div>
                          
                          <div className="col-span-1 px-2">
                              <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full ${player.fitness > 80 ? 'bg-emerald-500' : player.fitness > 50 ? 'bg-orange-500' : 'bg-red-500'}`} 
                                    style={{width: `${player.fitness}%`}}
                                  ></div>
                              </div>
                              <div className="text-[10px] text-center text-neutral-500 mt-0.5">{Math.round(player.fitness)}%</div>
                          </div>

                          <div className="col-span-1 text-center flex justify-center">
                              <div className={`w-2 h-2 rounded-full ${player.morale > 80 ? 'bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]' : player.morale > 50 ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                          </div>

                          <div className="col-span-2 text-center font-mono text-neutral-400 text-sm group-hover:text-white">£{(player.market_value / 1000000).toFixed(1)}M</div>
                          <div className="col-span-2 text-center font-mono text-neutral-400 text-sm">£{(player.salary / 1000).toFixed(0)}k</div>
                        </div>
                      ))}
                    </div>
                </div>
            </div>
          </div>
      )}

      {selectedPlayer && (
        <PlayerModal player={selectedPlayer} onClose={() => setSelectedPlayer(null)} />
      )}
    </div>
  );
};
