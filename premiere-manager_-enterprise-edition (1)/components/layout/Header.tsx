
import React from 'react';
import { useGame } from '../../context/GameContext';
import { formatDate } from '../../services/engine';

interface HeaderProps {
    onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { state, playerClub, simulatePeriod } = useGame();

  return (
    <header className="h-16 bg-neutral-900 border-b border-white/5 flex items-center justify-between px-4 md:px-6 shrink-0 z-20 relative shadow-lg">
      <div className="flex items-center gap-4">
        <button 
            onClick={onMenuClick}
            className="text-neutral-400 hover:text-white md:hidden p-1"
        >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>

        {playerClub && (
           <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-neutral-800 rounded flex items-center justify-center text-white font-bold border border-white/10 shadow-inner hidden sm:flex font-oswald">
                {playerClub.name.charAt(0)}
             </div>
             <div>
                 <span className="block font-bold text-white text-sm md:text-lg tracking-wide leading-none truncate max-w-[120px] md:max-w-none font-oswald uppercase">{playerClub.name}</span>
                 <span className="block text-[10px] text-neutral-500 uppercase font-bold tracking-widest">Manager Mode</span>
             </div>
           </div>
        )}
      </div>

      <div className="flex items-center gap-2 md:gap-6">
        {playerClub && (
          <div className="hidden md:flex items-center gap-2 bg-neutral-950/50 px-4 py-1.5 rounded-full border border-white/5 shadow-inner">
            <span className="text-neutral-500 text-[10px] uppercase font-bold tracking-wider">Budget</span>
            <span className="font-mono font-bold text-emerald-400">£{(playerClub.budget / 1000000).toFixed(1)}M</span>
          </div>
        )}

        <div className="h-8 w-px bg-neutral-800 mx-1 hidden md:block"></div>

        <div className="flex flex-col items-end mr-2 hidden sm:flex">
            <span className="text-[10px] text-neutral-500 uppercase font-bold tracking-widest">Date</span>
            <span className="text-white font-mono font-bold">{formatDate(state.currentDate)}</span>
        </div>

        <div className="flex gap-2">
            <button 
              onClick={() => simulatePeriod(1)}
              className="relative group overflow-hidden bg-neutral-800 hover:bg-neutral-700 text-white px-3 md:px-4 py-2 rounded-sm font-bold text-[10px] md:text-xs uppercase tracking-widest shadow-sm border border-white/10 transition-all"
            >
              <span className="relative z-10">Next Day</span>
            </button>

            <button 
              onClick={() => simulatePeriod(7)}
              className="bg-white hover:bg-neutral-200 text-neutral-900 px-3 md:px-6 py-2 rounded-sm font-bold text-[10px] md:text-xs uppercase tracking-widest shadow-lg transform hover:scale-105 transition-all active:scale-95 flex items-center gap-2"
            >
              <svg className="w-4 h-4 hidden md:block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              <span className="hidden md:inline">Advance Week</span>
              <span className="md:hidden">Adv. Week</span>
            </button>
        </div>
      </div>
    </header>
  );
};
