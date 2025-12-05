
import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { formatDate } from '../../services/engine';
import { View } from '../../types';

export const Dashboard: React.FC = () => {
  const { playerClub, state, setCurrentView, dispatch } = useGame();
  const [expandedMsgId, setExpandedMsgId] = useState<number | null>(null);

  if (!playerClub) return null;

  const league = state.leagues[playerClub.leagueId];
  
  let nextFixture: any = null;
  for (const key in state.leagues) {
      const l = state.leagues[key];
      const f = l.fixtures.find(fx => !fx.played && (fx.homeClubId === playerClub.id || fx.awayClubId === playerClub.id));
      if (f) {
          if (!nextFixture || new Date(f.date) < new Date(nextFixture.date)) {
              nextFixture = f;
          }
      }
  }

  let opponent = null;
  if (nextFixture) {
      const opponentId = nextFixture.homeClubId === playerClub.id ? nextFixture.awayClubId : nextFixture.homeClubId;
      for (const key in state.leagues) {
          const c = state.leagues[key].clubs.find(club => club.id === opponentId);
          if (c) { opponent = c; break; }
      }
  }
  
  const latestNews = state.news[0];

  const sortedMessages = [...state.messages].sort((a, b) => {
      if (a.read === b.read) return new Date(b.date).getTime() - new Date(a.date).getTime();
      return a.read ? 1 : -1;
  });

  const getBoardMood = (security: number) => {
      if (security > 90) return { text: 'Ecstatic', color: 'text-emerald-400' };
      if (security > 75) return { text: 'Happy', color: 'text-emerald-500' };
      if (security > 60) return { text: 'Satisfied', color: 'text-yellow-500' };
      if (security > 45) return { text: 'Concerned', color: 'text-orange-500' };
      if (security > 30) return { text: 'Unhappy', color: 'text-red-500' };
      return { text: 'Furious', color: 'text-red-700' };
  };

  const getFanMood = (happiness: number) => {
      if (happiness > 90) return { text: 'Euphoric', color: 'text-purple-400' };
      if (happiness > 70) return { text: 'Optimistic', color: 'text-emerald-400' };
      if (happiness > 50) return { text: 'Content', color: 'text-blue-400' };
      if (happiness > 30) return { text: 'Frustrated', color: 'text-orange-400' };
      return { text: 'Toxic', color: 'text-red-600' };
  };

  const boardMood = getBoardMood(playerClub.job_security);
  const fanMood = getFanMood(playerClub.fan_happiness);

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 h-full overflow-y-auto bg-neutral-900">
      
      {/* Header / Status */}
      <div className="col-span-12 flex justify-between items-end border-b border-white/5 pb-4">
          <div>
              <h2 className="text-3xl text-white font-oswald uppercase tracking-wide">Manager Dashboard</h2>
              <p className="text-neutral-500 text-sm">Overview & Tasks</p>
          </div>
          <div className="flex gap-4 text-sm">
               <div className="px-4 py-2 bg-neutral-800 rounded border border-white/5 text-center min-w-[100px]">
                   <span className="text-neutral-500 uppercase text-[10px] font-bold block mb-0.5">Job Security</span>
                   <div className="flex items-center justify-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${playerClub.job_security > 60 ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                        <span className="text-white font-bold">{playerClub.job_security}%</span>
                   </div>
               </div>
               <div className="px-4 py-2 bg-neutral-800 rounded border border-white/5 text-center min-w-[100px]">
                   <span className="text-neutral-500 uppercase text-[10px] font-bold block mb-0.5">Board Confidence</span>
                   <span className={`${boardMood.color} font-bold`}>{boardMood.text}</span>
               </div>
               <div className="px-4 py-2 bg-neutral-800 rounded border border-white/5 text-center min-w-[100px]">
                   <span className="text-neutral-500 uppercase text-[10px] font-bold block mb-0.5">Fan Atmosphere</span>
                   <span className={`${fanMood.color} font-bold`}>{fanMood.text}</span>
               </div>
          </div>
      </div>

      {/* Next Match - Hero Card */}
      <div className="col-span-12 md:col-span-8 bg-neutral-800 rounded-lg border border-white/5 p-0 overflow-hidden relative group min-h-[300px]">
         {/* Background Image with Overlay */}
         <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1518091043644-c1d4457512c6?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-20 group-hover:opacity-30 transition-opacity duration-700"></div>
         <div className="absolute inset-0 bg-gradient-to-r from-neutral-900 via-neutral-900/80 to-transparent"></div>
         
         <div className="relative z-10 p-8 h-full flex flex-col justify-center">
             <div className="mb-6">
                 <span className="bg-white text-neutral-900 text-[10px] font-bold uppercase px-3 py-1 rounded tracking-widest">Next Fixture</span>
                 <h3 className="text-4xl font-oswald text-white mt-2 uppercase">
                     {nextFixture ? (
                         <>
                            <span className="text-neutral-400">vs</span> {opponent?.name}
                         </>
                     ) : "No Upcoming Games"}
                 </h3>
                 <p className="text-neutral-400 text-sm mt-1">
                     {nextFixture ? `${formatDate(nextFixture.date)} • ${nextFixture.competition}` : "End of Season"}
                 </p>
             </div>

             {nextFixture && (
                 <div className="flex gap-4">
                     <button onClick={() => setCurrentView(View.SQUAD)} className="bg-neutral-900 hover:bg-neutral-700 text-white px-6 py-3 rounded border border-white/10 uppercase text-xs font-bold tracking-widest transition-colors">
                         Manage Squad
                     </button>
                     <button onClick={() => setCurrentView(View.TABLE)} className="bg-transparent hover:bg-white/5 text-white px-6 py-3 rounded border border-white/20 uppercase text-xs font-bold tracking-widest transition-colors">
                         View Table
                     </button>
                 </div>
             )}
         </div>
      </div>

      {/* Inbox / Messages */}
      <div className="col-span-12 md:col-span-4 bg-neutral-800 rounded-lg border border-white/5 flex flex-col h-[300px]">
          <div className="p-4 border-b border-white/5 flex justify-between items-center bg-neutral-850">
              <h3 className="text-white font-oswald uppercase tracking-wide text-sm">Inbox</h3>
              <span className="bg-neutral-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{sortedMessages.filter(m => !m.read).length}</span>
          </div>
          <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
              {sortedMessages.map(msg => (
                  <div 
                    key={msg.id} 
                    onClick={() => {
                        if (expandedMsgId === msg.id) setExpandedMsgId(null);
                        else {
                            setExpandedMsgId(msg.id);
                            if(!msg.read) dispatch({type:'MARK_READ', payload: msg.id});
                        }
                    }}
                    className={`p-3 mb-1 rounded cursor-pointer transition-colors border-l-2 ${!msg.read ? 'bg-neutral-700/50 border-emerald-500' : 'hover:bg-neutral-700/30 border-transparent'}`}
                  >
                      <div className="flex justify-between mb-1">
                          <span className={`text-xs font-bold ${!msg.read ? 'text-white' : 'text-neutral-400'}`}>{msg.sender}</span>
                          <span className="text-[10px] text-neutral-500">{formatDate(msg.date)}</span>
                      </div>
                      <p className={`text-xs truncate ${!msg.read ? 'text-neutral-200' : 'text-neutral-500'}`}>{msg.subject}</p>
                      
                      {expandedMsgId === msg.id && (
                          <div className="mt-3 pt-3 border-t border-white/5 text-xs text-neutral-300 leading-relaxed">
                              {msg.body}
                          </div>
                      )}
                  </div>
              ))}
              {sortedMessages.length === 0 && (
                  <div className="h-full flex items-center justify-center text-neutral-600 text-xs uppercase">No Messages</div>
              )}
          </div>
      </div>

      {/* Quick Stats / Ticker */}
      <div className="col-span-12 bg-neutral-800 rounded-lg border border-white/5 p-6 flex items-center justify-between">
           {latestNews && (
               <div className="flex items-center gap-4 w-full">
                   <span className="text-red-500 font-bold uppercase text-xs tracking-widest shrink-0 animate-pulse">Breaking News</span>
                   <div className="h-4 w-px bg-white/10"></div>
                   <p className="text-white text-sm font-medium truncate">{latestNews.headline}</p>
                   <button onClick={() => setCurrentView(View.NEWS)} className="ml-auto text-xs text-neutral-400 hover:text-white uppercase font-bold tracking-wider">Read More</button>
               </div>
           )}
      </div>

    </div>
  );
};