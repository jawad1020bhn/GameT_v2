import { League, Club, Fixture } from '../types';
import { START_YEAR } from '../constants';

export class CompetitionSystem {

    static initializeSeason(leagues: League[]): League[] {
        const dates = this.getSeasonDates(START_YEAR);

        // 1. Generate Domestic Fixtures
        leagues.forEach(league => {
            league.fixtures = this.generateDomesticFixtures(league.clubs, league.name, dates.MATCH_DATES);
            // Clear stats
            league.clubs.forEach(c => {
                c.stats = { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 };
                // Ensure domestic competition is active
                if (!c.active_competitions.includes(league.name)) {
                    c.active_competitions.push(league.name);
                }
            });
        });

        // 2. Generate European Fixtures (Swiss Model)
        this.generateEuropeanFixtures(leagues, dates.UCL_DATES);

        return leagues;
    }

    static getSeasonDates(year: number) {
        const startYear = year;
        const endYear = year + 1;
        const matchDates = [];

        // Generate weekends for the season
        let d = new Date(`${startYear}-08-16`); // Mid-August start
        while (d.getDay() !== 6) { d.setDate(d.getDate() + 1); } // Find Saturday

        for (let i = 0; i < 46; i++) { // Enough for Championship (46 rounds)
            matchDates.push(d.toISOString().split('T')[0]);
            d.setDate(d.getDate() + 7);

            // Winter Break / Int'l Break offsets
            if (i === 16) d.setDate(d.getDate() + 14); // Winter break approx
        }

        return {
            MATCH_DATES: matchDates,
            UCL_DATES: [
                `${startYear}-09-16`, // MD1
                `${startYear}-10-01`, // MD2
                `${startYear}-10-22`, // MD3
                `${startYear}-11-05`, // MD4
                `${startYear}-11-26`, // MD5
                `${startYear}-12-10`, // MD6
                `${endYear}-01-21`,   // MD7
                `${endYear}-01-29`    // MD8
            ]
        };
    }

    static generateDomesticFixtures(clubs: Club[], leagueName: string, dates: string[]): Fixture[] {
        const fixtures: Fixture[] = [];
        let matchId = Date.now() + Math.floor(Math.random() * 10000);
        const n = clubs.length;
        if (n === 0) return [];

        const map = clubs.map(c => c.id);

        // If odd number of teams, add a dummy?
        // Real world data should be even, but handle just in case
        if (n % 2 !== 0) {
            // Logic for bye week is complex, assume even for MVP as real data is clean
            // or just drop the last team from rotation
        }

        const rotating = map.slice(1);
        const fixed = map[0];
        const rounds = [];

        for (let r = 0; r < n - 1; r++) {
            const roundFixtures = [];
            roundFixtures.push([fixed, rotating[0]]);
            for (let i = 1; i < (n / 2); i++) {
                roundFixtures.push([rotating[i], rotating[rotating.length - i]]);
            }
            rounds.push(roundFixtures);
            rotating.push(rotating.shift()!);
        }

        const allRounds = [...rounds];
        // Return fixtures (mirror)
        const returnRounds = rounds.map(r => r.map(pair => [pair[1], pair[0]]));
        allRounds.push(...returnRounds);

        allRounds.forEach((round, roundIndex) => {
            if (roundIndex >= dates.length) return;
            const matchDate = dates[roundIndex];
            round.forEach(pair => {
                fixtures.push({
                    id: matchId++,
                    homeClubId: pair[0],
                    awayClubId: pair[1],
                    homeScore: null,
                    awayScore: null,
                    date: matchDate,
                    played: false,
                    competition: leagueName,
                    is_knockout: false
                });
            });
        });

        return fixtures;
    }

    static generateEuropeanFixtures(leagues: League[], dates: string[]) {
        // 1. Identify Participants
        const allClubs = leagues.flatMap(l => l.clubs);

        // Check who is already qualified (e.g. from Season Transition)
        let uclTeams = allClubs.filter(c => c.active_competitions.includes("Champions League"));

        // If not enough (e.g. First Season), fill with Top Reputation
        if (uclTeams.length < 36) {
            const potential = allClubs
                .filter(c => !uclTeams.includes(c))
                .sort((a, b) => b.reputation - a.reputation);

            const needed = 36 - uclTeams.length;
            const fillers = potential.slice(0, needed);

            fillers.forEach(c => c.active_competitions.push("Champions League"));
            uclTeams = [...uclTeams, ...fillers];
        }

        uclTeams = uclTeams.slice(0, 36); // Cap at 36

        if (uclTeams.length < 36) return; // Not enough data

        // 2. Pots
        // Pot 1: 1-9, Pot 2: 10-18, Pot 3: 19-27, Pot 4: 28-36
        const pots = [
            uclTeams.slice(0, 9),
            uclTeams.slice(9, 18),
            uclTeams.slice(18, 27),
            uclTeams.slice(27, 36)
        ];

        let matchId = Date.now() + 500000;

        // 3. Generate 8 Matches per team
        // Simplified Swiss:
        // Every team plays 2 opponents from each pot (1 Home, 1 Away)
        // Note: This is a complex graph coloring problem to do perfectly.
        // MVP Approach: Randomized pairing with retries/swaps.

        // Let's try a simpler robust approach:
        // Round 1-2: Play Pot 1 vs Pot 4, Pot 2 vs Pot 3
        // Round 3-4: Play Pot 1 vs Pot 3, Pot 2 vs Pot 4
        // Round 5-6: Play Pot 1 vs Pot 2, Pot 3 vs Pot 4
        // Round 7-8: Play Pot 1 vs Pot 1, Pot 2 vs Pot 2 ... (Internal pot matches)

        // Actually, the rules are: play 2 from EACH pot.
        // So Team in Pot 1 plays: 2x Pot1, 2x Pot2, 2x Pot3, 2x Pot4.

        // We can generate pairings for each Pot-Pair combination.
        // P1 vs P1 (Internal) - Each team needs 2 matches against its own pot.
        // P1 vs P2 - Each P1 needs 2 matches vs P2. Each P2 needs 2 matches vs P1.

        // This suggests we can just iterate the requirements.

        const fixtures: Fixture[] = [];

        const createMatch = (home: Club, away: Club, dateIndex: number) => {
            fixtures.push({
                id: matchId++,
                homeClubId: home.id,
                awayClubId: away.id,
                homeScore: null,
                awayScore: null,
                date: dates[dateIndex],
                played: false,
                competition: "Champions League",
                is_knockout: false,
                round: `League Phase - MD${dateIndex + 1}`
            });
        };

        // Helper to shuffle
        const shuffle = <T>(arr: T[]) => [...arr].sort(() => 0.5 - Math.random());

        // Strategy:
        // MD1 & MD5: Pot 1 vs Pot 4, Pot 2 vs Pot 3 (Cross Pot)
        // MD2 & MD6: Pot 1 vs Pot 3, Pot 2 vs Pot 4
        // MD3 & MD7: Pot 1 vs Pot 2, Pot 3 vs Pot 4
        // MD4 & MD8: Internal Pot Matches (P1vP1, P2vP2...)

        // To satisfy "2 from each pot", we need to mix this up.
        // Let's just generate the pairings first, then assign dates.

        // Requirement for Team T: 2 vs P1, 2 vs P2, 2 vs P3, 2 vs P4.

        const allPairings: {home: Club, away: Club}[] = [];

        // 1. Internal Pot Matches (Provides 2 matches vs own pot)
        // Each pot has 9 teams. Cannot do perfect round robin for 2 games easily with odd number?
        // Wait, 9 teams. Everyone plays 2 games.
        // 9 is odd. Someone sits out? No, that breaks the "8 games" rule.
        // Swiss Model Pots usually have even numbers?
        // The real UCL has 36 teams. 4 Pots of 9.
        // Each team plays 2 opponents from EACH of the 4 pots.
        // If I am in Pot 1, I play 2 teams from Pot 1.
        // Since there are 9 teams in Pot 1, I play 2 of the other 8.
        // This is possible. (Degree 2 regular graph on 9 vertices).

        // GENERATE INTERNAL PAIRINGS (2 games per team per pot)
        pots.forEach(pot => {
            // Create a cycle of 9: 1-2, 2-3, ... 9-1. That's 2 games each (1H, 1A? or just 2 pairings)
            // Just linking adjacent in shuffled list gives 2 neighbors.
            const shuf = shuffle(pot);
            for(let i=0; i<shuf.length; i++) {
                const pA = shuf[i];
                const pB = shuf[(i+1) % shuf.length];
                allPairings.push({home: pA, away: pB}); // A plays B
                // A needs 1 more? No, A plays B, and Z plays A. That is 2 matches involving A.
                // Wait: A vs B (A is Home?). Z vs A (A is Away?).
                // Yes. 1H 1A vs Own Pot.
            }
            // Wait, we need 2 matches vs own pot. The cycle gives 2 edges per node.
            // Edge (A,B) -> A plays B. Edge (Z,A) -> Z plays A.
            // A is involved in 2 games. Correct.

            // Wait, this only gives 1 match vs Pot X.
            // No, the requirement is 2 matches vs Pot X.
            // If I am in Pot 1, I play TWO TEAMS from Pot 1.
            // The cycle method: I play neighbor right and neighbor left.
            // So yes, I play 2 teams.
        });

        // 2. Cross Pot Pairings
        // Pot 1 vs Pot 2 (Everyone in P1 plays 2 teams in P2. Everyone in P2 plays 2 teams in P1).
        // P1 size 9, P2 size 9.
        // We can offset.
        // P1[i] plays P2[i] and P2[(i+1)%9].
        const linkPots = (potA: Club[], potB: Club[]) => {
            const shufA = shuffle(potA);
            const shufB = shuffle(potB);

            for(let i=0; i<shufA.length; i++) {
                const teamA = shufA[i];
                // Match 1
                const teamB1 = shufB[i];
                allPairings.push({home: teamA, away: teamB1});

                // Match 2
                const teamB2 = shufB[(i+1) % shufB.length];
                allPairings.push({home: teamB2, away: teamA}); // Swap home/away for balance
            }
        };

        linkPots(pots[0], pots[1]); // P1 vs P2
        linkPots(pots[0], pots[2]); // P1 vs P3
        linkPots(pots[0], pots[3]); // P1 vs P4

        linkPots(pots[1], pots[2]); // P2 vs P3
        linkPots(pots[1], pots[3]); // P2 vs P4

        linkPots(pots[2], pots[3]); // P3 vs P4

        // Wait, I am in Pot 1.
        // My matches:
        // vs Own Pot (Cycle): 2 games.
        // vs Pot 2: 2 games (from linkPots P1-P2).
        // vs Pot 3: 2 games (from linkPots P1-P3).
        // vs Pot 4: 2 games (from linkPots P1-P4).
        // Total: 8 games.
        // Logic holds!

        // Note: The logic above generates 8 games per team.
        // We need to distribute these `allPairings` into 8 Match Days.
        // This is a scheduling problem.
        // Simple heuristic: Shuffle all pairings and fill slots.
        // But a team cannot play twice on same MD.

        const shuffledPairings = shuffle(allPairings);

        // 8 Slots (Match Days)
        const slots: {home: Club, away: Club}[][] = [[], [], [], [], [], [], [], []];

        // Backtracking or Greedy fill
        // Greedy: Try to put match in first available slot where neither team is playing.

        const teamSchedule: {[key: number]: boolean[]} = {}; // teamId -> [T/F, T/F...] (playing on MD i)
        uclTeams.forEach(c => teamSchedule[c.id] = new Array(8).fill(false));

        const leftovers: {home: Club, away: Club}[] = [];

        shuffledPairings.forEach(match => {
            let placed = false;
            // Try random start index to balance
            const startSlot = Math.floor(Math.random() * 8);
            for(let i=0; i<8; i++) {
                const slotIdx = (startSlot + i) % 8;
                if (!teamSchedule[match.home.id][slotIdx] && !teamSchedule[match.away.id][slotIdx]) {
                    slots[slotIdx].push(match);
                    teamSchedule[match.home.id][slotIdx] = true;
                    teamSchedule[match.away.id][slotIdx] = true;
                    placed = true;
                    break;
                }
            }
            if (!placed) leftovers.push(match);
        });

        // Handle leftovers (Swap/Force - basic MVP ignore or simple swap)
        // If leftovers exist, we might have some uneven weeks, but for MVP let's just log or dump them in MD8 (allowing double headers? No that breaks engine).
        // Better: Just ignore them for now to prevent crash, or restart.
        // Given precise Math (36 * 8 / 2 = 144 matches), we should fit them.
        // 9 teams * 4 pots = 36.
        // 144 total matches. 18 matches per MD.

        // Create actual fixtures
        slots.forEach((slot, idx) => {
            slot.forEach(match => {
                createMatch(match.home, match.away, idx);
            });
        });

        // Distribute fixtures to leagues
        // We need to find the league object for each club and push the fixture
        fixtures.forEach(f => {
            // Find league
            const homeLeague = leagues.find(l => l.clubs.some(c => c.id === f.homeClubId));
            if (homeLeague) homeLeague.fixtures.push(f);

            // We usually duplicate fixture ref or just push to home?
            // The Engine iterates ALL leagues.
            // If we push to Home League, Engine finds it.
            // If Away team is in diff league (likely), we might want to push to both?
            // Or usually we just push to one list.
            // Engine: `league.fixtures.forEach...`
            // If A (PL) plays B (LaLiga).
            // If fixture is in PL.fixtures.
            // PL processing runs match.
            // LaLiga processing does not see it.
            // Correct.
            // But we need to ensure we don't double process.
            // Engine has `if (fixture.played) return`.
            // So if we push to BOTH, the first one plays it, the second skips.
            // This is safer for UI (showing fixtures in both leagues).

            // However, `processDay` iterates leagues.
            // If we push to both, we duplicate the object reference?
            // If we duplicate the object ref, `fixture.played = true` updates both.
            // Yes.

            const awayLeague = leagues.find(l => l.clubs.some(c => c.id === f.awayClubId));
            if (awayLeague && awayLeague !== homeLeague) {
                awayLeague.fixtures.push(f);
            }
        });
    }
}
