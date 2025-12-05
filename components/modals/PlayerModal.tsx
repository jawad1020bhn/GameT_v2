
import React from 'react';
import { useGame } from '../../context/GameContext';
import { Player, GrowthCurve } from '../../types';
import { ScoutingEngine } from '../../services/ScoutingEngine';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface PlayerModalProps {
  player: Player;
  onClose: () => void;
}

const AttributeBar = ({ label, value, displayValue, max = 99, hidden = false }: { label: string; value: number; displayValue?: string; max?: number; hidden?: boolean }) => {
  if (hidden) {
    return (
        <div className="mb-2 opacity-50">
            <div className="flex justify-between items-end mb-0.5">
                <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">{label}</span>
                <span className="text-xs font-mono font-bold text-neutral-500">??</span>
            </div>
            <div className="h-1.5 w-full bg-neutral-800/80 rounded-sm overflow-hidden border border-neutral-700/50">
                <div className="h-full bg-neutral-800 w-full animate-pulse"></div>
            </div>
        </div>
    );
  }

  let color = 'bg-neutral-500';
  if (value >= 90) color = 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]';
  else if (value >= 80) color = 'bg-emerald-600';
  else if (value >= 70) color = 'bg-yellow-600';
  else if (value >= 60) color = 'bg-orange-600';
  else color = 'bg-red-600';

  const width = Math.min(100, Math.max(5, (value / max) * 100));

  return (
    <div className="mb-2">
      <div className="flex justify-between items-end mb-0.5">
        <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">{label}</span>
        <span className={`text-xs font-mono font-bold ${value >= 80 ? 'text-white' : 'text-neutral-300'}`}>{displayValue || value}</span>
      </div>
      <div className="h-1.5 w-full bg-neutral-800/80 rounded-sm overflow-hidden border border-neutral-700/50">
        <div className={`h-full ${color} transition-all duration-500`} style={{ width: `${width}%` }}></div>
      </div>
    </div>
  );
};

const StatBox = ({ label, value, sub = "", highlight = false }: { label: string; value: string | number; sub?: string, highlight?: boolean }) => (
  <div className={`p-3 bg-neutral-900/50 border ${highlight ? 'border-emerald-500/50 bg-emerald-900/10' : 'border-neutral-700/50'} rounded flex flex-col justify-center`}>
    <span className="text-[10px] uppercase text-neutral-500 font-bold tracking-widest mb-1">{label}</span>
    <span className={`text-lg font-bold font-mono ${highlight ? 'text-emerald-400' : 'text-white'}`}>{value}</span>
    {sub && <span className="text-[10px] text-neutral-400">{sub}</span>}
  </div>
);

export const PlayerModal: React.FC<PlayerModalProps> = ({ player, onClose }) => {
  const { playerClub } = useGame();

  // FOG OF WAR LOGIC
  const getScoutingInfo = () => {
      if (!playerClub) return { visible: true, knowledge: 100 };
      if (player.clubId === playerClub.id) return { visible: true, knowledge: 100 };
      if (player.reputation >= 85) return { visible: true, knowledge: 100 };
      if (playerClub.scouting.assignments.some(a => a.reports.includes(player.id))) return { visible: true, knowledge: 100 };

      // Default to regional knowledge
      // We don't have player region stored explicitly, assume simplified logic or random?
      // Let's assume based on League or Nationality?
      // For MVP, lets use a simple hash of ID to pick a region if not stored.
      // But we added scouting_knowledge to Club.
      // Let's assume player has no region field, so we default to 0 knowledge unless scouted directly.
      return { visible: false, knowledge: 0 };
  };

  const { visible, knowledge } = getScoutingInfo();

  // Helper for masking
  const mask = (val: number) => ScoutingEngine.getMaskedAttribute(val, knowledge);

  // Prevent scrolling when modal is open
  React.useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  const formatCurrency = (val: number) => `£${(val).toLocaleString()}`;
  const formatMillions = (val: number) => `£${(val / 1000000).toFixed(1)}M`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/90 backdrop-blur-sm">
      {/* Close overlay */}
      <div className="absolute inset-0" onClick={onClose}></div>

      {/* Modal Content */}
      <div className="relative w-full max-w-5xl h-[85vh] bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="h-24 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between px-8 shrink-0 relative overflow-hidden">
           {/* Background Detail */}
           <div className="absolute top-0 right-0 p-4 text-8xl font-bold font-oswald text-neutral-800/20 pointer-events-none select-none">
              {player.id}
           </div>

           <div className="flex items-center gap-6 relative z-10">
              <div className="w-16 h-16 bg-gradient-to-br from-neutral-700 to-neutral-800 rounded-full border-2 border-neutral-600 flex items-center justify-center shadow-lg">
                 <span className="text-2xl font-bold text-white">{player.position}</span>
              </div>
              <div>
                 <h2 className="text-3xl font-bold text-white font-oswald uppercase tracking-wide">{player.name}</h2>
                 <div className="flex gap-4 text-sm text-neutral-400 font-mono mt-1">
                    <span className="flex items-center gap-1">
                       <span className="text-neutral-600">AGE</span> <span className="text-white">{player.age}</span>
                    </span>
                    <span className="flex items-center gap-1">
                       <span className="text-neutral-600">NAT</span> <span className="text-white">{player.nationality}</span>
                    </span>
                    <span className="flex items-center gap-1">
                       <span className="text-neutral-600">ID</span> <span className="text-neutral-500">{player.id}</span>
                    </span>
                 </div>
              </div>
           </div>

           <div className="flex gap-4 relative z-10">
              <div className="text-center">
                  <div className="text-xs text-neutral-500 font-bold uppercase">Overall</div>
                  <div className="text-4xl font-bold text-white font-oswald bg-neutral-800 px-3 py-1 rounded border border-neutral-700 shadow-inner">
                    {visible ? player.overall : '?'}
                  </div>
              </div>
              <div className="text-center">
                  <div className="text-xs text-neutral-500 font-bold uppercase">Potential</div>
                  <div className="text-4xl font-bold text-emerald-400 font-oswald bg-neutral-800 px-3 py-1 rounded border border-neutral-700 shadow-inner">
                    {visible ? player.potential : '?'}
                  </div>
              </div>
              <button 
                onClick={onClose} 
                className="ml-6 w-10 h-10 flex items-center justify-center bg-red-900/20 hover:bg-red-600 text-red-500 hover:text-white rounded transition-colors border border-red-900/50"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
           </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Column: Attributes */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-neutral-950/50 p-5 rounded-lg border border-neutral-800 relative overflow-hidden">
                        {!visible && <div className="absolute inset-0 z-10 flex items-center justify-center bg-neutral-950/80 backdrop-blur-sm"><span className="text-white font-bold font-oswald uppercase tracking-widest border border-white/20 px-4 py-2 rounded">Scouting Required</span></div>}
                        <h3 className="text-emerald-500 font-bold uppercase text-sm tracking-widest mb-4 border-b border-neutral-800 pb-2">Technical</h3>
                        <AttributeBar label="Shooting" value={player.attributes.shooting} displayValue={mask(player.attributes.shooting)} hidden={!visible} />
                        <AttributeBar label="Passing" value={player.attributes.passing} displayValue={mask(player.attributes.passing)} hidden={!visible} />
                        <AttributeBar label="Dribbling" value={player.attributes.dribbling} displayValue={mask(player.attributes.dribbling)} hidden={!visible} />
                        <AttributeBar label="Set Pieces" value={player.attributes.set_pieces} displayValue={mask(player.attributes.set_pieces)} hidden={!visible} />
                        <AttributeBar label="Goalkeeping" value={player.attributes.goalkeeping} displayValue={mask(player.attributes.goalkeeping)} max={20} hidden={!visible} />
                    </div>

                    <div className="bg-neutral-950/50 p-5 rounded-lg border border-neutral-800 relative overflow-hidden">
                        {!visible && <div className="absolute inset-0 z-10 flex items-center justify-center bg-neutral-950/80 backdrop-blur-sm"></div>}
                        <h3 className="text-emerald-500 font-bold uppercase text-sm tracking-widest mb-4 border-b border-neutral-800 pb-2">Physical & Mental</h3>
                        <AttributeBar label="Pace" value={player.attributes.pace} displayValue={mask(player.attributes.pace)} hidden={!visible} />
                        <AttributeBar label="Physical" value={player.attributes.physical} displayValue={mask(player.attributes.physical)} hidden={!visible} />
                        <AttributeBar label="Mental" value={player.attributes.mental} displayValue={mask(player.attributes.mental)} hidden={!visible} />
                        <AttributeBar label="Defending" value={player.attributes.defending} displayValue={mask(player.attributes.defending)} hidden={!visible} />
                    </div>
                </div>

                {/* Middle Column: Growth & Status */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Development & Growth (UI Improvement 2) */}
                    <div className="bg-neutral-950/50 p-5 rounded-lg border border-neutral-800">
                         <div className="flex justify-between items-center mb-4 border-b border-neutral-800 pb-2">
                             <h3 className="text-blue-400 font-bold uppercase text-sm tracking-widest">Growth Trajectory</h3>
                             <div className="flex items-center gap-2">
                                {player.season_stats.avg_rating > 7.5 && <span className="text-emerald-500 text-xs font-bold">▲ Form Boost</span>}
                                <span className="text-[10px] uppercase font-bold bg-neutral-800 px-2 py-1 rounded text-neutral-400">{player.growth_curve || 'Steady'}</span>
                             </div>
                         </div>
                         <div className="h-32 w-full">
                             <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={[{ age: player.age, overall: player.overall }, { age: player.age + 3, overall: player.potential }]}>
                                    <XAxis dataKey="age" hide />
                                    <YAxis domain={[player.overall - 5, 99]} hide />
                                    <Tooltip contentStyle={{backgroundColor: '#171717', border: '1px solid #333'}} />
                                    <Line type="monotone" dataKey="overall" stroke="#3b82f6" strokeWidth={2} dot={{r:4}} />
                                </LineChart>
                             </ResponsiveContainer>
                         </div>
                         <div className="flex justify-between text-xs text-neutral-500 mt-2">
                             <span>Current ({player.age}yo)</span>
                             <span>Potential Peak</span>
                         </div>
                    </div>

                    <div className="bg-neutral-950/50 p-5 rounded-lg border border-neutral-800">
                         <h3 className="text-emerald-500 font-bold uppercase text-sm tracking-widest mb-4 border-b border-neutral-800 pb-2">Current Status</h3>
                         <div className="space-y-4">
                             <AttributeBar label="Fitness" value={player.fitness} max={100} />
                             <AttributeBar label="Sharpness" value={player.sharpness} max={100} />
                             <AttributeBar label="Morale" value={player.morale} max={100} />
                             <AttributeBar label="Form" value={player.form} max={100} />
                         </div>
                    </div>

                    <div className="bg-neutral-950/50 p-5 rounded-lg border border-neutral-800">
                         <h3 className="text-red-400 font-bold uppercase text-sm tracking-widest mb-4 border-b border-neutral-800 pb-2">Medical Report</h3>
                         <div className="grid grid-cols-2 gap-4">
                             <StatBox label="Status" value={player.injury_status.type === 'none' ? 'Fit' : player.injury_status.type} highlight={player.injury_status.type === 'none'} />
                             <StatBox label="Return" value={player.injury_status.weeks_remaining > 0 ? `${Math.ceil(player.injury_status.weeks_remaining)} Wks` : 'Ready'} />
                             <div className="col-span-2">
                                 <div className="flex justify-between text-[10px] uppercase text-neutral-500 font-bold mb-1">
                                     <span>Injury Proneness</span>
                                     <span>{player.injury_status.proneness}/100</span>
                                 </div>
                                 <div className="h-1 w-full bg-neutral-800 rounded-full overflow-hidden">
                                     <div className="h-full bg-red-500" style={{ width: `${player.injury_status.proneness}%`}}></div>
                                 </div>
                             </div>
                         </div>
                    </div>

                    <div className="bg-neutral-950/50 p-5 rounded-lg border border-neutral-800">
                         <h3 className="text-blue-400 font-bold uppercase text-sm tracking-widest mb-4 border-b border-neutral-800 pb-2">Personality</h3>
                         <div className="space-y-3">
                             <div className="flex justify-between text-xs">
                                 <span className="text-neutral-400">Professionalism</span>
                                 <span className="text-white font-bold">{player.personality.professionalism}</span>
                             </div>
                             <div className="flex justify-between text-xs">
                                 <span className="text-neutral-400">Ambition</span>
                                 <span className="text-white font-bold">{player.personality.ambition}</span>
                             </div>
                             <div className="flex justify-between text-xs">
                                 <span className="text-neutral-400">Loyalty</span>
                                 <span className="text-white font-bold">{player.personality.loyalty}</span>
                             </div>
                             <div className="flex justify-between text-xs">
                                 <span className="text-neutral-400">Temperament</span>
                                 <span className="text-white font-bold">{player.personality.temperament}</span>
                             </div>
                         </div>
                    </div>
                </div>

                {/* Right Column: Contract & Info */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-neutral-950/50 p-5 rounded-lg border border-neutral-800">
                        <h3 className="text-purple-500 font-bold uppercase text-sm tracking-widest mb-4 border-b border-neutral-800 pb-2">Dynamic Roles</h3>
                        <div className="flex flex-wrap gap-2">
                            {player.roles && player.roles.length > 0 ? (
                                player.roles.map(role => (
                                    <span key={role} className="px-2 py-1 bg-purple-900/30 border border-purple-500/30 text-purple-200 text-[10px] uppercase font-bold rounded tracking-wider shadow-sm">
                                        {role}
                                    </span>
                                ))
                            ) : (
                                <span className="text-xs text-neutral-600 italic">No specialized roles yet.</span>
                            )}
                        </div>
                    </div>

                    <div className="bg-neutral-950/50 p-5 rounded-lg border border-neutral-800">
                        <h3 className="text-yellow-500 font-bold uppercase text-sm tracking-widest mb-4 border-b border-neutral-800 pb-2">Contract & Value</h3>
                        <div className="grid grid-cols-1 gap-3">
                            <StatBox label="Market Value" value={formatMillions(player.market_value)} highlight />
                            <StatBox label="Weekly Wage" value={formatCurrency(player.salary)} />
                            <StatBox label="Contract Expires" value={player.contract_end} />
                            <StatBox label="Release Clause" value={player.release_clause ? formatMillions(player.release_clause) : 'None'} />
                            <div className="p-3 bg-neutral-900 border border-neutral-800 rounded">
                                <span className="block text-[10px] uppercase text-neutral-500 font-bold">Transfer Status</span>
                                <span className="block text-white font-bold uppercase text-sm mt-1">{player.transfer_status.replace(/_/g, ' ')}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-neutral-950/50 p-5 rounded-lg border border-neutral-800">
                        <h3 className="text-neutral-400 font-bold uppercase text-sm tracking-widest mb-4 border-b border-neutral-800 pb-2">Agent Info</h3>
                        <div className="flex justify-between items-center mb-2">
                             <span className="text-xs text-neutral-400">Fee Percentage</span>
                             <span className="text-white font-mono font-bold">{player.agent.fee_pct}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                             <span className="text-xs text-neutral-400">Stubbornness</span>
                             <span className="text-white font-mono font-bold">{player.agent.stubbornness}/100</span>
                        </div>
                    </div>

                    <div className="bg-neutral-950/50 p-5 rounded-lg border border-neutral-800">
                        <h3 className="text-neutral-400 font-bold uppercase text-sm tracking-widest mb-4 border-b border-neutral-800 pb-2">Misc</h3>
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs border-b border-neutral-800/50 pb-1">
                                <span className="text-neutral-500">Homegrown</span>
                                <span className="text-neutral-300 capitalize">{player.homegrown_status.replace(/_/g, ' ')}</span>
                            </div>
                            <div className="flex justify-between text-xs border-b border-neutral-800/50 pb-1">
                                <span className="text-neutral-500">Squad Role</span>
                                <span className="text-neutral-300 capitalize">{player.squad_role}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-neutral-500">Fan Favorite</span>
                                <span className={`font-bold ${player.fan_favorite ? 'text-yellow-500' : 'text-neutral-600'}`}>
                                    {player.fan_favorite ? 'YES' : 'NO'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
      </div>
    </div>
  );
};
