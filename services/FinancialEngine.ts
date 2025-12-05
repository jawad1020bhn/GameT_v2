import { Club, SeasonFinancials, FinancialStrategy } from '../types';

export const FinancialEngine = {
    getTicketPrice: (club: Club): number => {
        const base = club.reputation > 80 ? 60 : club.reputation > 60 ? 40 : 25;
        const strategy = club.financial_strategy.ticket_pricing;
        const multipliers = { very_low: 0.7, low: 0.85, normal: 1.0, high: 1.25, very_high: 1.5 };
        return Math.floor(base * multipliers[strategy]);
    },

    getAttendanceMod: (club: Club): number => {
        const strategy = club.financial_strategy.ticket_pricing;
        // Lower price = higher attendance
        const multipliers = { very_low: 1.15, low: 1.08, normal: 1.0, high: 0.92, very_high: 0.80 };
        return multipliers[strategy];
    },

    processDailyFinances: (club: Club, roleMods: any, isMatchDay: boolean) => {
        const strat = club.financial_strategy;

        // 1. Wages
        const dailyWages = club.wage_budget_weekly / 7;
        club.budget -= dailyWages;
        club.season_financials.wage_bill += dailyWages;

        // 2. Merchandise Revenue (Deterministic + Strategy + Roles + Matchday)
        const baseMerch = (club.fanbase_size * 0.02) * (1 + (roleMods.merchandiseSales || 0));
        let merchIncome = baseMerch;

        if (strat.merchandise_focus === 'global') merchIncome *= 1.25;
        if (isMatchDay) merchIncome += baseMerch * 15; // Matchday spike

        club.budget += merchIncome;
        club.season_financials.merchandise_income += merchIncome;

        // 3. Debt Interest (Daily)
        if (club.debt > 0) {
            const interestRate = 0.05 / 365; // 5% annual
            const interest = club.debt * interestRate;
            club.budget -= interest;
            club.season_financials.legal_fees += interest;

            let repaymentRate = 0;
            if (strat.debt_repayment === 'aggressive') repaymentRate = 0.0005;
            if (strat.debt_repayment === 'balanced') repaymentRate = 0.0002;
            if (strat.debt_repayment === 'minimum') repaymentRate = 0.00005;

            if (club.budget > 1000000) {
                const repayment = Math.min(club.budget * 0.05, club.debt * repaymentRate);
                if (repayment > 0) {
                    club.debt -= repayment;
                    club.budget -= repayment;
                    club.season_financials.loan_repayments += repayment;
                }
            }
        }

        // 4. Marketing Investment (Daily Cost)
        let marketingCost = 0;
        const scale = club.reputation / 50;
        if (strat.merchandise_focus === 'global') marketingCost = 10000 * scale;
        else if (strat.merchandise_focus === 'national') marketingCost = 2000 * scale;

        if (club.budget > marketingCost * 30) {
            club.budget -= marketingCost;
            club.season_financials.marketing_costs += marketingCost;

            if (Math.random() < 0.05) {
                if (strat.merchandise_focus === 'global') {
                    club.commercial_power = Math.min(100, club.commercial_power + 0.05);
                    club.fanbase_size += 50;
                } else if (strat.merchandise_focus === 'national') {
                    club.fanbase_size += 10;
                }
            }
        }
    },

    evaluateSquadNeeds: (club: Club): { position: "GK"|"DEF"|"MID"|"FWD", priority: number } | null => {
        const positions = { GK: 0, DEF: 0, MID: 0, FWD: 0 };
        club.players.forEach(p => {
            const pos = p.position === 'ST' ? 'FWD' : p.position;
            positions[pos as keyof typeof positions]++;
        });

        if (positions.GK < 2) return { position: "GK", priority: 10 };
        if (positions.DEF < 7) return { position: "DEF", priority: 8 };
        if (positions.MID < 6) return { position: "MID", priority: 7 };
        if (positions.FWD < 5) return { position: "FWD", priority: 6 };

        return null;
    }
};
