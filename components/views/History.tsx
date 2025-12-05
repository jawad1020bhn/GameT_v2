import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';

export const History: React.FC = () => {
  const { state, playerClub } = useGame();
  const [activeTab, setActiveTab] = useState<'club' | 'league' | 'awards'>('club');
  
  if (!playerClub) return null;

  const league = state.leagues[playerClub.leagueId];

  const getClubName = (id: number) => {
      const c = league.clubs.find(x => x.id === id);
      return c ? c.name : "Unknown";
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex justify-between items-end mb-6">
        <div>
            <h2 className="text-4xl font-bold text-white font-oswald uppercase tracking-tight">Records & History</h2>
            <div className="text-neutral-400 text-sm font-mono">Archive</div>
        </div>
        <div className="flex gap-2 bg-neutral-900 p-1 rounded-lg border border-white/10">
            <button onClick={() => setActiveTab('club')} className={`px-4 py-2 rounded font-bold uppercase text-xs transition-all ${activeTab === 'club' ? 'bg-emerald-600 text-white' : 'text-neutral-400 hover:text-white'}`}>Club</button>
            <button onClick={() => setActiveTab('league')} className={`px-4 py-2 rounded font-bold uppercase text-xs transition-all ${activeTab === 'league' ? 'bg-emerald-600 text-white' : 'text-neutral-400 hover:text-white'}`}>League</button>
            <button onClick={() => setActiveTab('awards')} className={`px-4 py-2 rounded font-bold uppercase text-xs transition-all ${activeTab === 'awards' ? 'bg-emerald-600 text-white' : 'text-neutral-400 hover:text-white'}`}>Awards</button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar">
          
          {activeTab === 'club' && (
              <div className="bg-neutral-900 rounded-xl border border-white/10 shadow-2xl p-6">
                  {/* Existing Trophy Cabinet Logic */}
                  <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                      <div className="w-10 h-10 rounded-full bg-yellow-600/20 text-yellow-500 flex items-center justify-center">
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" /></svg>
                      </div>
                      <h3 className="text-2xl font-bold text-white uppercase font-oswald">Trophy Cabinet</h3>
                  </div>
                  {playerClub.trophies.length === 0 ? (
                      <div className="h-32 flex items-center justify-center text-neutral-600 uppercase font-bold tracking-widest">
                          No Silverware Yet
                      </div>
                  ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          {playerClub.trophies.map(t => (
                              <div key={t.id} className="bg-gradient-to-br from-neutral-800 to-neutral-900 p-4 rounded border border-yellow-900/30 shadow-lg group hover:border-yellow-600/50 transition-all">
                                  <div className="text-yellow-500 text-3xl mb-2">🏆</div>
                                  <div className="font-bold text-white uppercase tracking-wide text-sm">{t.name}</div>
                                  <div className="text-xs text-neutral-400 font-mono mt-1">{t.season}</div>
                              </div>
                          ))}
                      </div>
                  )}
              </div>
          )}

          {activeTab === 'league' && (
              <div className="bg-neutral-900 rounded-xl border border-white/10 shadow-2xl p-6">
                  {/* Existing League Hall of Fame Logic */}
                  <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                      <div className="w-10 h-10 rounded-full bg-emerald-600/20 text-emerald-500 flex items-center justify-center">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
                      </div>
                      <h3 className="text-2xl font-bold text-white uppercase font-oswald">League Hall of Fame</h3>
                  </div>
                  {league.history.length === 0 ? (
                       <div className="h-32 flex items-center justify-center text-neutral-600 uppercase font-bold tracking-widest">
                          No History Recorded
                      </div>
                  ) : (
                      <div className="space-y-3">
                          <div className="grid grid-cols-12 text-[10px] uppercase font-bold text-neutral-500 tracking-widest mb-2 px-2">
                              <div className="col-span-3">Season</div>
                              <div className="col-span-5">Champion</div>
                              <div className="col-span-4">MVP</div>
                          </div>
                          {league.history.map((h, idx) => (
                              <div key={idx} className="grid grid-cols-12 items-center p-3 bg-neutral-950/50 rounded border border-neutral-800 hover:bg-neutral-800 transition-colors">
                                  <div className="col-span-3 font-mono text-neutral-400 text-xs">{h.season}</div>
                                  <div className="col-span-5 font-bold text-white flex items-center gap-2">
                                      <span className="text-yellow-500">★</span> {getClubName(h.championId)}
                                  </div>
                                  <div className="col-span-4 text-xs text-neutral-400">
                                      {h.topScorer.name}
                                  </div>
                              </div>
                          ))}
                      </div>
                  )}
              </div>
          )}

          {activeTab === 'awards' && (
              <div className="space-y-6">
                  {/* Ballon d'Or Section */}
                  <div className="bg-neutral-900 rounded-xl border border-white/10 p-6 shadow-lg">
                       <h3 className="text-yellow-500 font-bold uppercase tracking-widest text-lg mb-4 flex items-center gap-2">
                           <span className="text-2xl">🏆</span> Ballon d'Or History
                       </h3>
                       <div className="space-y-2">
                           {state.ballonDorHistory?.map(b => (
                               <div key={b.year} className="flex justify-between items-center bg-neutral-950 p-3 rounded border border-neutral-800">
                                   <div className="flex items-center gap-4">
                                       <span className="text-neutral-500 font-mono w-12">{b.year}</span>
                                       <div>
                                           <span className="font-bold text-white block">{b.name}</span>
                                           <span className="text-neutral-500 text-xs">{b.club} • {b.nationality}</span>
                                       </div>
                                   </div>
                                   <span className="text-emerald-400 font-mono font-bold">{b.rating} OVR</span>
                               </div>
                           ))}
                           {(!state.ballonDorHistory || state.ballonDorHistory.length === 0) && (
                               <div className="text-neutral-600 text-sm italic py-4 text-center">No history yet. Awarded in January.</div>
                           )}
                       </div>
                  </div>

                  {/* Monthly Awards Section */}
                  <div className="bg-neutral-900 rounded-xl border border-white/10 p-6 shadow-lg">
                       <h3 className="text-white font-bold uppercase tracking-widest text-lg mb-4">Monthly Awards ({league.name})</h3>
                       <div className="space-y-4">
                           {league.monthly_awards?.map(a => (
                               <div key={a.id} className="bg-neutral-950 p-4 rounded border border-neutral-800">
                                   <div className="flex justify-between items-center mb-3 border-b border-white/5 pb-2">
                                       <span className="text-emerald-500 font-bold uppercase text-sm tracking-wider">{a.month}</span>
                                       <span className="text-neutral-500 text-xs font-mono">{a.year}</span>
                                   </div>
                                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                       <div className="flex items-center gap-3">
                                           <div className="w-10 h-10 bg-neutral-900 rounded-full flex items-center justify-center text-xl">👟</div>
                                           <div>
                                               <p className="text-neutral-500 text-[10px] uppercase font-bold">Player of Month</p>
                                               <p className="text-white font-bold">{a.playerOfTheMonth.name}</p>
                                               <p className="text-neutral-400 text-xs">{a.playerOfTheMonth.club}</p>
                                           </div>
                                       </div>
                                       <div className="flex items-center gap-3">
                                           <div className="w-10 h-10 bg-neutral-900 rounded-full flex items-center justify-center text-xl">👔</div>
                                           <div>
                                               <p className="text-neutral-500 text-[10px] uppercase font-bold">Manager of Month</p>
                                               <p className="text-white font-bold">{a.managerOfTheMonth.name}</p>
                                               <p className="text-neutral-400 text-xs">{a.managerOfTheMonth.club}</p>
                                           </div>
                                       </div>
                                   </div>
                                   <div className="mt-4 pt-3 border-t border-white/5">
                                       <p className="text-neutral-500 text-[10px] uppercase font-bold mb-2">Team of the Month</p>
                                       <div className="flex flex-wrap gap-2">
                                           {a.teamOfTheMonth.map((p, i) => (
                                               <span key={i} className="px-2 py-1 bg-neutral-900 rounded border border-neutral-800 text-[10px] text-neutral-300">
                                                   <span className="text-neutral-500 font-bold mr-1">{p.position}</span> {p.name}
                                               </span>
                                           ))}
                                       </div>
                                   </div>
                               </div>
                           ))}
                           {(!league.monthly_awards || league.monthly_awards.length === 0) && (
                               <div className="text-neutral-600 text-sm italic py-4 text-center">No awards yet. Awarded monthly.</div>
                           )}
                       </div>
                  </div>
              </div>
          )}

      </div>
    </div>
  );
};
