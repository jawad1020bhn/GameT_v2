
import React, { useState, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { upgradeFacility } from '../../services/engine';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { SponsorDeal, JuniorCandidate, Player } from '../../types';
import { YouthEngine } from '../../services/YouthEngine';
import { generatePlayer } from '../../constants';

export const Headquarters: React.FC = () => {
    const { playerClub, dispatch, state } = useGame();
    const [activeTab, setActiveTab] = useState<'facilities' | 'finance' | 'commercial' | 'stadium' | 'boardroom' | 'staff' | 'youth'>('facilities');

    // Lazy load youth candidates
    useEffect(() => {
        if (playerClub && (!playerClub.junior_candidates || playerClub.junior_candidates.length === 0)) {
            playerClub.junior_candidates = YouthEngine.generateCandidates(playerClub);
            // We don't dispatch here to avoid render loops, but it persists in ref if we navigate away
        }
    }, [playerClub]);

    if (!playerClub) return null;

    const formatMoney = (amount: number) => `£${(amount / 1000000).toFixed(2)}M`;
    const formatMoneyK = (amount: number) => `£${(amount / 1000).toFixed(0)}k`;

    // --- ACTIONS ---
    const handleUpgrade = (type: 'youth_academy' | 'training_ground' | 'medical_center') => {
        if (upgradeFacility(playerClub, type)) {
            dispatch({ type: 'UPDATE_STATE', payload: { ...state } }); // Force re-render logic handled via context update
        }
    };

    const handleSignYouth = (candidate: JuniorCandidate) => {
        if (playerClub.budget < candidate.signing_cost) return;

        playerClub.budget -= candidate.signing_cost;
        playerClub.junior_candidates = playerClub.junior_candidates.filter(c => c.id !== candidate.id);

        const newId = Date.now();
        const player: Player = generatePlayer(newId, playerClub.id, candidate.position as any, candidate.true_potential - 15, 16);
        // Adjust potential to match candidate
        player.potential = candidate.true_potential;
        player.name = candidate.name;
        player.squad_role = 'prospect';

        playerClub.players.push(player);

        dispatch({ type: 'UPDATE_STATE', payload: { ...state } });
    };

    const acceptSponsor = (offer: SponsorDeal) => {
        playerClub.sponsorships.active.push(offer);
        playerClub.sponsorships.offers = playerClub.sponsorships.offers.filter(o => o.id !== offer.id);
        // Immediate cash bonus just for fun/gameplay loop
        playerClub.budget += offer.amount_per_season * 0.5;
        dispatch({ type: 'UPDATE_STATE', payload: { ...state } });
    };

    const handleTicketChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newPrice = parseInt(e.target.value);
        const oldPrice = playerClub.infrastructure.stadium.ticket_price;

        // FAN DYNAMICS: Hiking prices drops happiness
        if (newPrice > oldPrice) {
            const diff = newPrice - oldPrice;
            playerClub.fan_happiness = Math.max(0, playerClub.fan_happiness - diff); // 1 happiness per pound
        }

        playerClub.infrastructure.stadium.ticket_price = newPrice;
        dispatch({ type: 'UPDATE_STATE', payload: { ...state } });
    };

    const updateStrategy = (key: string, value: any) => {
        if (!playerClub.financial_strategy) return;
        playerClub.financial_strategy = { ...playerClub.financial_strategy, [key]: value };
        dispatch({ type: 'UPDATE_STATE', payload: { ...state } });
    };

    // --- COMPONENTS ---

    const FacilityCard = ({ id, data, icon }: { id: 'youth_academy' | 'training_ground' | 'medical_center', data: any, icon: React.ReactNode }) => (
        <div className="bg-neutral-900 rounded-xl border border-white/10 p-6 shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">{icon}</div>

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-white font-oswald uppercase">{data.name}</h3>
                    <div className="bg-neutral-950 px-3 py-1 rounded border border-neutral-700 text-xs font-mono text-emerald-400">
                        Level {data.level} <span className="text-neutral-600">/ {data.max_level}</span>
                    </div>
                </div>

                <p className="text-sm text-neutral-400 mb-6 h-10">{data.description}</p>

                {data.is_upgrading ? (
                    <div className="bg-neutral-950/50 p-4 rounded border border-blue-900/50">
                        <div className="flex justify-between text-xs font-bold uppercase text-blue-400 mb-2">
                            <span>Under Construction</span>
                            <span>{Math.ceil(data.weeks_remaining)} weeks left</span>
                        </div>
                        <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 animate-pulse" style={{ width: '60%' }}></div>
                        </div>
                    </div>
                ) : (
                    <div>
                        <div className="flex justify-between text-xs mb-2">
                            <span className="text-neutral-500 uppercase font-bold">Upgrade Cost</span>
                            <span className="text-white font-mono">{formatMoney(data.next_upgrade_cost)}</span>
                        </div>
                        <div className="flex justify-between text-xs mb-4">
                            <span className="text-neutral-500 uppercase font-bold">Duration</span>
                            <span className="text-white font-mono">{data.next_upgrade_weeks} Weeks</span>
                        </div>
                        <button
                            onClick={() => handleUpgrade(id)}
                            disabled={playerClub.budget < data.next_upgrade_cost || data.level >= data.max_level}
                            className="w-full py-3 rounded bg-emerald-600 hover:bg-emerald-500 disabled:bg-neutral-800 disabled:text-neutral-500 disabled:cursor-not-allowed text-white font-bold uppercase tracking-widest transition-colors shadow-lg"
                        >
                            {data.level >= data.max_level ? 'Max Level Reached' : 'Start Construction'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );

    const StaffCard = ({ staff }: { staff: any }) => (
        <div className="bg-neutral-900 rounded-xl border border-white/10 p-6 shadow-lg relative overflow-hidden group">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-xl font-bold text-white font-oswald uppercase">{staff.name}</h3>
                    <p className="text-emerald-500 text-xs font-bold uppercase tracking-widest">{staff.role.replace('_', ' ')}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-500 font-bold text-xl">
                    {staff.name.charAt(0)}
                </div>
            </div>

            <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center text-sm">
                    <span className="text-neutral-400">Coaching</span>
                    <div className="flex items-center gap-2">
                        <div className="w-24 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500" style={{ width: `${staff.attributes.coaching}%` }}></div>
                        </div>
                        <span className="text-white font-mono text-xs w-6 text-right">{staff.attributes.coaching}</span>
                    </div>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <span className="text-neutral-400">Judging</span>
                    <div className="flex items-center gap-2">
                        <div className="w-24 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                            <div className="h-full bg-yellow-500" style={{ width: `${staff.attributes.judging}%` }}></div>
                        </div>
                        <span className="text-white font-mono text-xs w-6 text-right">{staff.attributes.judging}</span>
                    </div>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <span className="text-neutral-400">Healing</span>
                    <div className="flex items-center gap-2">
                        <div className="w-24 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                            <div className="h-full bg-red-500" style={{ width: `${staff.attributes.healing}%` }}></div>
                        </div>
                        <span className="text-white font-mono text-xs w-6 text-right">{staff.attributes.healing}</span>
                    </div>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <span className="text-neutral-400">Man Mgmt</span>
                    <div className="flex items-center gap-2">
                        <div className="w-24 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                            <div className="h-full bg-purple-500" style={{ width: `${staff.attributes.man_management}%` }}></div>
                        </div>
                        <span className="text-white font-mono text-xs w-6 text-right">{staff.attributes.man_management}</span>
                    </div>
                </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex justify-between items-center text-xs">
                <span className="text-neutral-500 uppercase font-bold">Contract</span>
                <span className="text-white font-mono">£{staff.salary.toLocaleString()}/yr</span>
            </div>
        </div>
    );

    return (
        <div className="p-6 h-full flex flex-col">
            <div className="flex justify-between items-end mb-6">
                <div>
                    <h2 className="text-4xl font-bold text-white font-oswald uppercase tracking-tight">Club Operations</h2>
                    <p className="text-neutral-400 text-sm font-mono">Facilities & Finance</p>
                </div>
                <div className="flex gap-2 bg-neutral-900 p-1 rounded-lg border border-white/10 overflow-x-auto max-w-2xl">
                    {['facilities', 'finance', 'commercial', 'stadium', 'boardroom', 'staff', 'youth'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`px-4 py-2 rounded font-bold uppercase text-xs transition-all whitespace-nowrap ${activeTab === tab ? 'bg-emerald-600 text-white shadow' : 'text-neutral-400 hover:text-white hover:bg-neutral-800'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">

                {/* FACILITIES TAB */}
                {activeTab === 'facilities' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FacilityCard
                            id="youth_academy"
                            data={playerClub.infrastructure.youth_academy}
                            icon={<svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z" /></svg>}
                        />
                        <FacilityCard
                            id="training_ground"
                            data={playerClub.infrastructure.training_ground}
                            icon={<svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29z" /></svg>}
                        />
                        <FacilityCard
                            id="medical_center"
                            data={playerClub.infrastructure.medical_center}
                            icon={<svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-1.99.9-1.99 2L3 19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 11h-4v4h-4v-4H6v-4h4V6h4v4h4v4z" /></svg>}
                        />
                    </div>
                )}

                {/* FINANCE TAB */}
                {activeTab === 'finance' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">

                        {/* Strategy & Bank Controls */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 bg-neutral-900 rounded-xl border border-white/10 p-6 shadow-lg">
                                <h3 className="text-white font-bold uppercase tracking-widest text-sm mb-6 flex items-center gap-2">
                                    Financial Strategy
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-neutral-500 uppercase mb-2">Ticket Pricing Policy</label>
                                        <select
                                            value={playerClub.financial_strategy?.ticket_pricing || 'normal'}
                                            onChange={(e) => updateStrategy('ticket_pricing', e.target.value)}
                                            className="w-full bg-neutral-950 text-white text-sm p-3 rounded border border-neutral-800 focus:border-emerald-500 outline-none"
                                        >
                                            <option value="very_low">Very Low (Max Attendance)</option>
                                            <option value="low">Low</option>
                                            <option value="normal">Normal</option>
                                            <option value="high">High</option>
                                            <option value="very_high">Very High (Max Revenue)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-neutral-500 uppercase mb-2">Merchandise Focus</label>
                                        <select
                                            value={playerClub.financial_strategy?.merchandise_focus || 'local'}
                                            onChange={(e) => updateStrategy('merchandise_focus', e.target.value)}
                                            className="w-full bg-neutral-950 text-white text-sm p-3 rounded border border-neutral-800 focus:border-emerald-500 outline-none"
                                        >
                                            <option value="local">Local (Low Cost)</option>
                                            <option value="national">National (Medium Cost)</option>
                                            <option value="global">Global (High Cost/High Reward)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-neutral-500 uppercase mb-2">Debt Repayment</label>
                                        <select
                                            value={playerClub.financial_strategy?.debt_repayment || 'balanced'}
                                            onChange={(e) => updateStrategy('debt_repayment', e.target.value)}
                                            className="w-full bg-neutral-950 text-white text-sm p-3 rounded border border-neutral-800 focus:border-emerald-500 outline-none"
                                        >
                                            <option value="minimum">Minimum</option>
                                            <option value="balanced">Balanced</option>
                                            <option value="aggressive">Aggressive</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Bank Operations */}
                            <div className="bg-neutral-900 rounded-xl border border-white/10 p-6 shadow-lg">
                                <h3 className="text-white font-bold uppercase tracking-widest text-sm mb-6 flex items-center gap-2">
                                    Bank Operations
                                </h3>
                                <div className="space-y-4">
                                    <div className="bg-neutral-950 p-4 rounded border border-neutral-800">
                                        <p className="text-xs text-neutral-500 uppercase font-bold mb-1">Current Debt</p>
                                        <p className="text-2xl font-mono font-bold text-red-400">{formatMoney(playerClub.debt)}</p>
                                        <p className="text-[10px] text-neutral-600 mt-1">Interest Rate: 5.0% APR</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => {
                                                playerClub.debt += 5000000;
                                                playerClub.budget += 5000000;
                                                dispatch({ type: 'UPDATE_STATE', payload: { ...state } });
                                            }}
                                            className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 rounded text-[10px] font-bold uppercase text-white transition-colors"
                                        >
                                            Borrow £5M
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (playerClub.budget >= 5000000 && playerClub.debt >= 5000000) {
                                                    playerClub.debt -= 5000000;
                                                    playerClub.budget -= 5000000;
                                                    dispatch({ type: 'UPDATE_STATE', payload: { ...state } });
                                                }
                                            }}
                                            disabled={playerClub.budget < 5000000 || playerClub.debt < 5000000}
                                            className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-neutral-800 disabled:text-neutral-600 rounded text-[10px] font-bold uppercase text-white transition-colors"
                                        >
                                            Repay £5M
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Top Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-neutral-900 p-5 rounded-xl border border-white/10 shadow-md">
                                <div className="text-neutral-500 text-xs font-bold uppercase mb-1">Current Balance</div>
                                <div className="text-2xl font-mono font-bold text-emerald-400">{formatMoney(playerClub.budget)}</div>
                                <div className="text-[10px] text-neutral-600 mt-1">Available now</div>
                            </div>
                            <div className="bg-neutral-900 p-5 rounded-xl border border-white/10 shadow-md">
                                <div className="text-neutral-500 text-xs font-bold uppercase mb-1">Cash Reserves</div>
                                <div className="text-2xl font-mono font-bold text-blue-400">{formatMoney(playerClub.cash_reserves)}</div>
                                <div className="text-[10px] text-neutral-600 mt-1">Emergency fund</div>
                            </div>
                            <div className="bg-neutral-900 p-5 rounded-xl border border-white/10 shadow-md">
                                <div className="text-neutral-500 text-xs font-bold uppercase mb-1">Outstanding Debt</div>
                                <div className="text-2xl font-mono font-bold text-red-400">{formatMoney(playerClub.debt)}</div>
                                <div className="text-[10px] text-neutral-600 mt-1">Long-term obligations</div>
                            </div>
                            <div className="bg-neutral-900 p-5 rounded-xl border border-white/10 shadow-md relative overflow-hidden">
                                <div className="text-neutral-500 text-xs font-bold uppercase mb-1">YTD Profit/Loss</div>
                                <div className={`text-2xl font-mono font-bold ${(playerClub.season_financials.transfer_income +
                                    playerClub.season_financials.matchday_income +
                                    playerClub.season_financials.tv_income +
                                    playerClub.season_financials.merchandise_income +
                                    playerClub.season_financials.sponsorship_income +
                                    playerClub.season_financials.prize_money +
                                    playerClub.season_financials.friendly_match_income +
                                    playerClub.season_financials.hospitality_income +
                                    playerClub.season_financials.parking_revenue -
                                    playerClub.season_financials.transfer_spend -
                                    playerClub.season_financials.wage_bill -
                                    playerClub.season_financials.facility_maintenance -
                                    playerClub.season_financials.scouting_costs -
                                    playerClub.season_financials.coaching_staff_wages -
                                    playerClub.season_financials.administrative_staff_wages -
                                    playerClub.season_financials.medical_staff_wages -
                                    playerClub.season_financials.security_costs -
                                    playerClub.season_financials.utilities_costs -
                                    playerClub.season_financials.insurance_premiums -
                                    playerClub.season_financials.travel_costs -
                                    playerClub.season_financials.catering_costs -
                                    playerClub.season_financials.kit_equipment_costs -
                                    playerClub.season_financials.agent_fees -
                                    playerClub.season_financials.loan_repayments -
                                    playerClub.season_financials.tax_obligations -
                                    playerClub.season_financials.league_fees -
                                    playerClub.season_financials.legal_fees -
                                    playerClub.season_financials.marketing_costs -
                                    playerClub.season_financials.charity_contributions
                                ) >= 0 ? 'text-emerald-400' : 'text-red-500'}`}>
                                    {formatMoney(
                                        playerClub.season_financials.transfer_income +
                                        playerClub.season_financials.matchday_income +
                                        playerClub.season_financials.tv_income +
                                        playerClub.season_financials.merchandise_income +
                                        playerClub.season_financials.sponsorship_income +
                                        playerClub.season_financials.prize_money +
                                        playerClub.season_financials.friendly_match_income +
                                        playerClub.season_financials.hospitality_income +
                                        playerClub.season_financials.parking_revenue -
                                        playerClub.season_financials.transfer_spend -
                                        playerClub.season_financials.wage_bill -
                                        playerClub.season_financials.facility_maintenance -
                                        playerClub.season_financials.scouting_costs -
                                        playerClub.season_financials.coaching_staff_wages -
                                        playerClub.season_financials.administrative_staff_wages -
                                        playerClub.season_financials.medical_staff_wages -
                                        playerClub.season_financials.security_costs -
                                        playerClub.season_financials.utilities_costs -
                                        playerClub.season_financials.insurance_premiums -
                                        playerClub.season_financials.travel_costs -
                                        playerClub.season_financials.catering_costs -
                                        playerClub.season_financials.kit_equipment_costs -
                                        playerClub.season_financials.agent_fees -
                                        playerClub.season_financials.loan_repayments -
                                        playerClub.season_financials.tax_obligations -
                                        playerClub.season_financials.league_fees -
                                        playerClub.season_financials.legal_fees -
                                        playerClub.season_financials.marketing_costs -
                                        playerClub.season_financials.charity_contributions
                                    )}
                                </div>
                                <div className="text-[10px] text-neutral-600 mt-1">Year to date</div>
                            </div>
                        </div>

                        {/* Revenue & Expenses Detailed Breakdown */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                            {/* Revenue Streams */}
                            <div className="bg-neutral-900 rounded-xl border border-white/10 p-6 shadow-lg">
                                <h3 className="text-emerald-400 font-bold uppercase tracking-widest text-sm mb-6 border-b border-white/10 pb-2 flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" /><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" /></svg>
                                    Revenue Streams (YTD)
                                </h3>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-sm bg-neutral-950 p-3 rounded">
                                        <span className="text-neutral-400">Broadcasting Rights</span>
                                        <span className="text-emerald-400 font-mono font-bold">+{formatMoney(playerClub.season_financials.tv_income)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm bg-neutral-950 p-3 rounded">
                                        <span className="text-neutral-400">Matchday Revenue</span>
                                        <span className="text-emerald-400 font-mono font-bold">+{formatMoney(playerClub.season_financials.matchday_income)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm bg-neutral-950 p-3 rounded">
                                        <span className="text-neutral-400">Sponsorship Deals</span>
                                        <span className="text-emerald-400 font-mono font-bold">+{formatMoney(playerClub.season_financials.sponsorship_income)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm bg-neutral-950 p-3 rounded">
                                        <span className="text-neutral-400">Merchandise Sales</span>
                                        <span className="text-emerald-400 font-mono font-bold">+{formatMoney(playerClub.season_financials.merchandise_income)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm bg-neutral-950 p-3 rounded">
                                        <span className="text-neutral-400">Prize Money</span>
                                        <span className="text-emerald-400 font-mono font-bold">+{formatMoney(playerClub.season_financials.prize_money)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm bg-neutral-950 p-3 rounded">
                                        <span className="text-neutral-400">Transfer Sales</span>
                                        <span className="text-emerald-400 font-mono font-bold">+{formatMoney(playerClub.season_financials.transfer_income)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm bg-neutral-950 p-3 rounded">
                                        <span className="text-neutral-400">Hospitality & VIP</span>
                                        <span className="text-emerald-400 font-mono font-bold">+{formatMoney(playerClub.season_financials.hospitality_income)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm bg-neutral-950 p-3 rounded">
                                        <span className="text-neutral-400">Friendly Matches</span>
                                        <span className="text-emerald-400 font-mono font-bold">+{formatMoney(playerClub.season_financials.friendly_match_income)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm bg-neutral-950 p-3 rounded">
                                        <span className="text-neutral-400">Parking Revenue</span>
                                        <span className="text-emerald-400 font-mono font-bold">+{formatMoney(playerClub.season_financials.parking_revenue)}</span>
                                    </div>

                                    <div className="flex justify-between items-center text-sm border-t border-white/10 pt-3 mt-4">
                                        <span className="text-white font-bold uppercase">Total Revenue</span>
                                        <span className="text-emerald-400 font-mono font-bold text-lg">
                                            +{formatMoney(
                                                playerClub.season_financials.transfer_income +
                                                playerClub.season_financials.matchday_income +
                                                playerClub.season_financials.tv_income +
                                                playerClub.season_financials.merchandise_income +
                                                playerClub.season_financials.sponsorship_income +
                                                playerClub.season_financials.prize_money +
                                                playerClub.season_financials.friendly_match_income +
                                                playerClub.season_financials.hospitality_income +
                                                playerClub.season_financials.parking_revenue
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Operating Expenses */}
                            <div className="bg-neutral-900 rounded-xl border border-white/10 p-6 shadow-lg">
                                <h3 className="text-red-400 font-bold uppercase tracking-widest text-sm mb-6 border-b border-white/10 pb-2 flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                    Operating Expenses (YTD)
                                </h3>

                                <div className="space-y-2">
                                    <div className="bg-neutral-950 p-3 rounded">
                                        <p className="text-[10px] text-neutral-500 font-bold uppercase mb-2">Personnel</p>
                                        <div className="space-y-1.5">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-neutral-400">Player Wages</span>
                                                <span className="text-red-400 font-mono">-{formatMoney(playerClub.season_financials.wage_bill)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-neutral-400">Coaching Staff</span>
                                                <span className="text-red-400 font-mono">-{formatMoney(playerClub.season_financials.coaching_staff_wages)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-neutral-400">Medical Staff</span>
                                                <span className="text-red-400 font-mono">-{formatMoney(playerClub.season_financials.medical_staff_wages)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-neutral-400">Admin Staff</span>
                                                <span className="text-red-400 font-mono">-{formatMoney(playerClub.season_financials.administrative_staff_wages)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-neutral-950 p-3 rounded">
                                        <p className="text-[10px] text-neutral-500 font-bold uppercase mb-2">Infrastructure</p>
                                        <div className="space-y-1.5">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-neutral-400">Facility Maintenance</span>
                                                <span className="text-red-400 font-mono">-{formatMoney(playerClub.season_financials.facility_maintenance)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-neutral-400">Utilities</span>
                                                <span className="text-red-400 font-mono">-{formatMoney(playerClub.season_financials.utilities_costs)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-neutral-400">Security</span>
                                                <span className="text-red-400 font-mono">-{formatMoney(playerClub.season_financials.security_costs)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-neutral-950 p-3 rounded">
                                        <p className="text-[10px] text-neutral-500 font-bold uppercase mb-2">Operations</p>
                                        <div className="space-y-1.5">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-neutral-400">Transfer Purchases</span>
                                                <span className="text-red-400 font-mono">-{formatMoney(playerClub.season_financials.transfer_spend)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-neutral-400">Agent Fees</span>
                                                <span className="text-red-400 font-mono">-{formatMoney(playerClub.season_financials.agent_fees)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-neutral-400">Scouting Network</span>
                                                <span className="text-red-400 font-mono">-{formatMoney(playerClub.season_financials.scouting_costs)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-neutral-400">Travel & Logistics</span>
                                                <span className="text-red-400 font-mono">-{formatMoney(playerClub.season_financials.travel_costs)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-neutral-400">Catering</span>
                                                <span className="text-red-400 font-mono">-{formatMoney(playerClub.season_financials.catering_costs)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-neutral-400">Kit & Equipment</span>
                                                <span className="text-red-400 font-mono">-{formatMoney(playerClub.season_financials.kit_equipment_costs)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-neutral-400">Marketing</span>
                                                <span className="text-red-400 font-mono">-{formatMoney(playerClub.season_financials.marketing_costs)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-neutral-950 p-3 rounded">
                                        <p className="text-[10px] text-neutral-500 font-bold uppercase mb-2">Obligations</p>
                                        <div className="space-y-1.5">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-neutral-400">Insurance</span>
                                                <span className="text-red-400 font-mono">-{formatMoney(playerClub.season_financials.insurance_premiums)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-neutral-400">Tax Obligations</span>
                                                <span className="text-red-400 font-mono">-{formatMoney(playerClub.season_financials.tax_obligations)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-neutral-400">Loan Repayments</span>
                                                <span className="text-red-400 font-mono">-{formatMoney(playerClub.season_financials.loan_repayments)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-neutral-400">League Fees</span>
                                                <span className="text-red-400 font-mono">-{formatMoney(playerClub.season_financials.league_fees)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-neutral-400">Legal Fees</span>
                                                <span className="text-red-400 font-mono">-{formatMoney(playerClub.season_financials.legal_fees)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-neutral-400">Charity</span>
                                                <span className="text-red-400 font-mono">-{formatMoney(playerClub.season_financials.charity_contributions)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center text-sm border-t border-white/10 pt-3 mt-4">
                                        <span className="text-white font-bold uppercase">Total Expenses</span>
                                        <span className="text-red-400 font-mono font-bold text-lg">
                                            -{formatMoney(
                                                playerClub.season_financials.transfer_spend +
                                                playerClub.season_financials.wage_bill +
                                                playerClub.season_financials.facility_maintenance +
                                                playerClub.season_financials.scouting_costs +
                                                playerClub.season_financials.coaching_staff_wages +
                                                playerClub.season_financials.administrative_staff_wages +
                                                playerClub.season_financials.medical_staff_wages +
                                                playerClub.season_financials.security_costs +
                                                playerClub.season_financials.utilities_costs +
                                                playerClub.season_financials.insurance_premiums +
                                                playerClub.season_financials.travel_costs +
                                                playerClub.season_financials.catering_costs +
                                                playerClub.season_financials.kit_equipment_costs +
                                                playerClub.season_financials.agent_fees +
                                                playerClub.season_financials.loan_repayments +
                                                playerClub.season_financials.tax_obligations +
                                                playerClub.season_financials.league_fees +
                                                playerClub.season_financials.legal_fees +
                                                playerClub.season_financials.marketing_costs +
                                                playerClub.season_financials.charity_contributions
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Financial Health Metrics */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-neutral-900 rounded-xl border border-white/10 p-6 shadow-lg">
                                <h3 className="text-neutral-400 text-xs font-bold uppercase mb-3">Profit Margin</h3>
                                <div className="text-3xl font-mono font-bold text-white mb-2">
                                    {(() => {
                                        const revenue = playerClub.season_financials.transfer_income + playerClub.season_financials.matchday_income + playerClub.season_financials.tv_income + playerClub.season_financials.merchandise_income + playerClub.season_financials.sponsorship_income + playerClub.season_financials.prize_money + playerClub.season_financials.friendly_match_income + playerClub.season_financials.hospitality_income + playerClub.season_financials.parking_revenue;
                                        const expenses = playerClub.season_financials.transfer_spend + playerClub.season_financials.wage_bill + playerClub.season_financials.facility_maintenance + playerClub.season_financials.scouting_costs + playerClub.season_financials.coaching_staff_wages + playerClub.season_financials.administrative_staff_wages + playerClub.season_financials.medical_staff_wages + playerClub.season_financials.security_costs + playerClub.season_financials.utilities_costs + playerClub.season_financials.insurance_premiums + playerClub.season_financials.travel_costs + playerClub.season_financials.catering_costs + playerClub.season_financials.kit_equipment_costs + playerClub.season_financials.agent_fees + playerClub.season_financials.loan_repayments + playerClub.season_financials.tax_obligations + playerClub.season_financials.league_fees + playerClub.season_financials.legal_fees + playerClub.season_financials.marketing_costs + playerClub.season_financials.charity_contributions;
                                        const margin = revenue > 0 ? ((revenue - expenses) / revenue * 100) : 0;
                                        return `${margin.toFixed(1)}%`;
                                    })()}
                                </div>
                                <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden">
                                    <div className={`h-full ${(() => {
                                        const revenue = playerClub.season_financials.transfer_income + playerClub.season_financials.matchday_income + playerClub.season_financials.tv_income + playerClub.season_financials.merchandise_income + playerClub.season_financials.sponsorship_income + playerClub.season_financials.prize_money + playerClub.season_financials.friendly_match_income + playerClub.season_financials.hospitality_income + playerClub.season_financials.parking_revenue;
                                        const expenses = playerClub.season_financials.transfer_spend + playerClub.season_financials.wage_bill + playerClub.season_financials.facility_maintenance + playerClub.season_financials.scouting_costs + playerClub.season_financials.coaching_staff_wages + playerClub.season_financials.administrative_staff_wages + playerClub.season_financials.medical_staff_wages + playerClub.season_financials.security_costs + playerClub.season_financials.utilities_costs + playerClub.season_financials.insurance_premiums + playerClub.season_financials.travel_costs + playerClub.season_financials.catering_costs + playerClub.season_financials.kit_equipment_costs + playerClub.season_financials.agent_fees + playerClub.season_financials.loan_repayments + playerClub.season_financials.tax_obligations + playerClub.season_financials.league_fees + playerClub.season_financials.legal_fees + playerClub.season_financials.marketing_costs + playerClub.season_financials.charity_contributions;
                                        const margin = revenue > 0 ? ((revenue - expenses) / revenue) : 0;
                                        return margin >= 0 ? 'bg-emerald-500' : 'bg-red-500';
                                    })()}`} style={{
                                        width: `${(() => {
                                            const revenue = playerClub.season_financials.transfer_income + playerClub.season_financials.matchday_income + playerClub.season_financials.tv_income + playerClub.season_financials.merchandise_income + playerClub.season_financials.sponsorship_income + playerClub.season_financials.prize_money + playerClub.season_financials.friendly_match_income + playerClub.season_financials.hospitality_income + playerClub.season_financials.parking_revenue;
                                            const expenses = playerClub.season_financials.transfer_spend + playerClub.season_financials.wage_bill + playerClub.season_financials.facility_maintenance + playerClub.season_financials.scouting_costs + playerClub.season_financials.coaching_staff_wages + playerClub.season_financials.administrative_staff_wages + playerClub.season_financials.medical_staff_wages + playerClub.season_financials.security_costs + playerClub.season_financials.utilities_costs + playerClub.season_financials.insurance_premiums + playerClub.season_financials.travel_costs + playerClub.season_financials.catering_costs + playerClub.season_financials.kit_equipment_costs + playerClub.season_financials.agent_fees + playerClub.season_financials.loan_repayments + playerClub.season_financials.tax_obligations + playerClub.season_financials.league_fees + playerClub.season_financials.legal_fees + playerClub.season_financials.marketing_costs + playerClub.season_financials.charity_contributions;
                                            const margin = revenue > 0 ? Math.abs((revenue - expenses) / revenue * 100) : 0;
                                            return Math.min(100, margin);
                                        })()}%`
                                    }}></div>
                                </div>
                            </div>

                            <div className="bg-neutral-900 rounded-xl border border-white/10 p-6 shadow-lg">
                                <h3 className="text-neutral-400 text-xs font-bold uppercase mb-3">Revenue Diversity</h3>
                                <div className="text-3xl font-mono font-bold text-white mb-2">
                                    {(() => {
                                        const sources = [
                                            playerClub.season_financials.tv_income,
                                            playerClub.season_financials.matchday_income,
                                            playerClub.season_financials.sponsorship_income,
                                            playerClub.season_financials.merchandise_income,
                                        ].filter(v => v > 0).length;
                                        return sources > 0 ? `${sources}/4` : '0/4';
                                    })()}
                                </div>
                                <p className="text-xs text-neutral-500">Active revenue streams</p>
                            </div>

                            <div className="bg-neutral-900 rounded-xl border border-white/10 p-6 shadow-lg">
                                <h3 className="text-neutral-400 text-xs font-bold uppercase mb-3">Cash Runway</h3>
                                <div className="text-3xl font-mono font-bold text-white mb-2">
                                    {(() => {
                                        const weeklyBurn = playerClub.wage_budget_weekly + (playerClub.infrastructure.stadium.maintenance_cost / 52);
                                        const weeks = weeklyBurn > 0 ? Math.floor(playerClub.budget / weeklyBurn) : 999;
                                        return weeks > 52 ? '52+ wks' : `${weeks} wks`;
                                    })()}
                                </div>
                                <p className="text-xs text-neutral-500">At current burn rate</p>
                            </div>
                        </div>

                        {/* Historical Balance Chart */}
                        <div className="bg-neutral-900 p-6 rounded-xl border border-white/10 shadow-xl h-80">
                            <h3 className="text-white font-bold uppercase mb-4">Historical Balance</h3>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={playerClub.financial_history}>
                                    <defs>
                                        <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                                    <XAxis dataKey="date" stroke="#525252" fontSize={10} />
                                    <YAxis stroke="#525252" fontSize={10} tickFormatter={(val) => `£${val / 1000000}M`} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#171717', borderColor: '#404040' }}
                                        formatter={(value: any) => [`£${(value / 1000000).toFixed(1)}M`, 'Balance']}
                                    />
                                    <Area type="monotone" dataKey="balance" stroke="#10b981" fillOpacity={1} fill="url(#colorBalance)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Next Season Projection */}
                        <div className="bg-gradient-to-br from-blue-950/30 to-neutral-900 rounded-xl border border-blue-900/30 p-6 shadow-lg">
                            <h3 className="text-blue-400 font-bold uppercase tracking-widest text-sm mb-6 border-b border-blue-900/30 pb-2">Next Season Financial Projection</h3>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-neutral-950/50 p-4 rounded border border-neutral-800">
                                    <p className="text-xs text-neutral-500 uppercase font-bold mb-1">Current Budget</p>
                                    <p className="text-2xl font-mono font-bold text-white">{formatMoney(playerClub.budget)}</p>
                                </div>

                                <div className="bg-neutral-950/50 p-4 rounded border border-neutral-800">
                                    <p className="text-xs text-neutral-500 uppercase font-bold mb-1">Projected Annual Costs</p>
                                    <p className="text-2xl font-mono font-bold text-red-400">
                                        -{formatMoney(playerClub.wage_budget_weekly * 52)}
                                    </p>
                                    <p className="text-[10px] text-neutral-600 mt-1">Wages only (52 weeks)</p>
                                </div>

                                <div className="bg-neutral-950/50 p-4 rounded border border-emerald-900/30">
                                    <p className="text-xs text-neutral-500 uppercase font-bold mb-1">Est. Starting Budget</p>
                                    <p className="text-2xl font-mono font-bold text-emerald-400">
                                        {formatMoney(playerClub.budget + (playerClub.sponsorships.active.reduce((acc, s) => acc + s.amount_per_season, 0) - (playerClub.wage_budget_weekly * 52)))}
                                    </p>
                                    <p className="text-[10px] text-neutral-600 mt-1">With sponsorships</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* COMMERCIAL TAB */}
                {activeTab === 'commercial' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Active Deals */}
                        <div className="bg-neutral-900 rounded-xl border border-white/10 p-6">
                            <h3 className="text-emerald-500 font-bold uppercase tracking-widest mb-6">Active Partnerships</h3>
                            <div className="space-y-4">
                                {playerClub.sponsorships.active.map(s => (
                                    <div key={s.id} className="bg-neutral-950 p-4 rounded border border-neutral-800 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded bg-white flex items-center justify-center text-neutral-900 font-bold">
                                                {s.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-white font-bold text-sm">{s.name}</p>
                                                <p className="text-xs text-neutral-500 uppercase">{s.type.replace('_', ' ')}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-emerald-400 font-mono font-bold">{formatMoney(s.amount_per_season)}/yr</p>
                                            <p className="text-xs text-neutral-500">{s.years_remaining} Years Left</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Offers */}
                        <div className="bg-neutral-900 rounded-xl border border-white/10 p-6">
                            <h3 className="text-yellow-500 font-bold uppercase tracking-widest mb-6">Sponsorship Offers</h3>
                            <div className="space-y-4">
                                {playerClub.sponsorships.offers.length === 0 ? (
                                    <div className="text-center text-neutral-600 italic py-12">No commercial offers available. Improve reputation to attract partners.</div>
                                ) : (
                                    playerClub.sponsorships.offers.map(offer => (
                                        <div key={offer.id} className="bg-neutral-950 p-4 rounded border border-neutral-800 hover:border-yellow-500/50 transition-colors">
                                            <div className="flex justify-between mb-3">
                                                <span className="font-bold text-white">{offer.name}</span>
                                                <span className="text-xs bg-neutral-800 px-2 py-1 rounded text-neutral-400 uppercase">{offer.type.replace('_', ' ')}</span>
                                            </div>
                                            <div className="flex justify-between text-sm mb-4">
                                                <span className="text-neutral-400">Value: <span className="text-emerald-400 font-mono">{formatMoney(offer.amount_per_season)}</span></span>
                                                <span className="text-neutral-400">Duration: <span className="text-white font-mono">{offer.years_remaining} Yrs</span></span>
                                            </div>
                                            {offer.bonus_condition && (
                                                <div className="bg-neutral-900 p-2 rounded text-xs text-neutral-300 mb-3 border border-neutral-800">
                                                    Bonus: {formatMoney(offer.bonus_amount || 0)} if {offer.bonus_condition.replace('_', ' ')}
                                                </div>
                                            )}
                                            <button
                                                onClick={() => acceptSponsor(offer)}
                                                className="w-full py-2 bg-yellow-600 hover:bg-yellow-500 text-white font-bold uppercase text-xs tracking-wider rounded transition-colors"
                                            >
                                                Accept Partnership
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* STADIUM TAB */}
                {activeTab === 'stadium' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-neutral-900 rounded-xl border border-white/10 p-6 shadow-lg">
                            <h3 className="text-white font-bold uppercase tracking-widest text-sm mb-6">Stadium Operations</h3>

                            <div className="space-y-6">
                                <div className="bg-neutral-950 p-4 rounded border border-neutral-800">
                                    <p className="text-xs text-neutral-500 uppercase font-bold mb-2">Match Ticket Price</p>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-2xl font-mono font-bold text-white">£{playerClub.infrastructure.stadium.ticket_price}</span>
                                        <span className={`text-xs font-bold ${playerClub.infrastructure.stadium.ticket_price > 60 ? 'text-red-400' : 'text-emerald-400'}`}>
                                            {playerClub.infrastructure.stadium.ticket_price > 60 ? 'Expensive' : 'Affordable'}
                                        </span>
                                    </div>
                                    <input
                                        type="range" min="20" max="150"
                                        className="w-full accent-emerald-500 h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer"
                                        value={playerClub.infrastructure.stadium.ticket_price}
                                        onChange={handleTicketChange}
                                    />
                                    <p className="text-[10px] text-neutral-600 mt-2">Higher prices may reduce attendance and fan happiness.</p>
                                </div>

                                <div className="bg-neutral-950 p-4 rounded border border-neutral-800">
                                    <p className="text-xs text-neutral-500 uppercase font-bold mb-2">Average Attendance</p>
                                    <div className="flex items-end gap-2">
                                        <span className="text-3xl font-mono font-bold text-white">{(playerClub.infrastructure.stadium.capacity * playerClub.attendance_rate).toFixed(0)}</span>
                                        <span className="text-sm text-neutral-400">/ {playerClub.infrastructure.stadium.capacity.toLocaleString()}</span>
                                    </div>
                                    <div className="w-full bg-neutral-800 h-2 rounded-full mt-2 overflow-hidden">
                                        <div className="h-full bg-blue-500" style={{ width: `${playerClub.attendance_rate * 100}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* BOARDROOM TAB */}
                {activeTab === 'boardroom' && (
                    <div className="bg-neutral-900 rounded-xl border border-white/10 p-6 shadow-lg">
                        <h3 className="text-white font-bold uppercase tracking-widest text-sm mb-6">Board Expectations</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-4 bg-neutral-950 rounded border border-neutral-800">
                                <span className="text-neutral-400 uppercase text-xs font-bold">League Target</span>
                                <span className="text-white font-bold">Top {playerClub.board_expectations.league_position_target} Finish</span>
                            </div>
                            <div className="flex justify-between items-center p-4 bg-neutral-950 rounded border border-neutral-800">
                                <span className="text-neutral-400 uppercase text-xs font-bold">Domestic Cup</span>
                                <span className="text-white font-bold capitalize">{playerClub.board_expectations.cup_target_stage.replace('_', ' ')} or better</span>
                            </div>
                            <div className="flex justify-between items-center p-4 bg-neutral-950 rounded border border-neutral-800">
                                <span className="text-neutral-400 uppercase text-xs font-bold">Owner Patience</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-32 h-2 bg-neutral-800 rounded-full overflow-hidden">
                                        <div className={`h-full ${playerClub.owner.patience < 40 ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${playerClub.owner.patience}%` }}></div>
                                    </div>
                                    <span className="text-white font-mono text-xs">{playerClub.owner.patience}%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* STAFF TAB */}
                {activeTab === 'staff' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {playerClub.staff && playerClub.staff.length > 0 ? (
                            playerClub.staff.map((s: any) => <StaffCard key={s.id} staff={s} />)
                        ) : (
                            <div className="col-span-3 text-center py-12 text-neutral-500 italic">No staff hired yet.</div>
                        )}
                    </div>
                )}

                {/* YOUTH TAB */}
                {activeTab === 'youth' && (
                    <div className="bg-neutral-900 rounded-xl border border-white/10 p-6 shadow-lg animate-in fade-in">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-white font-bold uppercase tracking-widest text-sm">Youth Intake Pipeline</h3>
                            <span className="text-xs text-neutral-500 font-mono">Next Intake: March 15th</span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-neutral-950 text-xs uppercase text-neutral-500 font-bold">
                                    <tr>
                                        <th className="p-3 rounded-l">Name</th>
                                        <th className="p-3">Pos</th>
                                        <th className="p-3 text-center">Grade</th>
                                        <th className="p-3 text-right">Sign Cost</th>
                                        <th className="p-3 rounded-r text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm">
                                    {playerClub.junior_candidates && playerClub.junior_candidates.length > 0 ? (
                                        playerClub.junior_candidates.map((c: JuniorCandidate) => (
                                            <tr key={c.id} className="border-b border-white/5 hover:bg-neutral-800 transition-colors">
                                                <td className="p-3 font-bold text-white">{c.name}</td>
                                                <td className="p-3 font-mono text-neutral-300">{c.position}</td>
                                                <td className="p-3 text-center">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold ${c.perceived_grade.startsWith('A') ? 'bg-emerald-900/50 text-emerald-400' : c.perceived_grade === 'B' ? 'bg-blue-900/50 text-blue-400' : 'bg-neutral-800 text-neutral-500'}`}>
                                                        {c.perceived_grade}
                                                    </span>
                                                </td>
                                                <td className="p-3 text-right font-mono text-white">{formatMoneyK(c.signing_cost)}</td>
                                                <td className="p-3 text-center">
                                                    <button
                                                        onClick={() => handleSignYouth(c)}
                                                        className="px-4 py-1 bg-white hover:bg-neutral-200 text-neutral-900 font-bold uppercase text-[10px] rounded transition-colors"
                                                    >
                                                        Sign
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="p-8 text-center text-neutral-500 italic">Academy pipeline empty.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
