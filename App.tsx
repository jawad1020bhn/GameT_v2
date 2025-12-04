import React, { useState } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { MainLayout } from './components/layout/MainLayout';
import { Dashboard } from './components/views/Dashboard';
import { Squad } from './components/views/Squad';
import { LeagueTable } from './components/views/LeagueTable';
import { News } from './components/views/News';
import { Fixtures } from './components/views/Fixtures';
import { History } from './components/views/History';
import { Transfers } from './components/views/Transfers';
import { Headquarters } from './components/views/Headquarters';
import { DataHub } from './components/views/DataHub';
import { WorldNetwork } from './components/views/WorldNetwork';
import { Settings } from './components/views/Settings';
import { SimulationOverlay } from './components/modals/SimulationOverlay';
import { SeasonGala } from './components/modals/SeasonGala';
import { View, ManagerProfile, League } from './types';

const OnboardingWizard = () => {
    const { state, dispatch, loadGame, hasSave } = useGame();
    const [step, setStep] = useState<'intro' | 'create_manager' | 'select_club' | 'contract'>('intro');
    const [managerName, setManagerName] = useState("");
    const [managerStyle, setManagerStyle] = useState<ManagerProfile['style']>('tactician');
    
    // Selection Flow State
    const [selectionStage, setSelectionStage] = useState<'country' | 'league' | 'club'>('country');
    const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
    const [selectedLeagueId, setSelectedLeagueId] = useState<string | null>(null);
    const [selectedClubId, setSelectedClubId] = useState<number | null>(null);

    // Group leagues by country for selection
    const countryMap = React.useMemo(() => {
        const map: Record<string, League[]> = {};
        Object.entries(state.leagues).forEach(([key, league]) => {
            const l = league as League;
            if (!map[l.country]) map[l.country] = [];
            map[l.country].push(l);
        });
        return map;
    }, [state.leagues]);

    const handleCreateManager = () => {
        if (!managerName.trim()) return;
        const profile: ManagerProfile = {
            name: managerName,
            age: 40,
            nationality: "Unknown",
            style: managerStyle,
            stats: {
                man_management: managerStyle === 'motivator' ? 70 : 50,
                tactical_knowledge: managerStyle === 'tactician' ? 70 : 50,
                youth_development: managerStyle === 'youth_development' ? 70 : 50,
                financial_acumen: 50,
                media_handling: 50
            },
            reputation: 50,
            avatar_id: 1
        };
        dispatch({ type: 'CREATE_MANAGER', payload: profile });
        setStep('select_club');
    };

    const selectedLeague = selectedLeagueId ? state.leagues[selectedLeagueId] : null;

    if (step === 'intro') {
        return (
             <div className="h-screen w-screen bg-neutral-950 flex flex-col items-center justify-center relative overflow-hidden text-white">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522778119026-d647f0565c6a?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-10 grayscale"></div>
                <div className="z-10 text-center max-w-2xl p-8">
                    <h1 className="text-8xl font-bold font-oswald mb-4 tracking-tighter">PREMIERE MANAGER 25</h1>
                    <p className="text-xl text-neutral-400 mb-12 tracking-widest uppercase">The Beautiful Game Reimagined</p>
                    
                    <div className="space-y-4">
                        <button onClick={() => setStep('create_manager')} className="w-full bg-white text-neutral-900 font-bold py-4 rounded uppercase tracking-widest hover:bg-neutral-200 transition-colors">
                            New Career
                        </button>
                        {hasSave && (
                            <button onClick={loadGame} className="w-full bg-transparent border border-white/20 text-white font-bold py-4 rounded uppercase tracking-widest hover:bg-white/10 transition-colors">
                                Continue Career
                            </button>
                        )}
                    </div>
                </div>
             </div>
        );
    }

    if (step === 'create_manager') {
        return (
            <div className="h-screen w-screen bg-neutral-900 flex items-center justify-center p-8">
                <div className="w-full max-w-4xl bg-neutral-800 rounded-xl shadow-2xl overflow-hidden flex">
                    {/* Left Visual */}
                    <div className="w-1/3 bg-neutral-950 p-8 flex flex-col items-center justify-center border-r border-white/5">
                         <div className="w-32 h-32 rounded-full bg-neutral-800 mb-6 flex items-center justify-center text-4xl border-2 border-white/10">
                             👔
                         </div>
                         <h2 className="text-white font-oswald text-2xl uppercase tracking-wide">Manager Identity</h2>
                         <p className="text-neutral-500 text-sm text-center mt-2">Define your managerial persona.</p>
                    </div>

                    {/* Right Form */}
                    <div className="flex-1 p-12">
                        <div className="mb-8">
                            <label className="block text-xs font-bold text-neutral-500 uppercase mb-2">Full Name</label>
                            <input 
                                type="text" 
                                value={managerName}
                                onChange={(e) => setManagerName(e.target.value)}
                                className="w-full bg-neutral-900 border border-neutral-700 rounded p-4 text-white text-lg focus:border-white transition-colors outline-none"
                                placeholder="Enter your name..."
                            />
                        </div>
                        
                        <div className="mb-8">
                             <label className="block text-xs font-bold text-neutral-500 uppercase mb-4">Managerial Style</label>
                             <div className="grid grid-cols-3 gap-4">
                                 {[
                                     { id: 'tactician', label: 'Tactician', icon: '♟️' },
                                     { id: 'motivator', label: 'Motivator', icon: '🗣️' },
                                     { id: 'youth_development', label: 'Developer', icon: '🎓' }
                                 ].map((s) => (
                                     <button 
                                        key={s.id}
                                        onClick={() => setManagerStyle(s.id as any)}
                                        className={`p-4 rounded border-2 flex flex-col items-center gap-2 transition-all ${managerStyle === s.id ? 'border-white bg-neutral-700' : 'border-neutral-700 bg-neutral-900 hover:bg-neutral-800'}`}
                                     >
                                         <span className="text-2xl">{s.icon}</span>
                                         <span className="text-xs font-bold uppercase text-white">{s.label}</span>
                                     </button>
                                 ))}
                             </div>
                        </div>

                        <div className="flex justify-end gap-4">
                            <button onClick={() => setStep('intro')} className="text-neutral-500 hover:text-white font-bold uppercase text-sm px-6">Cancel</button>
                            <button 
                                onClick={handleCreateManager}
                                disabled={!managerName}
                                className="bg-white text-neutral-900 font-bold py-3 px-8 rounded uppercase text-sm tracking-wider hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next Step
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (step === 'select_club') {
        return (
            <div className="h-screen w-screen bg-neutral-900 flex flex-col relative overflow-hidden font-sans">
                {/* Background FX */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-neutral-900/90 to-blue-900/20 pointer-events-none"></div>

                {/* Header */}
                <div className="p-8 flex justify-between items-center relative z-10 border-b border-white/5">
                    <div>
                        <h2 className="text-3xl font-oswald text-white uppercase tracking-widest">
                            {selectionStage === 'country' && "Select Nation"}
                            {selectionStage === 'league' && `${selectedCountry} // Select Competition`}
                            {selectionStage === 'club' && "Select Your Club"}
                        </h2>
                        <p className="text-neutral-500 text-xs font-mono uppercase tracking-wider mt-1">
                            Step {selectionStage === 'country' ? '1' : selectionStage === 'league' ? '2' : '3'} of 3
                        </p>
                    </div>
                    
                    {selectionStage !== 'country' && (
                        <button 
                            onClick={() => {
                                if (selectionStage === 'club') setSelectionStage('league');
                                else if (selectionStage === 'league') setSelectionStage('country');
                            }}
                            className="text-neutral-400 hover:text-white flex items-center gap-2 uppercase text-xs font-bold tracking-widest transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                            Back
                        </button>
                    )}
                </div>

                {/* Content Container */}
                <div className="flex-1 overflow-y-auto p-8 relative z-10 custom-scrollbar">
                    
                    {/* STAGE 1: COUNTRY */}
                    {selectionStage === 'country' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 h-full items-center">
                            {Object.keys(countryMap).map(country => (
                                <button
                                    key={country}
                                    onClick={() => { setSelectedCountry(country); setSelectionStage('league'); }}
                                    className="group relative h-96 bg-neutral-800 border border-white/5 rounded-xl overflow-hidden hover:border-white/30 transition-all hover:-translate-y-2 hover:shadow-2xl flex flex-col"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent opacity-80"></div>
                                    
                                    {/* Stylized Background per Country (Simplified with gradients/colors) */}
                                    <div className={`absolute inset-0 opacity-30 group-hover:opacity-50 transition-opacity bg-gradient-to-br ${
                                        country === 'England' ? 'from-red-900 to-blue-900' :
                                        country === 'Spain' ? 'from-yellow-900 to-red-900' :
                                        country === 'Germany' ? 'from-yellow-600 to-black' :
                                        country === 'Italy' ? 'from-green-900 to-red-900' :
                                        'from-blue-900 to-red-900' // France/Default
                                    }`}></div>

                                    <div className="relative z-10 flex-1 flex flex-col justify-center items-center p-6 text-center">
                                        <h3 className="text-4xl font-oswald font-bold text-white uppercase tracking-tight mb-2 drop-shadow-lg">{country}</h3>
                                        <div className="w-12 h-1 bg-white/20 rounded mb-4 group-hover:w-24 transition-all"></div>
                                        <p className="text-neutral-300 text-xs font-mono uppercase">{countryMap[country].length} Leagues Available</p>
                                    </div>
                                    
                                    <div className="relative z-10 p-4 border-t border-white/10 bg-neutral-900/50 backdrop-blur">
                                        <span className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest flex justify-between w-full">
                                            <span>Start Career</span>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* STAGE 2: LEAGUE */}
                    {selectionStage === 'league' && selectedCountry && (
                        <div className="flex flex-col gap-4 max-w-4xl mx-auto">
                            {countryMap[selectedCountry].sort((a,b) => a.tier - b.tier).map(league => (
                                <button
                                    key={league.name}
                                    onClick={() => { setSelectedLeagueId(league.name); setSelectionStage('club'); }}
                                    className="group flex items-center bg-neutral-800 border border-white/5 rounded-xl overflow-hidden hover:bg-neutral-700 transition-all hover:border-emerald-500/50 hover:shadow-lg h-32"
                                >
                                    <div className="w-2 h-full bg-emerald-600"></div>
                                    <div className="w-32 h-full bg-neutral-900 flex items-center justify-center text-2xl font-bold text-neutral-700 group-hover:text-white transition-colors">
                                        {league.tier === 1 ? '1st' : '2nd'}
                                    </div>
                                    <div className="flex-1 p-6 text-left">
                                        <h3 className="text-2xl font-oswald font-bold text-white uppercase mb-1">{league.name}</h3>
                                        <p className="text-neutral-400 text-xs font-mono uppercase">{league.club_count} Clubs • {league.reputation} Reputation</p>
                                    </div>
                                    <div className="pr-8 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-2">
                                        <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* STAGE 3: CLUB */}
                    {selectionStage === 'club' && selectedLeague && (
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                             {selectedLeague.clubs.sort((a, b) => b.reputation - a.reputation).map(club => (
                                <button 
                                    key={club.id}
                                    onClick={() => { setSelectedClubId(club.id); setStep('contract'); }}
                                    className="group bg-neutral-800/50 border border-white/5 rounded-xl overflow-hidden text-left hover:bg-neutral-800 hover:border-emerald-500/50 transition-all hover:-translate-y-1 hover:shadow-2xl flex flex-col"
                                >
                                    <div className="h-32 bg-gradient-to-br from-neutral-900 to-neutral-800 flex items-center justify-center relative overflow-hidden">
                                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-10"></div>
                                        <div className="w-20 h-20 bg-neutral-900 rounded-full flex items-center justify-center text-white font-bold font-oswald text-3xl border-2 border-white/10 shadow-xl z-10 group-hover:scale-110 transition-transform group-hover:border-emerald-500">
                                            {club.name.charAt(0)}
                                        </div>
                                    </div>
                                    
                                    <div className="p-5 flex-1 flex flex-col">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-lg font-bold text-white font-oswald uppercase leading-tight">{club.name}</h3>
                                            <div className="text-emerald-400 font-mono font-bold text-xs bg-emerald-900/20 px-2 py-1 rounded border border-emerald-900/50">
                                                £{(club.budget/1000000).toFixed(0)}M
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-2 mt-2 mb-4">
                                             <div className="flex justify-between text-[10px] uppercase font-bold text-neutral-500 border-b border-white/5 pb-1">
                                                 <span>Stadium</span>
                                                 <span className="text-neutral-300">{club.capacity.toLocaleString()}</span>
                                             </div>
                                             <div className="flex justify-between text-[10px] uppercase font-bold text-neutral-500 border-b border-white/5 pb-1">
                                                 <span>Board Exp.</span>
                                                 <span className="text-white">{club.board_expectations.league_position_target <= 4 ? 'Top 4' : 'Mid Table'}</span>
                                             </div>
                                        </div>

                                        <div className="mt-auto pt-2">
                                            <span className="w-full block text-center py-2 rounded bg-neutral-900 text-neutral-500 text-xs font-bold uppercase group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                                Select Team
                                            </span>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                </div>
            </div>
        );
    }

    if (step === 'contract' && selectedClubId) {
        const club = (Object.values(state.leagues) as League[]).flatMap(l => l.clubs).find(c => c.id === selectedClubId)!;
        
        // Dynamic Generators
        const bestPlayer = [...club.players].sort((a,b) => b.overall - a.overall)[0];
        
        let chairmanQuote = "We believe you are the right person to take this club forward. Stability is key.";
        if (club.owner.ambition > 80) chairmanQuote = "Our vision is global dominance. We expect you to deliver silverware immediately. Second place is not an option here.";
        else if (club.owner.patience < 40) chairmanQuote = "The fans are restless. We need immediate results to steady the ship. Don't let us down.";
        else if (club.budget < 20000000) chairmanQuote = "Resources are tight, but our spirit is strong. You'll need to be shrewd in the market and rely on youth.";

        return (
            <div className="h-screen w-screen bg-neutral-950/90 backdrop-blur flex items-center justify-center p-4">
                <div className="w-full max-w-4xl bg-neutral-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
                    
                    {/* Left Panel: Club Identity */}
                    <div className="w-full md:w-1/3 bg-neutral-950 p-8 border-r border-white/5 flex flex-col">
                        <div className="text-center mb-8">
                             <div className="w-24 h-24 mx-auto bg-neutral-900 rounded-full border-4 border-white/10 flex items-center justify-center text-4xl font-bold text-white font-oswald mb-4 shadow-xl">
                                {club.name.charAt(0)}
                            </div>
                            <h2 className="text-2xl font-oswald text-white uppercase tracking-wide leading-none">{club.name}</h2>
                            <p className="text-neutral-500 text-xs mt-2 font-mono">Est. {club.founded}</p>
                        </div>

                        <div className="space-y-6 flex-1">
                            <div>
                                <h3 className="text-emerald-500 text-[10px] font-bold uppercase tracking-widest mb-2">Club DNA</h3>
                                <p className="text-neutral-300 text-sm leading-snug">
                                    Known for a <span className="text-white font-bold">{club.style_identity.play_style}</span> style of play. 
                                    The {club.stadium} holds <span className="text-white">{club.capacity.toLocaleString()}</span> passionate fans.
                                </p>
                            </div>
                            
                            <div>
                                <h3 className="text-blue-400 text-[10px] font-bold uppercase tracking-widest mb-2">Star Man</h3>
                                <div className="flex items-center gap-3 bg-neutral-900 p-3 rounded border border-white/5">
                                    <div className="w-8 h-8 rounded bg-neutral-800 flex items-center justify-center text-xs font-bold text-white">{bestPlayer.position}</div>
                                    <div>
                                        <div className="text-white font-bold text-sm">{bestPlayer.name}</div>
                                        <div className="text-neutral-500 text-[10px]">OVR: {bestPlayer.overall}</div>
                                    </div>
                                </div>
                            </div>

                             <div>
                                <h3 className="text-yellow-500 text-[10px] font-bold uppercase tracking-widest mb-2">Board Culture</h3>
                                <div className="grid grid-cols-2 gap-2">
                                     <div className="bg-neutral-900 p-2 rounded text-center">
                                         <div className="text-[10px] text-neutral-500">Ambition</div>
                                         <div className="text-white font-bold text-xs">{club.owner.ambition}/100</div>
                                     </div>
                                     <div className="bg-neutral-900 p-2 rounded text-center">
                                         <div className="text-[10px] text-neutral-500">Patience</div>
                                         <div className="text-white font-bold text-xs">{club.owner.patience}/100</div>
                                     </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel: The Contract */}
                    <div className="flex-1 flex flex-col">
                        <div className="p-8 border-b border-white/5 bg-neutral-900">
                            <h2 className="text-3xl font-oswald text-white uppercase tracking-wide mb-1">Official Contract</h2>
                            <p className="text-neutral-500 uppercase text-xs tracking-widest">Terms of Employment</p>
                        </div>

                        <div className="p-8 space-y-8 bg-neutral-900/50 flex-1 overflow-y-auto">
                             <div className="relative pl-6 border-l-2 border-white/10 italic text-neutral-400 text-sm">
                                 <span className="text-4xl absolute -top-4 -left-3 text-neutral-700">“</span>
                                 {chairmanQuote}
                             </div>

                             <div className="grid grid-cols-2 gap-6">
                                 <div className="bg-neutral-950 p-4 rounded border border-white/5">
                                     <span className="block text-[10px] text-neutral-500 uppercase font-bold mb-1">Personal Terms</span>
                                     <span className="block text-xl font-mono text-white">£45,000<span className="text-xs text-neutral-500">/wk</span></span>
                                     <span className="block text-xs text-neutral-400 mt-1">2 Year Deal</span>
                                 </div>
                                 <div className="bg-neutral-950 p-4 rounded border border-white/5">
                                     <span className="block text-[10px] text-neutral-500 uppercase font-bold mb-1">Transfer Budget</span>
                                     <span className="block text-xl font-mono text-emerald-400">£{(club.budget/1000000).toFixed(1)}M</span>
                                     <span className="block text-xs text-neutral-400 mt-1">Wage: £{(club.wage_budget_weekly/1000).toFixed(0)}k/wk</span>
                                 </div>
                                 <div className="bg-neutral-950 p-4 rounded border border-white/5 col-span-2 flex justify-between items-center">
                                     <div>
                                        <span className="block text-[10px] text-neutral-500 uppercase font-bold mb-1">Season Objective</span>
                                        <span className="block text-lg font-bold text-white uppercase tracking-wide">
                                            Finish Top {club.board_expectations.league_position_target}
                                        </span>
                                     </div>
                                     <div className="text-right">
                                          <span className="block text-[10px] text-neutral-500 uppercase font-bold mb-1">Cup Target</span>
                                          <span className="block text-sm font-bold text-neutral-300 uppercase">
                                            {club.board_expectations.cup_target_stage.replace('_', ' ')}
                                          </span>
                                     </div>
                                 </div>
                             </div>
                        </div>

                        <div className="p-6 border-t border-white/5 bg-neutral-950 flex gap-4">
                            <button onClick={() => setSelectionStage('club')} className="flex-1 py-4 text-neutral-500 font-bold uppercase text-xs hover:text-white transition-colors hover:bg-neutral-900 rounded">
                                Decline Offer
                            </button>
                            <button 
                                onClick={() => dispatch({ type: 'START_GAME', payload: { clubId: club.id } })}
                                className="flex-[2] bg-white hover:bg-neutral-200 text-neutral-900 font-bold py-4 rounded uppercase text-sm tracking-widest transition-colors shadow-lg flex items-center justify-center gap-2"
                            >
                                <span>Sign Contract</span>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return null;
};

const GameContent: React.FC = () => {
  const { state, currentView } = useGame();

  if (!state.playerClubId) {
      return <OnboardingWizard />;
  }

  return (
    <MainLayout>
      {currentView === View.DASHBOARD && <Dashboard />}
      {currentView === View.SQUAD && <Squad />}
      {currentView === View.TABLE && <LeagueTable />}
      {currentView === View.NEWS && <News />}
      {currentView === View.FIXTURES && <Fixtures />}
      {currentView === View.HISTORY && <History />}
      {currentView === View.TRANSFERS && <Transfers />}
      {currentView === View.HEADQUARTERS && <Headquarters />}
      {currentView === View.DATA_HUB && <DataHub />}
      {currentView === View.WORLD && <WorldNetwork />}
      {currentView === View.SETTINGS && <Settings />}
      <SimulationOverlay />
      {state.seasonGala && <SeasonGala data={state.seasonGala} />}
    </MainLayout>
  );
};

const App = () => {
  return (
    <GameProvider>
      <GameContent />
    </GameProvider>
  );
};

export default App;