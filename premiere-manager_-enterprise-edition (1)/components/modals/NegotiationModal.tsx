
import React, { useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { Negotiation, TransferOffer, League, ContractOffer } from '../../types';

interface NegotiationModalProps {
    negotiation: Negotiation;
    onClose: () => void;
}

export const NegotiationModal: React.FC<NegotiationModalProps> = ({ negotiation, onClose }) => {
    const { state, dispatch, playerClub } = useGame();
    
    // PHASE 1: CLUB FEE STATE
    const [fee, setFee] = useState(negotiation.latest_offer?.fee || 0);
    const [installments, setInstallments] = useState(negotiation.latest_offer?.installments || 0);
    const [sellOn, setSellOn] = useState(negotiation.latest_offer?.sell_on_clause_pct || 0);

    // PHASE 2: CONTRACT STATE
    const [wage, setWage] = useState(negotiation.latest_contract_offer?.wage || 0);
    const [duration, setDuration] = useState(negotiation.latest_contract_offer?.duration || 3);
    const [bonus, setBonus] = useState(negotiation.latest_contract_offer?.signing_bonus || 0);
    const [role, setRole] = useState<ContractOffer['role']>(negotiation.latest_contract_offer?.role || 'rotation');

    const player = Object.values(state.leagues).flatMap((l: League) => l.clubs).flatMap(c => c.players).find(p => p.id === negotiation.playerId);
    const sellingClub = Object.values(state.leagues).flatMap((l: League) => l.clubs).find(c => c.id === negotiation.sellingClubId);

    // Initialize Defaults for new negotiation
    useEffect(() => {
        if (fee === 0 && player) {
            setFee(player.market_value);
            setWage(Math.floor(player.salary * 1.2));
        }
    }, [player]);

    if (!player || !sellingClub || !playerClub) return null;

    const handleSubmitFee = () => {
        const offer: TransferOffer = { fee, installments, sell_on_clause_pct: sellOn };
        dispatch({ type: 'SUBMIT_OFFER', payload: { negotiationId: negotiation.id, offer } });
        onClose();
    };

    const handleSubmitContract = () => {
        const offer: ContractOffer = { wage, duration, signing_bonus: bonus, role };
        
        const updatedNeg = {
            ...negotiation,
            latest_contract_offer: offer,
            next_response_date: state.currentDate // Instant response for gameplay flow
        };
        
        const newState = {
            ...state,
            negotiations: state.negotiations.map(n => n.id === negotiation.id ? updatedNeg : n)
        };
        dispatch({ type: 'UPDATE_STATE', payload: newState });
        
        // Trigger processing immediately for UX
        setTimeout(() => {
             onClose();
        }, 100);
    };

    const handleWithdraw = () => {
        dispatch({ type: 'WITHDRAW_NEGOTIATION', payload: negotiation.id });
        onClose();
    };

    const patience = negotiation.ai_valuation?.patience || 100;
    const agentPatience = negotiation.ai_valuation?.agent_patience || 100;
    
    const isContractStage = negotiation.stage === 'contract';
    const isClubStage = negotiation.stage === 'club_fee';

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-neutral-950/95 backdrop-blur-md animate-in zoom-in-95 duration-200">
            <div className="bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col h-[85vh] relative">
                
                {/* Header */}
                <div className="h-20 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between px-8 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-xl border-2 shadow-lg ${negotiation.status === 'collapsed' ? 'bg-red-900 border-red-500' : 'bg-emerald-900 border-emerald-500'}`}>
                            {isContractStage ? '📝' : '🤝'}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white font-oswald uppercase tracking-wide">
                                {isContractStage ? 'Contract Negotiation' : 'Transfer Negotiation'}
                            </h2>
                            <p className="text-neutral-400 text-sm flex items-center gap-2">
                                <span className="text-white font-bold">{player.name}</span> 
                                <span className="text-neutral-600">•</span> 
                                <span>{sellingClub.name}</span>
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-[10px] uppercase font-bold text-neutral-500">Negotiation Patience</p>
                            <div className="w-32 h-2 bg-neutral-800 rounded-full overflow-hidden mt-1">
                                <div 
                                    className={`h-full transition-all duration-500 ${isContractStage 
                                        ? (agentPatience < 40 ? 'bg-red-500' : 'bg-blue-500') 
                                        : (patience < 40 ? 'bg-red-500' : 'bg-yellow-500')}`} 
                                    style={{ width: `${isContractStage ? agentPatience : patience}%` }}
                                ></div>
                            </div>
                        </div>
                        <button onClick={onClose} className="bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white p-2 rounded-full transition-colors">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                </div>

                {/* Main Content Split */}
                <div className="flex-1 flex overflow-hidden">
                    
                    {/* LEFT PANEL: INPUTS */}
                    <div className="w-1/2 p-8 border-r border-neutral-800 overflow-y-auto custom-scrollbar bg-neutral-900/50">
                        
                        {isClubStage && (
                            <div className="space-y-8 animate-in slide-in-from-left-4 duration-300">
                                <div className="bg-neutral-950 p-5 rounded-xl border border-neutral-800">
                                    <label className="flex justify-between text-xs text-neutral-400 uppercase font-bold mb-3">
                                        <span>Upfront Fee</span>
                                        <span className="text-white">£{(fee/1000000).toFixed(1)}M</span>
                                    </label>
                                    <input 
                                        type="range" min="0" max={playerClub.budget * 1.2} step={100000}
                                        className="w-full accent-emerald-500 h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer"
                                        value={fee}
                                        onChange={(e) => setFee(parseInt(e.target.value))}
                                    />
                                    <div className="flex justify-between mt-2 text-[10px] text-neutral-600">
                                        <span>£0</span>
                                        <span>£{(playerClub.budget/1000000).toFixed(1)}M (Budget)</span>
                                    </div>
                                </div>

                                <div className="bg-neutral-950 p-5 rounded-xl border border-neutral-800">
                                    <label className="flex justify-between text-xs text-neutral-400 uppercase font-bold mb-3">
                                        <span>Installments (3 Years)</span>
                                        <span className="text-white">£{(installments/1000000).toFixed(1)}M</span>
                                    </label>
                                    <input 
                                        type="range" min="0" max={50000000} step={100000}
                                        className="w-full accent-blue-500 h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer"
                                        value={installments}
                                        onChange={(e) => setInstallments(parseInt(e.target.value))}
                                    />
                                </div>

                                <div className="bg-neutral-950 p-5 rounded-xl border border-neutral-800">
                                    <label className="flex justify-between text-xs text-neutral-400 uppercase font-bold mb-3">
                                        <span>Sell-on Clause</span>
                                        <span className="text-white">{sellOn}%</span>
                                    </label>
                                    <div className="flex gap-2">
                                        {[0, 5, 10, 15, 20, 25, 30].map(val => (
                                            <button 
                                                key={val}
                                                onClick={() => setSellOn(val)}
                                                className={`flex-1 py-2 rounded text-xs font-bold border transition-colors ${sellOn === val ? 'bg-yellow-600 text-white border-yellow-500' : 'bg-neutral-900 text-neutral-500 border-neutral-700 hover:border-neutral-500'}`}
                                            >
                                                {val}%
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {isContractStage && (
                            <div className="space-y-6 animate-in slide-in-from-left-4 duration-300">
                                <div>
                                    <label className="block text-xs text-neutral-400 uppercase font-bold mb-2">Weekly Wage</label>
                                    <div className="flex items-center bg-neutral-950 border border-neutral-700 rounded-lg px-4 py-3 shadow-inner focus-within:border-emerald-500 transition-colors">
                                        <span className="text-neutral-500 mr-2 font-mono">£</span>
                                        <input 
                                            type="number" 
                                            className="bg-transparent w-full text-white font-mono font-bold text-lg focus:outline-none"
                                            value={wage}
                                            onChange={(e) => setWage(parseInt(e.target.value) || 0)}
                                            step={1000}
                                        />
                                        <span className="text-neutral-600 text-xs font-bold uppercase ml-2">/wk</span>
                                    </div>
                                    <p className="text-right text-[10px] text-neutral-500 mt-1">Current: £{(player.salary).toLocaleString()}</p>
                                </div>

                                <div>
                                    <label className="block text-xs text-neutral-400 uppercase font-bold mb-2">Contract Duration</label>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map(yr => (
                                            <button 
                                                key={yr}
                                                onClick={() => setDuration(yr)}
                                                className={`flex-1 py-3 rounded-lg font-bold border transition-all ${duration === yr ? 'bg-blue-600 text-white border-blue-500 shadow-lg' : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:border-neutral-600'}`}
                                            >
                                                {yr} Yrs
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs text-neutral-400 uppercase font-bold mb-2">Signing Bonus</label>
                                    <input 
                                        type="range" min="0" max={5000000} step={50000}
                                        className="w-full accent-emerald-500 h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer mb-2"
                                        value={bonus}
                                        onChange={(e) => setBonus(parseInt(e.target.value))}
                                    />
                                    <div className="text-right font-mono text-white font-bold">£{(bonus).toLocaleString()}</div>
                                </div>

                                <div>
                                    <label className="block text-xs text-neutral-400 uppercase font-bold mb-2">Squad Role</label>
                                    <select 
                                        className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-4 py-3 text-white font-bold focus:border-emerald-500 outline-none appearance-none"
                                        value={role}
                                        onChange={(e) => setRole(e.target.value as any)}
                                    >
                                        <option value="star">Star Player</option>
                                        <option value="key">Key Player</option>
                                        <option value="important">Important</option>
                                        <option value="rotation">Rotation</option>
                                        <option value="prospect">Prospect</option>
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* RIGHT PANEL: FEEDBACK / AGENT */}
                    <div className="w-1/2 bg-gradient-to-br from-neutral-950 to-neutral-900 flex flex-col relative">
                         {/* Background Pattern */}
                         <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 to-neutral-800 opacity-50 pointer-events-none"></div>
                         
                         <div className="flex-1 p-8 flex flex-col justify-center items-center text-center relative z-10">
                             
                             {/* Agent Persona */}
                             <div className="mb-6">
                                 <div className="w-24 h-24 rounded-full bg-neutral-800 border-4 border-neutral-700 flex items-center justify-center text-4xl shadow-2xl mb-4 mx-auto relative">
                                     {isContractStage ? '🕴️' : '🏢'}
                                     <div className="absolute -bottom-2 bg-neutral-950 px-3 py-1 rounded-full border border-neutral-700 text-[10px] uppercase font-bold text-neutral-300">
                                         {isContractStage ? 'Agent' : 'Director'}
                                     </div>
                                 </div>
                                 <div className={`p-4 rounded-xl border relative max-w-sm mx-auto ${negotiation.status === 'collapsed' ? 'bg-red-900/20 border-red-500/50' : 'bg-neutral-800 border-neutral-600'}`}>
                                     {/* Speech Bubble Triangle */}
                                     <div className={`absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rotate-45 border-t border-l bg-neutral-800 ${negotiation.status === 'collapsed' ? 'bg-red-900/20 border-red-500/50' : 'border-neutral-600'}`}></div>
                                     
                                     <p className={`text-sm italic font-medium leading-relaxed ${negotiation.status === 'collapsed' ? 'text-red-300' : 'text-emerald-100'}`}>
                                         "{negotiation.agent_comments || (negotiation.latest_offer ? "We are reviewing your proposal..." : "We are listening. Make your best offer.")}"
                                     </p>
                                 </div>
                             </div>

                             {/* Deal Value Summary */}
                             <div className="grid grid-cols-2 gap-8 w-full max-w-xs mt-8">
                                 <div className="text-center">
                                     <p className="text-[10px] text-neutral-500 uppercase font-bold">Total Value</p>
                                     <p className="text-2xl font-mono font-bold text-white">
                                         {isClubStage 
                                            ? `£${((fee + installments)/1000000).toFixed(1)}M` 
                                            : `£${(wage * 52 * duration / 1000000).toFixed(1)}M`}
                                     </p>
                                 </div>
                                 <div className="text-center">
                                     <p className="text-[10px] text-neutral-500 uppercase font-bold">Deal Likelihood</p>
                                     <p className={`text-2xl font-bold ${patience > 50 ? 'text-emerald-400' : 'text-red-400'}`}>
                                         {negotiation.status === 'collapsed' ? '0%' : negotiation.status === 'agreed_fee' && isClubStage ? '100%' : 'Est. Medium'}
                                     </p>
                                 </div>
                             </div>

                         </div>

                         {/* Action Bar */}
                         <div className="p-6 border-t border-neutral-800 bg-neutral-950/50 backdrop-blur relative z-20">
                             {negotiation.status === 'collapsed' ? (
                                 <button onClick={onClose} className="w-full py-4 bg-neutral-800 text-neutral-400 font-bold uppercase rounded hover:bg-neutral-700">
                                     Close Negotiations
                                 </button>
                             ) : (
                                 <div className="flex gap-4">
                                     <button 
                                         onClick={handleWithdraw}
                                         className="w-1/3 py-4 rounded-xl border border-red-900/50 text-red-500 font-bold uppercase hover:bg-red-900/10 transition-colors text-sm"
                                     >
                                         Walk Away
                                     </button>
                                     <button 
                                         onClick={isContractStage ? handleSubmitContract : handleSubmitFee}
                                         className="w-2/3 py-4 rounded-xl bg-emerald-600 text-white font-bold uppercase hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-900/40 text-sm flex items-center justify-center gap-2 group"
                                     >
                                         <span>Submit Offer</span>
                                         <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                     </button>
                                 </div>
                             )}
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
