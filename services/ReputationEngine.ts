import { ManagerProfile, League, Club, GameState } from '../types';

export const REPUTATION_LEVELS: { [key: number]: { name: string, min_points: number, max_tier: number, stars: string } } = {
    1: { name: 'Unknown', min_points: 0, max_tier: 5, stars: '● ○ ○ ○ ○ ○' },
    2: { name: 'Regional', min_points: 100, max_tier: 4, stars: '● ● ○ ○ ○ ○' },
    3: { name: 'National', min_points: 250, max_tier: 3, stars: '● ● ● ○ ○ ○' },
    4: { name: 'Continental', min_points: 500, max_tier: 2, stars: '● ● ● ● ○ ○' },
    5: { name: 'World Class', min_points: 900, max_tier: 1, stars: '● ● ● ● ● ○' },
    6: { name: 'Legendary', min_points: 1500, max_tier: 1, stars: '● ● ● ● ● ●' }
};

export class ReputationEngine {

    static getClubTier(club: Club): number {
        if (club.reputation >= 90) return 1;
        if (club.reputation >= 82) return 2;
        if (club.reputation >= 76) return 3;
        if (club.reputation >= 70) return 4;
        return 5;
    }

    static getReputationLevel(points: number): number {
        let level = 1;
        for (let l = 1; l <= 6; l++) {
            if (points >= REPUTATION_LEVELS[l].min_points) {
                level = l;
            }
        }
        return level;
    }

    static checkLevelUp(manager: ManagerProfile): { leveledUp: boolean, newLevel: number, name: string } {
        const currentLevel = manager.reputation.level;
        const correctLevel = this.getReputationLevel(manager.reputation.points);

        if (correctLevel > currentLevel) {
            manager.reputation.level = correctLevel;
            manager.reputation.name = REPUTATION_LEVELS[correctLevel].name;
            return { leveledUp: true, newLevel: correctLevel, name: REPUTATION_LEVELS[correctLevel].name };
        }
        return { leveledUp: false, newLevel: currentLevel, name: manager.reputation.name };
    }

    static generateJobOffers(manager: ManagerProfile, leagues: { [key: string]: League }): Club[] {
        const repLevel = manager.reputation.level;
        const maxTier = REPUTATION_LEVELS[repLevel].max_tier; // e.g. Level 1 -> Max Tier 5 (Underdog)

        const allClubs = Object.values(leagues).flatMap(l => l.clubs);

        // Filter clubs by Tier (Must be >= max_tier, meaning numeric value >= max_tier is WRONG. Tier 1 is best. Tier 5 is worst)
        // If max_tier is 5, we can manage 5.
        // If max_tier is 1, we can manage 1,2,3,4,5.
        // Wait, "Lower tier number = better club".
        // "Clubs Available: League One... (Tier 5)".
        // So if I am Level 1 (Unknown), I can ONLY manage Tier 5.
        // If I am Level 2 (Regional), I can manage Tier 4 & 5? Or just Tier 4?
        // Usually you can manage anything BELOW your level too.
        // So if max_tier allowed is 4 (Project), I can manage 4 and 5.
        // So `clubTier >= max_tier` (where 5 >= 4). Yes.

        const eligibleClubs = allClubs.filter(c => {
            const tier = this.getClubTier(c);
            // Allow clubs that match the tier or are lower (higher number)
            // But also don't offer clubs WAY below? No, offers can be from anywhere lower.
            return tier >= maxTier;
        });

        // Scoring system to pick 3 "Realistic" offers
        const scoredClubs = eligibleClubs.map(club => {
            let score = 50;
            // Random variation
            score += Math.random() * 20 - 10;

            // Prefer clubs that "Need Manager" (Simulated by random or low Job Security logic if game was running, but this is start game)
            // Just random for start game.

            // Bias towards manager's style?
            if (club.style_identity.play_style.includes(manager.style)) score += 10;

            return { club, score };
        });

        // Sort by score
        scoredClubs.sort((a, b) => b.score - a.score);

        // Pick top 3 unique
        return scoredClubs.slice(0, 3).map(s => s.club);
    }

    static updateReputation(manager: ManagerProfile, seasonData: any) {
        // Implement points calculation logic based on achievements
        // This is called at season end
        let pointsEarned = 0;

        if (seasonData.champion) pointsEarned += 100;
        if (seasonData.top4) pointsEarned += 40;
        if (seasonData.cupWinner) pointsEarned += 50;

        manager.reputation.points += pointsEarned;

        return pointsEarned;
    }
}
