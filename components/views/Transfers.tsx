
import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { calculatePlayerValue, formatDate } from '../../services/engine';
import { Player, League } from '../../types';
import { NegotiationModal } from '../modals/NegotiationModal';

export const Transfers: React.FC = () => {
  const { state, playerClub, dispatch } = useGame();
  const [activeTab, setActiveTab] = useState<'hub' | 'scouting' | 'shortlist'>('hub');
  const [searchQuery, setSearchQuery] = useState("");
  const [activeNegId, setActiveNegId] = useState<string | null>(null);
  const [filters, setFilters] = useState({
      pos: 'all',
      maxPrice: 200,
      minOverall: 50
  });

  if (!playerClub) return null;

  // Flatten all players
  const allPlayers = Object.values(state.leagues).flatMap((l: League) => l.clubs).flatMap(c => c.players);
  
  // Filter Logic
  const filteredPlayers = allPlayers.filter(p => {
      if (p.clubId === playerClub.id) return false;
      if (filters.pos !== 'all' && p.position !== filters.pos) return false;
      if (p.market_value > filters.maxPrice * 1000000) return false;
      if (p.overall < filters.minOverall) return false;
      if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
  }).slice(0, 50); // Performance limit

  const activeNegotiations = state.negotiations.filter(n => n.buyingClubId === playerClub.id && n.status !== 'completed' && n.status !== 'collapsed');
  const recentTransfers = state.news.filter(n => n.image_type === 'transfer').slice(0, 5);

  const startNegotiation = (player: Player) => {
      const sellingClub = Object.values(state.leagues).flatMap((l: League) => l.clubs).find(c => c.id === player.clubId);
      if (!sellingClub) return;

      dispatch({ 
          type: 'START_NEGOTIATION', 
          payload: { playerId: player.id, sellingClubId: sellingClub.id } 
      });
      setActiveTab('hub');
  };

  const getPlayer = (id: number) => allPlayers.find(p => p.id === id);

  const getPosColor = (pos: string) => {
      switch(pos) {
          case 'GK': return 'text-yellow-500 bg-yellow-900/20 border-yellow-700';
          case 'DEF': return 'text-blue-400 bg-blue-900/20 border-blue-700';
          case 'MID': return 'text-emerald-400 bg-emerald-900/20 border-emerald-700';
          case 'FWD': case 'ST': return 'text-rose-400 bg-rose-900/20 border-rose-700';
          default: return 'text-white';
      }
  };

  // --- SUB-COMPONENTS ---

  const TransferHub = () => (
      <div className="grid grid-cols-12 gap-6 h-full overflow-y-auto custom-scrollbar">
          {/* Top Stats Row */}
          <div className="col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-neutral-900 border border-white/10 p-6 rounded-xl shadow-lg flex items-center justify-between">
                  <div>
                      <p className="text-neutral-500 text-xs font-bold uppercase tracking-widest">Transfer Budget</p>
                      <p className="text-3xl font-mono font-bold text-emerald-400">£{(playerClub.budget / 1000000).toFixed(1)}M</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-emerald-900/20 border border-emerald-500/30 flex items-center justify-center text-emerald-500 text-xl">£</div>
              </div>
              <div className="bg-neutral-900 border border-white/10 p-6 rounded-xl shadow-lg flex items-center justify-between">
                  <div>
                      <p className="text-neutral-500 text-xs font-bold uppercase tracking-widest">Wage Budget</p>
                      <p className="text-3xl font-mono font-bold text-blue-400">£{(playerClub.wage_budget_weekly / 1000).toFixed(0)}k<span className="text-sm text-neutral-500">/wk</span></p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-blue-900/20 border border-blue-500/30 flex items-center justify-center text-blue-500 text-xl">W</div>
              </div>
              <div className="bg-gradient-to-br from-neutral-800 to-neutral-900 border border-neutral-700 p-6 rounded-xl shadow-lg flex items-center justify-between relative overflow-hidden">
                  <div className="relative z-10">
                      <p className="text-neutral-400 text-xs font-bold uppercase tracking-widest">Transfer Window</p>
                      <p className="text-2xl font-bold text-white uppercase flex items-center gap-2">
                          <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]"></span> Open
                      </p>
                  </div>
                  <div className="text-6xl opacity-10 absolute right-4 bottom-0">⏳</div>
              </div>
          </div>

          {/* Active Negotiations */}
          <div className="col-span-12 md:col-span-8">
              <div className="bg-neutral-900 border border-white/10 rounded-xl shadow-lg h-[400px] flex flex-col">
                  <div className="p-4 border-b border-white/10 flex justify-between items-center bg-neutral-950/50 rounded-t-xl">
                      <h3 className="font-oswald font-bold text-xl text-white uppercase tracking-tight">Active Negotiations</h3>
                      <span className="text-xs font-bold bg-neutral-800 px-2 py-1 rounded text-neutral-400">{activeNegotiations.length} Active</span>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                      {activeNegotiations.length === 0 && (
                          <div className="h-full flex flex-col items-center justify-center text-neutral-600 opacity-60">
                              <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                              <p className="text-sm uppercase font-bold tracking-widest">No Active Deals</p>
                              <button onClick={() => setActiveTab('scouting')} className="mt-4 text-emerald-500 hover:text-emerald-400 text-xs underline">Go to Scouting Network</button>
                          </div>
                      )}
                      {activeNegotiations.map(neg => {
                          const p = getPlayer(neg.playerId);
                          if (!p) return null;
                          const isActionRequired = new Date(neg.next_response_date) <= new Date(state.currentDate) && neg.status !== 'active'; 
                          
                          return (
                              <div 
                                  key={neg.id}
                                  onClick={() => setActiveNegId(neg.id)}
                                  className={`group relative overflow-hidden rounded-lg border transition-all cursor-pointer hover:scale-[1.01] ${isActionRequired ? 'bg-neutral-800 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'bg-neutral-900 border-neutral-700'}`}
                              >
                                  <div className="flex items-center p-4">
                                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xs font-bold border-2 mr-4 ${getPosColor(p.position)}`}>
                                          {p.position}
                                      </div>
                                      <div className="flex-1">
                                          <div className="flex justify-between items-start">
                                              <h4 className="font-bold text-white text-lg leading-none">{p.name}</h4>
                                              <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                                                  neg.stage === 'contract' ? 'bg-blue-900/30 text-blue-400 border-blue-500/30' : 'bg-yellow-900/30 text-yellow-400 border-yellow-500/30'
                                              }`}>
                                                  {neg.stage.replace('_', ' ')} Phase
                                              </span>
                                          </div>
                                          <div className="flex justify-between items-center mt-2">
                                              <span className="text-xs text-neutral-400 font-mono">Last Offer: £{(neg.latest_offer?.fee || 0) / 1000000}M</span>
                                              <span className="text-xs text-neutral-500 uppercase font-bold">
                                                  {isActionRequired ? <span className="text-emerald-400 animate-pulse">Action Required</span> : `Waiting: ${formatDate(neg.next_response_date)}`}
                                              </span>
                                          </div>
                                      </div>
                                  </div>
                                  {/* Progress Bar Visual */}
                                  <div className="h-1 bg-neutral-950 w-full mt-2">
                                      <div 
                                        className={`h-full transition-all duration-1000 ${neg.stage === 'contract' ? 'bg-blue-500 w-3/4' : 'bg-yellow-500 w-1/3'}`} 
                                      ></div>
                                  </div>
                              </div>
                          );
                      })}
                  </div>
              </div>
          </div>

          {/* Transfer Ticker */}
          <div className="col-span-12 md:col-span-4">
              <div className="bg-neutral-900 border border-white/10 rounded-xl shadow-lg h-[400px] flex flex-col overflow-hidden">
                   <div className="p-4 bg-rose-900/10 border-b border-rose-500/20 flex items-center gap-3">
                       <div className="w-2 h-2 bg-rose-500 rounded-full animate-ping"></div>
                       <h3 className="font-oswald font-bold text-white uppercase tracking-tight text-sm">Live Market Feed</h3>
                   </div>
                   <div className="flex-1 overflow-y-auto p-0">
                       {recentTransfers.map((news, i) => (
                           <div key={news.id} className="p-4 border-b border-neutral-800 hover:bg-neutral-800/50 transition-colors">
                               <p className="text-[10px] text-neutral-500 font-mono mb-1">{formatDate(news.date)}</p>
                               <p className="text-xs text-white font-bold leading-snug">{news.headline}</p>
                               <p className="text-[10px] text-emerald-500 mt-1 font-bold uppercase">Confirmed Deal</p>
                           </div>
                       ))}
                       <div className="p-8 text-center opacity-30">
                           <span className="text-[10px] uppercase tracking-widest">Scanning Global Feeds...</span>
                       </div>
                   </div>
              </div>
          </div>
      </div>
  );

  const ScoutingNetwork = () => (
      <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-2 duration-300">
          {/* Filters */}
          <div className="bg-neutral-900 p-4 rounded-xl border border-white/10 mb-4 flex flex-wrap gap-4 items-end shadow-lg">
              <div className="flex-1 min-w-[200px]">
                  <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Search Name</label>
                  <div className="relative">
                      <input 
                          type="text" 
                          className="w-full bg-neutral-950 border border-neutral-700 rounded px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors pl-10"
                          placeholder="e.g. Haaland"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      <svg className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  </div>
              </div>
              
              <div>
                  <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Position</label>
                  <select 
                      className="bg-neutral-950 border border-neutral-700 rounded px-4 py-2 text-sm text-white focus:border-emerald-500 outline-none"
                      value={filters.pos}
                      onChange={(e) => setFilters({...filters, pos: e.target.value})}
                  >
                      <option value="all">Any Position</option>
                      <option value="GK">Goalkeeper</option>
                      <option value="DEF">Defender</option>
                      <option value="MID">Midfielder</option>
                      <option value="FWD">Forward</option>
                      <option value="ST">Striker</option>
                  </select>
              </div>

              <div className="w-32">
                  <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Max Price</label>
                  <div className="text-xs text-emerald-400 font-mono mb-1">£{filters.maxPrice}M</div>
                  <input 
                      type="range" min="1" max="300" 
                      className="w-full accent-emerald-500 h-1 bg-neutral-700 rounded-lg appearance-none cursor-pointer"
                      value={filters.maxPrice}
                      onChange={(e) => setFilters({...filters, maxPrice: Number(e.target.value)})}
                  />
              </div>

              <div className="w-32">
                  <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Min Rating</label>
                  <div className="text-xs text-blue-400 font-mono mb-1">{filters.minOverall}+</div>
                  <input 
                      type="range" min="50" max="99" 
                      className="w-full accent-blue-500 h-1 bg-neutral-700 rounded-lg appearance-none cursor-pointer"
                      value={filters.minOverall}
                      onChange={(e) => setFilters({...filters, minOverall: Number(e.target.value)})}
                  />
              </div>
          </div>

          {/* Results Grid */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
                  {filteredPlayers.map(p => {
                       const value = calculatePlayerValue(p);
                       const isTarget = state.negotiations.some(n => n.playerId === p.id && n.buyingClubId === playerClub.id);
                       
                       return (
                           <div key={p.id} className="bg-neutral-900 border border-white/10 hover:border-white/30 rounded-xl p-4 flex flex-col shadow-md group transition-all hover:-translate-y-1">
                               <div className="flex justify-between items-start mb-3">
                                   <div className="flex items-center gap-3">
                                       <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border ${getPosColor(p.position)}`}>
                                           {p.position}
                                       </div>
                                       <div>
                                           <h4 className="font-bold text-white text-sm">{p.name}</h4>
                                           <p className="text-[10px] text-neutral-400 uppercase">{p.age} yrs • {p.nationality}</p>
                                       </div>
                                   </div>
                                   <div className={`text-xl font-bold font-oswald ${p.overall >= 85 ? 'text-emerald-400' : 'text-white'}`}>
                                       {p.overall}
                                   </div>
                               </div>
                               
                               <div className="grid grid-cols-2 gap-2 text-xs mb-4 bg-neutral-950/50 p-2 rounded border border-neutral-800">
                                   <div className="text-neutral-500">Market Value</div>
                                   <div className="text-right font-mono text-white">£{(value/1000000).toFixed(1)}M</div>
                                   <div className="text-neutral-500">Wage Demand</div>
                                   <div className="text-right font-mono text-white">~£{((p.salary * 1.2)/1000).toFixed(0)}k</div>
                               </div>
                               
                               <button 
                                  onClick={() => startNegotiation(p)}
                                  disabled={isTarget}
                                  className={`mt-auto w-full py-2 rounded font-bold text-xs uppercase tracking-wider transition-colors ${
                                      isTarget 
                                      ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed' 
                                      : 'bg-emerald-700 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-900/20'
                                  }`}
                               >
                                   {isTarget ? 'Negotiation Active' : 'Approach to Buy'}
                               </button>
                           </div>
                       )
                  })}
                  {filteredPlayers.length === 0 && (
                      <div className="col-span-full text-center py-20 text-neutral-600 uppercase font-bold">No players found matching criteria</div>
                  )}
              </div>
          </div>
      </div>
  );

  return (
    <div className="p-4 md:p-6 h-full flex flex-col">
        {/* Header Area */}
        <div className="flex justify-between items-end mb-6">
            <div>
                <h2 className="text-3xl md:text-4xl font-bold text-white font-oswald uppercase tracking-tight mb-1">Recruitment Centre</h2>
                <div className="flex gap-1">
                    <button 
                        onClick={() => setActiveTab('hub')} 
                        className={`px-4 py-1 rounded-t text-xs font-bold uppercase tracking-widest border-b-2 transition-colors ${activeTab === 'hub' ? 'bg-neutral-800 text-emerald-400 border-emerald-500' : 'bg-neutral-900 text-neutral-500 border-transparent hover:bg-neutral-800'}`}
                    >
                        Hub
                    </button>
                    <button 
                        onClick={() => setActiveTab('scouting')} 
                        className={`px-4 py-1 rounded-t text-xs font-bold uppercase tracking-widest border-b-2 transition-colors ${activeTab === 'scouting' ? 'bg-neutral-800 text-emerald-400 border-emerald-500' : 'bg-neutral-900 text-neutral-500 border-transparent hover:bg-neutral-800'}`}
                    >
                        Scouting Network
                    </button>
                    <button 
                        onClick={() => setActiveTab('shortlist')} 
                        className={`px-4 py-1 rounded-t text-xs font-bold uppercase tracking-widest border-b-2 transition-colors ${activeTab === 'shortlist' ? 'bg-neutral-800 text-emerald-400 border-emerald-500' : 'bg-neutral-900 text-neutral-500 border-transparent hover:bg-neutral-800'}`}
                    >
                        Shortlist
                    </button>
                </div>
            </div>
            
            <div className="hidden md:block text-right">
                <div className="text-xs text-neutral-500 font-bold uppercase">Financial Fair Play</div>
                <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-neutral-800 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500" style={{width: '30%'}}></div>
                    </div>
                    <span className="text-green-400 text-xs font-bold">Safe</span>
                </div>
            </div>
        </div>

        <div className="flex-1 overflow-hidden">
            {activeTab === 'hub' && <TransferHub />}
            {activeTab === 'scouting' && <ScoutingNetwork />}
            {activeTab === 'shortlist' && (
                <div className="h-full flex items-center justify-center bg-neutral-900/50 rounded-xl border border-neutral-800 border-dashed">
                    <div className="text-center text-neutral-500">
                        <p className="uppercase font-bold tracking-widest mb-2">Shortlist Empty</p>
                        <p className="text-sm">Tag players in the Scouting Network to track them here.</p>
                    </div>
                </div>
            )}
        </div>

        {activeNegId && (
            <NegotiationModal 
                negotiation={state.negotiations.find(n => n.id === activeNegId)!} 
                onClose={() => setActiveNegId(null)}
            />
        )}
    </div>
  );
};
