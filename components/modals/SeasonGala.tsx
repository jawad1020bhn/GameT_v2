
import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { GalaData } from '../../types';

interface SeasonGalaProps {
    data: GalaData;
}

export const SeasonGala: React.FC<SeasonGalaProps> = ({ data }) => {
    const { dispatch, playerClub } = useGame();
    const [step, setStep] = useState<1 | 2>(1);

    const handleContinue = () => {
        dispatch({ type: 'START_NEW_SEASON' });
    };

    if (!playerClub) return null;

    // Helper for formatting large numbers
    const fmtMoney = (n: number) => `£${(n / 1000000).toFixed(1)}M`;
    const fmtWage = (n: number) => `£${(n / 1000).toFixed(0)}K`;

    return (
        <div className="fixed inset-0 z-[200] bg-neutral-950 flex flex-col items-center justify-center overflow-hidden animate-in fade-in duration-500 font-sans">
             {/* Background FX */}
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
             <div className="absolute inset-0 bg-gradient-to-br from-neutral-950 via-neutral-900 to-blue-900/10 pointer-events-none"></div>
             
             {/* Main Container */}
             <div className="relative z-10 w-full max-w-4xl bg-neutral-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden flex flex-col h-[85vh]">
                 
                 {/* PAGE 1: SEASON RESULTS */}
                 {step === 1 && (
                     <div className="flex-1 flex flex-col p-8 animate-in slide-in-from-right duration-500">
                         {/* Header */}
                         <div className="text-center mb-8 border-b border-white/10 pb-6">
                             <div className="flex items-center justify-center gap-4 text-emerald-500 font-bold uppercase tracking-widest text-xs mb-2">
                                 <span>Season {data.season}</span>
                                 <span className="w-1 h-1 bg-emerald-500 rounded-full"></span>
                                 <span>Complete</span>
                             </div>
                             <h1 className="text-5xl font-black text-white font-oswald uppercase tracking-tight mb-2">
                                 {playerClub.name}
                             </h1>
                             <p className="text-neutral-400 italic font-serif">"A season to remember"</p>
                         </div>

                         {/* Objectives */}
                         <div className="mb-8">
                             <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-4">Objectives Review</h3>
                             <div className="space-y-3">
                                 {data.review?.objectives && Object.entries(data.review.objectives).map(([key, obj]) => (
                                     <div key={key} className="flex items-center justify-between bg-neutral-950 p-4 rounded border border-white/5">
                                         <div className="capitalize font-bold text-white w-32">{key}</div>
                                         <div className="text-sm text-neutral-400">Target: <span className="text-white">{obj.target}</span></div>
                                         <div className="flex items-center gap-2">
                                             <span className={`text-sm font-bold ${obj.success ? 'text-emerald-400' : 'text-red-400'}`}>
                                                 {obj.result}
                                             </span>
                                             <span>{obj.success ? '✓' : '✗'}</span>
                                         </div>
                                     </div>
                                 ))}
                             </div>
                         </div>

                         {/* Board Verdict */}
                         <div className="mb-8">
                             <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-4">Board Verdict</h3>
                             <div className="bg-neutral-950 p-6 rounded border border-white/5">
                                 <div className="flex justify-between items-end mb-2">
                                     <span className="text-white font-bold text-lg">Rating</span>
                                     <span className="text-2xl font-black text-white">{data.review?.board_score}<span className="text-neutral-500 text-sm">/100</span></span>
                                 </div>
                                 <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden mb-4">
                                     <div
                                        className={`h-full ${data.review?.board_score && data.review.board_score > 70 ? 'bg-emerald-500' : data.review?.board_score && data.review.board_score > 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                        style={{ width: `${data.review?.board_score}%` }}
                                     ></div>
                                 </div>
                                 <p className="text-neutral-300 italic text-sm">"{data.review?.board_verdict}"</p>
                             </div>
                         </div>

                         {/* Quick Stats */}
                         <div className="grid grid-cols-4 gap-4 mt-auto">
                             {[
                                 { label: "Played", value: data.review?.stats.played },
                                 { label: "Wins", value: data.review?.stats.wins },
                                 { label: "Losses", value: data.review?.stats.losses },
                                 { label: "Goal Dif", value: (data.review?.stats.goalDiff || 0) > 0 ? `+${data.review?.stats.goalDiff}` : data.review?.stats.goalDiff }
                             ].map((s, i) => (
                                 <div key={i} className="bg-neutral-800 p-4 rounded text-center border border-white/5">
                                     <div className="text-2xl font-black text-white font-oswald">{s.value}</div>
                                     <div className="text-[10px] text-neutral-500 uppercase font-bold">{s.label}</div>
                                 </div>
                             ))}
                         </div>

                         <button
                            onClick={() => setStep(2)}
                            className="w-full bg-white hover:bg-neutral-200 text-neutral-900 font-bold uppercase py-4 rounded mt-6 transition-colors shadow-lg"
                         >
                             Next Page
                         </button>
                     </div>
                 )}

                 {/* PAGE 2: PERFORMERS & FINANCES */}
                 {step === 2 && (
                     <div className="flex-1 flex flex-col p-8 animate-in slide-in-from-right duration-500">
                         <div className="text-center mb-8">
                             <h2 className="text-3xl font-black text-white font-oswald uppercase tracking-tight">Season Highlights</h2>
                         </div>

                         <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                             {/* Player of Season */}
                             <div className="space-y-4">
                                 <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Player of the Season</h3>
                                 <div className="bg-gradient-to-br from-neutral-800 to-neutral-900 p-6 rounded border border-white/10 flex flex-col items-center text-center shadow-lg">
                                     <div className="w-20 h-20 rounded-full bg-neutral-700 flex items-center justify-center text-4xl mb-4 border-2 border-yellow-500/50">
                                         ⭐
                                     </div>
                                     <div className="text-xl font-black text-white uppercase font-oswald mb-1">{data.awards.poty.name}</div>
                                     <div className="text-xs text-neutral-400 mb-4">{data.awards.poty.club}</div>
                                     <div className="text-emerald-400 font-mono font-bold">{data.awards.poty.value}</div>
                                 </div>
                             </div>

                             {/* Other Awards */}
                             <div className="space-y-4">
                                 <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Other Honors</h3>
                                 <div className="grid grid-cols-2 gap-4">
                                     <div className="bg-neutral-950 p-4 rounded border border-white/5">
                                         <div className="text-[10px] text-yellow-500 uppercase font-bold mb-1">🥇 Top Scorer</div>
                                         <div className="text-white font-bold text-sm truncate">{data.awards.goldenBoot.name}</div>
                                         <div className="text-neutral-500 text-xs">{data.awards.goldenBoot.value} Goals</div>
                                     </div>
                                     <div className="bg-neutral-950 p-4 rounded border border-white/5">
                                         <div className="text-[10px] text-blue-400 uppercase font-bold mb-1">🌟 Breakthrough</div>
                                         <div className="text-white font-bold text-sm truncate">{data.awards.breakthrough.name}</div>
                                         <div className="text-neutral-500 text-xs">{data.awards.breakthrough.club}</div>
                                     </div>
                                     <div className="bg-neutral-950 p-4 rounded border border-white/5">
                                         <div className="text-[10px] text-emerald-400 uppercase font-bold mb-1">📈 Most Improved</div>
                                         <div className="text-white font-bold text-sm truncate">{data.awards.mostImprovedClub.name}</div>
                                     </div>
                                     <div className="bg-neutral-950 p-4 rounded border border-white/5">
                                         <div className="text-[10px] text-purple-400 uppercase font-bold mb-1">🧤 Golden Glove</div>
                                         <div className="text-white font-bold text-sm truncate">{data.awards.goldenGlove.name}</div>
                                         <div className="text-neutral-500 text-xs">{data.awards.goldenGlove.value} Clean Sheets</div>
                                     </div>
                                 </div>
                             </div>
                         </div>

                         {/* Financial Summary */}
                         <div className="mt-auto mb-6">
                             <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-4">Financial Summary</h3>
                             <div className="bg-neutral-950 p-6 rounded border border-white/5">
                                 <div className="grid grid-cols-2 gap-x-8 gap-y-4 mb-6 border-b border-white/5 pb-6">
                                     <div className="flex justify-between">
                                         <span className="text-neutral-400 text-sm">Transfer Spend</span>
                                         <span className="text-white font-mono">{fmtMoney(data.review?.financials.spend || 0)}</span>
                                     </div>
                                     <div className="flex justify-between">
                                         <span className="text-neutral-400 text-sm">Income</span>
                                         <span className="text-emerald-400 font-mono">{fmtMoney(data.review?.financials.income || 0)}</span>
                                     </div>
                                     <div className="flex justify-between">
                                         <span className="text-neutral-400 text-sm">Turnover</span>
                                         <span className="text-white font-mono">{fmtMoney(data.review?.financials.turnover || 0)}</span>
                                     </div>
                                 </div>

                                 <div className="flex justify-between items-center">
                                     <div>
                                         <div className="text-[10px] text-neutral-500 uppercase font-bold mb-1">Next Season Budget</div>
                                         <div className="text-2xl font-black text-emerald-400 font-oswald">{fmtMoney(data.review?.financials.budget_next || 0)}</div>
                                     </div>
                                     <div className="text-right">
                                         <div className="text-[10px] text-neutral-500 uppercase font-bold mb-1">Wage Space</div>
                                         <div className="text-xl font-bold text-white font-mono">{fmtWage(data.review?.financials.wage_bill || 0)}<span className="text-sm text-neutral-500 font-normal">/wk</span></div>
                                     </div>
                                 </div>
                             </div>
                         </div>

                         <div className="flex gap-4">
                             <button
                                onClick={() => setStep(1)}
                                className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 font-bold uppercase py-4 rounded transition-colors"
                             >
                                 Back
                             </button>
                             <button
                                onClick={handleContinue}
                                className="flex-[2] bg-white hover:bg-neutral-200 text-neutral-900 font-bold uppercase py-4 rounded transition-colors shadow-lg"
                             >
                                 Continue
                             </button>
                         </div>
                     </div>
                 )}

             </div>
        </div>
    );
};
