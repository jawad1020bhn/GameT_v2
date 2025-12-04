
import React, { useState, useMemo } from 'react';
import { useGame } from '../../context/GameContext';
import { Player, Fixture, League } from '../../types';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ScatterChart, Scatter, ZAxis, Cell, AreaChart, Area, BarChart, Bar, ReferenceLine
} from 'recharts';

export const DataHub: React.FC = () => {
  const { state, playerClub } = useGame();
  const [activeTab, setActiveTab] = useState<'performance' | 'squad_dna' | 'player_lab'>('performance');
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);

  if (!playerClub) return null;

  // --- ANALYTICS ENGINE ---

  // 1. Match Performance & xG Simulation
  const matchAnalytics = useMemo(() => {
    const allFixtures: Fixture[] = [];
    Object.values(state.leagues).forEach((l: League) => {
        l.fixtures.forEach(f => {
            if (f.played && (f.homeClubId === playerClub.id || f.awayClubId === playerClub.id)) {
                allFixtures.push(f);
            }
        });
    });
    
    const sorted = allFixtures.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(-10);
    
    return sorted.map((f, i) => {
        const isHome = f.homeClubId === playerClub.id;
        const gf = isHome ? f.homeScore! : f.awayScore!;
        const ga = isHome ? f.awayScore! : f.homeScore!;
        
        // Simulate xG based on result + variance
        let xG = gf === 0 ? Math.random() * 0.8 : gf + (Math.random() * 1.2 - 0.4);
        xG = Math.max(0.1, Number(xG.toFixed(2)));
        
        let xGA = ga === 0 ? Math.random() * 0.8 : ga + (Math.random() * 1.2 - 0.4);
        xGA = Math.max(0.1, Number(xGA.toFixed(2)));

        let opponentName = "OPP";
        for(const k in state.leagues) {
            const c = state.leagues[k].clubs.find(cl => cl.id === (isHome ? f.awayClubId : f.homeClubId));
            if(c) { opponentName = c.name.substring(0, 3).toUpperCase(); break; }
        }

        return {
            id: f.id,
            match: opponentName,
            GF: gf,
            GA: ga,
            xG: xG,
            xGA: xGA,
            result: (gf > ga) ? 'W' : (gf === ga) ? 'D' : 'L'
        };
    });
  }, [state.leagues, playerClub.id]);

  // 2. Squad Depth Analysis
  const squadDepth = useMemo(() => {
      const depth: any = { GK: [], DEF: [], MID: [], FWD: [], ST: [] };
      playerClub.players.forEach(p => {
          if (depth[p.position]) depth[p.position].push(p.overall);
      });
      
      // Transform for box plot simplified (Min, Max, Avg)
      return Object.keys(depth).map(pos => {
          const ratings = depth[pos].sort((a: number, b: number) => a - b);
          if (!ratings.length) return { name: pos, min: 0, max: 0, avg: 0, count: 0 };
          return {
              name: pos,
              min: ratings[0],
              max: ratings[ratings.length - 1],
              avg: Math.round(ratings.reduce((a:number,b:number)=>a+b,0)/ratings.length),
              count: ratings.length
          };
      });
  }, [playerClub.players]);

  // 3. Squad Scatter Data
  const scatterData = useMemo(() => {
      return playerClub.players.map(p => ({
          id: p.id,
          name: p.name,
          age: p.age,
          overall: p.overall,
          position: p.position,
          value: p.market_value,
          potential: p.potential
      }));
  }, [playerClub.players]);

  // 4. Player Radar Data
  const playerAnalysis = useMemo(() => {
      const player = playerClub.players.find(p => p.id === (selectedPlayerId || playerClub.players[0].id));
      if (!player) return { data: [], notes: [] };

      const data = [
          { subject: 'PAC', A: player.attributes.pace, fullMark: 100 },
          { subject: 'SHO', A: player.attributes.shooting, fullMark: 100 },
          { subject: 'PAS', A: player.attributes.passing, fullMark: 100 },
          { subject: 'DRI', A: player.attributes.dribbling, fullMark: 100 },
          { subject: 'DEF', A: player.attributes.defending, fullMark: 100 },
          { subject: 'PHY', A: player.attributes.physical, fullMark: 100 },
          { subject: 'MEN', A: player.attributes.mental, fullMark: 100 },
      ];
      
      const notes = [];
      if (player.potential - player.overall > 5) notes.push("High growth potential detected.");
      if (player.age > 30 && player.attributes.physical > 80) notes.push("Exceptional physical longevity.");
      if (player.form < 60) notes.push("Currently experiencing a dip in form.");
      if (player.attributes.mental > 85) notes.push("Elite mentality - Captain material.");
      if (player.market_value > playerClub.budget * 0.8) notes.push("Most valuable asset.");

      return { data, notes, player };
  }, [playerClub.players, selectedPlayerId, playerClub.budget]);

  // --- HELPERS ---
  const posColor = (pos: string) => {
      switch(pos) {
          case 'GK': return '#eab308'; 
          case 'DEF': return '#3b82f6'; 
          case 'MID': return '#10b981'; 
          case 'FWD': case 'ST': return '#f43f5e'; 
          default: return '#94a3b8';
      }
  };

  const getKpiChange = (current: number, prev: number) => {
      const diff = current - prev;
      if (diff === 0) return <span className="text-neutral-500">-</span>;
      return diff > 0 
        ? <span className="text-emerald-400 text-[10px]">▲ +{diff.toFixed(2)}</span> 
        : <span className="text-red-400 text-[10px]">▼ {diff.toFixed(2)}</span>;
  };

  // KPIS
  const gfPerGame = matchAnalytics.reduce((a,b) => a + b.GF, 0) / (matchAnalytics.length || 1);
  const xGPerGame = matchAnalytics.reduce((a,b) => a + b.xG, 0) / (matchAnalytics.length || 1);
  const gaPerGame = matchAnalytics.reduce((a,b) => a + b.GA, 0) / (matchAnalytics.length || 1);
  const cleanSheets = matchAnalytics.filter(m => m.GA === 0).length;

  return (
    <div className="p-6 h-full flex flex-col bg-neutral-950/50">
      {/* Header */}
      <div className="flex justify-between items-end mb-6">
        <div>
            <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-emerald-500 text-xs font-bold uppercase tracking-widest">Live Analytics</span>
            </div>
            <h2 className="text-4xl font-bold text-white font-oswald uppercase tracking-tight">Data Hub</h2>
        </div>
        
        <div className="flex bg-neutral-900 p-1 rounded-lg border border-white/10 shadow-lg">
            {[
                { id: 'performance', label: 'Match Engine' },
                { id: 'squad_dna', label: 'Squad Analysis' },
                { id: 'player_lab', label: 'Player Performance' }
            ].map(tab => (
                <button 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-6 py-2 rounded font-bold uppercase text-xs tracking-wider transition-all ${activeTab === tab.id ? 'bg-emerald-600 text-white shadow-lg' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'}`}
                >
                    {tab.label}
                </button>
            ))}
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* PERFORMANCE TAB */}
          {activeTab === 'performance' && (
              <div className="grid grid-cols-12 gap-6 h-full overflow-y-auto custom-scrollbar pb-2">
                  
                  {/* KPI Row */}
                  <div className="col-span-12 grid grid-cols-4 gap-4">
                      <div className="bg-neutral-900 p-4 rounded-xl border border-white/10 shadow relative overflow-hidden group">
                          <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"/></svg></div>
                          <span className="text-neutral-500 text-[10px] font-bold uppercase tracking-widest">Goals / 90</span>
                          <div className="flex items-end gap-2 mt-1">
                              <span className="text-3xl font-mono font-bold text-white">{gfPerGame.toFixed(2)}</span>
                              {getKpiChange(gfPerGame, xGPerGame)}
                          </div>
                          <div className="text-[10px] text-neutral-600 mt-1">vs xG {xGPerGame.toFixed(2)}</div>
                      </div>
                      
                      <div className="bg-neutral-900 p-4 rounded-xl border border-white/10 shadow relative overflow-hidden group">
                          <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg></div>
                          <span className="text-neutral-500 text-[10px] font-bold uppercase tracking-widest">Conceded / 90</span>
                           <div className="flex items-end gap-2 mt-1">
                              <span className="text-3xl font-mono font-bold text-red-400">{gaPerGame.toFixed(2)}</span>
                          </div>
                          <div className="text-[10px] text-neutral-600 mt-1">Recent Form</div>
                      </div>

                      <div className="bg-neutral-900 p-4 rounded-xl border border-white/10 shadow relative overflow-hidden group">
                           <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-3.536L6.879 10.586 5.707 9.414a1 1 0 10-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg></div>
                           <span className="text-neutral-500 text-[10px] font-bold uppercase tracking-widest">Clean Sheets</span>
                           <div className="flex items-end gap-2 mt-1">
                              <span className="text-3xl font-mono font-bold text-emerald-400">{cleanSheets}</span>
                              <span className="text-neutral-500 text-sm">/ {matchAnalytics.length}</span>
                          </div>
                          <div className="text-[10px] text-neutral-600 mt-1">Defensive Solidity</div>
                      </div>

                      <div className="bg-neutral-900 p-4 rounded-xl border border-white/10 shadow flex flex-col justify-center">
                          <span className="text-neutral-500 text-[10px] font-bold uppercase tracking-widest mb-2">Form Guide</span>
                          <div className="flex gap-1.5">
                              {matchAnalytics.slice(-5).map((m, i) => (
                                  <div key={i} className={`w-8 h-8 flex items-center justify-center rounded font-bold text-xs border shadow-sm ${
                                      m.result === 'W' ? 'bg-emerald-600 border-emerald-500 text-white' : 
                                      m.result === 'D' ? 'bg-neutral-600 border-neutral-500 text-white' : 
                                      'bg-red-600 border-red-500 text-white'
                                  }`}>
                                      {m.result}
                                  </div>
                              ))}
                          </div>
                      </div>
                  </div>

                  {/* Main Chart */}
                  <div className="col-span-12 lg:col-span-8 bg-neutral-900 rounded-xl border border-white/10 p-6 shadow-xl h-96 flex flex-col">
                      <div className="flex justify-between items-center mb-4">
                          <h3 className="text-white font-bold uppercase tracking-widest text-sm">Attacking Performance (xG vs Actual)</h3>
                          <div className="flex gap-4 text-xs font-bold">
                              <span className="text-emerald-400 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Goals</span>
                              <span className="text-blue-400 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> xG</span>
                          </div>
                      </div>
                      <div className="flex-1 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={matchAnalytics}>
                                  <defs>
                                      <linearGradient id="colorGF" x1="0" y1="0" x2="0" y2="1">
                                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                      </linearGradient>
                                      <linearGradient id="colorxG" x1="0" y1="0" x2="0" y2="1">
                                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                      </linearGradient>
                                  </defs>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                                  <XAxis dataKey="match" stroke="#525252" fontSize={10} tickLine={false} axisLine={false} />
                                  <YAxis stroke="#525252" fontSize={10} tickLine={false} axisLine={false} />
                                  <RechartsTooltip 
                                      contentStyle={{ backgroundColor: '#171717', borderColor: '#404040', borderRadius: '8px' }}
                                      itemStyle={{ fontSize: '12px', fontWeight: 'bold', color: '#fff' }}
                                      cursor={{ stroke: '#525252', strokeWidth: 1, strokeDasharray: '4 4' }}
                                  />
                                  <Area type="monotone" dataKey="xG" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorxG)" />
                                  <Area type="monotone" dataKey="GF" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorGF)" />
                              </AreaChart>
                          </ResponsiveContainer>
                      </div>
                  </div>

                  {/* Side Stats */}
                  <div className="col-span-12 lg:col-span-4 flex flex-col gap-6 h-96">
                       <div className="flex-1 bg-neutral-900 rounded-xl border border-white/10 p-6 shadow-xl">
                           <h3 className="text-neutral-400 font-bold uppercase tracking-widest text-xs mb-4">Shot Quality</h3>
                           <div className="space-y-6">
                               <div>
                                   <div className="flex justify-between text-xs font-bold mb-1">
                                       <span className="text-white">Conversion Rate</span>
                                       <span className="text-emerald-400">18%</span>
                                   </div>
                                   <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden">
                                       <div className="h-full bg-emerald-500" style={{ width: '18%' }}></div>
                                   </div>
                               </div>
                               <div>
                                   <div className="flex justify-between text-xs font-bold mb-1">
                                       <span className="text-white">xG Performance</span>
                                       <span className={`${gfPerGame > xGPerGame ? 'text-emerald-400' : 'text-red-400'}`}>
                                           {gfPerGame > xGPerGame ? 'Overperforming' : 'Underperforming'}
                                       </span>
                                   </div>
                                   <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden relative">
                                       <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/20"></div>
                                       <div 
                                          className={`h-full ${gfPerGame > xGPerGame ? 'bg-emerald-500' : 'bg-red-500'}`} 
                                          style={{ 
                                              width: `${Math.min(50, Math.abs(gfPerGame - xGPerGame) * 20)}%`, 
                                              marginLeft: gfPerGame > xGPerGame ? '50%' : `${50 - Math.min(50, Math.abs(gfPerGame - xGPerGame) * 20)}%`
                                          }}
                                       ></div>
                                   </div>
                               </div>
                           </div>
                       </div>
                       
                       <div className="h-32 bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-xl border border-neutral-700 p-4 flex items-center justify-between group hover:border-emerald-500/50 transition-colors">
                           <div>
                               <div className="text-xs text-neutral-500 font-bold uppercase">Next Opponent Analysis</div>
                               <div className="text-white font-bold mt-1">Defensive Weakness Detected</div>
                           </div>
                           <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                           </div>
                       </div>
                  </div>

              </div>
          )}

          {/* SQUAD DNA TAB */}
          {activeTab === 'squad_dna' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full overflow-y-auto">
                  
                  {/* Scatter Chart */}
                  <div className="bg-neutral-900 rounded-xl border border-white/10 p-6 shadow-xl flex flex-col h-96 lg:h-auto">
                      <h3 className="text-white font-bold uppercase tracking-widest text-sm mb-2">Age Profile Matrix</h3>
                      <p className="text-xs text-neutral-400 mb-4">Distribution of squad by Age vs Overall Quality.</p>
                      <div className="flex-1">
                           <ResponsiveContainer width="100%" height="100%">
                               <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                                   <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                                   <XAxis type="number" dataKey="age" name="Age" domain={[16, 40]} stroke="#525252" fontSize={10} tickCount={10} />
                                   <YAxis type="number" dataKey="overall" name="Overall" domain={[50, 100]} stroke="#525252" fontSize={10} />
                                   <ZAxis type="number" dataKey="value" range={[50, 500]} name="Value" />
                                   <RechartsTooltip 
                                       cursor={{ strokeDasharray: '3 3' }}
                                       content={({ active, payload }) => {
                                           if (active && payload && payload.length) {
                                               const data = payload[0].payload;
                                               return (
                                                   <div className="bg-neutral-950 border border-neutral-700 p-3 rounded shadow-2xl z-50">
                                                       <p className="font-bold text-white text-sm">{data.name}</p>
                                                       <div className="flex gap-2 text-[10px] mt-1">
                                                           <span className="text-neutral-400">Age: {data.age}</span>
                                                           <span className="text-neutral-400">Ovr: {data.overall}</span>
                                                       </div>
                                                       <p className="text-xs text-emerald-400 font-mono mt-1">£{(data.value/1000000).toFixed(1)}M</p>
                                                   </div>
                                               );
                                           }
                                           return null;
                                       }}
                                   />
                                   {/* Quadrant Lines */}
                                   <ReferenceLine x={28} stroke="#404040" strokeDasharray="3 3" />
                                   <ReferenceLine y={80} stroke="#404040" strokeDasharray="3 3" />
                                   
                                   <Scatter name="Players" data={scatterData} fill="#8884d8">
                                       {scatterData.map((entry, index) => (
                                           <Cell key={`cell-${index}`} fill={posColor(entry.position)} fillOpacity={0.7} stroke="#fff" strokeWidth={1} />
                                       ))}
                                   </Scatter>
                               </ScatterChart>
                           </ResponsiveContainer>
                      </div>
                      <div className="flex justify-center gap-4 mt-4 text-[10px] font-bold uppercase">
                          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-yellow-500"></div> GK</div>
                          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div> DEF</div>
                          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> MID</div>
                          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-rose-500"></div> FWD</div>
                      </div>
                  </div>

                  {/* Depth Chart */}
                  <div className="flex flex-col gap-6">
                      <div className="bg-neutral-900 rounded-xl border border-white/10 p-6 shadow-xl flex-1">
                          <h3 className="text-white font-bold uppercase tracking-widest text-sm mb-4">Positional Depth</h3>
                          <div className="flex flex-col justify-between h-full">
                              {squadDepth.map(pos => (
                                  <div key={pos.name} className="mb-4 last:mb-0">
                                      <div className="flex justify-between text-xs mb-1 font-bold">
                                          <span style={{ color: posColor(pos.name) }}>{pos.name}</span>
                                          <span className="text-neutral-500">{pos.count} Players</span>
                                      </div>
                                      <div className="h-4 bg-neutral-800 rounded-full overflow-hidden relative border border-neutral-700">
                                          {/* Range Bar */}
                                          <div 
                                              className="absolute h-full opacity-30"
                                              style={{ 
                                                  left: `${pos.min}%`, 
                                                  width: `${pos.max - pos.min}%`,
                                                  backgroundColor: posColor(pos.name)
                                              }}
                                          ></div>
                                          {/* Avg Marker */}
                                          <div 
                                              className="absolute h-full w-1 bg-white shadow"
                                              style={{ left: `${pos.avg}%` }}
                                          ></div>
                                      </div>
                                      <div className="flex justify-between text-[10px] text-neutral-600 mt-0.5 font-mono">
                                          <span>Min: {pos.min}</span>
                                          <span>Avg: {pos.avg}</span>
                                          <span>Max: {pos.max}</span>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </div>
                      
                      <div className="bg-neutral-950 p-6 rounded-xl border border-neutral-800 shadow-xl h-48 flex items-center justify-center">
                          <div className="text-center">
                              <div className="text-5xl font-bold text-white font-oswald mb-1">£{(playerClub.players.reduce((a,b) => a + b.market_value, 0) / 1000000).toFixed(0)}M</div>
                              <div className="text-xs text-emerald-500 font-bold uppercase tracking-widest">Total Squad Value</div>
                          </div>
                      </div>
                  </div>

              </div>
          )}

          {/* PLAYER LAB TAB */}
          {activeTab === 'player_lab' && (
              <div className="flex flex-col lg:flex-row gap-6 h-full overflow-y-auto">
                   {/* Sidebar */}
                   <div className="w-full lg:w-80 flex flex-col gap-4 shrink-0">
                       <div className="bg-neutral-900 p-4 rounded-xl border border-white/10">
                           <label className="block text-xs text-neutral-500 uppercase font-bold mb-2">Subject</label>
                           <select 
                               className="w-full bg-neutral-950 border border-neutral-700 text-white text-sm rounded p-3 focus:border-emerald-500 outline-none transition-colors appearance-none"
                               onChange={(e) => setSelectedPlayerId(Number(e.target.value))}
                               value={playerAnalysis.player?.id}
                           >
                               {playerClub.players.sort((a,b) => b.overall - a.overall).map(p => (
                                   <option key={p.id} value={p.id}>{p.name} ({p.position}) - {p.overall}</option>
                               ))}
                           </select>
                       </div>

                       {playerAnalysis.player && (
                           <div className="bg-neutral-900 p-6 rounded-xl border border-white/10 flex-1 flex flex-col items-center text-center shadow-xl">
                               <div className={`w-24 h-24 rounded-full border-4 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(0,0,0,0.5)] ${
                                   playerAnalysis.player.overall >= 90 ? 'border-emerald-500 bg-emerald-900/20' : 'border-neutral-600 bg-neutral-800'
                               }`}>
                                   <span className="text-4xl font-bold text-white font-oswald">{playerAnalysis.player.overall}</span>
                               </div>
                               <h3 className="text-xl font-bold text-white mb-1">{playerAnalysis.player.name}</h3>
                               <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase mb-6 ${
                                   playerAnalysis.player.position === 'GK' ? 'bg-yellow-900/50 text-yellow-500' : 
                                   playerAnalysis.player.position === 'DEF' ? 'bg-blue-900/50 text-blue-400' : 
                                   'bg-red-900/50 text-red-400'
                               }`}>{playerAnalysis.player.position}</span>

                               <div className="w-full space-y-3 text-left">
                                    <div className="flex justify-between text-sm border-b border-neutral-800 pb-2">
                                        <span className="text-neutral-500">Age</span>
                                        <span className="text-white font-mono">{playerAnalysis.player.age}</span>
                                    </div>
                                    <div className="flex justify-between text-sm border-b border-neutral-800 pb-2">
                                        <span className="text-neutral-500">Potential</span>
                                        <span className="text-emerald-400 font-mono">{playerAnalysis.player.potential}</span>
                                    </div>
                                    <div className="flex justify-between text-sm border-b border-neutral-800 pb-2">
                                        <span className="text-neutral-500">Value</span>
                                        <span className="text-white font-mono">£{(playerAnalysis.player.market_value/1000000).toFixed(1)}M</span>
                                    </div>
                               </div>
                           </div>
                       )}
                   </div>

                   {/* Main Analysis */}
                   <div className="flex-1 bg-neutral-900 rounded-xl border border-white/10 p-6 shadow-xl relative overflow-hidden">
                       <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
                           <span className="text-9xl font-oswald font-bold text-white">ANALYSIS</span>
                       </div>

                       <div className="h-full flex flex-col">
                           <h3 className="text-emerald-500 font-bold uppercase tracking-widest text-sm mb-6">Attribute Polygon</h3>
                           <div className="flex-1 relative">
                               <ResponsiveContainer width="100%" height="100%">
                                   <RadarChart cx="50%" cy="50%" outerRadius="70%" data={playerAnalysis.data}>
                                       <PolarGrid stroke="#404040" strokeWidth={1} />
                                       <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 'bold' }} />
                                       <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                       <Radar name={playerAnalysis.player?.name} dataKey="A" stroke="#10b981" strokeWidth={3} fill="#10b981" fillOpacity={0.3} />
                                       <RechartsTooltip contentStyle={{ backgroundColor: '#171717', borderColor: '#404040', color: '#fff' }} />
                                   </RadarChart>
                               </ResponsiveContainer>
                           </div>
                           
                           {/* Scout Notes */}
                           <div className="mt-6 p-4 bg-neutral-950/50 rounded border border-neutral-800">
                               <h4 className="text-neutral-500 text-xs font-bold uppercase mb-3 flex items-center gap-2">
                                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                   Scouting Report
                               </h4>
                               <ul className="space-y-1">
                                   {playerAnalysis.notes.map((note, i) => (
                                       <li key={i} className="text-sm text-neutral-300 flex items-start gap-2">
                                           <span className="text-emerald-500 mt-1">▸</span> {note}
                                       </li>
                                   ))}
                                   {playerAnalysis.notes.length === 0 && <li className="text-sm text-neutral-500 italic">No significant observations.</li>}
                               </ul>
                           </div>
                       </div>
                   </div>
              </div>
          )}

      </div>
    </div>
  );
};
