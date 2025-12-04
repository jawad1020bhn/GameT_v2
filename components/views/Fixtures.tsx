
import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { formatDate } from '../../services/engine';
import { Fixture, Club, League } from '../../types';
import { MatchdayOverview } from '../modals/MatchdayOverview';

export const Fixtures: React.FC = () => {
  const { state, playerClub, simulatePeriod } = useGame();
  const [viewDate, setViewDate] = useState<string | null>(null);
  
  if (!playerClub) return null;

  // Gather all fixtures involving this club from all leagues
  const allFixtures: Fixture[] = [];
  Object.values(state.leagues).forEach((l: League) => {
      l.fixtures.forEach(f => {
          if (f.homeClubId === playerClub.id || f.awayClubId === playerClub.id) {
              allFixtures.push(f);
          }
      });
  });

  allFixtures.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const upcomingIndex = allFixtures.findIndex(f => !f.played);
  
  const getClubName = (id: number): string => {
      for (const key in state.leagues) {
          const c = state.leagues[key].clubs.find(club => club.id === id);
          if (c) return c.name;
      }
      return "Unknown";
  };

  const getCompetitionColor = (comp: string) => {
      if (comp === "Premier League") return "text-neutral-400 border-neutral-600";
      if (comp === "Champions League") return "text-blue-400 border-blue-500";
      if (comp === "National Cup") return "text-yellow-400 border-yellow-500";
      return "text-white";
  };

  const handleSimulateToDate = (targetDateStr: string) => {
      const target = new Date(targetDateStr);
      const current = new Date(state.currentDate);
      target.setHours(0, 0, 0, 0);
      current.setHours(0, 0, 0, 0);

      const diffTime = target.getTime() - current.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays > 0) {
          simulatePeriod(diffDays);
      }
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex justify-between items-end mb-6">
        <h2 className="text-4xl font-bold text-white font-oswald uppercase tracking-tight">Fixture Schedule</h2>
        <div className="text-neutral-400 text-sm font-mono">
            Upcoming: <span className="text-emerald-400 font-bold">{allFixtures.filter(f => !f.played).length}</span> | 
            Played: <span className="text-white font-bold">{allFixtures.filter(f => f.played).length}</span>
        </div>
      </div>
      
      <div className="bg-neutral-900 rounded-xl border border-white/10 shadow-2xl overflow-hidden flex-1 flex flex-col">
        <div className="overflow-auto flex-1 custom-scrollbar p-4">
            <div className="space-y-2">
                {allFixtures.map((fixture, idx) => {
                    const isUpcoming = !fixture.played;
                    const isNext = idx === upcomingIndex;
                    const homeName = getClubName(fixture.homeClubId);
                    const awayName = getClubName(fixture.awayClubId);
                    const isHome = fixture.homeClubId === playerClub.id;

                    const fixtureDateObj = new Date(fixture.date);
                    const currentDateObj = new Date(state.currentDate);
                    fixtureDateObj.setHours(0,0,0,0);
                    currentDateObj.setHours(0,0,0,0);
                    
                    const isFuture = fixtureDateObj > currentDateObj;
                    const isToday = fixtureDateObj.getTime() === currentDateObj.getTime();

                    return (
                        <div 
                            key={fixture.id} 
                            className={`
                                flex items-center p-4 rounded border-l-4 group/row
                                ${isNext ? 'bg-neutral-800 border-emerald-500 shadow-lg ring-1 ring-emerald-500/20' : 'bg-neutral-950/50 border-neutral-800'}
                                ${!isUpcoming ? 'opacity-60 hover:opacity-100 transition-opacity' : ''}
                            `}
                        >
                            {/* Date - Clickable */}
                            <div 
                                onClick={() => setViewDate(fixture.date)}
                                className="w-32 flex flex-col border-r border-neutral-800 pr-4 mr-4 cursor-pointer group-hover/row:bg-neutral-800 transition-colors rounded p-2 -ml-2"
                                title="View all matches on this day"
                            >
                                <span className="text-xs text-neutral-500 group-hover/row:text-white font-bold uppercase flex items-center gap-2">
                                    {formatDate(fixture.date)}
                                    <svg className="w-3 h-3 opacity-0 group-hover/row:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                </span>
                                <span className={`text-[10px] uppercase px-1.5 py-0.5 rounded border w-fit mt-1 ${getCompetitionColor(fixture.competition)}`}>
                                    {fixture.competition}
                                </span>
                            </div>

                            {/* Match */}
                            <div className="flex-1 flex items-center justify-between">
                                <div className={`w-1/3 text-right font-bold ${isHome ? 'text-white' : 'text-neutral-400'}`}>
                                    {homeName}
                                </div>

                                <div className="w-24 text-center flex flex-col items-center">
                                    {fixture.played ? (
                                        <div className="text-2xl font-mono font-bold text-white bg-neutral-900 px-3 py-1 rounded border border-neutral-700">
                                            {fixture.homeScore} - {fixture.awayScore}
                                        </div>
                                    ) : (
                                        <div className="text-xs text-neutral-600 font-bold uppercase bg-neutral-900/50 px-2 py-1 rounded">
                                            {new Date(fixture.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </div>
                                    )}
                                </div>

                                <div className={`w-1/3 text-left font-bold ${!isHome ? 'text-white' : 'text-neutral-400'}`}>
                                    {awayName}
                                </div>
                            </div>

                             {/* Action / Result Indicator */}
                             <div className="w-24 flex justify-center pl-4 border-l border-neutral-800 ml-4">
                                 {fixture.played ? (
                                     <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold
                                         ${(isHome && fixture.homeScore! > fixture.awayScore!) || (!isHome && fixture.awayScore! > fixture.homeScore!) ? 'bg-emerald-500 text-emerald-900' : 
                                           (fixture.homeScore === fixture.awayScore) ? 'bg-neutral-500 text-neutral-900' : 'bg-red-500 text-red-900'}
                                     `}>
                                         {(isHome && fixture.homeScore! > fixture.awayScore!) || (!isHome && fixture.awayScore! > fixture.homeScore!) ? 'W' : 
                                           (fixture.homeScore === fixture.awayScore) ? 'D' : 'L'}
                                     </div>
                                 ) : isFuture ? (
                                     <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleSimulateToDate(fixture.date);
                                        }}
                                        className="group flex items-center gap-1 bg-neutral-800 hover:bg-emerald-600 text-neutral-400 hover:text-white px-3 py-1.5 rounded transition-all text-[10px] font-bold uppercase border border-neutral-700 hover:border-emerald-500 shadow-sm hover:shadow-emerald-500/20"
                                        title="Simulate until this match day"
                                     >
                                         <span>Sim</span>
                                         <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="currentColor" viewBox="0 0 20 20"><path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 10l-5.445-4.832zM12 6a1 1 0 10-2 0v8a1 1 0 102 0V6z" /></svg>
                                     </button>
                                 ) : isToday ? (
                                     <span className="text-[10px] text-emerald-400 font-bold uppercase bg-emerald-900/20 px-2 py-1 rounded animate-pulse border border-emerald-500/30">Today</span>
                                 ) : (
                                     <span className="text-[10px] text-neutral-600 font-bold uppercase">Pending</span>
                                 )}
                             </div>
                        </div>
                    );
                })}
            </div>
        </div>

        {viewDate && (
            <MatchdayOverview date={viewDate} onClose={() => setViewDate(null)} />
        )}
    </div>
  );
};
