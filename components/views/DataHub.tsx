import React, { useState, useMemo } from 'react';
import { useGame } from '../../context/GameContext';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';
import { MetricService } from '../../services/MetricService';

export const DataHub: React.FC = () => {
    const { state, playerClub } = useGame();
    const [tab, setTab] = useState<'momentum' | 'dna'>('momentum');

    const league = state.leagues[playerClub?.leagueId || ""];
    
    // Momentum Data (Last Match)
    const momentumData = useMemo(() => {
        if (!playerClub || !league) return [];
        const lastFixture = [...league.fixtures]
            .filter(f => f.played && (f.homeClubId === playerClub.id || f.awayClubId === playerClub.id))
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

        if (!lastFixture || !lastFixture.momentum_history) return [];

        return lastFixture.momentum_history.map((val, idx) => ({
            minute: idx + 1,
            momentum: val
        }));
    }, [playerClub, league]);

    // DNA Data
    const dnaData = useMemo(() => {
        if (!playerClub || !league) return [];
        const myDNA = MetricService.getClubAverages(playerClub.players);
        const leagueDNA = MetricService.getLeagueAverages(league);

        return [
            { subject: 'Attacking', A: myDNA.attacking, B: leagueDNA.attacking, fullMark: 99 },
            { subject: 'Defending', A: myDNA.defending, B: leagueDNA.defending, fullMark: 99 },
            { subject: 'Physical', A: myDNA.physical, B: leagueDNA.physical, fullMark: 99 },
            { subject: 'Technical', A: myDNA.technical, B: leagueDNA.technical, fullMark: 99 },
            { subject: 'Mental', A: myDNA.mental, B: leagueDNA.mental, fullMark: 99 },
            { subject: 'Set Pieces', A: myDNA.set_pieces, B: leagueDNA.set_pieces, fullMark: 99 },
        ];
    }, [playerClub, league]);

    if (!playerClub) return null;

    return (
        <div className="p-6 h-full flex flex-col animate-in fade-in duration-300">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-3xl font-bold text-white font-oswald uppercase tracking-wider">Data Hub</h2>
                    <p className="text-xs text-neutral-400 font-mono">Advanced Performance Analytics</p>
                </div>
                <div className="flex bg-neutral-900 p-1 rounded-lg border border-neutral-800">
                    <button
                        onClick={() => setTab('momentum')}
                        className={`px-4 py-2 text-xs font-bold uppercase rounded transition-all ${tab === 'momentum' ? 'bg-blue-600 text-white shadow' : 'text-neutral-500 hover:text-white'}`}
                    >
                        Match Momentum
                    </button>
                    <button
                        onClick={() => setTab('dna')}
                        className={`px-4 py-2 text-xs font-bold uppercase rounded transition-all ${tab === 'dna' ? 'bg-purple-600 text-white shadow' : 'text-neutral-500 hover:text-white'}`}
                    >
                        Squad DNA
                    </button>
                </div>
            </div>

            <div className="flex-1 bg-neutral-900 border border-white/10 rounded-xl p-6 shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/grid-me.png')] opacity-5 pointer-events-none"></div>

                {tab === 'momentum' && (
                    <div className="h-full flex flex-col">
                        <h3 className="text-white font-oswald uppercase tracking-wide mb-4">Last Match Momentum</h3>
                        {momentumData.length > 0 ? (
                            <div className="flex-1 w-full min-h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={momentumData}>
                                        <defs>
                                            <linearGradient id="colorMom" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="minute" stroke="#525252" tick={{fontSize: 10}} />
                                        <YAxis hide domain={[-10, 10]} />
                                        <Tooltip contentStyle={{backgroundColor: '#171717', border: '1px solid #333'}} itemStyle={{color: '#fff'}} />
                                        <Area type="monotone" dataKey="momentum" stroke="#3b82f6" fillOpacity={1} fill="url(#colorMom)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-neutral-500">No match data available yet.</div>
                        )}
                    </div>
                )}

                {tab === 'dna' && (
                    <div className="h-full flex flex-col">
                        <h3 className="text-white font-oswald uppercase tracking-wide mb-4">Squad DNA Comparison</h3>
                        <div className="flex-1 w-full min-h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={dnaData}>
                                    <PolarGrid stroke="#333" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#a3a3a3', fontSize: 12, fontWeight: 'bold' }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 99]} tick={false} axisLine={false} />
                                    <Radar name={playerClub.name} dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                                    <Radar name="League Avg" dataKey="B" stroke="#525252" fill="#525252" fillOpacity={0.3} />
                                    <Legend />
                                    <Tooltip contentStyle={{backgroundColor: '#171717', border: '1px solid #333'}} itemStyle={{color: '#fff'}} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
