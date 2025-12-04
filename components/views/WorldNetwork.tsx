import React, { useState, useMemo } from 'react';
import { useGame } from '../../context/GameContext';
import { Player, Club, League, NewsItem } from '../../types';
import { PlayerModal } from '../modals/PlayerModal';

// --- ICONS (SVG) ---
const Icons = {
    Globe: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    Database: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>,
    Search: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
    Chart: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
    Money: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    Users: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
    Transfer: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>,
    Filter: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>,
    ArrowRight: () => <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>,
    Trophy: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>,
    Table: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>,
    Shirt: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
};

export const WorldNetwork: React.FC = () => {
  const { state, playerClub } = useGame();
  const [activeTab, setActiveTab] = useState<'overview' | 'tables' | 'squads' | 'scouting' | 'transfers'>('overview');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [selectedLeagueId, setSelectedLeagueId] = useState<string>(Object.keys(state.leagues)[0]);
  const [selectedClubId, setSelectedClubId] = useState<number | null>(null);
  
  // --- DEEP ANALYTICS BACKEND ---
  const analytics = useMemo(() => {
      let totalPlayers = 0;
      let totalMarketCap = 0;
      let totalWages = 0;
      let totalSpending = 0;
      let playersOver80 = 0;
      let playersUnder21 = 0;
      
      const allPlayers: Player[] = [];
      const allClubs: Club[] = [];
      
      // Position buckets for Best XI - Advanced Scoring Algorithm
      const scoredPlayers: { player: Player, score: number }[] = [];

      (Object.values(state.leagues) as League[]).forEach(league => {
          league.clubs.forEach(club => {
              allClubs.push(club);
              totalSpending += club.season_financials.transfer_spend;
              
              club.players.forEach(p => {
                  totalPlayers++;
                  totalMarketCap += p.market_value;
                  totalWages += p.salary;
                  allPlayers.push(p);
                  
                  if (p.overall >= 80) playersOver80++;
                  if (p.age < 21) playersUnder21++;

                  // ALGORITHM: Calculate Player Performance Score
                  // Score = (OVR * 0.4) + (REP * 0.1) + (FORM * 0.1) + (RATING_SCALED * 0.4)
                  // Plus stat bonuses based on position
                  let score = (p.overall * 0.4) + (p.reputation * 0.1) + (p.form * 0.1);
                  
                  // Rating Weighting (Heavy bias towards actual performance)
                  if (p.season_stats.appearances > 0) {
                      score += (p.season_stats.avg_rating * 10) * 0.4;
                  } else {
                      // Fallback for early season / no games: rely on ability
                      score += (p.overall * 0.4);
                  }

                  // Positional Bonuses
                  if (p.position === 'FWD' || p.position === 'ST') {
                      score += (p.season_stats.goals * 1.5) + (p.season_stats.assists * 0.5);
                  } else if (p.position === 'MID') {
                      score += (p.season_stats.assists * 1.5) + (p.season_stats.goals * 0.5) + (p.season_stats.mom_awards * 2);
                  } else if (p.position === 'DEF') {
                      score += (p.season_stats.clean_sheets * 2) + (p.season_stats.mom_awards * 2);
                  } else if (p.position === 'GK') {
                      score += (p.season_stats.clean_sheets * 2.5) + (p.season_stats.mom_awards * 2);
                  }

                  scoredPlayers.push({ player: p, score });
              });
          });
      });

      // Sort players by score for Best XI selection
      scoredPlayers.sort((a, b) => b.score - a.score);

      // Select Best XI (Strict 4-3-3 Formation)
      const bestXI = {
          GK: scoredPlayers.find(x => x.player.position === 'GK')?.player || null,
          DEF: scoredPlayers.filter(x => x.player.position === 'DEF').slice(0, 4).map(x => x.player),
          MID: scoredPlayers.filter(x => x.player.position === 'MID').slice(0, 3).map(x => x.player),
          FWD: scoredPlayers.filter(x => ['FWD', 'ST'].includes(x.player.position)).slice(0, 3).map(x => x.player)
      };

      // Breakout Stars (High Rating vs Low Overall)
      const breakoutStars = scoredPlayers
          .filter(x => x.player.season_stats.appearances > 3 && x.player.overall < 80)
          .sort((a, b) => b.player.season_stats.avg_rating - a.player.season_stats.avg_rating)
          .slice(0, 5)
          .map(x => x.player);

      const avgWage = totalPlayers > 0 ? totalWages / totalPlayers : 0;
      
      // Sort global lists for tables
      const topScorers = [...allPlayers].sort((a, b) => b.season_stats.goals - a.season_stats.goals).slice(0, 5);
      
      return {
          totalPlayers,
          totalMarketCap,
          totalWages,
          totalSpending,
          avgWage,
          playersOver80,
          playersUnder21,
          bestXI,
          breakoutStars,
          topScorers,
          allPlayers,
          allClubs
      };
  }, [state.leagues]);

  // --- SCOUTING FILTERS ---
  const [filters, setFilters] = useState({
      search: "",
      position: "all",
      minOverall: 70,
      maxAge: 40,
      maxValue: 200
  });

  const transferHistory = useMemo(() => 
      state.news.filter(n => n.image_type === 'transfer').slice(0, 20)
  , [state.news]);

  // Group leagues by country for sidebars
  const groupedLeagues = useMemo((): Record<string, { id: string, name: string }[]> => {
    return Object.entries(state.leagues).reduce((acc, [key, league]) => {
        const l = league as League;
        if (!acc[l.country]) acc[l.country] = [];
        acc[l.country].push({ id: key, name: l.name });
        return acc;
    }, {} as Record<string, { id: string, name: string }[]>);
  }, [state.leagues]);

  // --- HELPERS ---
  const formatCurrency = (val: number) => val >= 1000000 ? `£${(val/1000000).toFixed(1)}M` : `£${(val/1000).toFixed(0)}k`;
  
  const getRatingColor = (ovr: number) => {
      if (ovr >= 90) return 'text-emerald-400 font-black shadow-emerald-500/50';
      if (ovr >= 80) return 'text-emerald-500 font-bold';
      if (ovr >= 70) return 'text-blue-400 font-bold';
      if (ovr >= 60) return 'text-yellow-500 font-medium';
      return 'text-neutral-500';
  };

  // --- PITCH VISUALIZER ---
  const BestXIPitch = ({ xi, onSelect }: { xi: typeof analytics.bestXI, onSelect: (p: Player) => void }) => {
    // positions for 4-3-3
    const positions = [
        { role: 'GK', top: '82%', left: '50%', player: xi.GK },
        { role: 'LB', top: '65%', left: '20%', player: xi.DEF[0] }, 
        { role: 'CB', top: '65%', left: '40%', player: xi.DEF[1] },
        { role: 'CB', top: '65%', left: '60%', player: xi.DEF[2] },
        { role: 'RB', top: '65%', left: '80%', player: xi.DEF[3] },
        { role: 'CM', top: '42%', left: '30%', player: xi.MID[0] },
        { role: 'CDM', top: '50%', left: '50%', player: xi.MID[1] },
        { role: 'CM', top: '42%', left: '70%', player: xi.MID[2] },
        { role: 'LW', top: '18%', left: '20%', player: xi.FWD[0] },
        { role: 'ST', top: '12%', left: '50%', player: xi.FWD[1] },
        { role: 'RW', top: '18%', left: '80%', player: xi.FWD[2] },
    ];

    return (
        <div className="relative w-full h-[500px] bg-neutral-950 rounded-xl border border-white/10 overflow-hidden shadow-2xl group select-none">
            {/* Pitch Graphic */}
            <div className="absolute inset-0 bg-[#152238]">
                 {/* Pitch Texture */}
                 <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-30"></div>
                 <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/30 to-blue-900/10"></div>
                 
                 {/* Lines */}
                 <div className="absolute top-[2%] bottom-[2%] left-[2%] right-[2%] border-2 border-white/10 rounded"></div>
                 <div className="absolute top-1/2 left-[2%] right-[2%] h-px bg-white/10"></div>
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border border-white/10"></div>
                 <div className="absolute bottom-[2%] left-1/2 -translate-x-1/2 w-48 h-24 border border-white/10 border-b-0"></div>
                 <div className="absolute top-[2%] left-1/2 -translate-x-1/2 w-48 h-24 border border-white/10 border-t-0"></div>
            </div>

            {positions.map((pos, idx) => (
                <div 
                    key={idx}
                    onClick={() => pos.player && onSelect(pos.player)}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer group/player hover:z-10 transition-all"
                    style={{ top: pos.top, left: pos.left }}
                >
                    {pos.player ? (
                        <div className="relative transition-transform duration-300 group-hover/player:scale-110">
                            {/* Rating Badge (Top Right) */}
                            <div className={`absolute -top-2 -right-2 z-10 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shadow-lg border ${pos.player.overall >= 90 ? 'bg-emerald-500 border-emerald-400 text-white' : 'bg-neutral-800 border-neutral-600 text-neutral-300'}`}>
                                {pos.player.overall}
                            </div>

                            {/* Player Card */}
                            <div className="bg-neutral-900/90 backdrop-blur-sm border border-white/20 rounded-lg p-1.5 shadow-xl flex flex-col items-center w-20">
                                {/* Face/Icon */}
                                <div className={`w-8 h-8 rounded-full mb-1 flex items-center justify-center text-xs font-bold border shadow-inner ${pos.player.form > 80 ? 'bg-gradient-to-br from-emerald-800 to-emerald-900 border-emerald-500/50' : 'bg-neutral-800 border-white/10'}`}>
                                    {pos.player.name.charAt(0)}
                                </div>
                                
                                {/* Name & Club */}
                                <div className="text-center w-full">
                                    <p className="text-[9px] font-bold text-white truncate w-full leading-tight">{pos.player.name.split(' ').pop()}</p>
                                    <p className="text-[8px] text-neutral-400 truncate mt-0.5">{analytics.allClubs.find(c=>c.id===pos.player?.clubId)?.name?.substring(0,3).toUpperCase() || "UNK"}</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="w-8 h-8 rounded-full border border-dashed border-white/20 flex items-center justify-center text-white/10 text-xs">
                            +
                        </div>
                    )}
                </div>
            ))}
            
            <div className="absolute bottom-4 right-4 text-right pointer-events-none">
                <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-1">Global Analysis</div>
                <h4 className="text-4xl font-black text-white/10 font-oswald uppercase tracking-tight">Team of the Year</h4>
            </div>
        </div>
    )
  };

  // --- SUB-VIEWS ---

  const OverviewView = () => (
      <div className="grid grid-cols-12 gap-6 h-full overflow-y-auto custom-scrollbar pr-2">
          {/* Key Metrics Row */}
          <div className="col-span-12 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-neutral-900 border border-white/10 p-5 rounded-lg relative overflow-hidden group">
                   <div className="flex justify-between items-start relative z-10">
                       <div>
                           <p className="text-[10px] font-bold uppercase text-neutral-500 tracking-widest">Global Market Cap</p>
                           <p className="text-2xl font-mono font-bold text-white mt-1">{formatCurrency(analytics.totalMarketCap)}</p>
                       </div>
                       <div className="p-2 bg-emerald-900/20 rounded text-emerald-500"><Icons.Money /></div>
                   </div>
                   <div className="mt-4 h-1 w-full bg-neutral-800 rounded-full overflow-hidden">
                       <div className="h-full bg-emerald-500" style={{ width: '75%' }}></div>
                   </div>
              </div>

              <div className="bg-neutral-900 border border-white/10 p-5 rounded-lg relative overflow-hidden group">
                   <div className="flex justify-between items-start relative z-10">
                       <div>
                           <p className="text-[10px] font-bold uppercase text-neutral-500 tracking-widest">Avg Weekly Wage</p>
                           <p className="text-2xl font-mono font-bold text-white mt-1">{formatCurrency(analytics.avgWage)}</p>
                       </div>
                       <div className="p-2 bg-blue-900/20 rounded text-blue-500"><Icons.Chart /></div>
                   </div>
                   <div className="mt-4 flex justify-between text-[10px] text-neutral-500 font-mono">
                       <span>Low: £500</span>
                       <span>High: £500k</span>
                   </div>
              </div>

              <div className="bg-neutral-900 border border-white/10 p-5 rounded-lg relative overflow-hidden group">
                   <div className="flex justify-between items-start relative z-10">
                       <div>
                           <p className="text-[10px] font-bold uppercase text-neutral-500 tracking-widest">Elite Players</p>
                           <p className="text-2xl font-mono font-bold text-white mt-1">{analytics.playersOver80}</p>
                       </div>
                       <div className="p-2 bg-purple-900/20 rounded text-purple-500"><Icons.Users /></div>
                   </div>
                   <p className="text-[10px] text-neutral-600 mt-4">Rated 80+ Overall</p>
              </div>

              <div className="bg-neutral-900 border border-white/10 p-5 rounded-lg relative overflow-hidden group">
                   <div className="flex justify-between items-start relative z-10">
                       <div>
                           <p className="text-[10px] font-bold uppercase text-neutral-500 tracking-widest">Season Spend</p>
                           <p className="text-2xl font-mono font-bold text-white mt-1">{formatCurrency(analytics.totalSpending)}</p>
                       </div>
                       <div className="p-2 bg-rose-900/20 rounded text-rose-500"><Icons.Transfer /></div>
                   </div>
                   <p className="text-[10px] text-neutral-600 mt-4">Transfer Fees Paid</p>
              </div>
          </div>

          {/* World Best XI Visualization */}
          <div className="col-span-12 lg:col-span-8 flex flex-col">
              <h3 className="text-sm font-bold uppercase text-white font-oswald tracking-wide mb-4 flex items-center gap-2">
                  <span className="w-1 h-4 bg-emerald-500"></span> World Best XI
              </h3>
              <BestXIPitch xi={analytics.bestXI} onSelect={setSelectedPlayer} />
          </div>

          {/* Side Panel: Golden Shoe & Breakout Stars */}
          <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
               
               {/* Breakout Stars */}
               <div className="bg-neutral-900 border border-white/10 rounded-lg overflow-hidden flex flex-col max-h-[300px]">
                   <div className="p-4 border-b border-white/10 bg-neutral-950 flex justify-between items-center">
                      <h3 className="text-sm font-bold uppercase text-white font-oswald tracking-wide">Breakout Stars</h3>
                      <span className="text-[10px] bg-blue-900/20 text-blue-400 border border-blue-900/50 px-2 py-0.5 rounded font-bold">Overperformers</span>
                  </div>
                  <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                      {analytics.breakoutStars.map((p, i) => (
                          <div key={p.id} onClick={() => setSelectedPlayer(p)} className="flex items-center justify-between p-2 hover:bg-neutral-800 rounded cursor-pointer border-b border-white/5 last:border-0 group">
                              <div className="flex items-center gap-3">
                                  <div className="text-xs font-bold text-neutral-500 w-4">{i+1}</div>
                                  <div>
                                      <div className="text-xs font-bold text-white group-hover:text-blue-400">{p.name}</div>
                                      <div className="text-[9px] text-neutral-500">{analytics.allClubs.find(c => c.id === p.clubId)?.name}</div>
                                  </div>
                              </div>
                              <div className="text-right">
                                  <div className="text-emerald-400 font-bold text-sm">{p.season_stats.avg_rating.toFixed(2)}</div>
                                  <div className="text-[9px] text-neutral-600">Rat</div>
                              </div>
                          </div>
                      ))}
                  </div>
               </div>

               {/* Golden Shoe Table */}
               <div className="bg-neutral-900 border border-white/10 rounded-lg overflow-hidden flex flex-col flex-1">
                   <div className="p-4 border-b border-white/10 bg-neutral-950 flex justify-between items-center">
                      <h3 className="text-sm font-bold uppercase text-white font-oswald tracking-wide">Golden Shoe</h3>
                      <span className="text-[10px] bg-yellow-900/20 text-yellow-500 border border-yellow-900/50 px-2 py-0.5 rounded font-bold">Top Scorers</span>
                  </div>
                  <div className="flex-1 overflow-y-auto custom-scrollbar">
                      <table className="w-full text-left">
                          <thead className="bg-neutral-950/50 text-[10px] uppercase text-neutral-500 font-bold">
                              <tr>
                                  <th className="p-3 text-center">#</th>
                                  <th className="p-3">Player</th>
                                  <th className="p-3 text-right">Gls</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-neutral-800">
                              {analytics.topScorers.map((p, i) => (
                                  <tr key={p.id} className="hover:bg-neutral-800 transition-colors cursor-pointer" onClick={() => setSelectedPlayer(p)}>
                                      <td className="p-3 text-center font-mono text-xs text-neutral-500">{i+1}</td>
                                      <td className="p-3">
                                          <div className="text-xs font-bold text-white">{p.name}</div>
                                          <div className="text-[10px] text-neutral-500">{analytics.allClubs.find(c => c.id === p.clubId)?.name}</div>
                                      </td>
                                      <td className="p-3 text-right font-mono text-sm font-bold text-yellow-500">{p.season_stats.goals}</td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              </div>
          </div>
      </div>
  );

  const LeagueTableView = () => {
      const league = state.leagues[selectedLeagueId];
      
      if (!league) {
          return <div className="p-10 text-center text-neutral-500 uppercase font-bold">League Data Unavailable</div>;
      }

      const sortedClubs = [...league.clubs].sort((a, b) => b.stats.points - a.stats.points || (b.stats.goalsFor - b.stats.goalsAgainst) - (a.stats.goalsFor - a.stats.goalsAgainst));
      
      const leaguePlayers = league.clubs.flatMap(c => c.players);
      const topScorers = [...leaguePlayers].sort((a, b) => b.season_stats.goals - a.season_stats.goals).slice(0, 5);
      const topAssists = [...leaguePlayers].sort((a, b) => b.season_stats.assists - a.season_stats.assists).slice(0, 5);
      const topRated = [...leaguePlayers].filter(p => p.season_stats.appearances > 1).sort((a, b) => b.season_stats.avg_rating - a.season_stats.avg_rating).slice(0, 5);

      return (
          <div className="h-full flex flex-col lg:flex-row gap-6">
               {/* Left Sidebar: League Navigation */}
              <div className="w-full lg:w-64 bg-neutral-900 border border-white/10 rounded-lg flex flex-col shrink-0 overflow-hidden">
                  <div className="p-4 border-b border-white/10 bg-neutral-950">
                      <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Select Competition</h3>
                  </div>
                  <div className="flex-1 overflow-y-auto custom-scrollbar">
                      {Object.entries(groupedLeagues).map(([country, leagues]: [string, { id: string, name: string }[]]) => (
                          <div key={country} className="mb-1">
                              <div className="px-4 py-2 text-[10px] font-bold uppercase text-emerald-500 bg-neutral-950/80 sticky top-0 z-10 border-b border-neutral-800">
                                  {country}
                              </div>
                              {leagues.map((l) => (
                                  <button
                                      key={l.id}
                                      onClick={() => setSelectedLeagueId(l.id)}
                                      className={`w-full text-left px-4 py-3 text-xs font-bold uppercase tracking-wide transition-colors border-l-2 ${selectedLeagueId === l.id ? 'bg-neutral-800 text-white border-emerald-500 shadow-inner' : 'text-neutral-400 hover:text-white border-transparent hover:bg-neutral-800'}`}
                                  >
                                      {l.name}
                                  </button>
                              ))}
                          </div>
                      ))}
                  </div>
              </div>

              {/* Main Content */}
              <div className="flex-1 flex flex-col gap-6 overflow-hidden">
                  {/* League Header */}
                  <div className="bg-neutral-900 p-6 rounded-lg border border-white/10 flex justify-between items-end shrink-0">
                      <div>
                          <h2 className="text-3xl font-oswald font-bold text-white uppercase">{league.name}</h2>
                          <p className="text-neutral-400 text-xs font-mono uppercase">Reputation: {league.reputation} • {league.country}</p>
                      </div>
                      <div className="text-right hidden md:block">
                          <div className="text-[10px] text-neutral-500 font-bold uppercase">Defending Champion</div>
                          <div className="text-white font-bold text-lg">{league.history.length > 0 ? analytics.allClubs.find(c => c.id === league.history[league.history.length-1].championId)?.name : 'TBD'}</div>
                      </div>
                  </div>

                  <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
                      {/* Table */}
                      <div className="lg:col-span-2 bg-neutral-900 border border-white/10 rounded-lg overflow-hidden flex flex-col">
                          <div className="p-3 bg-neutral-950 border-b border-white/10">
                              <h3 className="text-xs font-bold uppercase text-white font-oswald">League Standings</h3>
                          </div>
                          <div className="flex-1 overflow-y-auto custom-scrollbar">
                               <table className="w-full text-left text-xs">
                                   <thead className="bg-neutral-950/50 text-[10px] uppercase text-neutral-500 font-bold sticky top-0 z-10">
                                       <tr>
                                           <th className="p-3 text-center">Pos</th>
                                           <th className="p-3">Club</th>
                                           <th className="p-3 text-center">P</th>
                                           <th className="p-3 text-center">W</th>
                                           <th className="p-3 text-center">D</th>
                                           <th className="p-3 text-center">L</th>
                                           <th className="p-3 text-center">GD</th>
                                           <th className="p-3 text-center font-black text-white">Pts</th>
                                       </tr>
                                   </thead>
                                   <tbody className="divide-y divide-neutral-800">
                                       {sortedClubs.map((c, i) => (
                                           <tr key={c.id} className={`hover:bg-neutral-800 transition-colors ${c.id === playerClub?.id ? 'bg-white/5' : ''}`}>
                                               <td className="p-3 text-center font-mono text-neutral-500">{i+1}</td>
                                               <td className={`p-3 font-bold ${c.id === playerClub?.id ? 'text-emerald-400' : 'text-white'}`}>{c.name}</td>
                                               <td className="p-3 text-center text-neutral-400">{c.stats.played}</td>
                                               <td className="p-3 text-center text-neutral-400">{c.stats.won}</td>
                                               <td className="p-3 text-center text-neutral-400">{c.stats.drawn}</td>
                                               <td className="p-3 text-center text-neutral-400">{c.stats.lost}</td>
                                               <td className="p-3 text-center font-mono text-neutral-300">{c.stats.goalsFor - c.stats.goalsAgainst}</td>
                                               <td className="p-3 text-center font-black text-white">{c.stats.points}</td>
                                           </tr>
                                       ))}
                                   </tbody>
                               </table>
                          </div>
                      </div>

                      {/* Stats Column */}
                      <div className="lg:col-span-1 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
                          
                          {/* Top Scorers */}
                          <div className="bg-neutral-900 border border-white/10 rounded-lg overflow-hidden shrink-0">
                              <div className="p-3 bg-neutral-950 border-b border-white/10 flex justify-between items-center">
                                  <h3 className="text-xs font-bold uppercase text-white font-oswald">Top Scorers</h3>
                                  <span className="text-[10px] text-yellow-500 font-bold">Gls</span>
                              </div>
                              <div className="p-2">
                                  {topScorers.map((p, i) => (
                                      <div key={p.id} onClick={() => setSelectedPlayer(p)} className="flex justify-between items-center p-2 hover:bg-neutral-800 rounded cursor-pointer group">
                                          <div className="flex items-center gap-2 overflow-hidden">
                                              <span className="text-[10px] font-mono text-neutral-500 w-4">{i+1}</span>
                                              <div className="flex flex-col min-w-0">
                                                  <span className="text-xs font-bold text-white truncate group-hover:text-emerald-400">{p.name}</span>
                                                  <span className="text-[10px] text-neutral-500 truncate">{analytics.allClubs.find(c => c.id === p.clubId)?.name}</span>
                                              </div>
                                          </div>
                                          <span className="font-mono font-bold text-yellow-500 text-sm">{p.season_stats.goals}</span>
                                      </div>
                                  ))}
                              </div>
                          </div>

                          {/* Assists */}
                          <div className="bg-neutral-900 border border-white/10 rounded-lg overflow-hidden shrink-0">
                              <div className="p-3 bg-neutral-950 border-b border-white/10 flex justify-between items-center">
                                  <h3 className="text-xs font-bold uppercase text-white font-oswald">Assists</h3>
                                  <span className="text-[10px] text-blue-400 font-bold">Ast</span>
                              </div>
                              <div className="p-2">
                                  {topAssists.map((p, i) => (
                                      <div key={p.id} onClick={() => setSelectedPlayer(p)} className="flex justify-between items-center p-2 hover:bg-neutral-800 rounded cursor-pointer group">
                                          <div className="flex items-center gap-2 overflow-hidden">
                                              <span className="text-[10px] font-mono text-neutral-500 w-4">{i+1}</span>
                                              <div className="flex flex-col min-w-0">
                                                  <span className="text-xs font-bold text-white truncate group-hover:text-emerald-400">{p.name}</span>
                                                  <span className="text-[10px] text-neutral-500 truncate">{analytics.allClubs.find(c => c.id === p.clubId)?.name}</span>
                                              </div>
                                          </div>
                                          <span className="font-mono font-bold text-blue-400 text-sm">{p.season_stats.assists}</span>
                                      </div>
                                  ))}
                              </div>
                          </div>

                           {/* Ratings */}
                           <div className="bg-neutral-900 border border-white/10 rounded-lg overflow-hidden shrink-0">
                              <div className="p-3 bg-neutral-950 border-b border-white/10 flex justify-between items-center">
                                  <h3 className="text-xs font-bold uppercase text-white font-oswald">Avg Rating</h3>
                                  <span className="text-[10px] text-emerald-500 font-bold">Rat</span>
                              </div>
                              <div className="p-2">
                                  {topRated.map((p, i) => (
                                      <div key={p.id} onClick={() => setSelectedPlayer(p)} className="flex justify-between items-center p-2 hover:bg-neutral-800 rounded cursor-pointer group">
                                          <div className="flex items-center gap-2 overflow-hidden">
                                              <span className="text-[10px] font-mono text-neutral-500 w-4">{i+1}</span>
                                              <div className="flex flex-col min-w-0">
                                                  <span className="text-xs font-bold text-white truncate group-hover:text-emerald-400">{p.name}</span>
                                                  <span className="text-[10px] text-neutral-500 truncate">{analytics.allClubs.find(c => c.id === p.clubId)?.name}</span>
                                              </div>
                                          </div>
                                          <span className="font-mono font-bold text-emerald-500 text-sm">{p.season_stats.avg_rating.toFixed(2)}</span>
                                      </div>
                                  ))}
                              </div>
                          </div>

                      </div>
                  </div>
              </div>
          </div>
      );
  };

  const SquadDatabaseView = () => {
      const league = state.leagues[selectedLeagueId];
      
      if (!league) return null;

      const clubs = league.clubs.sort((a,b) => b.reputation - a.reputation);
      const selectedClub = selectedClubId ? clubs.find(c => c.id === selectedClubId) : null;

      return (
          <div className="h-full flex flex-col lg:flex-row gap-6">
              
              {/* Left Sidebar: Country Grouped Navigation */}
              <div className="w-full lg:w-64 bg-neutral-900 border border-white/10 rounded-lg flex flex-col shrink-0 overflow-hidden">
                  <div className="p-4 border-b border-white/10 bg-neutral-950">
                      <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Select League</h3>
                  </div>
                  <div className="flex-1 overflow-y-auto custom-scrollbar">
                      {Object.entries(groupedLeagues).map(([country, leagues]: [string, { id: string, name: string }[]]) => (
                          <div key={country} className="mb-1">
                              <div className="px-4 py-2 text-[10px] font-bold uppercase text-emerald-500 bg-neutral-950/80 sticky top-0 z-10 border-b border-neutral-800">
                                  {country}
                              </div>
                              {leagues.map((l) => (
                                  <button
                                      key={l.id}
                                      onClick={() => { setSelectedLeagueId(l.id); setSelectedClubId(null); }}
                                      className={`w-full text-left px-4 py-3 text-xs font-bold uppercase tracking-wide transition-colors border-l-2 ${selectedLeagueId === l.id ? 'bg-neutral-800 text-white border-emerald-500 shadow-inner' : 'text-neutral-400 hover:text-white border-transparent hover:bg-neutral-800'}`}
                                  >
                                      {l.name}
                                  </button>
                              ))}
                          </div>
                      ))}
                  </div>
              </div>

              {/* Main Content: Grid or Club Detail */}
              <div className="flex-1 bg-neutral-900 border border-white/10 rounded-lg flex flex-col overflow-hidden relative">
                  {selectedClub ? (
                      <>
                          {/* Club Header */}
                          <div className="bg-neutral-950 p-6 border-b border-white/10 flex justify-between items-end">
                              <div className="flex items-center gap-6">
                                  <button 
                                    onClick={() => setSelectedClubId(null)}
                                    className="p-2 rounded-full bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-700 hover:bg-neutral-700 transition-all"
                                  >
                                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                                  </button>
                                  <div className="w-16 h-16 bg-neutral-800 rounded-lg border-2 border-neutral-700 flex items-center justify-center text-3xl font-oswald font-bold text-white shadow-2xl">
                                      {selectedClub.name.charAt(0)}
                                  </div>
                                  <div>
                                      <h2 className="text-3xl font-bold text-white font-oswald uppercase">{selectedClub.name}</h2>
                                      <p className="text-neutral-400 text-xs uppercase tracking-wide">Founded {selectedClub.founded} • {selectedClub.stadium}</p>
                                  </div>
                              </div>
                              <div className="text-right">
                                  <div className="text-[10px] font-bold uppercase text-neutral-500">Est. Value</div>
                                  <div className="text-2xl font-mono font-bold text-emerald-400">{formatCurrency(selectedClub.budget * 3)}</div>
                              </div>
                          </div>
                          
                          {/* Club Roster */}
                          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                              <h3 className="text-sm font-bold uppercase text-neutral-400 tracking-widest mb-4">First Team Squad</h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {selectedClub.players.sort((a,b) => b.overall - a.overall).map(p => (
                                      <div key={p.id} onClick={() => setSelectedPlayer(p)} className="flex items-center justify-between p-3 bg-neutral-950/50 border border-neutral-800 rounded hover:bg-neutral-800 cursor-pointer transition-colors group">
                                          <div className="flex items-center gap-3">
                                              <span className={`text-[10px] font-bold w-8 text-center ${p.position === 'GK' ? 'text-yellow-500' : p.position === 'DEF' ? 'text-blue-500' : p.position === 'MID' ? 'text-emerald-500' : 'text-rose-500'}`}>{p.position}</span>
                                              <span className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">{p.name}</span>
                                          </div>
                                          <div className="flex items-center gap-4">
                                              <span className="text-[10px] font-mono text-neutral-500">£{(p.market_value/1000000).toFixed(1)}M</span>
                                              <span className={`text-xs font-bold w-6 text-center ${getRatingColor(p.overall)}`}>{p.overall}</span>
                                          </div>
                                      </div>
                                  ))}
                              </div>
                          </div>
                      </>
                  ) : (
                      <>
                           {/* League Grid */}
                           <div className="p-6 border-b border-white/10 bg-neutral-950">
                               <h2 className="text-2xl font-bold text-white font-oswald uppercase">{league.name}</h2>
                               <div className="flex gap-4 mt-2 text-xs text-neutral-400">
                                   <span>Reputation: {league.reputation}</span>
                                   <span>Teams: {league.club_count}</span>
                                   <span>Defending Champ: {league.history.length > 0 ? analytics.allClubs.find(c => c.id === league.history[league.history.length-1].championId)?.name : 'TBD'}</span>
                               </div>
                           </div>
                           <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                   {clubs.map(club => (
                                       <div 
                                           key={club.id} 
                                           onClick={() => setSelectedClubId(club.id)}
                                           className="bg-neutral-950 border border-neutral-800 p-4 rounded-lg hover:border-emerald-500/50 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg group"
                                       >
                                           <div className="flex items-center justify-between mb-3">
                                               <div className="w-10 h-10 bg-neutral-900 rounded flex items-center justify-center font-bold text-white border border-white/5">
                                                   {club.name.charAt(0)}
                                               </div>
                                               <span className="text-xs font-bold text-neutral-500 uppercase group-hover:text-emerald-500">View Squad</span>
                                           </div>
                                           <h4 className="font-bold text-white text-sm truncate">{club.name}</h4>
                                           <div className="flex justify-between mt-2 text-[10px] text-neutral-400">
                                               <span>Rep: {club.reputation}</span>
                                               <span>Bud: {formatCurrency(club.budget)}</span>
                                           </div>
                                       </div>
                                   ))}
                               </div>
                           </div>
                      </>
                  )}
              </div>
          </div>
      );
  };

  const ScoutingView = () => (
      <div className="h-full flex flex-col">
          {/* Filters */}
          <div className="bg-neutral-900 p-4 rounded-lg border border-white/10 mb-4 flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-[200px]">
                  <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Search Database</label>
                  <input 
                      type="text" 
                      className="w-full bg-neutral-950 border border-neutral-700 rounded px-4 py-2 text-sm text-white focus:border-emerald-500 outline-none"
                      placeholder="Player Name..."
                      value={filters.search}
                      onChange={(e) => setFilters({...filters, search: e.target.value})}
                  />
              </div>
              <div className="w-32">
                  <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Position</label>
                  <select 
                      className="w-full bg-neutral-950 border border-neutral-700 rounded px-2 py-2 text-sm text-white focus:border-emerald-500 outline-none"
                      value={filters.position}
                      onChange={(e) => setFilters({...filters, position: e.target.value})}
                  >
                      <option value="all">All</option>
                      <option value="GK">GK</option>
                      <option value="DEF">DEF</option>
                      <option value="MID">MID</option>
                      <option value="FWD">FWD</option>
                  </select>
              </div>
              <div className="w-40">
                  <label className="block text-[10px] font-bold uppercase text-neutral-500 mb-1">Min Overall: {filters.minOverall}</label>
                  <input 
                      type="range" min="50" max="99" 
                      className="w-full accent-emerald-500 h-1 bg-neutral-700 rounded-lg appearance-none cursor-pointer"
                      value={filters.minOverall}
                      onChange={(e) => setFilters({...filters, minOverall: Number(e.target.value)})}
                  />
              </div>
          </div>

          {/* Results */}
          <div className="flex-1 bg-neutral-900 border border-white/10 rounded-lg overflow-hidden flex flex-col">
              <div className="bg-neutral-950 px-4 py-2 border-b border-white/5 grid grid-cols-12 text-[10px] font-bold uppercase text-neutral-500">
                  <div className="col-span-4">Player</div>
                  <div className="col-span-2">Age</div>
                  <div className="col-span-2">Pos</div>
                  <div className="col-span-2">Ovr</div>
                  <div className="col-span-2 text-right">Value</div>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                  {analytics.allPlayers
                      .filter(p => 
                          (filters.position === 'all' || p.position === filters.position) &&
                          p.overall >= filters.minOverall &&
                          p.age <= filters.maxAge &&
                          (p.market_value / 1000000) <= filters.maxValue &&
                          p.name.toLowerCase().includes(filters.search.toLowerCase())
                      )
                      .slice(0, 100)
                      .map(p => (
                          <div 
                              key={p.id} 
                              onClick={() => setSelectedPlayer(p)}
                              className="grid grid-cols-12 px-4 py-3 border-b border-white/5 hover:bg-neutral-800 cursor-pointer transition-colors items-center"
                          >
                              <div className="col-span-4 font-bold text-sm text-white flex flex-col">
                                  <span>{p.name}</span>
                                  <span className="text-[10px] text-neutral-500 font-normal">{analytics.allClubs.find(c => c.id === p.clubId)?.name}</span>
                              </div>
                              <div className="col-span-2 text-xs text-neutral-400">{p.age}</div>
                              <div className="col-span-2 text-xs font-bold text-white">{p.position}</div>
                              <div className={`col-span-2 text-xs font-bold ${getRatingColor(p.overall)}`}>{p.overall}</div>
                              <div className="col-span-2 text-right text-xs font-mono text-neutral-300">{formatCurrency(p.market_value)}</div>
                          </div>
                      ))
                  }
              </div>
          </div>
      </div>
  );

  const TransfersView = () => (
      <div className="h-full bg-neutral-900 border border-white/10 rounded-lg p-6 overflow-hidden flex flex-col">
           <h3 className="text-sm font-bold uppercase text-white font-oswald tracking-wide mb-6 flex items-center gap-2">
              <span className="w-1 h-4 bg-emerald-500"></span> Global Transfer History
           </h3>
           <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4">
               {transferHistory.length === 0 && (
                   <div className="text-center text-neutral-600 uppercase font-bold py-20">No major transfers recorded yet.</div>
               )}
               {transferHistory.map(news => (
                   <div key={news.id} className="bg-neutral-950 p-4 rounded border border-neutral-800 flex items-start gap-4 hover:border-emerald-500/30 transition-colors">
                       <div className="w-10 h-10 rounded bg-neutral-900 flex items-center justify-center border border-neutral-800 font-bold text-emerald-500">
                           ⇄
                       </div>
                       <div className="flex-1">
                           <p className="text-[10px] font-bold uppercase text-neutral-500 mb-1">Confirmed Deal</p>
                           <p className="text-sm font-bold text-white">{news.headline}</p>
                           <p className="text-xs text-neutral-400 mt-1">{news.content}</p>
                       </div>
                       <div className="text-right text-[10px] font-mono text-neutral-600">
                           {new Date(news.date).toLocaleDateString()}
                       </div>
                   </div>
               ))}
           </div>
      </div>
  );

  return (
    <div className="p-4 md:p-6 h-full flex flex-col">
        {/* Header Navigation */}
        <div className="flex justify-between items-end mb-6">
            <div>
                <h2 className="text-3xl md:text-4xl font-bold text-white font-oswald uppercase tracking-tight mb-1">World Network</h2>
                <div className="flex gap-1">
                    {[
                        { id: 'overview', label: 'Global Overview', icon: <Icons.Globe /> },
                        { id: 'tables', label: 'League Tables', icon: <Icons.Table /> },
                        { id: 'squads', label: 'Squad Database', icon: <Icons.Database /> },
                        { id: 'scouting', label: 'Player Search', icon: <Icons.Search /> },
                        { id: 'transfers', label: 'Latest Deals', icon: <Icons.Transfer /> },
                    ].map(tab => (
                        <button 
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`px-4 py-2 rounded-t text-xs font-bold uppercase tracking-widest border-b-2 transition-all flex items-center gap-2 ${activeTab === tab.id ? 'bg-neutral-800 text-emerald-400 border-emerald-500' : 'bg-neutral-900 text-neutral-500 border-transparent hover:bg-neutral-800 hover:text-white'}`}
                        >
                            {tab.icon} <span className="hidden md:inline">{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden">
            {activeTab === 'overview' && <OverviewView />}
            {activeTab === 'tables' && <LeagueTableView />}
            {activeTab === 'squads' && <SquadDatabaseView />}
            {activeTab === 'scouting' && <ScoutingView />}
            {activeTab === 'transfers' && <TransfersView />}
        </div>

        {/* Player Modal */}
        {selectedPlayer && (
            <PlayerModal player={selectedPlayer} onClose={() => setSelectedPlayer(null)} />
        )}
    </div>
  );
};