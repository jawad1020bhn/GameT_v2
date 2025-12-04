import React, { useState, useMemo, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { Player, Fixture, League, Club } from '../../types';
import { formatDate } from '../../services/engine';

interface BracketNodeData {
    fixture: Fixture;
    children: BracketNodeData[];
}

const BracketNode: React.FC<{ node: BracketNodeData; isFinal?: boolean }> = ({ node, isFinal }) => {
    const { state } = useGame();

    const getClubName = (id: number) => {
        if (id === 0) return "TBD";
        for (const key in state.leagues) {
            const c = state.leagues[key].clubs.find(club => club.id === id);
            if (c) return c.name;
        }
        return "Unknown";
    };

    const homeName = getClubName(node.fixture.homeClubId);
    const awayName = getClubName(node.fixture.awayClubId);
    const winnerId = node.fixture.played
        ? (node.fixture.homeScore! > node.fixture.awayScore! ? node.fixture.homeClubId : node.fixture.awayClubId)
        : null;

    return (
        <div className="flex items-center">
            {/* Recursive Children (Previous Round Matches) */}
            {node.children.length > 0 && (
                <div className="flex flex-col justify-around mr-8 relative">
                    {/* The Connector Lines */}
                    <div className="absolute right-[-2rem] top-[25%] bottom-[25%] w-4 border-r-2 border-neutral-700 rounded-r-lg"></div>
                    <div className="absolute right-[-2rem] top-[50%] w-4 h-0.5 bg-neutral-700"></div>

                    {node.children.map((child, idx) => (
                        <div key={child.fixture.id} className="flex items-center relative my-4">
                            <BracketNode node={child} />
                            {/* Individual Horizontal Line from child to parent */}
                            <div className="w-8 h-0.5 bg-neutral-700 mx-2"></div>
                        </div>
                    ))}
                </div>
            )}

            {/* Current Match Card */}
            <div className={`w-48 bg-neutral-900 border rounded-lg shadow-lg relative z-10 overflow-hidden transition-transform hover:scale-105 cursor-pointer group ${node.fixture.played ? 'border-neutral-700' : 'border-white/10'}`}>
                {/* Header */}
                <div className="bg-neutral-950 px-2 py-1 text-[10px] text-neutral-500 font-bold uppercase flex justify-between">
                    <span>{node.fixture.id} • {node.fixture.round}</span>
                    <span>{formatDate(node.fixture.date)}</span>
                </div>

                {/* Teams */}
                <div className="p-2">
                    {/* Home */}
                    <div className={`flex justify-between items-center mb-1 p-1 rounded ${winnerId === node.fixture.homeClubId ? 'bg-emerald-900/30 text-white' : 'text-neutral-400'}`}>
                        <div className="flex items-center gap-2 overflow-hidden">
                            <div className={`w-4 h-4 rounded-sm flex items-center justify-center text-[8px] font-bold ${node.fixture.homeClubId !== 0 ? 'bg-neutral-700 text-white' : 'bg-neutral-800 text-neutral-600'}`}>
                                {homeName.charAt(0)}
                            </div>
                            <span className={`text-xs font-bold truncate w-24 ${node.fixture.homeClubId === 0 ? 'italic opacity-50' : ''}`}>{homeName}</span>
                        </div>
                        <span className={`font-mono text-xs font-bold ${node.fixture.played ? 'text-white' : 'opacity-0'}`}>
                            {node.fixture.homeScore}
                        </span>
                    </div>

                    {/* Away */}
                    <div className={`flex justify-between items-center p-1 rounded ${winnerId === node.fixture.awayClubId ? 'bg-emerald-900/30 text-white' : 'text-neutral-400'}`}>
                        <div className="flex items-center gap-2 overflow-hidden">
                            <div className={`w-4 h-4 rounded-sm flex items-center justify-center text-[8px] font-bold ${node.fixture.awayClubId !== 0 ? 'bg-neutral-700 text-white' : 'bg-neutral-800 text-neutral-600'}`}>
                                {awayName.charAt(0)}
                            </div>
                            <span className={`text-xs font-bold truncate w-24 ${node.fixture.awayClubId === 0 ? 'italic opacity-50' : ''}`}>{awayName}</span>
                        </div>
                        <span className={`font-mono text-xs font-bold ${node.fixture.played ? 'text-white' : 'opacity-0'}`}>
                            {node.fixture.awayScore}
                        </span>
                    </div>
                </div>

                {/* Status Footer */}
                {!node.fixture.played && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-neutral-800 group-hover:bg-emerald-500 transition-colors"></div>
                )}
            </div>
        </div>
    );
};

export const LeagueTable: React.FC = () => {
    const { state, playerClub } = useGame();
    const [activeCompetition, setActiveCompetition] = useState<string>("");
    const [statView, setStatView] = useState<'goals' | 'assists' | 'rating'>('goals');
    const [selectedClubId, setSelectedClubId] = useState<number | null>(null);
    const [viewMode, setViewMode] = useState<'list' | 'bracket'>('list');

    if (!playerClub) return null;

    const currentLeague = state.leagues[playerClub.leagueId];

    // Combine player's active competitions with their domestic league to ensure it's always visible
    const availableCompetitions = useMemo(() => {
        // Use a Set to ensure uniqueness
        const comps = new Set([currentLeague.name, ...playerClub.active_competitions]);
        return Array.from(comps);
    }, [currentLeague.name, playerClub.active_competitions]);

    useEffect(() => {
        if (!activeCompetition || !availableCompetitions.includes(activeCompetition)) {
            setActiveCompetition(availableCompetitions[0]);
        }
    }, [availableCompetitions, activeCompetition]);

    const allFixtures = Object.values(state.leagues).flatMap((l: League) => l.fixtures);

    const getClubName = (clubId: number) => {
        if (clubId === 0) return "TBD";
        for (const key in state.leagues) {
            const c = state.leagues[key].clubs.find(club => club.id === clubId);
            if (c) return c.name;
        }
        return "Unknown";
    };

    const findClub = (id: number): Club | null => {
        for (const key in state.leagues) {
            const c = state.leagues[key].clubs.find(club => club.id === id);
            if (c) return c;
        }
        return null;
    };
    const selectedClub = selectedClubId ? findClub(selectedClubId) : null;

    const compFixtures = allFixtures
        .filter(f => f.competition === activeCompetition)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const allPlayers = Object.values(state.leagues).flatMap((l: League) => l.clubs).flatMap(c => c.players);

    const getCompStats = (p: Player) => {
        return p.competition_stats?.[activeCompetition] || { goals: 0, assists: 0, avg_rating: 0, appearances: 0, clean_sheets: 0, yellow_cards: 0, red_cards: 0, mom_awards: 0 };
    };

    const activePlayers = allPlayers.filter(p => {
        const stats = p.competition_stats?.[activeCompetition];
        return stats && stats.appearances > 0 && p.clubId;
    });

    const topScorers = [...activePlayers]
        .sort((a, b) => (getCompStats(b).goals || 0) - (getCompStats(a).goals || 0))
        .slice(0, 10);

    const topAssisters = [...activePlayers]
        .sort((a, b) => (getCompStats(b).assists || 0) - (getCompStats(a).assists || 0))
        .slice(0, 10);

    const topRated = [...activePlayers]
        .filter(p => getCompStats(p).appearances > (activeCompetition === currentLeague.name ? 3 : 1))
        .sort((a, b) => (getCompStats(b).avg_rating || 0) - (getCompStats(a).avg_rating || 0))
        .slice(0, 10);

    const isLeague = activeCompetition === currentLeague.name;
    const isCup = !isLeague;

    // --- BRACKET LOGIC ---
    const buildTree = (rootFixture: Fixture, allCompFixtures: Fixture[]): BracketNodeData => {
        const children = allCompFixtures
            .filter(f => f.nextFixtureId === rootFixture.id)
            .sort((a, b) => (a.bracketSlot === 'home' ? -1 : 1)); // Ensure top/bottom ordering for visual consistency

        return {
            fixture: rootFixture,
            children: children.map(c => buildTree(c, allCompFixtures))
        };
    };

    const groupedFixtures = useMemo(() => {
        return compFixtures.reduce((acc, f) => {
            const date = f.date.split('T')[0];
            if (!acc[date]) acc[date] = [];
            acc[date].push(f);
            return acc;
        }, {} as Record<string, Fixture[]>);
    }, [compFixtures]);

    const renderBracket = () => {
        // Find the Final
        const finalMatch = compFixtures.find(f => f.round === 'Final');

        if (!finalMatch) {
            return <div className="text-center p-10 text-neutral-500">Bracket data unavailable</div>;
        }

        const treeRoot = buildTree(finalMatch, compFixtures);

        return (
            <div className="flex items-center justify-center h-full overflow-auto p-12 bg-neutral-950/30 min-w-[1000px]">
                <BracketNode node={treeRoot} isFinal={true} />
            </div>
        );
    };

    const renderStatList = (players: Player[], metric: 'goals' | 'assists' | 'avg_rating', colorClass: string) => (
        <div className="space-y-2">
            {players.map((p, i) => {
                const val = metric === 'avg_rating' ? getCompStats(p).avg_rating.toFixed(2) : getCompStats(p)[metric];
                if (Number(val) === 0) return null;
                return (
                    <div key={p.id} className="flex items-center justify-between p-3 bg-neutral-800/50 border border-white/5 rounded hover:bg-neutral-800 transition-colors group">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className={`w-6 h-6 flex items-center justify-center font-mono font-bold text-xs ${i < 3 ? 'text-white bg-neutral-700 rounded shadow' : 'text-neutral-500'}`}>
                                {i + 1}
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className={`font-bold text-sm truncate ${p.clubId === playerClub.id ? 'text-emerald-400' : 'text-neutral-200'}`}>
                                    {p.name}
                                </span>
                                <span className="text-[10px] text-neutral-500 uppercase truncate">
                                    {getClubName(p.clubId)}
                                </span>
                            </div>
                        </div>
                        <div className={`font-mono text-lg font-bold ${colorClass}`}>
                            {val}
                        </div>
                    </div>
                )
            })}
            {players.length === 0 && (
                <div className="text-center py-8 text-neutral-500 text-xs uppercase italic">
                    No stats recorded yet
                </div>
            )}
        </div>
    );

    // --- CLUB PROFILE VIEW ---
    if (selectedClub) {
        return (
            <div className="p-4 md:p-6 h-full flex flex-col animate-in fade-in slide-in-from-right-8 duration-300">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => setSelectedClubId(null)}
                        className="p-2 rounded-full bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700 transition-colors group"
                    >
                        <svg className="w-6 h-6 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    </button>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 md:w-16 md:h-16 rounded bg-neutral-800 border-2 border-neutral-600 flex items-center justify-center text-2xl md:text-3xl font-bold text-white shadow-lg font-oswald">
                            {selectedClub.name.charAt(0)}
                        </div>
                        <div>
                            <h2 className="text-2xl md:text-4xl font-bold text-white font-oswald uppercase tracking-tight leading-none">{selectedClub.name}</h2>
                            <div className="flex gap-3 mt-2 text-xs md:text-sm text-neutral-400 font-mono">
                                <span>Est. {selectedClub.founded}</span>
                                <span className="text-neutral-600">|</span>
                                <span>{selectedClub.stadium} ({selectedClub.capacity.toLocaleString()})</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-y-auto flex-1 custom-scrollbar pb-4">
                    {/* Column 1: Overview */}
                    <div className="space-y-6">
                        <div className="bg-neutral-900 p-6 rounded-xl border border-white/10 shadow-lg">
                            <h3 className="text-emerald-500 font-bold uppercase tracking-widest text-xs mb-4 border-b border-white/10 pb-2">Club Profile</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between">
                                    <span className="text-neutral-500 text-sm">Reputation</span>
                                    <div className="flex gap-0.5">
                                        {[...Array(5)].map((_, i) => (
                                            <svg key={i} className={`w-4 h-4 ${i < Math.round(selectedClub.reputation / 20) ? 'text-yellow-500' : 'text-neutral-700'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-neutral-500 text-sm">Manager</span>
                                    <span className="text-white font-bold">A. Manager</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-neutral-500 text-sm">Owner</span>
                                    <span className="text-white font-bold">The Board</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-neutral-500 text-sm">Tactical Style</span>
                                    <span className="text-emerald-400 font-bold uppercase text-xs bg-emerald-900/20 px-2 py-0.5 rounded">{selectedClub.style_identity.play_style}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-neutral-900 p-6 rounded-xl border border-white/10 shadow-lg">
                            <h3 className="text-blue-400 font-bold uppercase tracking-widest text-xs mb-4 border-b border-white/10 pb-2">Boardroom Stats</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-neutral-950 p-3 rounded border border-neutral-800">
                                    <span className="block text-[10px] text-neutral-500 uppercase font-bold">Est. Value</span>
                                    <span className="block text-white font-mono font-bold">£{(selectedClub.budget * 3.5 / 1000000).toFixed(0)}M</span>
                                </div>
                                <div className="bg-neutral-950 p-3 rounded border border-neutral-800">
                                    <span className="block text-[10px] text-neutral-500 uppercase font-bold">Transfer Budget</span>
                                    <span className="block text-emerald-400 font-mono font-bold">£{(selectedClub.budget / 1000000).toFixed(1)}M</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Column 2: Key Players */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-neutral-900 p-6 rounded-xl border border-white/10 shadow-lg h-full flex flex-col">
                            <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-2">
                                <h3 className="text-white font-bold uppercase tracking-widest text-xs">Star Players & Squad Hierarchy</h3>
                                <span className="text-xs text-neutral-500">{selectedClub.players.length} Squad Members</span>
                            </div>

                            <div className="flex-1 overflow-x-auto">
                                <table className="w-full text-left text-sm min-w-[500px]">
                                    <thead className="text-[10px] uppercase text-neutral-500 font-bold bg-neutral-950/50">
                                        <tr>
                                            <th className="p-3 pl-4">Name</th>
                                            <th className="p-3 text-center">Pos</th>
                                            <th className="p-3 text-center">Age</th>
                                            <th className="p-3 text-center">OVR</th>
                                            <th className="p-3 text-center">Pot</th>
                                            <th className="p-3 text-right pr-4">Value</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-800/50">
                                        {selectedClub.players
                                            .sort((a, b) => b.overall - a.overall)
                                            .slice(0, 10)
                                            .map((p, i) => (
                                                <tr key={p.id} className={`hover:bg-neutral-800/50 transition-colors ${i < 3 ? 'bg-emerald-900/5' : ''}`}>
                                                    <td className="p-3 pl-4 font-bold text-white flex items-center gap-2">
                                                        {p.name}
                                                        {p.squad_role === 'star' && <span className="text-yellow-500 text-[10px]">★</span>}
                                                    </td>
                                                    <td className={`p-3 text-center font-bold text-xs ${p.position === 'GK' ? 'text-yellow-500' : p.position === 'DEF' ? 'text-blue-400' : p.position === 'MID' ? 'text-green-400' : 'text-rose-400'}`}>{p.position}</td>
                                                    <td className="p-3 text-center text-neutral-500 font-mono text-xs">{p.age}</td>
                                                    <td className="p-3 text-center">
                                                        <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${p.overall >= 85 ? 'bg-emerald-900 text-emerald-300' : 'bg-neutral-800 text-white'}`}>{p.overall}</span>
                                                    </td>
                                                    <td className="p-3 text-center text-neutral-500 font-mono text-xs">{p.potential}</td>
                                                    <td className="p-3 pr-4 text-right font-mono text-neutral-400 text-xs">£{(p.market_value / 1000000).toFixed(1)}M</td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 h-full flex flex-col">

            {/* Header & Tabs */}
            <div className="flex flex-col md:flex-row justify-between items-end mb-6 gap-4">
                <div className="w-full md:w-auto">
                    <h2 className="text-3xl md:text-4xl font-bold text-white font-oswald uppercase tracking-tight mb-2">Competition Center</h2>
                    <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
                        {availableCompetitions.map(comp => (
                            <button
                                key={comp}
                                onClick={() => { setActiveCompetition(comp); setViewMode('list'); }}
                                className={`px-4 py-2 rounded-t-lg font-bold uppercase text-xs tracking-wider transition-all border-b-2 whitespace-nowrap
                            ${activeCompetition === comp
                                        ? 'bg-neutral-800 text-emerald-400 border-emerald-500 shadow-lg'
                                        : 'bg-neutral-900 text-neutral-500 border-transparent hover:text-neutral-300 hover:bg-neutral-800'
                                    }`}
                            >
                                {comp}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col items-end">
                    <div className="text-neutral-400 text-sm font-mono text-right hidden md:block mb-2">
                        Season 2025/2026 <br />
                        <span className="text-emerald-500 font-bold">{activeCompetition}</span>
                    </div>
                    {isCup && (
                        <div className="flex bg-neutral-900 p-1 rounded border border-neutral-700 shadow-lg">
                            <button
                                onClick={() => setViewMode('list')}
                                className={`px-4 py-2 text-[10px] font-bold uppercase rounded transition-all ${viewMode === 'list' ? 'bg-neutral-700 text-white shadow' : 'text-neutral-500 hover:text-white'}`}
                            >
                                List View
                            </button>
                            <button
                                onClick={() => setViewMode('bracket')}
                                className={`px-4 py-2 text-[10px] font-bold uppercase rounded transition-all flex items-center gap-2 ${viewMode === 'bracket' ? 'bg-emerald-600 text-white shadow' : 'text-neutral-500 hover:text-white'}`}
                            >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>
                                Tree View
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-12 gap-6 flex-1 overflow-hidden bg-neutral-950/30 p-2 md:p-4 rounded-xl border border-white/5">

                {/* Left Panel: League Table OR Fixture List OR Bracket */}
                <div className="col-span-12 lg:col-span-8 bg-neutral-900 rounded-xl border border-white/10 shadow-2xl overflow-hidden flex flex-col relative">
                    {viewMode === 'bracket' && isCup ? (
                        renderBracket()
                    ) : isLeague ? (
                        // LEAGUE TABLE VIEW
                        <div className="overflow-x-auto flex-1 custom-scrollbar">
                            <table className="w-full text-left text-sm min-w-[600px]">
                                <thead className="bg-neutral-950 uppercase text-neutral-500 font-bold text-xs tracking-wider sticky top-0 z-10">
                                    <tr>
                                        <th className="px-4 py-3 md:px-6 md:py-4 text-center">Pos</th>
                                        <th className="px-4 py-3 md:px-6 md:py-4">Club</th>
                                        <th className="px-4 py-3 md:px-6 md:py-4 text-center">P</th>
                                        <th className="px-4 py-3 md:px-6 md:py-4 text-center">W</th>
                                        <th className="px-4 py-3 md:px-6 md:py-4 text-center">D</th>
                                        <th className="px-4 py-3 md:px-6 md:py-4 text-center">L</th>
                                        <th className="px-4 py-3 md:px-6 md:py-4 text-center">GD</th>
                                        <th className="px-4 py-3 md:px-6 md:py-4 text-center">Pts</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-800/50">
                                    {[...currentLeague.clubs]
                                        .sort((a, b) => b.stats.points - a.stats.points || (b.stats.goalsFor - b.stats.goalsAgainst) - (a.stats.goalsFor - a.stats.goalsAgainst))
                                        .map((club, index) => {
                                            const isPlayer = club.id === playerClub.id;
                                            let rowStyle = "";
                                            if (index === 0) rowStyle = "border-l-4 border-emerald-500 bg-emerald-900/10";
                                            else if (index < 4) rowStyle = "border-l-4 border-blue-500 bg-blue-900/10";
                                            else if (index >= currentLeague.clubs.length - currentLeague.relegation_slots) rowStyle = "border-l-4 border-red-500 bg-red-900/10";

                                            return (
                                                <tr
                                                    key={club.id}
                                                    onClick={() => setSelectedClubId(club.id)}
                                                    className={`hover:bg-neutral-800 transition-colors cursor-pointer ${rowStyle} ${isPlayer ? 'bg-white/5' : ''}`}
                                                >
                                                    <td className="px-4 py-3 text-center font-mono text-neutral-400">{index + 1}</td>
                                                    <td className="px-4 py-3 font-bold text-white flex items-center gap-3">
                                                        <div className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold ${isPlayer ? 'bg-emerald-600 text-white' : 'bg-neutral-800 text-neutral-400'}`}>
                                                            {club.name.charAt(0)}
                                                        </div>
                                                        <span className={isPlayer ? 'text-emerald-400' : ''}>{club.name}</span>
                                                    </td>
                                                    <td className="px-4 py-3 text-center text-neutral-400">{club.stats.played}</td>
                                                    <td className="px-4 py-3 text-center text-neutral-500">{club.stats.won}</td>
                                                    <td className="px-4 py-3 text-center text-neutral-500">{club.stats.drawn}</td>
                                                    <td className="px-4 py-3 text-center text-neutral-500">{club.stats.lost}</td>
                                                    <td className="px-4 py-3 text-center font-mono text-neutral-400">{club.stats.goalsFor - club.stats.goalsAgainst}</td>
                                                    <td className="px-4 py-3 text-center font-bold text-white text-base">{club.stats.points}</td>
                                                </tr>
                                            );
                                        })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        // FIXTURE LIST VIEW (Cup or fallback)
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
                            {Object.keys(groupedFixtures).length === 0 && (
                                <div className="h-full flex items-center justify-center text-neutral-600 uppercase font-bold">
                                    No Fixtures Found
                                </div>
                            )}
                            {Object.entries(groupedFixtures)
                                .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
                                .map(([date, fixtures]) => (
                                    <div key={date} className="mb-6">
                                        <div className="flex items-center gap-4 mb-2">
                                            <div className="h-px flex-1 bg-neutral-800"></div>
                                            <span className="text-xs font-bold text-neutral-500 uppercase">{formatDate(date)}</span>
                                            <div className="h-px flex-1 bg-neutral-800"></div>
                                        </div>
                                        <div className="space-y-2">
                                            {(fixtures as Fixture[]).map(f => {
                                                const home = findClub(f.homeClubId);
                                                const away = findClub(f.awayClubId);
                                                const winnerId = f.homeScore! > f.awayScore! ? f.homeClubId : f.awayClubId;

                                                return (
                                                    <div key={f.id} className="bg-neutral-950/50 border border-white/5 rounded p-3 flex items-center justify-between hover:bg-neutral-800 transition-colors">
                                                        <div className={`flex-1 text-right font-bold text-sm ${winnerId === f.homeClubId ? 'text-emerald-400' : 'text-neutral-400'}`}>
                                                            {home ? home.name : "TBD"}
                                                        </div>
                                                        <div className="mx-4 flex flex-col items-center w-16">
                                                            {f.played ? (
                                                                <span className="text-white font-mono font-bold bg-neutral-900 px-2 py-0.5 rounded border border-neutral-700">{f.homeScore}-{f.awayScore}</span>
                                                            ) : (
                                                                <span className="text-neutral-600 text-xs uppercase">vs</span>
                                                            )}
                                                            {f.round && <span className="text-[8px] uppercase text-neutral-500 mt-1">{f.round}</span>}
                                                        </div>
                                                        <div className={`flex-1 text-left font-bold text-sm ${winnerId === f.awayClubId ? 'text-emerald-400' : 'text-neutral-400'}`}>
                                                            {away ? away.name : "TBD"}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                        </div>
                    )}
                </div>

                {/* Right Panel: Stats */}
                <div className="col-span-12 lg:col-span-4 flex flex-col gap-6 h-full">

                    <div className="bg-neutral-900 rounded-xl border border-white/10 shadow-lg p-4 flex-1 overflow-hidden flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-bold text-white uppercase font-oswald tracking-wide">Player Stats</h3>
                            <div className="flex gap-1 bg-neutral-950 p-0.5 rounded border border-neutral-800">
                                <button onClick={() => setStatView('goals')} className={`px-2 py-1 text-[10px] font-bold uppercase rounded ${statView === 'goals' ? 'bg-neutral-700 text-white' : 'text-neutral-500'}`}>G</button>
                                <button onClick={() => setStatView('assists')} className={`px-2 py-1 text-[10px] font-bold uppercase rounded ${statView === 'assists' ? 'bg-neutral-700 text-white' : 'text-neutral-500'}`}>A</button>
                                <button onClick={() => setStatView('rating')} className={`px-2 py-1 text-[10px] font-bold uppercase rounded ${statView === 'rating' ? 'bg-neutral-700 text-white' : 'text-neutral-500'}`}>R</button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            {statView === 'goals' && renderStatList(topScorers, 'goals', 'text-yellow-500')}
                            {statView === 'assists' && renderStatList(topAssisters, 'assists', 'text-blue-400')}
                            {statView === 'rating' && renderStatList(topRated, 'avg_rating', 'text-emerald-400')}
                        </div>
                    </div>

                    <div className="bg-neutral-900 rounded-xl border border-white/10 shadow-lg p-4 h-1/3 flex flex-col justify-center items-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
                        <div className="z-10 text-center">
                            <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-1">Current Champion</p>
                            <h3 className="text-2xl font-bold text-white font-oswald uppercase mb-2 text-shadow">
                                {currentLeague.history.length > 0 ? getClubName(currentLeague.history[currentLeague.history.length - 1].championId) : "TBD"}
                            </h3>
                            <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center text-yellow-500 text-3xl mx-auto border-2 border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.4)]">
                                🏆
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};