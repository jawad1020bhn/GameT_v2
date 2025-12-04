import { GameState, Club, Player, NewsItem } from '../types';
import { generatePlayer, getRandomName } from '../constants';
import { TRANSFER_HEADLINES, CONTENT, NEWS_SOURCES } from './news_templates';

// Helper to pick random item
const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// Helper: Check Transfer Window (Approximate for all leagues for gameplay fluidity)
const isTransferWindow = (dateStr: string): boolean => {
    const date = new Date(dateStr);
    const m = date.getMonth(); // 0 = Jan, 6 = July, 7 = Aug
    const d = date.getDate();
    // Winter Window
    if (m === 0) return true;
    // Summer Window (July, August, and first few days of Sept)
    if (m === 6 || m === 7) return true;
    if (m === 8 && d < 2) return true;
    return false;
};

// --- INTELLIGENT SQUAD ANALYSIS ---
const getSquadNeeds = (club: Club): { position: string, priority: number } | null => {
    // Sort squad by overall to find starters
    const sorted = [...club.players].sort((a, b) => b.overall - a.overall);
    const squadSize = club.players.length;

    // 1. Critical Shortage Check
    const counts = { GK: 0, DEF: 0, MID: 0, FWD: 0, ST: 0 };
    club.players.forEach(p => counts[p.position as keyof typeof counts]++);

    if (counts.GK < 2) return { position: 'GK', priority: 10 }; // Desperate
    if (counts.DEF < 6) return { position: 'DEF', priority: 9 };
    if (counts.MID < 5) return { position: 'MID', priority: 9 };
    if (counts.FWD + counts.ST < 4) return { position: 'FWD', priority: 8 };

    // 2. Quality Gap Analysis (Find weakest starter)
    // Assumption: 4-3-3 or 4-4-2 broadly
    const starterGK = sorted.find(p => p.position === 'GK');
    const starterDefs = sorted.filter(p => p.position === 'DEF').slice(0, 4);
    const starterMids = sorted.filter(p => p.position === 'MID').slice(0, 3);
    const starterAtts = sorted.filter(p => ['FWD', 'ST'].includes(p.position)).slice(0, 3);

    if (!starterGK) return { position: 'GK', priority: 10 };

    const avgOvr = sorted.slice(0, 11).reduce((a, b) => a + b.overall, 0) / 11;
    
    // Check for weak links (more than 3 points below squad avg)
    if (starterGK.overall < avgOvr - 3) return { position: 'GK', priority: 7 };
    
    const weakDef = starterDefs.find(p => p.overall < avgOvr - 4);
    if (weakDef) return { position: 'DEF', priority: 6 };

    const weakMid = starterMids.find(p => p.overall < avgOvr - 4);
    if (weakMid) return { position: 'MID', priority: 6 };

    const weakAtt = starterAtts.find(p => p.overall < avgOvr - 4);
    if (weakAtt) return { position: 'FWD', priority: 6 };

    // 3. Luxury / Depth Buys (if rich)
    if (club.budget > 50000000 && Math.random() < 0.3) {
        const positions = ['MID', 'FWD', 'ST']; // Rich clubs buy attackers
        return { position: positions[Math.floor(Math.random() * positions.length)], priority: 4 };
    }

    return null;
};

const scoreTransferTarget = (player: Player, buyer: Club, need: string): number => {
    let score = 0;
    
    // Positional Match
    if (player.position === need) score += 50;
    else if (need === 'FWD' && player.position === 'ST') score += 40;
    else if (need === 'ST' && player.position === 'FWD') score += 40;
    else return 0; // Wrong position

    // Ability vs Squad
    const avgOvr = buyer.players.reduce((a, b) => a + b.overall, 0) / buyer.players.length;
    if (player.overall > avgOvr + 5) score += 30; // Star signing
    else if (player.overall > avgOvr) score += 20; // Upgrade
    else if (player.potential > avgOvr + 10) score += 25; // Wonderkid
    else score += 5; // Depth

    // Age Profile
    if (player.age >= 23 && player.age <= 29) score += 15; // Prime
    else if (player.age < 23) score += 10; // Potential
    else score -= 5; // Aging

    // Financial Feasibility
    const affordability = buyer.budget / player.market_value;
    if (affordability > 2) score += 20; // Easily affordable
    else if (affordability < 1) score = -100; // Can't afford

    return score;
};

// --- FEATURE 1: AI MARKET ACTIVITY (REPLACES DOMINO TRANSFERS) ---
const processAiMarketActivity = (state: GameState, news: NewsItem[]): void => {
    if (!isTransferWindow(state.currentDate)) return;

    const allClubs = Object.values(state.leagues).flatMap(l => l.clubs);
    // Filter potential buyers - exclude player club
    const potentialBuyers = allClubs
        .filter(c => c.id !== state.playerClubId)
        .sort(() => 0.5 - Math.random()); // Shuffle
    
    let dailyTransfers = 0;
    const MAX_DAILY_TRANSFERS = 4; 

    for (const buyer of potentialBuyers) {
        if (dailyTransfers >= MAX_DAILY_TRANSFERS) break;
        if (buyer.players.length >= 30) continue;
        if (buyer.budget < 1000000) continue; 

        // 1. Analyze Needs
        const need = getSquadNeeds(buyer);
        if (!need) continue; // Squad is balanced

        // Chance to act based on priority
        const actChance = 0.05 + (need.priority * 0.02); // 0.05 to 0.25
        if (Math.random() > actChance) continue;

        // 2. Find Targets
        const candidates = allClubs
            .flatMap(c => c.players)
            .filter(p => 
                p.clubId !== buyer.id &&
                p.clubId !== state.playerClubId && 
                p.market_value <= buyer.budget * 1.1 && // Rough affordability check
                p.transfer_status !== 'not_for_sale'
            );

        // Score and sort targets
        const rankedTargets = candidates
            .map(p => ({ player: p, score: scoreTransferTarget(p, buyer, need.position) }))
            .filter(t => t.score > 50) // Filter out bad fits
            .sort((a, b) => b.score - a.score)
            .slice(0, 5); // Top 5 shortlist

        if (rankedTargets.length === 0) continue;

        const selected = rankedTargets[0].player; // AI picks the best fit
        const seller = allClubs.find(c => c.id === selected.clubId);
        if (!seller) continue;

        // 3. Negotiate & Execute
        // Dynamic Fee Calculation
        const feeVariance = 0.9 + (Math.random() * 0.4); // 0.9x to 1.3x market value
        let finalFee = Math.floor(selected.market_value * feeVariance);
        
        // "Bidding War" Simulation (if player is high quality)
        if (selected.overall > 82) finalFee = Math.floor(finalFee * 1.2);

        if (buyer.budget < finalFee) continue; // Failed negotiation

        // Execute
        buyer.budget -= finalFee;
        buyer.season_financials.transfer_spend += finalFee;
        seller.budget += finalFee;
        seller.season_financials.transfer_income += finalFee;

        seller.players = seller.players.filter(p => p.id !== selected.id);
        selected.clubId = buyer.id;
        selected.salary = Math.floor(selected.salary * (1.2 + (Math.random() * 0.3))); // Wage increase
        buyer.players.push(selected);

        dailyTransfers++;

        // 4. Generate Rich News
        let headlineTemplate = TRANSFER_HEADLINES.STANDARD;
        let subType: NewsItem['subType'] = 'statement';
        let sentiment: 'neutral' | 'positive' | 'negative' = 'neutral';
        let importance = 5;

        if (finalFee > 80000000) {
            headlineTemplate = TRANSFER_HEADLINES.RECORD;
            subType = 'punditry';
            importance = 10;
            sentiment = 'positive';
        } else if (finalFee < selected.market_value * 0.8) {
            headlineTemplate = TRANSFER_HEADLINES.BARGAIN;
            subType = 'tactical_analysis';
            importance = 6;
            sentiment = 'positive';
        } else if (selected.age < 21 && selected.potential > 85) {
            headlineTemplate = TRANSFER_HEADLINES.PROSPECT;
            subType = 'rumour';
            importance = 7;
            sentiment = 'positive';
        } else if (selected.age > 32) {
            headlineTemplate = TRANSFER_HEADLINES.VETERAN;
            importance = 4;
        }

        const formatHeadline = (str: string) => str
            .replace('{buyer}', buyer.name)
            .replace('{player}', selected.name)
            .replace('{fee}', (finalFee/1000000).toFixed(1));

        news.push({
            id: Date.now() + Math.random(),
            date: state.currentDate,
            headline: formatHeadline(pick(headlineTemplate)),
            content: `${pick(CONTENT.TRANSFER_GENERIC).replace('{age}', selected.age.toString()).replace('{player}', selected.name).replace('{wage}', (selected.salary/1000).toFixed(0))} The transfer fee is reported to be £${(finalFee/1000000).toFixed(1)}M.`,
            image_type: 'transfer',
            subType,
            sentiment,
            importance,
            clubId: buyer.id,
            meta: {
                source: pick(NEWS_SOURCES),
                tag: '#Official',
                likes: Math.floor(Math.random() * 50000),
                comments: Math.floor(Math.random() * 2000),
                reaction: sentiment === 'positive' ? "Incredible signing!" : "Interesting move."
            }
        });

        // --- CHAIN REACTION (Domino) ---
        // If seller lost a starter, they almost certainly buy a replacement
        const sellerNeeds = getSquadNeeds(seller);
        // High chance if they have money and hole in squad
        if (sellerNeeds && sellerNeeds.position === selected.position && seller.budget > 2000000 && Math.random() < 0.7) {
             
             // Quick search for replacement
             const replacementCandidates = allClubs
                .flatMap(c => c.players)
                .filter(p => 
                    p.clubId !== seller.id &&
                    p.clubId !== buyer.id &&
                    p.clubId !== state.playerClubId &&
                    p.position === selected.position &&
                    p.market_value <= seller.budget * 0.9 // Spend the money
                )
                .sort((a,b) => b.overall - a.overall) // Best available
                .slice(0, 3);

            if (replacementCandidates.length > 0) {
                const replacement = pick(replacementCandidates);
                const seller2 = allClubs.find(c => c.id === replacement.clubId);
                
                if (seller2) {
                    const fee2 = Math.floor(replacement.market_value * 1.1);
                    seller.budget -= fee2;
                    seller.season_financials.transfer_spend += fee2;
                    seller2.budget += fee2;
                    seller2.season_financials.transfer_income += fee2;

                    seller2.players = seller2.players.filter(p => p.id !== replacement.id);
                    replacement.clubId = seller.id;
                    seller.players.push(replacement);

                    const chainHeadline = pick(TRANSFER_HEADLINES.CHAIN)
                        .replace('{buyer}', seller.name)
                        .replace('{player}', replacement.name);

                    news.push({
                        id: Date.now() + Math.random() + 10,
                        date: state.currentDate,
                        headline: chainHeadline,
                        content: `Acting swiftly after selling ${selected.name}, ${seller.name} have triggered a release clause for ${replacement.name} from ${seller2.name}.`,
                        image_type: 'transfer',
                        subType: 'rumour',
                        importance: Math.max(4, importance - 2),
                        clubId: seller.id
                    });
                }
            }
        }
    }
};

// --- FEATURE 6: DYNAMIC STAFF & MANAGER AI ---
const processManagerMovement = (state: GameState, news: NewsItem[]): void => {
    Object.values(state.leagues).forEach(league => {
        league.clubs.forEach(club => {
            if (club.id === state.playerClubId) return;

            const sortedTable = [...league.clubs].sort((a, b) => b.stats.points - a.stats.points);
            const currentPos = sortedTable.findIndex(c => c.id === club.id) + 1;
            
            if (currentPos > club.board_expectations.league_position_target + 6 && Math.random() < 0.005) {
                const newStyles = ['Gegenpress', 'Tiki Taka', 'Catenaccio', 'Route One', 'Fluid Counter'];
                const newStyle = newStyles[Math.floor(Math.random() * newStyles.length)];
                
                club.style_identity.play_style = newStyle;
                club.job_security = 100; 
                
                club.players.forEach(p => p.form = Math.min(100, p.form + 15));

                news.push({
                    id: Date.now() + Math.random(),
                    date: state.currentDate,
                    headline: `SACKED! ${club.name} part ways with manager`,
                    content: `After a disastrous run of form leaving them in ${currentPos}th, ${club.name} have acted decisively. The new boss is expected to bring a '${newStyle}' philosophy to the club.`,
                    image_type: 'general',
                    subType: 'statement',
                    sentiment: 'negative',
                    importance: 9,
                    clubId: club.id,
                    meta: {
                        source: { name: 'Club Official', tier: 'Tier 0' },
                        tag: '#SackRace',
                        likes: Math.floor(Math.random() * 10000),
                        comments: 500,
                        reaction: "About time!"
                    }
                });
            }
        });
    });
};

// --- FEATURE 3: DAILY PLAYER GROWTH ALGORITHMS ---
const processDailyPlayerGrowth = (state: GameState, news: NewsItem[]) => {
    Object.values(state.leagues).forEach(league => {
        league.clubs.forEach(club => {
            const trainingQuality = club.infrastructure.training_ground.level / 10; // 0.1 to 1.0
            
            club.players.forEach(p => {
                const roll = Math.random();
                let changed = false;

                // GROWTH LOGIC
                // Young players (under 24), high potential, good morale
                if (p.age < 24 && p.potential > p.overall) {
                    // Base chance ~0.2% daily per attribute. Scaled by training and morale.
                    const growthChance = 0.002 * trainingQuality * (p.morale / 80); 
                    if (roll < growthChance) {
                        const attrs = Object.keys(p.attributes) as (keyof typeof p.attributes)[];
                        const attr = attrs[Math.floor(Math.random() * attrs.length)];
                        if (p.attributes[attr] < 99) {
                            p.attributes[attr]++;
                            changed = true;
                        }
                    }
                }

                // DECAY LOGIC
                // Old players (>32) or long-term injured
                if (p.age > 32 || (p.injury_status.type !== 'none' && p.injury_status.weeks_remaining > 4)) {
                    // Decay chance increases with age. ~0.1% at 31, up to ~1% at 40
                    const decayChance = 0.001 * (p.age - 30); 
                    if (roll < decayChance) {
                         const physicalAttrs = ['pace', 'physical'] as const;
                         const attr = physicalAttrs[Math.floor(Math.random() * physicalAttrs.length)];
                         if (p.attributes[attr] > 10) {
                             p.attributes[attr]--;
                             changed = true;
                         }
                    }
                }

                // Recalculate Overall & Market Value
                if (changed) {
                    const newOverall = Math.floor(
                        Object.values(p.attributes).reduce((a, b) => a + b, 0) / Object.values(p.attributes).length
                    );
                    
                    if (newOverall !== p.overall) {
                        const oldOverall = p.overall;
                        p.overall = newOverall;
                        
                        // Adjust Value roughly
                        const valueMod = newOverall > oldOverall ? 1.05 : 0.90;
                        p.market_value = Math.floor(p.market_value * valueMod);

                        // Notification for player's club
                        if (club.id === state.playerClubId && Math.random() < 0.3) {
                             news.push({
                                id: Date.now() + Math.random(),
                                date: state.currentDate,
                                headline: `TRAINING UPDATE: ${p.name}`,
                                content: newOverall > oldOverall 
                                    ? `${p.name} has shown improvement in training this week. Coaches report his overall game has stepped up.`
                                    : `${p.name} seems to be struggling physically. His performance levels have dropped slightly.`,
                                image_type: 'general',
                                subType: 'statement',
                                importance: 3,
                                clubId: club.id
                            });
                        }
                    }
                }
            });
        });
    });
};

// --- YOUTH INTAKE ---
const processYearlyRegens = (state: GameState, news: NewsItem[]): void => {
    const date = new Date(state.currentDate);
    if (date.getMonth() === 2 && date.getDate() === 15) {
        let bestRegen: Player | null = null;

        Object.values(state.leagues).forEach(league => {
            league.clubs.forEach(club => {
                const facilityLevel = club.infrastructure.youth_academy.level;
                const numPlayers = 2 + Math.floor(Math.random() * 2); 

                for (let i = 0; i < numPlayers; i++) {
                    const basePot = 60 + (facilityLevel * 3); 
                    const variance = Math.floor(Math.random() * 20) - 5;
                    const potential = Math.min(99, basePot + variance);
                    const overall = Math.floor(potential * 0.6); 
                    
                    const positions = ["GK", "DEF", "MID", "FWD", "ST"] as const;
                    const pos = positions[Math.floor(Math.random() * positions.length)];
                    
                    const newId = Date.now() + Math.floor(Math.random() * 100000);
                    const regen = generatePlayer(newId, club.id, pos, overall, 16);
                    regen.potential = potential;
                    regen.name = getRandomName();
                    regen.squad_role = "prospect";
                    regen.market_value = 0; 

                    club.players.push(regen);

                    if (!bestRegen || regen.potential > bestRegen.potential) {
                        bestRegen = regen;
                    }
                }
            });
        });

        if (bestRegen) {
             const club = Object.values(state.leagues).flatMap(l => l.clubs).find(c => c.id === bestRegen!.clubId);
             news.push({
                id: Date.now(),
                date: state.currentDate,
                headline: "NxGn: The Class of '25 Arrives",
                content: `Youth intake day has arrived. Scouts are raving about a 16-year-old prospect at ${club?.name}, touted as the 'Next Big Thing'.`,
                image_type: 'award',
                subType: 'punditry',
                sentiment: 'positive',
                importance: 10,
                meta: {
                    source: { name: 'Wonderkid Watch', tier: 'Tier 1' },
                    tag: '#NxGn',
                    likes: 90000,
                    comments: 2000,
                    reaction: "Remember the name!"
                }
            });
        }
    }
};

// --- GLOBAL ECONOMY ---
const processGlobalEconomy = (state: GameState): void => {
    const date = new Date(state.currentDate);
    if (date.getMonth() === 5 && date.getDate() === 30) {
        Object.values(state.leagues).forEach(league => {
            const totalSpend = league.clubs.reduce((acc, c) => acc + c.season_financials.transfer_spend, 0);
            const spendingFactor = totalSpend > 500000000 ? 0.02 : 0;
            const newInflation = (league.coefficient * 0.03) + spendingFactor;
            league.inflation_rate = newInflation;
            league.clubs.forEach(c => {
                c.players.forEach(p => {
                    p.market_value = Math.floor(p.market_value * (1 + newInflation));
                    p.salary = Math.floor(p.salary * (1 + (newInflation / 2))); 
                });
                c.budget = Math.floor(c.budget * (1 + league.inflation_rate));
            });
        });
    }
};

export const AdvancedEngine = {
    processDailyEvents: (state: GameState, news: NewsItem[]): void => {
        processAiMarketActivity(state, news); 
        processManagerMovement(state, news);
        processDailyPlayerGrowth(state, news); 
        processYearlyRegens(state, news);
        processGlobalEconomy(state);
    }
};