import { League, Player, PlayerAttributes } from '../types';

export interface DNA {
    attacking: number;
    defending: number;
    physical: number;
    technical: number;
    mental: number;
    set_pieces: number;
}

export const MetricService = {
    calculateDNA: (attrs: PlayerAttributes): DNA => {
        return {
            attacking: (attrs.shooting + attrs.dribbling + attrs.pace) / 3,
            defending: (attrs.defending + attrs.physical) / 2,
            physical: (attrs.pace + attrs.physical) / 2,
            technical: (attrs.passing + attrs.dribbling + attrs.set_pieces) / 3,
            mental: attrs.mental,
            set_pieces: attrs.set_pieces
        };
    },

    getClubAverages: (players: Player[]): DNA => {
        if (players.length === 0) return { attacking:0, defending:0, physical:0, technical:0, mental:0, set_pieces:0 };

        const totals = players.reduce((acc, p) => {
            const dna = MetricService.calculateDNA(p.attributes);
            return {
                attacking: acc.attacking + dna.attacking,
                defending: acc.defending + dna.defending,
                physical: acc.physical + dna.physical,
                technical: acc.technical + dna.technical,
                mental: acc.mental + dna.mental,
                set_pieces: acc.set_pieces + dna.set_pieces
            };
        }, { attacking:0, defending:0, physical:0, technical:0, mental:0, set_pieces:0 });

        return {
            attacking: Math.round(totals.attacking / players.length),
            defending: Math.round(totals.defending / players.length),
            physical: Math.round(totals.physical / players.length),
            technical: Math.round(totals.technical / players.length),
            mental: Math.round(totals.mental / players.length),
            set_pieces: Math.round(totals.set_pieces / players.length)
        };
    },

    getLeagueAverages: (league: League): DNA => {
        const allPlayers = league.clubs.flatMap(c => c.players);
        return MetricService.getClubAverages(allPlayers);
    }
};
