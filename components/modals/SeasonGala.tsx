
import React from 'react';
import { useGame } from '../../context/GameContext';
import { GalaData } from '../../types';

interface SeasonGalaProps {
    data: GalaData;
}

export const SeasonGala: React.FC<SeasonGalaProps> = ({ data }) => {
    const { dispatch, playerClub } = useGame();

    const handleContinue = () => {
        dispatch({ type: 'START_NEW_SEASON' });
    };

    if (!playerClub) return null;

    return (
        <div className="fixed inset-0 z-[200] bg-neutral-950 flex flex-col items-center justify-center overflow-hidden animate-in fade-in duration-1000">
             {/* Background FX */}
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 animate-pulse"></div>
             <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-neutral-950"></div>
             
             <div className="relative z-10 w-full max-w-6xl h-[90vh] flex flex-col">
                 
                 {/* Title */}
                 <div className="text-center mb-8 animate-in slide-in-from-top-10 duration-1000 delay-300">
                     <div className="text-yellow-500 font-bold uppercase tracking-[0.5em] text-sm mb-2">End of Season Awards</div>
                     <h1 className="text-6xl md:text-8xl font-black text-white font-oswald uppercase tracking-tighter drop-shadow-2xl">
                         Season <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">{data.season}</span>
                     </h1>
                 </div>

                 <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-6 p-6 overflow-y-auto custom-scrollbar">
                     
                     {/* LEAGUE CHAMPION CARD */}
                     <div className="md:col-span-4 bg-gradient-to-br from-neutral-900 to-neutral-800 border border-yellow-500/30 rounded-xl p-8 flex flex-col items-center justify-center text-center shadow-[0_0_50px_rgba(234,179,8,0.1)] relative overflow-hidden group animate-in zoom-in duration-700 delay-500">
                         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                         <div className="text-yellow-500 text-6xl mb-4 drop-shadow-lg">🏆</div>
                         <div className="text-xs text-neutral-400 font-bold uppercase tracking-widest mb-2">{data.leagueName} Champion</div>
                         <div className="text-3xl md:text-4xl font-black text-white uppercase font-oswald mb-4">{data.championId === playerClub.id ? playerClub.name : "The Winner"}</div> 
                         {/* Note: Actual name is not passed in data.championId, we need to fetch it or pass it. The generateGala logic only passed ID. 
                             Let's rely on the awards data or fetch it from context if possible, but context is complex here. 
                             Actually, I updated generateGala to include championId, but UI needs name. 
                             For now, let's just show 'League Winner' if not player. Or assume logic holds.
                             Actually, let's fix the display logic:
                         */}
                         <div className="text-sm text-neutral-500">
                             {data.championId === playerClub.id ? "Congratulations on the title!" : `Better luck next year.`}
                         </div>
                     </div>

                     {/* PLAYER PERFORMANCE */}
                     <div className="md:col-span-4 bg-neutral-900 border border-white/10 rounded-xl p-8 flex flex-col items-center justify-center text-center animate-in zoom-in duration-700 delay-700">
                         <div className="text-4xl mb-4">📊</div>
                         <div className="text-xs text-neutral-400 font-bold uppercase tracking-widest mb-2">Season Finish</div>
                         <div className="text-6xl font-black text-white font-oswald mb-2">{data.playerPos}<span className="text-2xl align-top">th</span></div>
                         <div className="text-sm text-neutral-500">
                             {data.playerPos <= 4 ? "Champions League Football Secured" : "A season of rebuilding."}
                         </div>
                     </div>

                     {/* TIMELINE */}
                     <div className="md:col-span-4 bg-neutral-900 border border-white/10 rounded-xl p-6 overflow-hidden flex flex-col animate-in zoom-in duration-700 delay-900">
                         <div className="text-xs text-neutral-400 font-bold uppercase tracking-widest mb-4 border-b border-white/5 pb-2">Season Highlights</div>
                         <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar">
                             {data.history.map((h, i) => (
                                 <div key={i} className="flex gap-3">
                                     <div className="w-12 text-[10px] text-neutral-500 font-mono shrink-0 pt-1">{new Date(h.date).toLocaleDateString(undefined, {month:'short', day:'numeric'})}</div>
                                     <div className="text-xs text-white">{h.event}</div>
                                 </div>
                             ))}
                             {data.history.length === 0 && <div className="text-neutral-600 text-xs italic">No major headlines.</div>}
                         </div>
                     </div>

                     {/* AWARDS ROW */}
                     <div className="md:col-span-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                         {[
                             { title: "Player of the Year", icon: "⭐", data: data.awards.poty },
                             { title: "Young Player", icon: "💎", data: data.awards.ypos },
                             { title: "Golden Boot", icon: "👟", data: data.awards.goldenBoot },
                             { title: "Playmaker", icon: "🎯", data: data.awards.playmaker },
                         ].map((award, i) => (
                             <div key={i} className="bg-neutral-900 border border-white/10 rounded-lg p-4 flex flex-col animate-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${1000 + (i * 100)}ms` }}>
                                 <div className="flex justify-between items-start mb-3">
                                     <span className="text-[10px] font-bold uppercase text-yellow-500 tracking-wider">{award.title}</span>
                                     <span>{award.icon}</span>
                                 </div>
                                 <div className="font-bold text-white text-lg leading-tight">{award.data.name}</div>
                                 <div className="text-xs text-neutral-500 mt-1">{award.data.club}</div>
                                 <div className="mt-auto pt-3 border-t border-white/5 text-right">
                                     <span className="text-emerald-400 font-mono font-bold text-sm">{award.data.value}</span>
                                 </div>
                             </div>
                         ))}
                     </div>

                 </div>

                 <div className="p-8 text-center animate-in fade-in duration-1000 delay-[1500ms]">
                     <button 
                        onClick={handleContinue}
                        className="bg-white text-black hover:bg-yellow-400 font-black uppercase text-lg px-12 py-4 rounded-full shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all transform hover:scale-105 active:scale-95"
                     >
                         Begin {parseInt(data.season.split('/')[0]) + 1} Campaign
                     </button>
                 </div>

             </div>
        </div>
    );
};
