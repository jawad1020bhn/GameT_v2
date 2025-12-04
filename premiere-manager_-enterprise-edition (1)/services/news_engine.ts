
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
        positive: ["Huge result!", "Love to see it.", "We are back!", "Trust the process.", "What a player!"],
        negative: ["Embarrassing.", "Board out.", "Players aren't trying.", "Disaster class.", "Sell him."],
        neutral: ["Interesting development.", "Wait and see.", "Big if true.", "Tactical battle.", "Needs time."]
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
        if (seed > 0.4) return stories; // Limit frequency

        const allClubs = Object.values(state.leagues).flatMap(l => l.clubs);

        // 1. SACK RACE (Managers under pressure)
        const crisisClub = allClubs.find(c => c.job_security < 35);
        if (crisisClub && seed < 0.1) {
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
        if (negotiation && seed > 0.2 && seed < 0.3) {
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

        // 3. PLAYER UNREST
        const unhappyPlayer = allClubs.flatMap(c => c.players).find(p => p.morale < 30 && p.overall > 80);
        if (unhappyPlayer && seed > 0.3 && seed < 0.35) {
             const club = allClubs.find(c => c.id === unhappyPlayer.clubId);
             stories.push({
                 id: Date.now() + Math.random(),
                 date: state.currentDate,
                 headline: format(pick(HEADLINES.PLAYER_UNREST), { player: unhappyPlayer.name, club: club?.name || 'the club' }),
                 content: `${unhappyPlayer.name}'s body language in training has raised eyebrows. Rumours of a falling out with management are circulating.`,
                 image_type: 'general',
                 subType: 'scandal',
                 sentiment: 'negative',
                 importance: 9,
                 clubId: club?.id,
                 meta: generateMeta('Tier 3', 'negative')
             });
        }

        // 4. PLAYER FORM (Punditry)
        const inFormPlayer = allClubs.flatMap(c => c.players).find(p => p.season_stats.goals > 5 && p.form > 85);
        if (inFormPlayer && seed > 0.35) {
             const club = allClubs.find(c => c.id === inFormPlayer.clubId);
             stories.push({
                id: Date.now() + Math.random(),
                date: state.currentDate,
                headline: format(pick(HEADLINES.PLAYER_FORM), { player: inFormPlayer.name, club: club?.name || '' }),
                content: `${inFormPlayer.name} has been in sensational form recently, contributing key goals and assists. Is he the best player in the league right now?`,
                image_type: 'award',
                subType: 'punditry',
                sentiment: 'positive',
                importance: 6,
                clubId: club?.id,
                meta: generateMeta('The Pundit', 'positive')
            });
        }

        return stories;
    }
};
