import { Club, Player } from '../types';

export const DRILLS: Record<string, { name: string, label: string, color: string }> = {
    'cardio': { name: 'Cardio', label: 'Fit -5, Sta ++', color: 'bg-red-600' },
    'tactical': { name: 'Tactical', label: 'Fam +2, Fit -1', color: 'bg-blue-600' },
    'rest': { name: 'Rest', label: 'Fit +15, Mor +', color: 'bg-green-600' },
    'match_prep': { name: 'Match Prep', label: 'Sharp +5, Fit -2', color: 'bg-yellow-600' },
    'technical': { name: 'Technical', label: 'Atts ++, Fit -3', color: 'bg-purple-600' }
};

export const TrainingEngine = {
    applyDailyTraining: (club: Club, dayOfWeek: number) => {
        if (!club.training_schedule) return;

        const todaysDrills = club.training_schedule.filter(s => s.day === dayOfWeek);

        todaysDrills.forEach(slot => {
            const drill = slot.drillId;

            club.players.forEach(p => {
                if (drill === 'cardio') {
                    p.fitness = Math.max(0, p.fitness - 5);
                    // Small chance to improve physical stats
                    if (Math.random() < 0.05) p.attributes.physical = Math.min(99, p.attributes.physical + 1);
                } else if (drill === 'tactical') {
                    if (club.tactics) club.tactics.familiarity = Math.min(100, club.tactics.familiarity + 1);
                    p.fitness = Math.max(0, p.fitness - 1);
                } else if (drill === 'rest') {
                    p.fitness = Math.min(100, p.fitness + 7);
                    p.morale = Math.min(100, p.morale + 1);
                    if (p.chronic_fatigue) p.chronic_fatigue = Math.max(0, p.chronic_fatigue - 2);
                } else if (drill === 'match_prep') {
                    p.sharpness = Math.min(100, p.sharpness + 2);
                    p.fitness = Math.max(0, p.fitness - 2);
                } else if (drill === 'technical') {
                    p.fitness = Math.max(0, p.fitness - 3);
                    // Small chance to improve technical stats
                    if (Math.random() < 0.05) p.attributes.technical = Math.min(99, p.attributes.technical + 1);
                }
            });
        });
    }
};
