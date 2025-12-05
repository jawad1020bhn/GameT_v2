import { Club } from '../types';

export const ScoutingEngine = {
    getKnowledgeLevel: (club: Club, region: string): number => {
        return club.scouting.knowledge?.[region] || 0;
    },

    getMaskedAttribute: (value: number, knowledge: number): string => {
        // If own player or loaned out, always known?
        // Let's assume this is only called for transfers/scouting context.
        if (knowledge >= 100) return value.toString();

        // Range logic: +/- (100 - Knowledge) / 10
        // e.g. K=50 -> +/- 5. True 15 -> "10-20"
        // e.g. K=0 -> +/- 10. True 15 -> "5-25"
        const range = Math.ceil((100 - knowledge) / 10);
        const min = Math.max(1, value - range);
        const max = Math.min(99, value + range);

        if (min === max) return value.toString();
        return `${min}-${max}`;
    },

    processDailyScouting: (club: Club) => {
        if (!club.scouting.knowledge) club.scouting.knowledge = {};

        // Decay all
        Object.keys(club.scouting.knowledge).forEach(k => {
            club.scouting.knowledge[k] = Math.max(0, club.scouting.knowledge[k] - 0.1);
        });

        // Growth based on assignments
        club.scouting.assignments.forEach(assign => {
            const region = assign.region;
            const current = club.scouting.knowledge[region] || 0;
            club.scouting.knowledge[region] = Math.min(100, current + 0.5);
        });
    }
};
