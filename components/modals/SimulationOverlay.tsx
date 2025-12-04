import React, { useMemo } from 'react';
import { useGame } from '../../context/GameContext';
import { Fixture, League } from '../../types';

export const SimulationOverlay = () => {
    const { state, playerClub } = useGame();

    if (!state.simulation.isActive) return null;

    const { progress, recentEvents, type } = state.simulation;

    // --- OPTIMIZED DATA ACCESS ---
    // Create a fast lookup map for clubs to avoid O(N) searches every render
    const clubMap = useMemo(() => {
        const map = new Map<number, { name: string; id: number }>();
        Object.values(state.leagues).forEach((l: League) => {
            l.clubs.forEach(c => {
                map.set(c.id, { name: c.name, id: c.id });
            });
        });
        return map;
    }, [state.leagues]);

    const getClubName = (id: number) => clubMap.get(id) || { name: 'Unknown', id: 0 };

    // --- LIVE SCOREBOARD DATA ---
    const todaysFixtures = useMemo(() => {
        const fixtures: Fixture[] = [];
        Object.values(state.leagues).forEach((l: League) => {
            // Filter for today's matches
            const daysMatches = l.fixtures.filter(f => f.date === state.currentDate);
            fixtures.push(...daysMatches);
        });
        return fixtures;
    }, [state.leagues, state.currentDate]);

    // --- CALENDAR LOGIC ---
    const calendarData = useMemo(() => {
        const current = new Date(state.currentDate);
        const year = current.getFullYear();
        const month = current.getMonth();

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        const daysInMonth = lastDay.getDate();
        const startDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; // Mon=0, Sun=6

        const days = [];
        // Padding for start of month
        for (let i = 0; i < startDayOfWeek; i++) days.push(null);
        // Actual days
        for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));

        return { days, monthName: current.toLocaleString('default', { month: 'long' }), year };
    }, [state.currentDate]);

    // Helper to check if a date has fixtures (for calendar dots)
    const hasFixturesOnDate = (date: Date) => {
        const dateStr = date.toISOString().split('T')[0];
        return Object.values(state.leagues).some(l => l.fixtures.some(f => f.date === dateStr));
    };

    return (
        <div className="fixed inset-0 z-[100] bg-neutral-900/95 flex flex-col font-sans text-white overflow-hidden animate-in fade-in duration-300">

            {/* Top Status Bar */}
            <div className="h-16 border-b border-white/10 bg-neutral-900 flex items-center justify-between px-8 relative z-10 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
                    <span className="text-lg font-bold uppercase tracking-wide font-oswald">Match Day Live</span>
                </div>
                <div className="flex items-center gap-6 text-sm text-neutral-400">
                    <span className="text-emerald-400 font-mono font-bold text-lg">{state.currentDate}</span>
                    <span className="text-white uppercase font-bold bg-neutral-800 px-3 py-1 rounded text-xs">{type === 'day' ? 'Daily Sim' : 'Weekly Sim'}</span>
                </div>
            </div>

            {/* Main Split View */}
            <div className="flex-1 flex overflow-hidden relative z-10">

                {/* LEFT: Feed */}
                <div className="w-1/4 border-r border-white/10 bg-neutral-950/50 flex flex-col relative">
                    <div className="p-3 border-b border-white/10 bg-neutral-900 text-xs font-bold text-neutral-500 uppercase tracking-wider flex justify-between">
                        <span>Live Commentary</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 font-mono text-xs custom-scrollbar flex flex-col-reverse gap-2">
                        {recentEvents.map((event, i) => (
                            <div key={i} className={`py-2 border-b border-white/5 ${event.includes('GOAL') ? 'text-white font-bold' : event.includes('RED CARD') ? 'text-red-500 font-bold' : 'text-neutral-400'}`}>
                                {/* Simulated timestamp based on event index to fake progression */}
                                <span className="opacity-50 mr-3">[{Math.min(90, Math.floor((i / Math.max(1, recentEvents.length)) * 90)) + 1}']</span>
                                {event}
                            </div>
                        ))}
                        <div className="text-neutral-600 italic text-center py-4">Connecting to stadiums...</div>
                    </div>
                </div>

                {/* CENTER: Visualizer */}
                <div className="flex-1 relative bg-neutral-900 flex flex-col items-center justify-center p-12">

                    <div className="relative z-10 w-full max-w-2xl flex flex-col items-center justify-center">
                        <div className="w-full bg-neutral-950 rounded-xl border border-white/10 p-8 shadow-2xl">
                            <div className="flex justify-between items-end mb-6">
                                <div>
                                    <h2 className="text-3xl font-oswald font-bold text-white uppercase tracking-wide">{calendarData.monthName}</h2>
                                    <p className="text-neutral-500 font-mono text-sm">{calendarData.year}</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs font-bold uppercase text-neutral-500 mb-1">Processing</div>
                                    <div className="text-emerald-500 font-mono text-sm animate-pulse">
                                        {state.simulation.statusText || "Running Algorithms..."}
                                    </div>
                                </div>
                            </div>

                            {/* Calendar Grid */}
                            <div className="grid grid-cols-7 gap-2 mb-2">
                                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                                    <div key={d} className="text-center text-[10px] font-bold uppercase text-neutral-600 py-1">{d}</div>
                                ))}
                            </div>
                            <div className="grid grid-cols-7 gap-2">
                                {calendarData.days.map((date, i) => {
                                    if (!date) return <div key={`empty-${i}`} className="aspect-square"></div>;

                                    const dateStr = date.toISOString().split('T')[0];
                                    const isToday = dateStr === state.currentDate;
                                    const isPast = date < new Date(state.currentDate);
                                    const hasMatch = hasFixturesOnDate(date);

                                    return (
                                        <div
                                            key={dateStr}
                                            className={`aspect-square rounded border flex flex-col items-center justify-center relative transition-all
                                               ${isToday
                                                    ? 'bg-emerald-600 border-emerald-400 shadow-lg shadow-emerald-900/50 scale-110 z-10'
                                                    : isPast
                                                        ? 'bg-neutral-900 border-white/5 text-neutral-600'
                                                        : 'bg-neutral-800 border-white/10 text-neutral-400'
                                                }
                                           `}
                                        >
                                            <span className={`text-sm font-bold font-mono ${isToday ? 'text-white' : ''}`}>{date.getDate()}</span>

                                            {/* Indicators */}
                                            <div className="flex gap-0.5 mt-1">
                                                {hasMatch && (
                                                    <div className={`w-1 h-1 rounded-full ${isToday ? 'bg-white' : 'bg-emerald-500'}`}></div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT: Broadcast Scoreboard */}
                <div className="w-1/3 bg-neutral-950 border-l border-white/10 flex flex-col">
                    <div className="p-4 border-b border-white/10 bg-neutral-900 flex justify-between items-center">
                        <span className="text-sm font-bold text-white uppercase font-oswald tracking-wider">Live Scores</span>
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
                        {todaysFixtures.length === 0 ? (
                            <div className="text-center py-12 text-neutral-600 uppercase font-bold">No Matches Today</div>
                        ) : (
                            todaysFixtures.map(f => {
                                const home = getClubName(f.homeClubId);
                                const away = getClubName(f.awayClubId);
                                const isPlayerMatch = f.homeClubId === playerClub?.id || f.awayClubId === playerClub?.id;
                                const played = f.played;

                                return (
                                    <div key={f.id} className={`bg-neutral-900 border ${isPlayerMatch ? 'border-emerald-500 shadow-lg shadow-emerald-900/20' : 'border-neutral-800'} rounded-lg p-3 flex items-center justify-between group hover:bg-neutral-800 transition-colors`}>
                                        {/* Home */}
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <div className="w-8 h-8 rounded bg-neutral-800 flex items-center justify-center font-oswald font-bold text-white text-xs border border-white/5 group-hover:border-white/20 transition-colors">
                                                {home.name.charAt(0)}
                                            </div>
                                            <span className={`text-xs font-bold uppercase truncate ${f.homeScore! > f.awayScore! ? 'text-white' : 'text-neutral-400'}`}>
                                                {home.name}
                                            </span>
                                        </div>

                                        {/* Score */}
                                        <div className="mx-2 px-3 py-1 bg-neutral-950 rounded border border-neutral-800 flex flex-col items-center w-16 shrink-0">
                                            {played ? (
                                                <>
                                                    <span className="text-lg font-oswald font-bold text-white leading-none">{f.homeScore}-{f.awayScore}</span>
                                                    <span className="text-[8px] uppercase text-neutral-500 font-bold">FT</span>
                                                </>
                                            ) : (
                                                <span className="text-xs text-neutral-500 font-bold uppercase">vs</span>
                                            )}
                                        </div>

                                        {/* Away */}
                                        <div className="flex items-center justify-end gap-3 flex-1 min-w-0">
                                            <span className={`text-xs font-bold uppercase truncate ${f.awayScore! > f.homeScore! ? 'text-white' : 'text-neutral-400'}`}>
                                                {away.name}
                                            </span>
                                            <div className="w-8 h-8 rounded bg-neutral-800 flex items-center justify-center font-oswald font-bold text-white text-xs border border-white/5 group-hover:border-white/20 transition-colors">
                                                {away.name.charAt(0)}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};
