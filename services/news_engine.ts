
import { GameState, Club, Fixture, NewsItem, Player, League } from '../types';
import { HEADLINES, CONTENT, NEWS_SOURCES } from './news_templates';

// Helper to pick random item
const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// Helper to format string with vars
const format = (template: string, vars: { [key: string]: string | number }) => {
    return template.replace(/{(\w+)}/g, (_, k) => vars[k]?.toString() || `{${k}}`);
};

const generateMeta = (tier: string, sentiment: 'positive' | 'negative' | 'neutral') => {
    const source = pick(NEWS_SOURCES.filter(s => tier === 'Random' ? true : s.tier === tier)) || NEWS_SOURCES[0];
    const likes = Math.floor(Math.random() * 10000) + 50;
    const comments = Math.floor(likes * (0.05 + Math.random() * 0.1));
    
    const reactions = {
        positive: ["Huge result!", "Love to see it.", "We are back!", "Trust the process.", "What a player!", "This is football!"],
        negative: ["Embarrassing.", "Board out.", "Players aren't trying.", "Disaster class.", "Sell him.", "Refund the fans."],
        neutral: ["Interesting development.", "Wait and see.", "Big if true.", "Tactical battle.", "Needs time.", "Could go either way."]
    };

    return {
        source,
        tag: "#Football",
        likes,
        comments,
        reaction: pick(reactions[sentiment])
    };
};

export const NewsEngine = {
    generateMatchNews: (fixture: Fixture, home: Club, away: Club, league: League): NewsItem[] => {
        const stories: NewsItem[] = [];
        const homeGoals = fixture.homeScore || 0;
        const awayGoals = fixture.awayScore || 0;
        const totalGoals = homeGoals + awayGoals;
        const diff = Math.abs(homeGoals - awayGoals);
        
        const winner = homeGoals > awayGoals ? home : awayGoals > homeGoals ? away : null;
        const loser = winner === home ? away : winner === away ? home : null;

        // 1. DETECT NARRATIVE TYPE
        let headlineTemplate = HEADLINES.CLOSE_WIN;
        let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
        let subType: NewsItem['subType'] = 'match_report';
        let contentTemplate = CONTENT.MATCH_GENERIC;
        
        const isRivalry = winner && loser && winner.rivalries.includes(loser.id);

        // Upset: Low rep beats high rep (diff > 10)
        if (winner && loser && loser.reputation > winner.reputation + 10) {
            headlineTemplate = HEADLINES.UPSET_WIN;
            subType = 'scandal'; // "Scandal" style for shocking results
            sentiment = 'negative'; 
        }
        // Thrashing: Diff >= 3
        else if (diff >= 3) {
            headlineTemplate = HEADLINES.THRASHING;
            subType = 'tactical_analysis';
            sentiment = 'positive'; 
            contentTemplate = [...CONTENT.MATCH_GENERIC, ...CONTENT.TACTICAL_FAIL];
        }
        // Thriller: Total goals >= 5
        else if (totalGoals >= 5) {
            headlineTemplate = HEADLINES.THRILLER;
            subType = 'fan_reaction';
            sentiment = 'positive';
        }
        // Rivalry
        else if (isRivalry && winner) {
            headlineTemplate = HEADLINES.RIVALRY_WIN;
            subType = 'fan_reaction';
            sentiment = 'positive';
            contentTemplate = [...CONTENT.MATCH_GENERIC, ...CONTENT.RIVALRY_INTENSITY];
        }
        // Bore Draw: 0-0
        else if (totalGoals === 0) {
            headlineTemplate = HEADLINES.BORE_DRAW;
            subType = 'punditry';
            sentiment = 'negative';
        }

        // 2. COMPILE STORY
        const vars = {
            home: home.name,
            away: away.name,
            winner: winner?.name || '',
            loser: loser?.name || '',
            score: `${homeGoals}-${awayGoals}`,
            goals: totalGoals,
            stadium: home.stadium,
            mvp: (fixture.match_events?.find(e => e.type === 'goal')?.text.split(' ')[1]) || 'The Captain'
        };

        const headline = format(pick(headlineTemplate), vars);
        let content = format(pick(contentTemplate), vars);

        stories.push({
            id: Date.now() + Math.random(),
            date: fixture.date,
            headline,
            content,
            image_type: 'match',
            subType,
            sentiment,
            importance: (diff >= 3 || isRivalry) ? 9 : 5,
            clubId: winner?.id || home.id,
            meta: generateMeta(subType === 'tactical_analysis' ? 'Analysis' : 'Tier 2', sentiment)
        });

        return stories;
    },

    generateDailyStories: (state: GameState): NewsItem[] => {
        const stories: NewsItem[] = [];
        const seed = Math.random();

        // Slightly increased frequency logic handled by caller or random check
        if (Math.random() > 0.6) return stories;

        const allClubs = Object.values(state.leagues).flatMap(l => l.clubs);

        // 1. SACK RACE (Managers under pressure)
        const crisisClub = allClubs.find(c => c.job_security < 35);
        if (crisisClub && Math.random() < 0.15) {
            stories.push({
                id: Date.now() + Math.random(),
                date: state.currentDate,
                headline: format(pick(HEADLINES.SACK_PRESSURE), { club: crisisClub.name }),
                content: `Sources close to ${crisisClub.name} suggest the board is losing patience. The next few games could be decisive for the manager.`,
                image_type: 'general',
                subType: 'rumour',
                sentiment: 'negative',
                importance: 8,
                clubId: crisisClub.id,
                meta: generateMeta('Tier 1', 'negative')
            });
        }

        // 2. TRANSFER SAGAS (Active Negotiations)
        const negotiation = state.negotiations.find(n => n.status === 'active' || n.status === 'agreed_fee');
        if (negotiation && Math.random() < 0.2) {
            const player = allClubs.flatMap(c => c.players).find(p => p.id === negotiation.playerId);
            const buyingClub = allClubs.find(c => c.id === negotiation.buyingClubId);
            
            if (player && buyingClub) {
                const isStalled = negotiation.ai_valuation && negotiation.ai_valuation.patience < 40;
                
                stories.push({
                    id: Date.now() + Math.random(),
                    date: state.currentDate,
                    headline: format(pick(isStalled ? HEADLINES.TRANSFER_STALL : HEADLINES.TRANSFER_RUMOUR), { player: player.name, club: buyingClub.name, city: buyingClub.stadium.split(' ')[0] }),
                    content: isStalled 
                        ? `Negotiations have hit a stumbling block over the valuation of ${player.name}. The deal hangs in the balance.`
                        : `Insiders report that ${buyingClub.name} are pushing hard to sign ${player.name} before the window shuts.`,
                    image_type: 'transfer',
                    subType: 'rumour',
                    sentiment: 'neutral',
                    importance: 7,
                    clubId: buyingClub.id,
                    meta: generateMeta('Transfer Insider', 'neutral')
                });
            }
        }

        // 3. INJURY CRISIS
        const injuredClubs = allClubs.filter(c => c.players.filter(p => p.injury_status.type !== 'none').length >= 3);
        if (injuredClubs.length > 0 && Math.random() < 0.2) {
            const club = pick(injuredClubs);
            const player = club.players.find(p => p.injury_status.type !== 'none' && p.squad_role === 'key') || club.players.find(p => p.injury_status.type !== 'none');

            if (player) {
                stories.push({
                    id: Date.now() + Math.random(),
                    date: state.currentDate,
                    headline: format(pick(HEADLINES.INJURY_BLOW), { club: club.name, player: player.name }),
                    content: format(pick(CONTENT.INJURY_DETAIL), { player: player.name }),
                    image_type: 'injury',
                    subType: 'scandal',
                    sentiment: 'negative',
                    importance: 7,
                    clubId: club.id,
                    meta: generateMeta('Medical Gazette', 'negative')
                });
            }
        }

        // 4. STREAKS (Form)
        if (Math.random() < 0.15) {
            const club = pick(allClubs);
            const league = state.leagues[club.leagueId];
            // Get last 5 played matches involving this club
            const recent = league.fixtures
                .filter(f => f.played && (f.homeClubId === club.id || f.awayClubId === club.id))
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 5);

            if (recent.length >= 3) {
                const wins = recent.filter(f => {
                    const isHome = f.homeClubId === club.id;
                    return isHome ? (f.homeScore! > f.awayScore!) : (f.awayScore! > f.homeScore!);
                }).length;
                const losses = recent.filter(f => {
                    const isHome = f.homeClubId === club.id;
                    return isHome ? (f.homeScore! < f.awayScore!) : (f.awayScore! < f.homeScore!);
                }).length;

                if (wins >= 3) {
                    stories.push({
                        id: Date.now() + Math.random(),
                        date: state.currentDate,
                        headline: format(pick(HEADLINES.WINNING_STREAK), { club: club.name }),
                        content: format(pick(CONTENT.STREAK_DETAIL), {}),
                        image_type: 'match',
                        subType: 'tactical_analysis',
                        sentiment: 'positive',
                        importance: 6,
                        clubId: club.id,
                        meta: generateMeta('Tactical View', 'positive')
                    });
                } else if (losses >= 3) {
                    const manager = club.staff.find(s => s.role === 'assistant')?.name || 'The Manager'; // Fallback
                    stories.push({
                        id: Date.now() + Math.random(),
                        date: state.currentDate,
                        headline: format(pick(HEADLINES.LOSING_STREAK), { club: club.name, manager }),
                        content: format(pick(CONTENT.CRISIS_DETAIL), {}),
                        image_type: 'general',
                        subType: 'punditry',
                        sentiment: 'negative',
                        importance: 8,
                        clubId: club.id,
                        meta: generateMeta('Fan TV', 'negative')
                    });
                }
            }
        }

        // 5. YOUTH HYPE
        if (Math.random() < 0.1) {
            const youth = allClubs.flatMap(c => c.players).find(p => p.age <= 19 && p.potential > 85 && p.overall > 60 && Math.random() < 0.1);
            if (youth) {
                const club = allClubs.find(c => c.id === youth.clubId);
                stories.push({
                    id: Date.now() + Math.random(),
                    date: state.currentDate,
                    headline: format(pick(HEADLINES.YOUTH_HYPE), { player: youth.name, club: club?.name || 'Club' }),
                    content: format(pick(CONTENT.YOUTH_DETAIL), { player: youth.name }),
                    image_type: 'award',
                    subType: 'scout_report',
                    sentiment: 'positive',
                    importance: 6,
                    clubId: club?.id,
                    meta: generateMeta('Youth Watch', 'positive')
                });
            }
        }

        // 6. MANAGER TALK (Random flavor)
        if (Math.random() < 0.05) {
            const club = pick(allClubs);
            // Assuming we don't have manager names easily on Club, we use generic or specific if available
            // Ah, Club has 'staff' but ManagerProfile is usually separate or implied.
            // Let's use "The Manager" or specific if we can find it.
            // In GameState, we have 'manager' (player) and 'aiManagers'.
            // But Club object structure in types.ts doesn't explicitly have a named manager property?
            // It has 'staff'.
            // Let's just use "Manager" for now.

            stories.push({
                id: Date.now() + Math.random(),
                date: state.currentDate,
                headline: format(pick(HEADLINES.MANAGER_TALK), { manager: `${club.name} Boss`, club: club.name }),
                content: "In a fiery press conference today, the manager took aim at the fixture list and the media.",
                image_type: 'general',
                subType: 'statement',
                sentiment: 'neutral',
                importance: 4,
                clubId: club.id,
                meta: generateMeta('National Press', 'neutral')
            });
        }

        return stories;
    }
};
