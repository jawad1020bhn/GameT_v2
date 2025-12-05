import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../../context/GameContext';
import { Negotiation, TransferOffer, League, ContractOffer } from '../../types';

interface NegotiationModalProps {
    negotiation: Negotiation;
    onClose: () => void;
}

export const NegotiationModal: React.FC<NegotiationModalProps> = ({ negotiation, onClose }) => {
    const { state, dispatch, playerClub } = useGame();
    const chatEndRef = useRef<HTMLDivElement>(null);
    
    // PHASE 1: CLUB FEE STATE
    const [fee, setFee] = useState(negotiation.latest_offer?.fee || 0);
    const [installments, setInstallments] = useState(negotiation.latest_offer?.installments || 0);
    const [sellOn, setSellOn] = useState(negotiation.latest_offer?.sell_on_clause_pct || 0);

    // PHASE 2: CONTRACT STATE
    const [wage, setWage] = useState(negotiation.latest_contract_offer?.wage || 0);
    const [duration, setDuration] = useState(negotiation.latest_contract_offer?.duration || 3);
    const [bonus, setBonus] = useState(negotiation.latest_contract_offer?.signing_bonus || 0);
    const [role, setRole] = useState<ContractOffer['role']>(negotiation.latest_contract_offer?.role || 'rotation');

    // New Clauses
    const [releaseClause, setReleaseClause] = useState(negotiation.latest_contract_offer?.release_clause || 0);
    const [perfBonus, setPerfBonus] = useState(negotiation.latest_contract_offer?.performance_bonus || 0);
    const [wageRise, setWageRise] = useState(negotiation.latest_contract_offer?.yearly_wage_rise || 0);

    const player = Object.values(state.leagues).flatMap((l: League) => l.clubs).flatMap(c => c.players).find(p => p.id === negotiation.playerId);
    const sellingClub = Object.values(state.leagues).flatMap((l: League) => l.clubs).find(c => c.id === negotiation.sellingClubId);

    useEffect(() => {
        if (fee === 0 && player) {
            setFee(player.market_value);
            setWage(Math.floor(player.salary * 1.2));
        }
    }, [player]);

    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [negotiation.dialogue_history]);

    if (!player || !sellingClub || !playerClub) return null;

    const handleSubmitFee = () => {
        const offer: TransferOffer = { fee, installments, sell_on_clause_pct: sellOn };
        dispatch({ type: 'SUBMIT_OFFER', payload: { negotiationId: negotiation.id, offer } });
        onClose();
    };

    const handleSubmitContract = () => {
        const offer: ContractOffer = { wage, duration, signing_bonus: bonus, role, release_clause: releaseClause, performance_bonus: perfBonus, yearly_wage_rise: wageRise };
        dispatch({ type: 'SUBMIT_OFFER', payload: { negotiationId: negotiation.id, offer } });
        onClose();
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
            <div className="bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl w-full max-w-6xl overflow-hidden flex flex-col h-[90vh] relative">
                
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
                            <p className="text-[10px] uppercase font-bold text-neutral-500">Patience Meter</p>
                            <div className="w-48 h-3 bg-neutral-800 rounded-full overflow-hidden mt-1 border border-neutral-700">
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
                    
                    {/* LEFT PANEL: PROPOSAL */}
                    <div className="w-5/12 p-6 border-r border-neutral-800 overflow-y-auto custom-scrollbar bg-neutral-900/30 flex flex-col">
                        <h3 className="text-white font-bold uppercase tracking-widest text-sm mb-6 flex items-center gap-2">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                            Current Proposal
                        </h3>
                        
                        {isClubStage && (
                            <div className="space-y-6 animate-in slide-in-from-left-4 duration-300">
                                <div className="bg-neutral-950 p-5 rounded-xl border border-neutral-800">
                                    <label className="flex justify-between text-xs text-neutral-400 uppercase font-bold mb-3">
                                        <span>Upfront Fee</span>
                                        <span className="text-white">£{(fee/1000000).toFixed(1)}M</span>
                                    </label>
                                    <input 
                                        type="range" min="0" max={playerClub.budget * 1.5} step={100000}
                                        className="w-full accent-emerald-500 h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer"
                                        value={fee}
                                        onChange={(e) => setFee(parseInt(e.target.value))}
                                    />
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
                                        {[0, 10, 20, 30].map(val => (
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
                            <div className="space-y-4 animate-in slide-in-from-left-4 duration-300">
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
                                </div>

                                <div>
                                    <label className="block text-xs text-neutral-400 uppercase font-bold mb-2">Contract Length</label>
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map(yr => (
                                            <button 
                                                key={yr}
                                                onClick={() => setDuration(yr)}
                                                className={`flex-1 py-2 rounded font-bold border text-xs transition-all ${duration === yr ? 'bg-blue-600 text-white border-blue-500' : 'bg-neutral-950 text-neutral-400 border-neutral-800'}`}
                                            >
                                                {yr}Y
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs text-neutral-400 uppercase font-bold mb-2">Squad Role</label>
                                    <select 
                                        className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm focus:border-emerald-500 outline-none"
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

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs text-neutral-400 uppercase font-bold mb-1">Signing Bonus</label>
                                        <input
                                            type="number" className="w-full bg-neutral-950 border border-neutral-700 rounded p-2 text-white text-sm font-mono"
                                            value={bonus} onChange={(e) => setBonus(parseInt(e.target.value))} step={10000}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-neutral-400 uppercase font-bold mb-1">Performance Bonus</label>
                                        <input
                                            type="number" className="w-full bg-neutral-950 border border-neutral-700 rounded p-2 text-white text-sm font-mono"
                                            value={perfBonus} onChange={(e) => setPerfBonus(parseInt(e.target.value))} step={1000}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs text-neutral-400 uppercase font-bold mb-1">Release Clause</label>
                                        <input
                                            type="number" className="w-full bg-neutral-950 border border-neutral-700 rounded p-2 text-white text-sm font-mono"
                                            value={releaseClause} onChange={(e) => setReleaseClause(parseInt(e.target.value))} step={1000000}
                                            placeholder="None"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-neutral-400 uppercase font-bold mb-1">Yearly Wage Rise</label>
                                        <div className="flex gap-1">
                                            {[0, 5, 10].map(val => (
                                                <button key={val} onClick={() => setWageRise(val)} className={`flex-1 py-1 rounded text-xs font-bold border ${wageRise === val ? 'bg-emerald-700 border-emerald-500' : 'bg-neutral-950 border-neutral-700'}`}>{val}%</button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="mt-auto pt-6 border-t border-white/5">
                             <div className="flex justify-between items-center mb-4">
                                 <span className="text-xs text-neutral-500 uppercase font-bold">Total Package Value</span>
                                 <span className="text-xl font-mono font-bold text-white">
                                     {isClubStage
                                        ? `£${((fee + installments + (sellOn * 100000))/1000000).toFixed(1)}M`
                                        : `£${((wage * 52 * duration) + bonus + (perfBonus * 20))/1000000}M`}
                                 </span>
                             </div>

                             <div className="flex gap-3">
                                 <button
                                     onClick={handleWithdraw}
                                     className="flex-1 py-3 rounded-lg border border-red-900/50 text-red-500 font-bold uppercase hover:bg-red-900/10 transition-colors text-xs"
                                 >
                                     End Talks
                                 </button>
                                 <button
                                     onClick={isContractStage ? handleSubmitContract : handleSubmitFee}
                                     className="flex-[2] py-3 rounded-lg bg-emerald-600 text-white font-bold uppercase hover:bg-emerald-500 transition-all shadow-lg text-xs"
                                 >
                                     Submit Offer
                                 </button>
                             </div>
                        </div>
                    </div>

                    {/* RIGHT PANEL: DIALOGUE */}
                    <div className="w-7/12 bg-neutral-950 flex flex-col relative">
                         <div className="flex-1 p-6 overflow-y-auto custom-scrollbar space-y-4">
                             <div className="flex justify-center mb-4">
                                 <span className="text-[10px] text-neutral-600 bg-neutral-900 px-3 py-1 rounded-full uppercase font-bold tracking-widest">Negotiation Started</span>
                             </div>
                             
                             {/* Initial Context Message */}
                             <div className="flex gap-3">
                                 <div className="w-8 h-8 rounded-full bg-neutral-800 flex-shrink-0 flex items-center justify-center text-lg border border-neutral-700">
                                     {isContractStage ? '🕴️' : '🏢'}
                                 </div>
                                 <div className="bg-neutral-900 border border-neutral-800 p-3 rounded-2xl rounded-tl-none max-w-[80%]">
                                     <p className="text-neutral-300 text-sm">
                                         {isContractStage
                                            ? `We are ready to discuss terms for ${player.name}. He expects a salary reflecting his status as a ${negotiation.ai_valuation?.demanded_role}.`
                                            : `We value ${player.name} at approximately £${(negotiation.ai_valuation?.min_fee! / 1000000).toFixed(1)}M. Make a serious offer.`}
                                     </p>
                                 </div>
                             </div>

                             {negotiation.dialogue_history?.map((msg, idx) => (
                                 <div key={idx} className={`flex gap-3 ${msg.speaker === 'club' ? 'flex-row-reverse' : ''}`}>
                                     <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-lg border ${msg.speaker === 'club' ? 'bg-blue-900 border-blue-700' : 'bg-neutral-800 border-neutral-700'}`}>
                                         {msg.speaker === 'club' ? '💼' : (isContractStage ? '🕴️' : '🏢')}
                                     </div>
                                     <div className={`p-3 rounded-2xl max-w-[80%] border ${
                                         msg.speaker === 'club'
                                            ? 'bg-blue-900/20 border-blue-800/50 rounded-tr-none'
                                            : `bg-neutral-900 border-neutral-800 rounded-tl-none ${msg.sentiment === 'positive' ? 'border-l-4 border-l-emerald-500' : msg.sentiment === 'negative' ? 'border-l-4 border-l-red-500' : ''}`
                                     }`}>
                                         <p className="text-neutral-300 text-sm">{msg.text}</p>
                                     </div>
                                 </div>
                             ))}

                             {negotiation.status === 'collapsed' && (
                                 <div className="flex justify-center mt-4">
                                     <span className="text-xs text-red-500 font-bold uppercase border border-red-900/50 bg-red-900/10 px-4 py-2 rounded">Negotiation Collapsed</span>
                                 </div>
                             )}

                             <div ref={chatEndRef}></div>
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
