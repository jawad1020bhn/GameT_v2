import { Club, JuniorCandidate } from '../types';
import { getRandomName } from '../constants';

export const YouthEngine = {
    generateCandidates: (club: Club): JuniorCandidate[] => {
        const count = 8;
        const candidates: JuniorCandidate[] = [];
        const positions = ["GK", "DEF", "MID", "FWD"] as const;

        for(let i=0; i<count; i++) {
            const pot = 60 + Math.floor(Math.random() * 35);
            const errorMargin = Math.max(2, 20 - (club.infrastructure.youth_academy.level * 2));
            const error = Math.floor(Math.random() * errorMargin * 2) - errorMargin;

            const perceived = Math.min(99, Math.max(1, pot + error));
            let grade: JuniorCandidate['perceived_grade'] = 'C';
            if (perceived >= 90) grade = 'A+';
            else if (perceived >= 80) grade = 'A';
            else if (perceived >= 75) grade = 'B';
            else if (perceived >= 65) grade = 'C';
            else if (perceived >= 50) grade = 'D';
            else grade = 'F';

            candidates.push({
                id: Date.now() + Math.random(),
                name: getRandomName('EN'),
                position: positions[Math.floor(Math.random() * positions.length)],
                true_potential: pot,
                perceived_grade: grade,
                signing_cost: pot * 500
            });
        }
        return candidates;
    }
};
