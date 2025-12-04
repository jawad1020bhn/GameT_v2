

import React from 'react';
import { View } from '../../types';
import { useGame } from '../../context/GameContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const NavItem = ({ 
  label, 
  active, 
  onClick, 
  icon 
}: { 
  label: string; 
  active: boolean; 
  onClick: () => void;
  icon: React.ReactNode;
}) => (
  <button 
    onClick={onClick}
    className={`
      w-full text-left py-3 px-4 mb-1 flex items-center gap-3 transition-all rounded-lg
      ${active 
        ? 'bg-white text-neutral-900 font-bold shadow-lg' 
        : 'text-neutral-400 hover:text-white hover:bg-neutral-800'}
    `}
  >
    {icon}
    <span className="uppercase tracking-wide font-medium text-sm font-oswald">{label}</span>
  </button>
);

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { currentView, setCurrentView } = useGame();

  const handleNav = (view: View) => {
    setCurrentView(view);
    if (window.innerWidth < 768) {
      onClose();
    }
  };

  // SVG Icons - Minimalist Line Art
  const DashboardIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
  const SquadIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
  const TableIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>;
  const NewsIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>;
  const FixturesIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
  const HistoryIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
  const TransfersIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>;
  const HQIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>;
  const DataIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;
  const SettingsIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
  const WorldIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

  return (
    <>
    {/* Mobile Overlay */}
    <div 
      className={`fixed inset-0 bg-black/50 z-30 md:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
      onClick={onClose}
    />
    
    <div className={`
        w-64 bg-neutral-950 border-r border-white/5 flex flex-col h-full 
        fixed md:static inset-y-0 left-0 z-40 transition-transform duration-300 
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
    `}>
      <div className="p-6 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white text-neutral-900 rounded-sm flex items-center justify-center font-bold font-oswald text-lg tracking-tighter">
                PM
            </div>
            <span className="font-oswald font-bold text-lg tracking-widest text-white uppercase">Manager 25</span>
        </div>
        <button onClick={onClose} className="md:hidden text-neutral-500 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <nav className="flex-1 p-4 overflow-y-auto custom-scrollbar">
        <div className="mb-6">
          <p className="text-[10px] font-bold text-neutral-500 uppercase px-4 mb-2 tracking-widest">Team</p>
          <NavItem 
            label="Overview" 
            active={currentView === View.DASHBOARD} 
            onClick={() => handleNav(View.DASHBOARD)}
            icon={<DashboardIcon />}
          />
          <NavItem 
            label="Squad" 
            active={currentView === View.SQUAD} 
            onClick={() => handleNav(View.SQUAD)}
            icon={<SquadIcon />}
          />
        </div>

        <div className="mb-6">
          <p className="text-[10px] font-bold text-neutral-500 uppercase px-4 mb-2 tracking-widest">Management</p>
           <NavItem 
            label="Operations" 
            active={currentView === View.HEADQUARTERS} 
            onClick={() => handleNav(View.HEADQUARTERS)}
            icon={<HQIcon />}
          />
          <NavItem 
            label="Recruitment" 
            active={currentView === View.TRANSFERS} 
            onClick={() => handleNav(View.TRANSFERS)}
            icon={<TransfersIcon />}
          />
          <NavItem 
            label="Analytics" 
            active={currentView === View.DATA_HUB} 
            onClick={() => handleNav(View.DATA_HUB)}
            icon={<DataIcon />}
          />
          <NavItem 
            label="World Network" 
            active={currentView === View.WORLD} 
            onClick={() => handleNav(View.WORLD)}
            icon={<WorldIcon />}
          />
        </div>

        <div className="mb-6">
          <p className="text-[10px] font-bold text-neutral-500 uppercase px-4 mb-2 tracking-widest">Competitions</p>
          <NavItem 
            label="Tables" 
            active={currentView === View.TABLE} 
            onClick={() => handleNav(View.TABLE)}
            icon={<TableIcon />}
          />
          <NavItem 
            label="Schedule" 
            active={currentView === View.FIXTURES} 
            onClick={() => handleNav(View.FIXTURES)}
            icon={<FixturesIcon />}
          />
          <NavItem 
            label="News Feed" 
            active={currentView === View.NEWS} 
            onClick={() => handleNav(View.NEWS)}
            icon={<NewsIcon />}
          />
           <NavItem 
            label="History" 
            active={currentView === View.HISTORY} 
            onClick={() => handleNav(View.HISTORY)}
            icon={<HistoryIcon />}
          />
        </div>

        <div className="mt-auto pt-4 border-t border-white/5">
          <NavItem 
            label="Options" 
            active={currentView === View.SETTINGS} 
            onClick={() => handleNav(View.SETTINGS)}
            icon={<SettingsIcon />}
          />
        </div>
      </nav>

      <div className="p-4 border-t border-white/5">
        <div className="text-[10px] text-neutral-600 text-center uppercase tracking-wider font-mono">
          Season 2025/26
        </div>
      </div>
    </div>
    </>
  );
};
