import { Negotiation, TransferOffer, ContractOffer, Player, Club } from '../types';

export const NegotiationEngine = {
    generateResponse: (
        player: Player,
        stage: 'club_fee' | 'contract',
        offerQuality: number // 0.0 to 1.5 (1.0 = meets expectation)
    ): { text: string, sentiment: 'positive' | 'negative' | 'neutral' } => {
        const isStubborn = player.agent.stubbornness > 70;
        const isGreedy = player.agent.fee_pct > 10;

        if (offerQuality >= 1.0) {
            return {
                text: stage === 'club_fee' ? "The club accepts this valuation." : "My client is happy to join the project.",
                sentiment: 'positive'
            };
        } else if (offerQuality < 0.6) {
            return {
                text: stage === 'club_fee'
                    ? "This offer is derisory. We expect serious bids only."
                    : (isStubborn ? "Do not insult my client with such low figures." : "We are very far apart."),
                sentiment: 'negative'
            };
        } else {
            // Close but not there
            return {
                text: stage === 'club_fee'
                    ? "We are getting closer, but the structure needs work."
                    : (isGreedy ? "The signing bonus needs to reflect his talent." : "Can we improve the weekly wage?"),
                sentiment: 'neutral'
            };
        }
    },

    evaluateFee: (negotiation: Negotiation, offer: TransferOffer): { patienceHit: number, status: 'active' | 'agreed_fee' | 'collapsed', quality: number } => {
        const valuation = negotiation.ai_valuation!;
        // Sell on clause worth ~1% = 1% of current value estimate (simplified)
        const sellOnValue = (negotiation.ai_valuation!.min_fee * (offer.sell_on_clause_pct / 100)) * 0.5; // Discounted future value
        const totalValue = offer.fee + (offer.installments * 0.9) + sellOnValue;

        const quality = totalValue / valuation.min_fee;

        let patienceHit = 0;
        if (quality < 0.5) patienceHit = 25;
        else if (quality < 0.8) patienceHit = 10;
        else if (quality < 1.0) patienceHit = 5;

        let status: 'active' | 'agreed_fee' | 'collapsed' = 'active';
        if (quality >= 1.0) status = 'agreed_fee';

        return { patienceHit, status, quality };
    },

    evaluateContract: (negotiation: Negotiation, offer: ContractOffer): { patienceHit: number, status: 'active' | 'signed' | 'collapsed', quality: number } => {
        const valuation = negotiation.ai_valuation!;

        // Clauses value
        const wageAnnual = offer.wage * 52;
        const totalWage = wageAnnual * offer.duration;
        const bonusVal = offer.signing_bonus;
        const performanceVal = (offer.performance_bonus || 0) * 15; // Assume 15 goals/clean sheets per season

        const packageValue = totalWage + bonusVal + performanceVal;

        const demandAnnual = valuation.demanded_wage * 52;
        const demandTotal = demandAnnual * 3; // Assume 3 year benchmark

        // Quality based on Wage mostly
        const quality = offer.wage / valuation.demanded_wage;

        // Role penalty
        const roles = ['prospect', 'rotation', 'important', 'key', 'star'];
        const offerRoleIdx = roles.indexOf(offer.role);
        const demandRoleIdx = roles.indexOf(valuation.demanded_role);

        let rolePenalty = 0;
        if (offerRoleIdx < demandRoleIdx) rolePenalty = 0.2 * (demandRoleIdx - offerRoleIdx);

        const finalQuality = quality - rolePenalty + (offer.signing_bonus / (demandAnnual * 0.5)) * 0.1;

        let patienceHit = 0;
        if (finalQuality < 0.6) patienceHit = 20;
        else if (finalQuality < 0.9) patienceHit = 10;
        else if (finalQuality < 1.0) patienceHit = 5;

        let status: 'active' | 'signed' | 'collapsed' = 'active';
        if (finalQuality >= 1.0) status = 'signed';

        return { patienceHit, status, quality: finalQuality };
    }
};
