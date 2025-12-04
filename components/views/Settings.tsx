
import React from 'react';
import { useGame } from '../../context/GameContext';

export const Settings: React.FC = () => {
  const { saveGame, loadGame, resetGame, deleteSave, hasSave, state } = useGame();

  const handleReset = () => {
      if (confirm("Are you sure you want to resign? This will return you to the main menu. Unsaved progress will be lost.")) {
          resetGame();
      }
  };

  const handleDelete = () => {
      if (confirm("Are you sure you want to delete your saved career? This cannot be undone.")) {
          deleteSave();
      }
  };

  return (
    <div className="p-6 h-full flex flex-col">
        <div className="flex justify-between items-end mb-6">
            <div>
                <h2 className="text-4xl font-bold text-white font-oswald uppercase tracking-tight">System Settings</h2>
                <p className="text-neutral-400 text-sm font-mono">Game Configuration & Memory</p>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Save/Load Section */}
            <div className="bg-neutral-900 rounded-xl border border-white/10 p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-4 border-b border-white/10 pb-2">
                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                    <h3 className="text-xl font-bold text-white uppercase">Career Memory</h3>
                </div>
                <div className="space-y-4">
                    <div className="bg-neutral-950 p-4 rounded border border-neutral-800">
                        <p className="text-xs text-neutral-500 uppercase font-bold mb-1">Current Session</p>
                        <p className="text-white font-mono text-sm">Date: {state.currentDate}</p>
                        <button 
                            onClick={saveGame}
                            className="mt-3 w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded uppercase text-xs tracking-wider transition-colors shadow-lg"
                        >
                            Save Progress
                        </button>
                    </div>

                    <div className="bg-neutral-950 p-4 rounded border border-neutral-800">
                         <div className="flex justify-between items-center mb-2">
                             <p className="text-xs text-neutral-500 uppercase font-bold">Storage Status</p>
                             {hasSave ? (
                                 <span className="text-xs text-emerald-400 font-bold uppercase flex items-center gap-1">
                                     <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span> Active Save
                                 </span>
                             ) : (
                                 <span className="text-xs text-neutral-600 font-bold uppercase">Empty</span>
                             )}
                         </div>
                         <div className="flex gap-3">
                             <button 
                                onClick={loadGame}
                                disabled={!hasSave}
                                className="flex-1 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded uppercase text-xs tracking-wider transition-colors border border-neutral-700"
                             >
                                 Load Last Save
                             </button>
                             <button 
                                onClick={handleDelete}
                                disabled={!hasSave}
                                className="px-4 bg-red-900/20 hover:bg-red-900/40 text-red-500 disabled:opacity-30 disabled:cursor-not-allowed rounded border border-red-900/50 transition-colors"
                                title="Delete Save"
                             >
                                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                             </button>
                         </div>
                    </div>
                </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-neutral-900 rounded-xl border border-white/10 p-6 shadow-lg flex flex-col">
                <div className="flex items-center gap-3 mb-4 border-b border-white/10 pb-2">
                    <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    <h3 className="text-xl font-bold text-white uppercase">Career Control</h3>
                </div>
                <div className="flex-1 bg-red-900/10 border border-red-900/30 rounded p-4 flex flex-col justify-between">
                    <div>
                        <p className="text-white font-bold text-sm mb-2">Resign Position</p>
                        <p className="text-xs text-neutral-400 leading-relaxed">
                            Resigning will end your current tenure immediately. You will be returned to the main menu to select a new club or start a new career. 
                            <br/><br/>
                            <span className="text-red-400">Warning: Any unsaved progress in this session will be lost.</span>
                        </p>
                    </div>
                    <button 
                        onClick={handleReset}
                        className="mt-6 w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded uppercase text-xs tracking-wider transition-colors shadow-[0_0_15px_rgba(220,38,38,0.4)]"
                    >
                        Resign & Main Menu
                    </button>
                </div>
            </div>

             {/* Audio / Display Placeholder */}
             <div className="col-span-1 md:col-span-2 bg-neutral-900 rounded-xl border border-white/10 p-6 shadow-lg opacity-50 pointer-events-none grayscale">
                 <div className="flex items-center gap-3 mb-4 border-b border-white/10 pb-2">
                    <svg className="w-6 h-6 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    <h3 className="text-xl font-bold text-white uppercase">Engine Preferences</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex justify-between items-center p-3 bg-neutral-950 rounded border border-neutral-800">
                        <span className="text-xs text-neutral-400 font-bold uppercase">Audio Engine</span>
                        <div className="w-10 h-5 bg-neutral-700 rounded-full relative"><div className="w-3 h-3 bg-neutral-400 rounded-full absolute top-1 left-1"></div></div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-neutral-950 rounded border border-neutral-800">
                        <span className="text-xs text-neutral-400 font-bold uppercase">High Contrast</span>
                         <div className="w-10 h-5 bg-neutral-700 rounded-full relative"><div className="w-3 h-3 bg-neutral-400 rounded-full absolute top-1 left-1"></div></div>
                    </div>
                </div>
            </div>

        </div>
    </div>
  );
};
