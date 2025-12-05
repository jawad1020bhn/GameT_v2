import { League, Player, MonthlyAward, BallonDorWinner, GameState, AwardWinner, PlayerStats, Club, GalaData } from '../types';

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

const getClubName = (state: GameState, id: number | undefined) => {
    if (!id) return "Unknown";
    const club = Object.values(state.leagues).flatMap(l => l.clubs).find(c => c.id === id);
    return club ? club.name : "Unknown";
}

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
        dateObj.setMonth(dateObj.getMonth() - 1);
        const monthName = dateObj.toLocaleString('default', { month: 'long' });
        const year = dateObj.getFullYear();
        const fullDate = `${monthName} ${year}`;

        let bestPlayer: Player | null = null;
        let bestPlayerScore = -1;

        let bestManager: { name: string, club: string, points: number } | null = null;
        let bestManagerScore = -1;

        league.clubs.forEach(club => {
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

    calculateSeasonAwards: (state: GameState, league: League): GalaData => {
        const allPlayers = league.clubs.flatMap(c => c.players);
        const sortedClubs = [...league.clubs].sort((a, b) => b.stats.points - a.stats.points);
        const champion = sortedClubs[0];

        // 1. Individual Awards
        const topScorer = [...allPlayers].sort((a, b) => b.season_stats.goals - a.season_stats.goals)[0];
        const playmaker = [...allPlayers].sort((a, b) => b.season_stats.assists - a.season_stats.assists)[0];
        const topGK = [...allPlayers].filter(p => p.position === 'GK').sort((a, b) => b.season_stats.clean_sheets - a.season_stats.clean_sheets)[0];
        const poty = [...allPlayers].filter(p => p.season_stats.appearances > 15).sort((a, b) => b.season_stats.avg_rating - a.season_stats.avg_rating)[0];
        const ypos = [...allPlayers].filter(p => p.age <= 21 && p.season_stats.appearances > 10).sort((a, b) => b.season_stats.avg_rating - a.season_stats.avg_rating)[0];

        // Breakthrough: Low Rep (<75) but High Rating (>7.0)
        const breakthrough = [...allPlayers]
            .filter(p => p.reputation < 75 && p.season_stats.appearances > 15)
            .sort((a, b) => b.season_stats.avg_rating - a.season_stats.avg_rating)[0];

        // 2. Club Awards
        // Most Improved: Performance vs Expectation
        // Expectation: 1 (Title) to 20 (Relegation)
        const mostImproved = [...league.clubs].sort((a, b) => {
            const aDiff = a.board_expectations.league_position_target - (sortedClubs.findIndex(c => c.id === a.id) + 1);
            const bDiff = b.board_expectations.league_position_target - (sortedClubs.findIndex(c => c.id === b.id) + 1);
            return bDiff - aDiff;
        })[0];

        const bestAttack = [...league.clubs].sort((a, b) => b.stats.goalsFor - a.stats.goalsFor)[0];
        const bestDefense = [...league.clubs].sort((a, b) => a.stats.goalsAgainst - b.stats.goalsAgainst)[0]; // Ascending (min conceded)

        // 3. UCL Awards (Global)
        let uclBestPlayer: Player | undefined;
        let uclTopScorer: Player | undefined;

        const allWorldPlayers = Object.values(state.leagues).flatMap(l => l.clubs).flatMap(c => c.players);
        const uclStats = (p: Player) => p.competition_stats['Champions League'];

        const uclPlayers = allWorldPlayers.filter(p => uclStats(p) && uclStats(p).appearances > 0);

        if (uclPlayers.length > 0) {
            uclBestPlayer = [...uclPlayers].sort((a, b) => uclStats(b).avg_rating - uclStats(a).avg_rating)[0];
            uclTopScorer = [...uclPlayers].sort((a, b) => uclStats(b).goals - uclStats(a).goals)[0];
        }

        const playerClub = sortedClubs.find(c => c.id === state.playerClubId);
        const playerPos = sortedClubs.findIndex(c => c.id === state.playerClubId) + 1;

        const history = state.news
            .filter(n => n.importance && n.importance >= 8 && (n.clubId === state.playerClubId || n.clubId === champion.id))
            .slice(0, 5)
            .map(n => ({ date: n.date, event: n.headline }));

        return {
            season: `${state.currentSeasonStartYear}/${state.currentSeasonStartYear + 1}`,
            leagueName: league.name,
            championId: champion.id,
            playerPos,
            awards: {
                poty: { name: poty?.name || "N/A", club: getClubName(state, poty?.clubId), value: `${poty?.season_stats.avg_rating.toFixed(2)} Rating` },
                ypos: { name: ypos?.name || "N/A", club: getClubName(state, ypos?.clubId), value: `${ypos?.season_stats.avg_rating.toFixed(2)} Rating` },
                goldenBoot: { name: topScorer?.name || "N/A", club: getClubName(state, topScorer?.clubId), value: topScorer?.season_stats.goals || 0 },
                goldenGlove: { name: topGK?.name || "N/A", club: getClubName(state, topGK?.clubId), value: topGK?.season_stats.clean_sheets || 0 },
                playmaker: { name: playmaker?.name || "N/A", club: getClubName(state, playmaker?.clubId), value: playmaker?.season_stats.assists || 0 },
                breakthrough: { name: breakthrough?.name || "N/A", club: getClubName(state, breakthrough?.clubId), value: "Breakout Season" },
                managerOfTheSeason: { name: "Head Coach", club: champion.name, value: "Title Winner" },
                clubOfTheYear: { name: champion.name, value: "Champions" },
                mostImprovedClub: { name: mostImproved?.name || "N/A", value: "Exceeded Expectations" },
                bestAttack: { name: bestAttack?.name || "N/A", value: bestAttack?.stats.goalsFor || 0 },
                bestDefense: { name: bestDefense?.name || "N/A", value: bestDefense?.stats.goalsAgainst || 0 },
                teamOfTheSeason: AwardsEngine.getBestXI(league, 'season_stats')
            },
            uclAwards: uclBestPlayer ? {
                bestPlayer: { name: uclBestPlayer.name, club: getClubName(state, uclBestPlayer.clubId), value: uclBestPlayer.competition_stats['Champions League'].avg_rating.toFixed(2) },
                topScorer: { name: uclTopScorer?.name || "", club: getClubName(state, uclTopScorer?.clubId), value: uclTopScorer?.competition_stats['Champions League'].goals || 0 }
            } : undefined,
            history
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
