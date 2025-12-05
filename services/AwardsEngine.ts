import { League, Player, MonthlyAward, BallonDorWinner, GameState, AwardWinner, PlayerStats, Club } from '../types';

const calculateScore = (stats: PlayerStats, position: string, winPct: number): number => {
    let score = (stats.avg_rating * 10) + (stats.mom_awards * 5);

    if (position === 'GK' || position === 'DEF') {
        score += (stats.clean_sheets * 10);
        score += (stats.goals * 15); // Defenders scoring is huge
    } else {
        score += (stats.goals * 10);
        score += (stats.assists * 8);
    }

    score += (winPct * 20); // Team success factor
    return score;
};

const getTeamWinPct = (club: Club, date: string): number => {
    // Ideally we look at fixtures in the last month, but simplified:
    // We rely on momentum/form or just simple calc if passed in.
    // For now, we will use a simplified assumption or pass it in.
    return 0.5; // Placeholder if we don't have monthly record easily
};

export const AwardsEngine = {
    getBestXI: (league: League, statsKey: 'monthly_stats' | 'season_stats' = 'monthly_stats'): { position: string, name: string, club: string }[] => {
        const bestPlayersByPos: { [pos: string]: Player[] } = {
            GK: [], DEF: [], MID: [], FWD: [], ST: []
        };

        league.clubs.forEach(club => {
            club.players.forEach(p => {
                const stats = p[statsKey];
                if (!stats || stats.appearances === 0) return;
                bestPlayersByPos[p.position].push(p);
            });
        });

        const sortFn = (a: Player, b: Player) => (b[statsKey]?.avg_rating || 0) - (a[statsKey]?.avg_rating || 0);
        Object.keys(bestPlayersByPos).forEach(k => bestPlayersByPos[k].sort(sortFn));

        const team: { position: string, name: string, club: string }[] = [];
        const gk = bestPlayersByPos['GK'][0];
        const defs = bestPlayersByPos['DEF'].slice(0, 4);
        const mids = bestPlayersByPos['MID'].slice(0, 3);
        const fwds = [...bestPlayersByPos['FWD'], ...bestPlayersByPos['ST']].sort(sortFn).slice(0, 3);

        if(gk) team.push({ position: 'GK', name: gk.name, club: league.clubs.find(c => c.id === gk.clubId)?.name || '' });
        defs.forEach(p => team.push({ position: 'DEF', name: p.name, club: league.clubs.find(c => c.id === p.clubId)?.name || '' }));
        mids.forEach(p => team.push({ position: 'MID', name: p.name, club: league.clubs.find(c => c.id === p.clubId)?.name || '' }));
        fwds.forEach(p => team.push({ position: 'FWD', name: p.name, club: league.clubs.find(c => c.id === p.clubId)?.name || '' }));

        return team;
    },

    resetMonthlyStats: (league: League) => {
        league.clubs.forEach(c => {
            c.players.forEach(p => {
                p.monthly_stats = {
                    goals: 0, assists: 0, clean_sheets: 0,
                    yellow_cards: 0, red_cards: 0, appearances: 0,
                    avg_rating: 0, mom_awards: 0
                };
            });
        });
    },

    calculateMonthlyAwards: (league: League, currentDate: string): MonthlyAward => {
        const dateObj = new Date(currentDate);
        // Get Previous Month
        dateObj.setMonth(dateObj.getMonth() - 1);
        const monthName = dateObj.toLocaleString('default', { month: 'long' });
        const year = dateObj.getFullYear();
        const fullDate = `${monthName} ${year}`;

        let bestPlayer: Player | null = null;
        let bestPlayerScore = -1;

        let bestManager: { name: string, club: string, points: number } | null = null;
        let bestManagerScore = -1;

        const bestXI: { [key: string]: Player | null } = {
            GK: null, LB: null, CB1: null, CB2: null, RB: null,
            CM1: null, CM2: null, CAM: null, LW: null, ST: null, RW: null
        };
        league.clubs.forEach(club => {
            // Manager Score: Based on recent form (last 5 games approx)
            const recentForm = club.stats.points / Math.max(1, club.stats.played);
            const managerScore = recentForm * 100 + (Math.random() * 20);

            if (managerScore > bestManagerScore) {
                bestManagerScore = managerScore;
                bestManager = {
                    name: "Head Coach",
                    club: club.name,
                    points: Math.floor(managerScore)
                };
            }

            club.players.forEach(p => {
                if (!p.monthly_stats || p.monthly_stats.appearances === 0) return;

                const score = calculateScore(p.monthly_stats, p.position, 0.5);

                if (score > bestPlayerScore) {
                    bestPlayerScore = score;
                    bestPlayer = p;
                }
            });
        });

        const team = AwardsEngine.getBestXI(league, 'monthly_stats');

        return {
            id: `ma_${Date.now()}_${league.name}`,
            month: fullDate,
            year: year,
            leagueId: league.name,
            playerOfTheMonth: bestPlayer ? {
                name: (bestPlayer as Player).name,
                club: league.clubs.find(c => c.id === (bestPlayer as Player).clubId)?.name || '',
                value: `${(bestPlayer as Player).monthly_stats!.avg_rating.toFixed(2)} Rating`
            } : { name: "N/A", club: "", value: "" },
            managerOfTheMonth: bestManager ? {
                name: bestManager.name,
                club: bestManager.club,
                value: "Outstanding Form"
            } : { name: "N/A", club: "", value: "" },
            teamOfTheMonth: team
        };
    },

    calculateBallonDor: (state: GameState): BallonDorWinner | null => {
        let bestPlayer: Player | null = null;
        let highestScore = -1;

        Object.values(state.leagues).forEach(league => {
            league.clubs.forEach(club => {
                club.players.forEach(p => {
                    // Score = Rating * 10 + Goals * 2 + Assists * 1.5 + Trophies
                    // Simplified:
                    let score = (p.season_stats.avg_rating * 10) + (p.season_stats.goals * 1) + (p.season_stats.assists * 0.5);

                    // Reputation bias
                    score += (p.reputation / 5);

                    if (score > highestScore) {
                        highestScore = score;
                        bestPlayer = p;
                    }
                });
            });
        });

        if (!bestPlayer) return null;
        const p = bestPlayer as Player;
        const club = Object.values(state.leagues).flatMap(l => l.clubs).find(c => c.id === p.clubId);

        return {
            year: state.currentSeasonStartYear,
            name: p.name,
            club: club?.name || "Unknown",
            nationality: p.nationality,
            rating: p.overall // Store overall snapshot
        };
    }
};
