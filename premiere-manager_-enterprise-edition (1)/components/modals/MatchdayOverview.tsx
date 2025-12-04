
import React from 'react';
import { useGame } from '../../context/GameContext';
import { Fixture, League } from '../../types';

interface MatchdayOverviewProps {
    date: string;
    onClose: () => void;
}

export const MatchdayOverview: React.FC<MatchdayOverviewProps> = ({ date, onClose }) => {
    const { state, playerClub } = useGame();

    // Aggregate all fixtures for this date
    const dayFixtures: Fixture[] = [];
    Object.values(state.leagues).forEach((l: League) => {
        l.fixtures.forEach(f => {
            // Compare dates (ignoring time for safety, though strings usually match YYYY-MM-DD)
            if (f.date.split('T')[0] === date.split('T')[0]) {
                dayFixtures.push(f);
            }
        });
    });

    // Group by competition
    const groupedFixtures = dayFixtures.reduce((acc, f) => {
        if (!acc[f.competition]) acc[f.competition] = [];
        acc[f.competition].push(f);
        return acc;
    }, {} as Record<string, Fixture[]>);

    const getClub = (id: number) => {
        for (const key in state.leagues) {
            const c = state.leagues[key].clubs.find(club => club.id === id);
            if (c) return c;
        }
        return null;
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-neutral-950/95 backdrop-blur-md animate-in zoom-in-95 duration-200">
            <div className="bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col relative overflow-hidden">
                
                {/* Header */}
                <div className="h-20 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between px-8 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-neutral-800 border-2 border-white/10 flex items-center justify-center text-2xl">
                            📅
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white font-oswald uppercase tracking-wide">Global Matchday</h2>
                            <p className="text-emerald-400 font-mono font-bold text-sm">{new Date(date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white p-2 rounded-full transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                    {Object.keys(groupedFixtures).length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-neutral-600">
                            <p className="font-oswald text-xl uppercase tracking-widest">No Matches Scheduled</p>
                        </div>
                    ) : (
                        Object.keys(groupedFixtures).map(comp => (
                            <div key={comp} className="mb-8 animate-in slide-in-from-bottom-4 duration-500">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-neutral-700 to-transparent"></div>
                                    <span className="text-neutral-300 font-oswald font-bold uppercase tracking-widest text-sm bg-neutral-800 px-3 py-1 rounded border border-neutral-700">
                                        {comp}
                                    </span>
                                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-neutral-700 to-transparent"></div>
                                </div>

                                <div className="grid grid-cols-1 gap-3">
                                    {groupedFixtures[comp].map(f => {
                                        const home = getClub(f.homeClubId);
                                        const away = getClub(f.awayClubId);
                                        const isPlayerMatch = f.homeClubId === playerClub?.id || f.awayClubId === playerClub?.id;

                                        if (!home || !away) return null;

                                        return (
                                            <div 
                                                key={f.id} 
                                                className={`
                                                    relative flex items-center justify-between p-4 rounded-lg border bg-neutral-950/50
                                                    ${isPlayerMatch ? 'border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'border-neutral-800 hover:border-neutral-700'}
                                                `}
                                            >
                                                {/* Home Team */}
                                                <div className="flex-1 flex items-center justify-end gap-4">
                                                    <span className={`font-bold uppercase text-sm md:text-base text-right ${f.homeScore! > f.awayScore! ? 'text-white' : 'text-neutral-400'}`}>
                                                        {home.name}
                                                    </span>
                                                    <div className="w-10 h-10 rounded bg-neutral-800 flex items-center justify-center font-oswald font-bold text-white text-sm shrink-0 border border-white/5">
                                                        {home.name.charAt(0)}
                                                    </div>
                                                </div>

                                                {/* Scoreboard */}
                                                <div className="mx-6 w-24 flex flex-col items-center justify-center shrink-0">
                                                    {f.played ? (
                                                        <>
                                                            <div className="flex items-center gap-2 text-2xl font-oswald font-bold text-white">
                                                                <span>{f.homeScore}</span>
                                                                <span className="text-neutral-600 text-sm">-</span>
                                                                <span>{f.awayScore}</span>
                                                            </div>
                                                            <span className="text-[10px] font-bold uppercase text-neutral-500 bg-neutral-900 px-1.5 rounded mt-1">Full Time</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div className="text-xl font-oswald font-bold text-neutral-500">VS</div>
                                                            <span className="text-[10px] font-bold uppercase text-emerald-500 bg-emerald-900/10 px-1.5 rounded mt-1">Upcoming</span>
                                                        </>
                                                    )}
                                                </div>

                                                {/* Away Team */}
                                                <div className="flex-1 flex items-center justify-start gap-4">
                                                    <div className="w-10 h-10 rounded bg-neutral-800 flex items-center justify-center font-oswald font-bold text-white text-sm shrink-0 border border-white/5">
                                                        {away.name.charAt(0)}
                                                    </div>
                                                    <span className={`font-bold uppercase text-sm md:text-base text-left ${f.awayScore! > f.homeScore! ? 'text-white' : 'text-neutral-400'}`}>
                                                        {away.name}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
