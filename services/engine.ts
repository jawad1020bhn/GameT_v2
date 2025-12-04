import { GameState, League, Club, Fixture, GameMessage, Player, NewsItem, Trophy, Negotiation, TransferOffer, View, MatchEvent, FacilityDetails, ContractOffer, Tactics, SeasonFinancials, GalaData, PlayerRole } from '../types';
import { generateFixtures, injectCupFixtures, getSeasonDates, generatePlayer, getRandomName } from '../constants';
import { NewsEngine } from './news_engine';
import { AdvancedEngine } from './advanced_engine';
import { RoleService } from './RoleService';
import { FinancialEngine } from './FinancialEngine';

// Helper to add days to a YYYY-MM-DD string
export const addDays = (dateStr: string, days: number): string => {
    const date = new Date(dateStr);
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
};

export const formatDate = (dateStr: string): string => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString('en-GB', options);
};

// --- DYNAMIC VALUATION ENGINE ---
export const calculatePlayerValue = (player: Player): number => {
    let value = player.market_value;
    const endDate = new Date(player.contract_end);
    const today = new Date();
    const yearsLeft = (endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 365);
    if (yearsLeft < 1) value *= 0.6;
    else if (yearsLeft > 3) value *= 1.2;
    if (player.form > 85) value *= 1.15;
    if (player.form < 60) value *= 0.9;
    if (player.age < 22) value *= 1.3;
    else if (player.age > 32) value *= 0.6;
    return Math.floor(value);
};

// --- DYNAMIC WORLD HELPERS ---

// GRAVITY MODEL: Updates reputation dynamically
const updateClubReputation = (club: Club, change: number, reason: string, messages: GameMessage[], date: string) => {
    const oldRep = club.reputation;
    club.reputation = Math.min(100, Math.max(1, club.reputation + change));

    if (Math.floor(oldRep / 10) !== Math.floor(club.reputation / 10)) {
        // Significant tier change
        messages.push({
            id: Date.now() + Math.random(),
            date,
            sender: "Club Secretary",
            subject: "Global Standing Update",
            body: `Due to recent ${reason}, our global reputation has ${change > 0 ? 'risen' : 'fallen'} to ${club.reputation.toFixed(1)}. This will impact sponsorship deals and player attraction.`,
            read: false,
            type: 'news'
        });
    }
};

// FAN MOOD DYNAMICS
const updateFanHappiness = (club: Club, change: number) => {
    club.fan_happiness = Math.min(100, Math.max(0, club.fan_happiness + change));
};


// --- PREDICTIVE ANALYTICS ---
export const calculateWinProbability = (home: Club, away: Club): number => {
    // Simplified Elo-like calculation based on Overall ratings and Form
    const homeStr = home.players.reduce((acc, p) => acc + p.overall, 0) / Math.max(1, home.players.length) + (home.reputation / 2);
    const awayStr = away.players.reduce((acc, p) => acc + p.overall, 0) / Math.max(1, away.players.length) + (away.reputation / 2);

    // Tactical Familiarity Bonus (Home Team only as player)
    let homeBonus = 10; // Home advantage base
    if (home.tactics) {
        homeBonus += (home.tactics.familiarity / 10);
    }

    const diff = (homeStr + homeBonus) - awayStr;
    const probability = 1 / (1 + Math.pow(10, (-diff / 40)));

    return Math.min(0.99, Math.max(0.01, probability));
};


// --- INFRASTRUCTURE & FINANCE ENGINE ---

export const upgradeFacility = (club: Club, facilityType: 'youth_academy' | 'training_ground' | 'medical_center'): boolean => {
    const facility = club.infrastructure[facilityType];
    if (facility.level >= facility.max_level || facility.is_upgrading) return false;
    if (club.budget < facility.next_upgrade_cost) return false;

    club.budget -= facility.next_upgrade_cost;
    facility.is_upgrading = true;
    facility.weeks_remaining = facility.next_upgrade_weeks;

    return true;
};

const processInfrastructureDaily = (club: Club, date: string, messages: GameMessage[]) => {
    // Helper to process a single facility
    const checkUpgrade = (facility: FacilityDetails) => {
        if (facility.is_upgrading) {
            // Approximate: 1 day = 1/7th of a week
            facility.weeks_remaining -= 0.142;
            if (facility.weeks_remaining <= 0) {
                facility.is_upgrading = false;
                facility.level += 1;
                facility.weeks_remaining = 0;

                // Update cost/time for next level
                facility.next_upgrade_cost *= 1.5;
                facility.next_upgrade_weeks += 2;
                facility.maintenance_cost *= 1.2;

                // Add Message
                messages.unshift({
                    id: Date.now(),
                    date: date,
                    sender: "Facilities Manager",
                    subject: `Construction Complete: ${facility.name}`,
                    body: `${facility.name} has been upgraded to Level ${facility.level}.`,
                    read: false,
                    type: 'email'
                });
            }
        }
    };

    checkUpgrade(club.infrastructure.youth_academy);
    checkUpgrade(club.infrastructure.training_ground);
    checkUpgrade(club.infrastructure.medical_center);

    // Daily Maintenance Deductions (amortized)
    const dailyMaint = (
        club.infrastructure.youth_academy.maintenance_cost +
        club.infrastructure.training_ground.maintenance_cost +
        club.infrastructure.medical_center.maintenance_cost +
        club.infrastructure.stadium.maintenance_cost
    ) / 7;

    // Deterministic financial tracking, stochastic cash flow effect (or just smooth it out)
    if (Math.random() < 0.1) {
        const deduction = dailyMaint * 10;
        club.budget -= deduction;
        club.season_financials.facility_maintenance += deduction;
    }
};

const generateSponsorOffers = (club: Club, date: string) => {
    if (Math.random() > 0.02) return;
    if (club.sponsorships.offers.length >= 3) return;

    const companyNames = ["Northern Rail", "Crown Lager", "Apex Motors", "Vertex Insurance", "Kingfisher", "Royal Bank", "Sovereign Oil", "Titan Bet"];
    const name = companyNames[Math.floor(Math.random() * companyNames.length)];

    // GRAVITY MODEL: Sponsorships scale exponentially with Reputation
    const baseValue = 400000;
    const scalingFactor = Math.pow(club.reputation / 50, 1.2);

    const risk = Math.random();

    const offer = {
        id: `sp_${Date.now()}`,
        name,
        type: "kit_sleeve" as const,
        amount_per_season: Math.floor(baseValue * scalingFactor * (0.8 + (Math.random() * 0.4))),
        years_remaining: 1 + Math.floor(Math.random() * 3),
        bonus_condition: risk > 0.5 ? "top_4" : undefined,
        bonus_amount: risk > 0.5 ? baseValue * scalingFactor * 0.5 : undefined
    };

    club.sponsorships.offers.push(offer);
};

// --- OWNER DYNAMICS ENGINE ---
const processOwnerLogic = (club: Club, leaguePos: number, date: string): { messages: GameMessage[], news: NewsItem[] } => {
    const { owner } = club;
    const messages: GameMessage[] = [];
    const news: NewsItem[] = [];
    const msgIdBase = Date.now() + Math.floor(Math.random() * 1000);

    // Job Security Check (Added Fan Mood influence)
    const moodPenalty = club.fan_happiness < 30 ? 2 : 1;

    if (owner.patience < 40 && club.job_security < (40 * moodPenalty) && Math.random() < 0.1) {
        messages.push({
            id: msgIdBase + 3,
            date,
            sender: "The Board",
            subject: "URGENT: Position Under Review",
            body: club.fan_happiness < 30
                ? "The atmosphere in the stadium is toxic. The board is under immense pressure to make a change."
                : "The board is extremely disappointed with recent results. Your position is currently under review. We expect an immediate turnaround.",
            read: false,
            type: 'email'
        });
    }

    // Regular dynamics
    if (owner.ambition > 80 && owner.spend_tendency > 80 && club.budget < 5000000 && Math.random() < 0.02) {
        const injection = 50000000;
        club.budget += injection;
        club.cash_reserves += injection;

        news.push({
            id: msgIdBase,
            date,
            headline: `WAR CHEST: ${club.name.toUpperCase()} OWNER INJECTS £50M`,
            content: "The board has approved a significant capital injection to aid transfer market activity and club operations.",
            image_type: 'finance',
            clubId: club.id
        });

        messages.push({
            id: msgIdBase + 1,
            date,
            sender: "The Chairman",
            subject: "Additional Investment",
            body: "I am not seeing the dominance I expect. I have injected £50M into the transfer budget. Spend it wisely. I expect results.",
            read: false,
            type: 'email'
        });
    }

    return { messages, news };
};

// --- SOCIAL DYNAMICS (NEW) ---
const processSocialDynamics = (club: Club, events: string[]) => {
    // Leaders buffer morale loss, Toxic players spread it
    const leadership = club.players.reduce((acc, p) => acc + p.personality.leadership, 0) / club.players.length;

    // Random interpersonal events
    if (Math.random() < 0.01) {
        const troublemaker = club.players.find(p => p.personality.temperament < 30);
        if (troublemaker) {
            club.players.forEach(p => p.morale = Math.max(0, p.morale - 5));
            events.push(`Locker Room: ${troublemaker.name} caused a scene, lowering morale.`);
        }
    }

    // High leadership boosts recovery
    if (leadership > 60) {
        club.players.forEach(p => {
            if (p.morale < 50) p.morale += 1;
        });
    }
};


// --- HEARTBEAT MATCH ENGINE (v2.1 - With Tactical Matchups) ---

const getZoneControl = (club: Club): number => {
    // 1.1 Zone of Control Logic
    const mids = club.players.filter(p => p.position === 'MID');
    if (!mids.length) return 50;

    // Tactical Influence
    let tacticalBonus = 0;
    if (club.tactics) {
        tacticalBonus += club.tactics.instructions.pressing_intensity / 10; // Pressing gives control but risks counters
        tacticalBonus += (club.tactics.instructions.line_height - 50) / 10; // High line compresses play
    }

    const avgControl = mids.reduce((sum, p) => sum + (p.attributes.passing + p.attributes.mental + p.attributes.physical) / 3, 0) / mids.length;
    const moraleMod = 0.9 + (club.players.reduce((acc, p) => acc + p.morale, 0) / club.players.length / 1000) * 2;

    return (avgControl + tacticalBonus) * moraleMod;
};

const resolveDuel = (attacker: Player, defender: Player): 'win' | 'loss' | 'foul' => {
    const attackerScore = (attacker.attributes.dribbling * 0.4) + (attacker.attributes.pace * 0.4) + (attacker.attributes.mental * 0.2) + (attacker.form > 80 ? 5 : 0);
    const defenderScore = (defender.attributes.defending * 0.5) + (defender.attributes.physical * 0.3) + (defender.attributes.mental * 0.2);

    // Sigmoid Probability for realistic outcomes
    const diff = attackerScore - defenderScore;
    const winProb = 1 / (1 + Math.exp(-diff / 8));

    if (Math.random() < winProb) return 'win';
    if (defender.attributes.physical > 80 && Math.random() < 0.1) return 'foul';
    return 'loss';
};

// Tactical Paper-Scissors-Rock
const getTacticalAdvantage = (t1: Tactics, t2: Tactics): number => {
    // Simple Logic:
    // High Line vs Fast Direct = Bad
    // High Press vs Low Tempo = Good

    let adv = 0;
    if (t1.instructions.line_height > 70 && t2.instructions.passing_directness > 70) adv -= 10; // Counter attack vulnerability
    if (t1.instructions.pressing_intensity > 70 && t2.instructions.tempo < 40) adv += 10; // Caught in possession

    return adv;
};

interface MatchStats {
    playerId: number;
    goals: number;
    assists: number;
    rating: number;
    yellow: boolean;
    red: boolean;
}

const simulateMatch = (home: Club, away: Club, strictness: number, isKnockout: boolean = false, weather: 'sunny' | 'rain' | 'snow' | 'cloudy' = 'sunny'): { homeGoals: number; awayGoals: number; events: MatchEvent[]; penalties?: boolean; playerStats: MatchStats[] } => {
    let homeGoals = 0;
    let awayGoals = 0;
    let momentum = 0; // -10 to 10
    const events: MatchEvent[] = [];
    const playerStats: MatchStats[] = [...home.players, ...away.players].map(p => ({
        playerId: p.id, goals: 0, assists: 0, rating: 6.0 + (Math.random() * 1.0), yellow: false, red: false
    }));

    const getStat = (pid: number) => playerStats.find(s => s.playerId === pid)!;

    let homeControl = getZoneControl(home);
    let awayControl = getZoneControl(away);

    const homeMods = RoleService.getClubRoleModifiers(home);
    const awayMods = RoleService.getClubRoleModifiers(away);

    // Apply Tactical Advantage
    let tacAdv = getTacticalAdvantage(home.tactics, away.tactics);
    tacAdv += (homeMods.tacticalAdaptability || 0) * 10;
    tacAdv -= (awayMods.tacticalAdaptability || 0) * 10;

    // Width Effect: Trade control for chances
    if (home.tactics) homeControl -= (home.tactics.instructions.attacking_width - 50) / 10;
    if (away.tactics) awayControl -= (away.tactics.instructions.attacking_width - 50) / 10;

    // Weather Effects
    let passingMod = 1.0;
    let staminaDrainMod = 1.0;
    if (weather === 'rain') { passingMod = 0.9; staminaDrainMod = 1.1; }
    if (weather === 'snow') { passingMod = 0.8; staminaDrainMod = 1.2; }
    if (weather === 'sunny') { staminaDrainMod = 1.05; } // Heat

    const totalControl = (homeControl * passingMod) + (awayControl * passingMod) + tacAdv;
    const homeDominanceBase = ((homeControl * passingMod) + tacAdv / 2) / totalControl;

    // TACTICAL MODIFIERS
    let homeChanceMod = 1.0;
    let awayChanceMod = 1.0;
    let homeCardMod = 1.0;
    let awayCardMod = 1.0;

    // Role Effects
    homeChanceMod += (homeMods.homeAtmosphere || 0);
    homeChanceMod -= (awayMods.defensiveOrganization || 0) * 0.5;
    awayChanceMod -= (homeMods.defensiveOrganization || 0) * 0.5;

    const applyTactics = (t: Tactics | undefined, isHome: boolean) => {
        if (!t) return;
        const wMod = (t.instructions.attacking_width - 50) / 100;
        const pMod = (t.instructions.pressing_intensity - 50) / 100;
        const dMod = (t.instructions.passing_directness - 50) / 200;
        const tMod = (t.instructions.tackling_style - 50) / 50;

        if (isHome) {
            homeChanceMod += wMod + dMod;
            homeCardMod += pMod + tMod;
        } else {
            awayChanceMod += wMod + dMod;
            awayCardMod += pMod + tMod;
        }
    };

    applyTactics(home.tactics, true);
    applyTactics(away.tactics, false);

    for (let minute = 1; minute <= 90; minute++) {
        // Momentum Dynamics
        if (momentum > 0.5) momentum -= 0.1;
        else if (momentum < -0.5) momentum += 0.1;

        const momEffect = momentum * 0.02; // Up to +/- 20% swing
        const homeDominance = Math.min(0.95, Math.max(0.05, homeDominanceBase + momEffect));

        const isHomeAttack = Math.random() < homeDominance;
        const attackingTeam = isHomeAttack ? home : away;
        const defendingTeam = isHomeAttack ? away : home;
        const chanceMod = isHomeAttack ? homeChanceMod : awayChanceMod;

        // Creative Freedom: Chance for brilliance or turnover
        const freedom = attackingTeam.tactics?.instructions.creative_freedom || 50;
        const freedomBonus = Math.random() < (freedom / 500) ? 0.1 : 0;

        let actionProb = (0.04 + freedomBonus) * chanceMod;
        if (minute > 80 && Math.abs(homeGoals - awayGoals) <= 1) actionProb = 0.08;

        if (Math.random() < actionProb) {
            const attackers = attackingTeam.players.filter(p => ['FWD', 'ST', 'MID'].includes(p.position));
            const defenders = defendingTeam.players.filter(p => ['DEF', 'GK'].includes(p.position));

            // Use tactics lineup if available, else random
            const attacker = attackers[Math.floor(Math.random() * attackers.length)] || attackingTeam.players[0];
            const defender = defenders[Math.floor(Math.random() * defenders.length)] || defendingTeam.players[0];

            // Stamina Check: Tired players perform worse
            const attackerFatigue = (100 - attacker.condition) / 100;
            const defenderFatigue = (100 - defender.condition) / 100;

            // Reduce condition
            attacker.condition = Math.max(0, attacker.condition - (0.1 * staminaDrainMod));
            defender.condition = Math.max(0, defender.condition - (0.1 * staminaDrainMod));

            const duelResult = resolveDuel(attacker, defender);

            if (duelResult === 'win') {
                // Momentum Swing
                if (isHomeAttack) momentum = Math.min(10, momentum + 0.5);
                else momentum = Math.max(-10, momentum - 0.5);

                const shotQuality = (attacker.attributes.shooting + attacker.attributes.mental) / 2 * (1 - attackerFatigue * 0.3);
                const gk = defendingTeam.players.find(p => p.position === 'GK') || defendingTeam.players[0];
                const saveQuality = gk.attributes.goalkeeping + (Math.random() * 20);

                // xG Calculation
                const distance = Math.random(); // 0-1 (1 is close)
                const angle = Math.random(); // 0-1 (1 is central)
                const xG = (0.7 * distance * angle) * (attacker.attributes.shooting / 100);

                if (shotQuality + (Math.random() * 20) > saveQuality) {
                    if (isHomeAttack) { homeGoals++; momentum = 5; } // Goal Boost
                    else { awayGoals++; momentum = -5; }

                    const sStats = getStat(attacker.id);
                    sStats.goals++;
                    sStats.rating += 1.0;

                    const possibleAssisters = attackingTeam.players.filter(p => p.id !== attacker.id && p.position !== 'GK');
                    if (possibleAssisters.length > 0 && Math.random() > 0.3) {
                        const assister = possibleAssisters[Math.floor(Math.random() * possibleAssisters.length)];
                        const aStats = getStat(assister.id);
                        aStats.assists++;
                        aStats.rating += 0.5;
                        events.push({
                            minute,
                            type: 'goal',
                            text: `GOAL! ${attacker.name} scores (${assister.name} assist). ${attackingTeam.name} leads.`,
                            team: isHomeAttack ? 'home' : 'away',
                            xg: xG
                        });
                    } else {
                        events.push({
                            minute,
                            type: 'goal',
                            text: `GOAL! ${attacker.name} scores a solo effort!`,
                            team: isHomeAttack ? 'home' : 'away',
                            xg: xG
                        });
                    }
                } else {
                    if (Math.random() > 0.7) {
                        events.push({ minute, type: 'commentary', text: `BIG SAVE! ${gk.name} denies ${attacker.name}.`, team: 'neutral', xg: xG });
                        getStat(gk.id).rating += 0.3;
                    }
                }
            } else if (duelResult === 'foul') {
                const cardRoll = Math.random() * 100;
                const dStats = getStat(defender.id);
                const cardMod = isHomeAttack ? awayCardMod : homeCardMod;

                // Aggression Effect
                const aggression = defendingTeam.tactics?.instructions.tackling_style || 50;
                const riskFactor = 1 + ((aggression - 50) / 50); // 0.5 to 2.0

                if (cardRoll < (strictness / 4) * cardMod * riskFactor) {
                    events.push({ minute, type: 'card', text: `RED CARD! ${defender.name} is sent off!`, team: isHomeAttack ? 'away' : 'home' });
                    dStats.red = true;
                    dStats.rating -= 2.0;
                } else if (cardRoll < strictness * cardMod) {
                    events.push({ minute, type: 'card', text: `Yellow Card for ${defender.name}.`, team: isHomeAttack ? 'away' : 'home' });
                    dStats.yellow = true;
                    dStats.rating -= 0.5;
                }
            }
        }
    }

    if (awayGoals === 0) home.players.filter(p => ['GK', 'DEF'].includes(p.position)).forEach(p => getStat(p.id).rating += 0.5);
    if (homeGoals === 0) away.players.filter(p => ['GK', 'DEF'].includes(p.position)).forEach(p => getStat(p.id).rating += 0.5);

    let penalties = false;
    if (isKnockout && homeGoals === awayGoals) {
        penalties = true;
        if (Math.random() > 0.5) {
            homeGoals++;
            events.push({ minute: 120, type: 'goal', text: `PENALTIES: ${home.name} win!`, team: 'home' });
        } else {
            awayGoals++;
            events.push({ minute: 120, type: 'goal', text: `PENALTIES: ${away.name} win!`, team: 'away' });
        }
    }

    return { homeGoals, awayGoals, events, penalties, playerStats };
};

const updatePlayersDaily = (club: Club, playedMatch: boolean, competition?: string | null, matchStats?: MatchStats[]) => {
    // Facility Effects
    const injuryReduction = club.infrastructure.medical_center.level * 0.05;
    const fitnessRecovery = club.infrastructure.training_ground.level * 0.5;

    // Staff Effects
    const assistant = club.staff.find(s => s.role === 'assistant');
    const physio = club.staff.find(s => s.role === 'physio');

    const tacticalBoost = assistant ? (assistant.attributes.coaching / 100) * 0.5 : 0.1;
    const healingBoost = physio ? (physio.attributes.healing / 100) * 0.2 : 0;

    const clubMods = RoleService.getClubRoleModifiers(club);

    // Increase Tactical Familiarity if match played
    if (playedMatch && club.tactics) {
        club.tactics.familiarity = Math.min(100, club.tactics.familiarity + 0.5 + tacticalBoost);
    } else if (club.tactics) {
        // Training gain
        club.tactics.familiarity = Math.min(100, club.tactics.familiarity + 0.1 + (tacticalBoost / 2));
    }

    club.players.forEach(p => {
        if (matchStats) {
            const stat = matchStats.find(s => s.playerId === p.id);
            if (stat) {
                p.season_stats.appearances++;
                p.season_stats.goals += stat.goals;
                p.season_stats.assists += stat.assists;
                p.season_stats.yellow_cards += stat.yellow ? 1 : 0;
                p.season_stats.red_cards += stat.red ? 1 : 0;
                const currentTotal = p.season_stats.avg_rating * (p.season_stats.appearances - 1);
                p.season_stats.avg_rating = (currentTotal + stat.rating) / p.season_stats.appearances;
                if (stat.rating > 8.5) p.season_stats.mom_awards++;

                if (competition) {
                    if (!p.competition_stats) p.competition_stats = {};
                    if (!p.competition_stats[competition]) {
                        p.competition_stats[competition] = { goals: 0, assists: 0, clean_sheets: 0, appearances: 0, yellow_cards: 0, red_cards: 0, avg_rating: 0, mom_awards: 0 };
                    }
                    const cStats = p.competition_stats[competition];
                    cStats.appearances++;
                    cStats.goals += stat.goals;
                    cStats.assists += stat.assists;
                    cStats.yellow_cards += stat.yellow ? 1 : 0;
                    cStats.red_cards += stat.red ? 1 : 0;
                    const cTotal = cStats.avg_rating * (cStats.appearances - 1);
                    cStats.avg_rating = (cTotal + stat.rating) / cStats.appearances;
                    if (stat.rating > 8.5) cStats.mom_awards++;
                }
            }
        }

        if (playedMatch) {
            const fatigueHit = 15 + Math.random() * 10;
            p.fitness = Math.max(10, p.fitness - fatigueHit);
            p.condition = Math.max(10, p.condition - 30); // Major condition hit after match
            p.form = Math.min(100, Math.max(0, p.form + (Math.random() * 10 - 5)));
        } else {
            // Apply Stamina Decline reduction (from Workhorse/Squad Player)
            const roleDef = p.roles ? p.roles.map(r => RoleService.getRoleDefinition(r).modifiers(p)) : [];
            const staminaRecoveryBonus = roleDef.reduce((sum, m) => sum + (m.staminaDecline || 0), 0);

            p.fitness = Math.min(100, p.fitness + 8 + Math.random() * 3 + fitnessRecovery + (staminaRecoveryBonus * 5));
            p.condition = Math.min(100, p.condition + 20 + fitnessRecovery); // Recover condition fast

            // Training Growth (Dynamic Evolution - Performance Based)
            const personalDevMod = roleDef.reduce((sum, m) => sum + (m.developmentSpeed || 0), 0);
            const formFactor = Math.max(0.5, p.form / 60);
            const ratingFactor = p.season_stats.appearances > 0 ? Math.max(0.8, p.season_stats.avg_rating / 6.5) : 1.0;

            const growthChance = 0.02 * (1 + (clubMods.teamTrainingEfficiency || 0) + personalDevMod) * formFactor * ratingFactor;

            if (p.overall < p.potential && Math.random() < growthChance) {
                const keys = Object.keys(p.attributes) as (keyof typeof p.attributes)[];
                const key = keys[Math.floor(Math.random() * keys.length)];
                if (p.attributes[key] < 99) {
                    p.attributes[key]++;
                    // Small chance to bump overall
                    if (Math.random() < 0.1) p.overall++;
                }
            }
        }

        if (p.injury_status.type !== "none") {
            p.injury_status.weeks_remaining -= ((1 / 7) * (1 + (club.infrastructure.medical_center.level * 0.1) + healingBoost));
            if (p.injury_status.weeks_remaining <= 0) {
                p.injury_status.type = "none";
                p.injury_status.weeks_remaining = 0;
            }
        } else {
            const roleDef = p.roles ? p.roles.map(r => RoleService.getRoleDefinition(r).modifiers(p)) : [];
            const injuryResist = roleDef.reduce((sum, m) => sum + (m.injuryResistance || 0), 0);

            const redZoneMult = p.fitness < 75 ? 4 : 1;
            if (Math.random() < 0.0005 * p.injury_status.proneness * redZoneMult * (1 - injuryReduction) * (1 - injuryResist)) {
                p.injury_status.type = "hamstring";
                p.injury_status.weeks_remaining = 2 + Math.floor(Math.random() * 4);
            }
        }
    });
};

// --- TRANSFER ENGINE ---

const processNegotiations = (state: GameState): Negotiation[] => {
    const updatedNegotiations = [...state.negotiations];
    const currentDate = new Date(state.currentDate);

    updatedNegotiations.forEach(neg => {
        if (new Date(neg.next_response_date) <= currentDate) {
            const player = Object.values(state.leagues).flatMap(l => l.clubs).flatMap(c => c.players).find(p => p.id === neg.playerId);
            const sellingClub = Object.values(state.leagues).flatMap(l => l.clubs).find(c => c.id === neg.sellingClubId);
            const buyingClub = Object.values(state.leagues).flatMap(l => l.clubs).find(c => c.id === neg.buyingClubId);
            const buyingLeague = Object.values(state.leagues).find(l => l.clubs.some(c => c.id === neg.buyingClubId));

            if (!player || !sellingClub || !buyingClub) return;

            // GRAVITY MODEL: Check if club is too small for player
            if (neg.status === 'active' && neg.stage === 'club_fee') {
                if (player.reputation > buyingClub.reputation + 15 && Math.random() < 0.9) {
                    neg.status = 'collapsed';
                    neg.agent_comments = "My client does not see this move as a step forward for his career.";
                    state.messages.unshift({
                        id: Date.now(),
                        date: state.currentDate,
                        sender: "Player Agent",
                        subject: `NEGOTIATION FAILED: ${player.name}`,
                        body: `We are looking for a club with higher global standing. ${buyingClub.name} does not match our ambition.`,
                        read: false,
                        type: 'transfer_bid'
                    });
                    return;
                }
            }

            if (neg.status === 'active' && neg.stage === 'club_fee') {
                if (!neg.latest_offer) return;

                const offer = neg.latest_offer;
                const valuation = neg.ai_valuation!;
                const totalValue = offer.fee + (offer.installments * 0.9);

                let patienceHit = 0;
                if (totalValue < valuation.min_fee * 0.7) patienceHit = 20;
                else if (totalValue < valuation.min_fee * 0.9) patienceHit = 10;

                valuation.patience = Math.max(0, valuation.patience - patienceHit);

                if (valuation.patience <= 0) {
                    neg.status = 'collapsed';
                    neg.agent_comments = "The club has walked away due to lowball offers.";
                    state.messages.unshift({
                        id: Date.now(),
                        date: state.currentDate,
                        sender: sellingClub.name,
                        subject: `NEGOTIATIONS COLLAPSED: ${player.name}`,
                        body: `We have grown tired of your undervaluation of ${player.name}. We are withdrawing from talks.`,
                        read: false,
                        type: 'transfer_bid'
                    });
                } else if (totalValue >= valuation.min_fee) {
                    neg.status = 'agreed_fee';
                    neg.stage = 'contract';
                    neg.next_response_date = state.currentDate;
                    neg.agent_comments = "Fee agreed. Now let's talk about my client's terms.";
                    state.messages.unshift({
                        id: Date.now(),
                        date: state.currentDate,
                        sender: sellingClub.name,
                        subject: `BID ACCEPTED: ${player.name}`,
                        body: `We have accepted your offer for ${player.name}. You may now discuss terms with his agent.`,
                        read: false,
                        type: 'transfer_bid',
                        actionLink: { view: View.TRANSFERS, id: neg.id }
                    });
                } else {
                    const counterFee = Math.floor((offer.fee + valuation.min_fee * 1.2) / 2);
                    state.messages.unshift({
                        id: Date.now(),
                        date: state.currentDate,
                        sender: sellingClub.name,
                        subject: `BID RESPONSE: ${player.name}`,
                        body: `Your offer is insufficient. We want close to £${(counterFee / 1000000).toFixed(1)}M. Patience is ${valuation.patience}%.`,
                        read: false,
                        type: 'transfer_bid',
                        actionLink: { view: View.TRANSFERS, id: neg.id }
                    });
                    neg.next_response_date = addDays(state.currentDate, 2);
                }
            }
            else if (neg.status === 'agreed_fee' && neg.stage === 'contract' && neg.latest_contract_offer) {
                const contract = neg.latest_contract_offer;
                const valuation = neg.ai_valuation!;

                // ECONOMIC DYNAMICS: Inflation affects wage demands
                const inflationFactor = buyingLeague ? buyingLeague.coefficient : 1.0;
                const demandedWage = valuation.demanded_wage * inflationFactor;

                const offeredTotal = contract.wage + (contract.signing_bonus / 200);

                let agentPatienceHit = 0;

                if (offeredTotal >= demandedWage) {
                    neg.status = 'signed';
                    neg.stage = 'medical';
                    neg.agent_comments = "We are happy with these terms. Where do we sign?";

                    if (buyingClub.budget >= (neg.latest_offer?.fee || 0)) {
                        buyingClub.budget -= neg.latest_offer?.fee || 0;
                        buyingClub.season_financials.transfer_spend += neg.latest_offer?.fee || 0;

                        sellingClub.budget += neg.latest_offer?.fee || 0;
                        sellingClub.season_financials.transfer_income += neg.latest_offer?.fee || 0;

                        // FAN MOOD: Selling Fan Favorite
                        if (player.fan_favorite) {
                            updateFanHappiness(sellingClub, -15);
                            state.news.push({
                                id: Date.now() + Math.random(),
                                date: state.currentDate,
                                headline: `FANS FURIOUS: ${sellingClub.name.toUpperCase()} SELL ICON`,
                                content: `Supporters are burning shirts outside the stadium after the club sold fan favorite ${player.name}.`,
                                image_type: 'general',
                                clubId: sellingClub.id
                            });
                        }

                        // GRAVITY: Signing a world class player
                        if (player.overall >= 88) {
                            updateClubReputation(buyingClub, 2, "Marquee Signing", state.messages, state.currentDate);
                            updateFanHappiness(buyingClub, 10);
                        }

                        sellingClub.players = sellingClub.players.filter(p => p.id !== player.id);

                        player.clubId = buyingClub.id;
                        player.salary = contract.wage;
                        player.squad_role = contract.role;
                        player.contract_end = `${state.currentSeasonStartYear + contract.duration}-06-30`;
                        buyingClub.players.push(player);

                        state.news.unshift({
                            id: Date.now(),
                            date: state.currentDate,
                            headline: `OFFICIAL: ${player.name} SIGNS FOR ${buyingClub.name}`,
                            content: `The deal is done! ${player.name} joins ${buyingClub.name} on a ${contract.duration}-year deal worth £${(contract.wage).toLocaleString()}/week.`,
                            image_type: 'transfer',
                            clubId: buyingClub.id
                        });

                        state.messages.unshift({
                            id: Date.now(),
                            date: state.currentDate,
                            sender: "Club Secretary",
                            subject: `NEW SIGNING: ${player.name}`,
                            body: `${player.name} has successfully completed his medical and signed the contract. He is available for selection.`,
                            read: false,
                            type: 'email'
                        });

                        neg.status = 'completed';
                    } else {
                        neg.status = 'collapsed';
                        state.messages.unshift({
                            id: Date.now(),
                            date: state.currentDate,
                            sender: "Finance Director",
                            subject: `TRANSFER FAILED: ${player.name}`,
                            body: `We do not have the funds to complete the transfer of ${player.name}. The deal has collapsed.`,
                            read: false,
                            type: 'email'
                        });
                    }

                } else {
                    agentPatienceHit = 15;
                    valuation.agent_patience -= agentPatienceHit;

                    if (valuation.agent_patience <= 0) {
                        neg.status = 'collapsed';
                        neg.agent_comments = "You are wasting my client's time. We are exploring other options.";
                        state.messages.unshift({
                            id: Date.now(),
                            date: state.currentDate,
                            sender: "Player Agent",
                            subject: `CONTRACT TALKS ENDED: ${player.name}`,
                            body: `The gap between our valuation and your offer is too large. Negotiation over.`,
                            read: false,
                            type: 'email'
                        });
                    } else {
                        neg.agent_comments = "That wage is insulting. Improve it significantly.";
                        neg.next_response_date = addDays(state.currentDate, 1);
                        neg.latest_contract_offer = undefined;

                        state.messages.unshift({
                            id: Date.now(),
                            date: state.currentDate,
                            sender: "Player Agent",
                            subject: `CONTRACT COUNTER: ${player.name}`,
                            body: `My client expects at least £${(demandedWage).toLocaleString()} per week. Inflation is high this year. Patience: ${valuation.agent_patience}%`,
                            read: false,
                            type: 'transfer_bid',
                            actionLink: { view: View.TRANSFERS, id: neg.id }
                        });
                    }
                }
            }
        }
    });

    return updatedNegotiations;
};

const generateAiTransferActivity = (state: GameState): { news: NewsItem[], transfers: any[] } => {
    const news: NewsItem[] = [];
    const transfers = [];
    if (Math.random() > 0.15) return { news, transfers }; // Throttle

    const allClubs = Object.values(state.leagues).flatMap(l => l.clubs);
    const activeClub = allClubs[Math.floor(Math.random() * allClubs.length)];

    // 1. Financial Distress Sale (Smart AI)
    if (activeClub.budget < -5000000 && activeClub.willingness_to_sell > 30) {
        const valuable = [...activeClub.players].sort((a, b) => b.market_value - a.market_value)[0];
        if (valuable && valuable.transfer_status !== 'listed') {
            const buyer = allClubs.find(c => c.id !== activeClub.id && c.budget > valuable.market_value * 1.1 && c.reputation >= activeClub.reputation);
            if (buyer) {
                activeClub.players = activeClub.players.filter(p => p.id !== valuable.id);
                valuable.clubId = buyer.id;
                valuable.salary = Math.floor(valuable.salary * 1.2);
                buyer.players.push(valuable);

                activeClub.budget += valuable.market_value;
                buyer.budget -= valuable.market_value;

                activeClub.season_financials.transfer_income += valuable.market_value;
                buyer.season_financials.transfer_spend += valuable.market_value;

                news.push({
                    id: Date.now(),
                    date: state.currentDate,
                    headline: `FIRE SALE: ${activeClub.name} sell ${valuable.name}`,
                    content: `${buyer.name} capitalize on ${activeClub.name}'s debts to sign ${valuable.name} for £${(valuable.market_value / 1000000).toFixed(1)}M.`,
                    image_type: 'transfer',
                    clubId: activeClub.id
                });
                return { news, transfers };
            }
        }
    }

    // 2. Strategic Buy (Needs Analysis)
    const needs = FinancialEngine.evaluateSquadNeeds(activeClub);
    if (needs && activeClub.budget > 5000000) {
        const target = allClubs.flatMap(c => c.players).find(p =>
            p.clubId !== activeClub.id &&
            (p.position === needs.position || (needs.position === 'FWD' && p.position === 'ST')) &&
            p.transfer_status !== 'not_for_sale' &&
            p.market_value < activeClub.budget * 0.9 &&
            p.overall > (activeClub.reputation / 2 + 35) && // Must be good enough
            p.age < 32
        );

        if (target) {
            const seller = allClubs.find(c => c.id === target.clubId);
            if (seller) {
                seller.players = seller.players.filter(p => p.id !== target.id);
                target.clubId = activeClub.id;
                target.salary = Math.floor(target.salary * 1.15);
                activeClub.players.push(target);

                activeClub.budget -= target.market_value;
                seller.budget += target.market_value;

                activeClub.season_financials.transfer_spend += target.market_value;
                seller.season_financials.transfer_income += target.market_value;

                news.push({
                    id: Date.now(),
                    date: state.currentDate,
                    headline: `OFFICIAL: ${activeClub.name} sign ${target.name}`,
                    content: `Addressing a key weakness in ${needs.position === 'GK' ? 'goal' : 'the squad'}, they signed ${target.name} from ${seller.name}.`,
                    image_type: 'transfer',
                    clubId: activeClub.id
                });
            }
        }
    }
    return { news, transfers };
};

const generateTakeover = (clubs: Club[]): { club: Club, news: NewsItem } | null => {
    if (Math.random() > 0.0005) return null;
    const target = clubs[Math.floor(Math.random() * clubs.length)];
    target.budget += 200000000;
    return {
        club: target,
        news: {
            id: Date.now(),
            date: "",
            headline: `TYCOON TAKEOVER AT ${target.name.toUpperCase()}`,
            content: `A consortium led by a mysterious billionaire has completed the takeover of ${target.name}.`,
            image_type: 'finance',
            clubId: target.id
        }
    };
};

// Helper for GALA
const getClubName = (state: GameState, id: number | undefined) => {
    if (!id) return "Unknown";
    const club = Object.values(state.leagues).flatMap(l => l.clubs).find(c => c.id === id);
    return club ? club.name : "Unknown";
}

export const generateGala = (state: GameState): GalaData => {
    const playerClub = Object.values(state.leagues).flatMap(l => l.clubs).find(c => c.id === state.playerClubId);
    if (!playerClub) throw new Error("Player club not found");

    const league = state.leagues[playerClub.leagueId];
    const allPlayers = league.clubs.flatMap(c => c.players);

    const topScorer = [...allPlayers].sort((a, b) => b.season_stats.goals - a.season_stats.goals)[0];
    const playmaker = [...allPlayers].sort((a, b) => b.season_stats.assists - a.season_stats.assists)[0];
    const poty = [...allPlayers].filter(p => p.season_stats.appearances > 15).sort((a, b) => b.season_stats.avg_rating - a.season_stats.avg_rating)[0];
    const ypos = [...allPlayers].filter(p => p.age <= 21 && p.season_stats.appearances > 10).sort((a, b) => b.season_stats.avg_rating - a.season_stats.avg_rating)[0];

    const champion = [...league.clubs].sort((a, b) => b.stats.points - a.stats.points)[0];
    const playerPos = [...league.clubs].sort((a, b) => b.stats.points - a.stats.points).findIndex(c => c.id === playerClub.id) + 1;

    const history = state.news
        .filter(n => n.importance && n.importance >= 8 && (n.clubId === playerClub.id || n.clubId === champion.id))
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
            playmaker: { name: playmaker?.name || "N/A", club: getClubName(state, playmaker?.clubId), value: playmaker?.season_stats.assists || 0 }
        },
        history
    };
}

// --- LIVING WORLD ENGINE ---

export const processManagerMovement = (state: GameState) => {
    if (Math.random() > 0.01) return; // Rare event

    const allClubs = Object.values(state.leagues).flatMap(l => l.clubs);
    const vulnerableClubs = allClubs.filter(c => c.job_security < 10 && c.id !== state.playerClubId);

    if (vulnerableClubs.length > 0) {
        const club = vulnerableClubs[Math.floor(Math.random() * vulnerableClubs.length)];

        // Sack Manager
        state.news.unshift({
            id: Date.now(),
            date: state.currentDate,
            headline: `SACKED: ${club.name} Part Ways with Manager`,
            content: `Following a string of poor results, ${club.name} have announced the departure of their manager.`,
            image_type: 'general',
            clubId: club.id
        });

        // Hire New Manager (Simplified)
        const newManagerRep = club.reputation;
        club.job_security = 60; // Reset
        club.tactics = {
            formation: Math.random() > 0.5 ? "4-3-3" : "4-4-2",
            instructions: {
                line_height: 40 + Math.random() * 40,
                passing_directness: 40 + Math.random() * 40,
                pressing_intensity: 40 + Math.random() * 40,
                tempo: 40 + Math.random() * 40
            },
            lineup: [],
            familiarity: 50
        };

        state.news.unshift({
            id: Date.now() + 1,
            date: state.currentDate,
            headline: `APPOINTED: New Boss at ${club.name}`,
            content: `${club.name} have acted quickly to appoint a new manager to steady the ship.`,
            image_type: 'general',
            clubId: club.id
        });
    }
};

export const processGlobalEconomy = (state: GameState) => {
    // 1. Update Inflation
    const inflation = 0.02 + (Math.random() * 0.03); // 2-5%
    Object.values(state.leagues).forEach(league => {
        league.inflation_index *= (1 + inflation);

        // 2. Update Ticket Prices
        league.clubs.forEach(club => {
            club.infrastructure.stadium.ticket_price = Math.ceil(club.infrastructure.stadium.ticket_price * (1 + inflation));
        });
    });

    state.news.unshift({
        id: Date.now(),
        date: state.currentDate,
        headline: "ECONOMY UPDATE: Inflation Hits Football",
        content: `Global economic factors have led to a ${inflation.toFixed(1)}% increase in operating costs and ticket prices across the leagues.`,
        image_type: 'finance'
    });
};

export const transitionSeason = (state: GameState): GameState => {
    const newState = { ...state };
    const nextYear = state.currentSeasonStartYear + 1;

    processGlobalEconomy(newState);

    const seasonLabel = `${state.currentSeasonStartYear}/${nextYear.toString().slice(2)}`;

    Object.values(newState.leagues).forEach(league => {
        const sortedClubs = [...league.clubs].sort((a, b) => b.stats.points - a.stats.points);
        const champion = sortedClubs[0];

        // ECONOMIC CYCLE: Update League Coefficient
        // Simple logic: If high rep team wins, coefficient stays high. If chaos, it fluctuates.
        if (champion.reputation > 85) league.coefficient += 0.05;
        else league.coefficient = Math.max(0.8, league.coefficient - 0.05);

        // Inflationary Pressure
        league.inflation_rate = (league.coefficient - 1) * 0.1;

        const topScorerName = champion.players[0]?.name || "Unknown Player";

        league.history.push({
            season: seasonLabel,
            championId: champion.id,
            runnerUpId: sortedClubs[1].id,
            topScorer: {
                name: topScorerName,
                goals: 25,
                clubId: champion.id
            }
        });

        if (champion.id === state.playerClubId) {
            champion.trophies.push({ id: Date.now(), name: `${league.name} Winner`, season: seasonLabel, date_won: state.currentDate });
            updateClubReputation(champion, 5, "League Title", state.messages, state.currentDate);
            updateFanHappiness(champion, 15);
        }

        league.fixtures = [];
        league.clubs.forEach(c => {
            c.stats = { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 };
            c.active_competitions = ["FA Cup"];
            c.season_financials = {
                transfer_income: 0,
                transfer_spend: 0,
                matchday_income: 0,
                tv_income: 0,
                merchandise_income: 0,
                wage_bill: 0,
                facility_maintenance: 0,
                scouting_costs: 0,
                sponsorship_income: 0
            };
            c.players.forEach(p => {
                p.season_stats = { goals: 0, assists: 0, clean_sheets: 0, appearances: 0, yellow_cards: 0, red_cards: 0, avg_rating: 0, mom_awards: 0 };
                p.competition_stats = {};

                // Wage Inflation update
                if (league.inflation_rate > 0) {
                    p.salary = Math.floor(p.salary * (1 + league.inflation_rate));
                }
            });
        });
        sortedClubs.slice(0, 4).forEach(c => c.active_competitions.push("Champions League"));

        league.clubs.forEach(c => {
            c.players.forEach(p => {
                p.age += 1;
                p.years_at_club = (p.years_at_club || 0) + 1;
                if (p.age < 24 && p.potential > p.overall) p.overall = Math.min(p.potential, p.overall + Math.floor(Math.random() * 3) + 1);
                else if (p.age > 31) p.overall = Math.max(40, p.overall - 2);
            });

            // YOUTH INTAKE
            const youthCoach = c.staff.find(s => s.role === 'youth_coach');
            const academyLevel = c.infrastructure.youth_academy.level;
            const coachQuality = youthCoach ? youthCoach.attributes.coaching : 50;

            // Generate 2 new players
            for (let i = 0; i < 2; i++) {
                const potentialBase = 60 + (academyLevel * 3) + (coachQuality * 0.1);
                const potential = Math.min(99, Math.floor(potentialBase + (Math.random() * 20 - 10)));
                const overall = Math.floor(potential * 0.6);

                const posRoll = Math.random();
                let pos: "GK" | "DEF" | "MID" | "FWD" | "ST" = "MID";
                if (posRoll < 0.1) pos = "GK";
                else if (posRoll < 0.4) pos = "DEF";
                else if (posRoll < 0.8) pos = "MID";
                else pos = "FWD";

                const newId = Date.now() + Math.floor(Math.random() * 10000);
                const newPlayer = generatePlayer(newId, c.id, pos, overall, 16);
                newPlayer.potential = potential;
                newPlayer.name = getRandomName('EN'); // Default to EN for now, could be dynamic based on league
                newPlayer.homegrown_status = "club_trained";

                c.players.push(newPlayer);
            }
        });

        const newDates = getSeasonDates(nextYear);
        league.fixtures = generateFixtures(league.clubs, league.name, newDates.PL_MATCH_DATES);
    });

    injectCupFixtures(newState.leagues, nextYear);
    newState.currentSeasonStartYear = nextYear;
    newState.currentDate = `${nextYear}-07-01`;

    newState.news.unshift({
        id: Date.now(),
        date: newState.currentDate,
        headline: `SEASON ${nextYear}/${(nextYear + 1).toString().slice(2)} BEGINS`,
        content: `The new season is underway! Analysts predict an inflation rate of ${(newState.leagues["Premier League"].inflation_rate * 100).toFixed(1)}% this year.`,
        image_type: 'match'
    });

    return newState;
};


// --- Main Process ---

export const processDay = (state: GameState): { newState: GameState, events: string[] } => {
    const dayEvents: string[] = [];
    const currentMonth = new Date(state.currentDate).getMonth();

    if (currentMonth === 4 && new Date(state.currentDate).getDate() === 31) {
        // END OF SEASON TRIGGER
        // If we haven't already generated the Gala (which means we haven't transitioned), do it now.
        if (!state.seasonGala) {
            const gala = generateGala(state);
            // Halt simulation and trigger the GALA screen via state
            return {
                newState: { ...state, seasonGala: gala, simulation: { ...state.simulation, isActive: false } },
                events: ["Season Ended. Gala Night."]
            };
        }
        // If seasonGala exists, we wait for user to click 'Continue' in the Gala modal.
        // If this runs again, just return same state.
        return { newState: state, events: [] };
    }

    const nextDate = addDays(state.currentDate, 1);
    const newMessages: GameMessage[] = [];
    const newNews: NewsItem[] = [];

    const newState = { ...state };

    newState.negotiations = processNegotiations(newState);
    const aiActivity = generateAiTransferActivity(newState);
    newNews.push(...aiActivity.news);

    // NEW: Generate Daily Narratives
    const dailyStories = NewsEngine.generateDailyStories(newState);
    newNews.push(...dailyStories);

    // ADVANCED AI: Deep Simulation (Transfers, Managers, Economy)
    AdvancedEngine.processDailyEvents(newState, newNews);

    Object.keys(newState.leagues).forEach(leagueName => {
        const league = newState.leagues[leagueName];

        league.fixtures.forEach(fixture => {
            if (fixture.date === state.currentDate && !fixture.played) {
                // If it's a knockout game with placeholder ID 0, skip (waiting for opponents)
                if (fixture.homeClubId === 0 || fixture.awayClubId === 0) {
                    return;
                }

                let homeClub: Club | undefined, awayClub: Club | undefined;

                Object.values(newState.leagues).forEach(l => {
                    if (!homeClub) homeClub = l.clubs.find(c => c.id === fixture.homeClubId);
                    if (!awayClub) awayClub = l.clubs.find(c => c.id === fixture.awayClubId);
                });

                if (homeClub && awayClub) {
                    // Generate Weather
                    const month = new Date(state.currentDate).getMonth();
                    let weather: 'sunny' | 'rain' | 'snow' | 'cloudy' = 'sunny';
                    if (month >= 9 || month <= 2) { // Winter/Autumn
                        const r = Math.random();
                        if (r < 0.3) weather = 'rain';
                        else if (r < 0.4 && month <= 1) weather = 'snow';
                        else if (r < 0.7) weather = 'cloudy';
                    }
                    fixture.weather = weather;

                    // USE NEW HEARTBEAT ENGINE with Stats
                    const result = simulateMatch(homeClub, awayClub, league.refereeing_strictness, fixture.is_knockout, weather);

                    fixture.match_events = result.events;
                    fixture.played = true;
                    fixture.homeScore = result.homeGoals;
                    fixture.awayScore = result.awayGoals;

                    // NEW: Generate Context-Aware Match Report
                    const matchReports = NewsEngine.generateMatchNews(fixture, homeClub, awayClub, league);
                    newNews.push(...matchReports);

                    result.events.filter(e => e.type === 'goal' || e.type === 'card').forEach(e => {
                        dayEvents.push(`[${league.name}] ${e.text}`);
                    });

                    const homeWin = result.homeGoals > result.awayGoals;
                    const draw = result.homeGoals === result.awayGoals;
                    const awayWin = result.awayGoals > result.homeGoals;

                    if (fixture.competition === league.name) {
                        const updateStats = (club: Club, scored: number, conceded: number, isWin: boolean, isDraw: boolean) => {
                            club.stats.played += 1;
                            club.stats.goalsFor += scored;
                            club.stats.goalsAgainst += conceded;
                            if (isWin) { club.stats.won += 1; club.stats.points += 3; club.budget += 50000; }
                            else if (isDraw) { club.stats.drawn += 1; club.stats.points += 1; }
                            else { club.stats.lost += 1; }
                        };
                        updateStats(homeClub, result.homeGoals, result.awayGoals, homeWin, draw);
                        updateStats(awayClub, result.awayGoals, result.homeGoals, awayWin, draw);

                        // GRAVITY MODEL: Underdog bonus
                        if (homeWin && awayClub.reputation > homeClub.reputation + 10) {
                            updateClubReputation(homeClub, 0.5, "Giant Killing", newMessages, state.currentDate);
                            updateFanHappiness(homeClub, 5);
                        }
                        if (awayWin && homeClub.reputation > awayClub.reputation + 10) {
                            updateClubReputation(awayClub, 0.5, "Giant Killing", newMessages, state.currentDate);
                            updateFanHappiness(awayClub, 5);
                        }
                    }

                    if (homeClub.id === state.playerClubId || awayClub.id === state.playerClubId) {
                        const playerTeam = homeClub.id === state.playerClubId ? homeClub : awayClub;
                        const goalDiff = playerTeam.id === homeClub.id ? (result.homeGoals - result.awayGoals) : (result.awayGoals - result.homeGoals);

                        if (goalDiff > 0) {
                            playerTeam.job_security = Math.min(100, playerTeam.job_security + 3);
                            updateFanHappiness(playerTeam, 2);
                        } else if (goalDiff < 0) {
                            playerTeam.job_security = Math.max(0, playerTeam.job_security - 5);
                            updateFanHappiness(playerTeam, -2);
                        }
                    }

                    if (homeClub.infrastructure) {
                        const attendancePct = Math.min(1, (homeClub.reputation / 100) + (Math.random() * 0.2));

                        // DYNAMIC WORLD: Attendance influenced by happiness and ticket price strategy
                        const happinessFactor = homeClub.fan_happiness / 100;
                        const priceMod = FinancialEngine.getAttendanceMod(homeClub);
                        const ticketPrice = FinancialEngine.getTicketPrice(homeClub);

                        const dynamicAttendance = Math.floor(homeClub.infrastructure.stadium.capacity * attendancePct * happinessFactor * priceMod);
                        const finalAttendance = Math.min(homeClub.infrastructure.stadium.capacity, dynamicAttendance);

                        const gateReceipts = finalAttendance * ticketPrice;
                        homeClub.budget += gateReceipts;
                        homeClub.season_financials.matchday_income += gateReceipts;
                        homeClub.attendance_rate = finalAttendance / homeClub.infrastructure.stadium.capacity;
                    }

                    updatePlayersDaily(homeClub, true, fixture.competition, result.playerStats);
                    updatePlayersDaily(awayClub, true, fixture.competition, result.playerStats);

                    // --- TOURNAMENT PROGRESSION LOGIC ---
                    if (fixture.is_knockout) {
                        const winnerId = result.homeGoals > result.awayGoals ? fixture.homeClubId : fixture.awayClubId;
                        const loserId = result.homeGoals > result.awayGoals ? fixture.awayClubId : fixture.homeClubId;

                        const loser = result.homeGoals > result.awayGoals ? awayClub : homeClub;
                        const winner = result.homeGoals > result.awayGoals ? homeClub : awayClub;

                        loser.active_competitions = loser.active_competitions.filter(c => c !== fixture.competition);
                        dayEvents.push(`[${fixture.competition}] ${winner.name} eliminated ${loser.name}`);

                        // Advance winner to next round
                        if (fixture.nextFixtureId) {
                            const nextFixture = league.fixtures.find(f => f.id === fixture.nextFixtureId);
                            if (nextFixture) {
                                if (fixture.bracketSlot === 'home') nextFixture.homeClubId = winnerId;
                                else if (fixture.bracketSlot === 'away') nextFixture.awayClubId = winnerId;

                                // If both slots are now filled in next match, announce the matchup
                                if (nextFixture.homeClubId !== 0 && nextFixture.awayClubId !== 0) {
                                    // Find the newly opponent
                                    let oppName = "Opponent";
                                    Object.values(newState.leagues).forEach(l2 => {
                                        const opp = l2.clubs.find(c => c.id === (fixture.bracketSlot === 'home' ? nextFixture.awayClubId : nextFixture.homeClubId));
                                        if (opp) oppName = opp.name;
                                    });

                                    newNews.push({
                                        id: Date.now() + Math.random(),
                                        date: state.currentDate,
                                        headline: `${fixture.round === 'SF' ? 'FINAL' : 'NEXT ROUND'} SET: ${winner.name} vs ${oppName}`,
                                        content: `The fixture is confirmed for the next round of the ${fixture.competition}.`,
                                        image_type: 'match'
                                    });
                                }
                            }
                        } else if (fixture.round === 'Final') {
                            newNews.push({
                                id: Date.now() + Math.random(),
                                date: state.currentDate,
                                headline: `${winner.name.toUpperCase()} WIN THE ${fixture.competition.toUpperCase()}!`,
                                content: `History is made as ${winner.name} lift the trophy!`,
                                image_type: 'award',
                                clubId: winner.id
                            });
                            winner.trophies.push({
                                id: Date.now(),
                                name: fixture.competition,
                                season: `${state.currentSeasonStartYear}/${state.currentSeasonStartYear + 1}`,
                                date_won: state.currentDate
                            });
                            updateClubReputation(winner, 5, "Cup Victory", newMessages, state.currentDate);
                            updateFanHappiness(winner, 20);
                        }
                    }

                    if (homeClub.id === state.playerClubId || awayClub.id === state.playerClubId) {
                        newMessages.push({
                            id: Date.now() + Math.random(),
                            date: state.currentDate,
                            sender: "Assistant Manager",
                            subject: `Result vs ${homeClub.id === state.playerClubId ? awayClub.name : homeClub.name}`,
                            body: `Result: ${homeClub.name} ${result.homeGoals} - ${result.awayGoals} ${awayClub.name}.`,
                            read: false,
                            type: 'news'
                        });
                    }
                }
            }
        });

        league.clubs.forEach(c => {
            if (c.id === state.playerClubId) {
                processInfrastructureDaily(c, state.currentDate, newMessages);
                generateSponsorOffers(c, state.currentDate);
                processSocialDynamics(c, dayEvents);

                const sortedTable = [...league.clubs].sort((a, b) => b.stats.points - a.stats.points);
                const leaguePos = sortedTable.findIndex(cl => cl.id === c.id) + 1;
                const ownerUpdates = processOwnerLogic(c, leaguePos, state.currentDate);
                newMessages.push(...ownerUpdates.messages);
                newNews.push(...ownerUpdates.news);
            }

            const playedTodayLocal = league.fixtures.some(f => f.date === state.currentDate && (f.homeClubId === c.id || f.awayClubId === c.id));
            if (!playedTodayLocal) {
                updatePlayersDaily(c, false, null);
            }

            // Check Role Progression (Weekly on Mondays)
            if (new Date(state.currentDate).getDay() === 1) {
                c.players.forEach(p => {
                    const { added } = RoleService.updatePlayerRoles(p, c);
                    if (added.length > 0 && c.id === state.playerClubId) {
                         added.forEach(role => {
                             const def = RoleService.getRoleDefinition(role);
                             if (def.tier >= 2) {
                                 newNews.push({
                                     id: Date.now() + Math.random(),
                                     date: state.currentDate,
                                     headline: `${p.name.toUpperCase()} DEVELOPS AS ${role.toUpperCase()}`,
                                     content: `${p.name} has been recognized as a ${role} due to their recent performances and status within the club.`,
                                     image_type: 'general',
                                     clubId: c.id
                                 });
                             }
                         });
                    }
                });
            }

            const roleMods = RoleService.getClubRoleModifiers(c);

            FinancialEngine.processDailyFinances(c, roleMods, playedTodayLocal);
        });

        const takeover = generateTakeover(league.clubs);
        if (takeover) { takeover.news.date = state.currentDate; newNews.push(takeover.news); }
    });

    const today = new Date(state.currentDate);
    if (today.getDate() === 1) {
        const playerClub = Object.values(newState.leagues).flatMap(l => l.clubs).find(c => c.id === state.playerClubId);
        if (playerClub) {
            const lastRecord = playerClub.financial_history[playerClub.financial_history.length - 1];
            playerClub.financial_history.push({
                date: state.currentDate,
                balance: playerClub.budget,
                profit_loss: playerClub.budget - (lastRecord ? lastRecord.balance : 0)
            });
        }
    }

    newState.currentDate = nextDate;
    newState.messages = [...newMessages, ...state.messages];
    newState.news = [...newNews, ...state.news].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const activeLeague = Object.values(newState.leagues).find(l => l.clubs.some(c => c.id === state.playerClubId)) || Object.values(newState.leagues)[0];
    const allPlayers = activeLeague.clubs.flatMap(c => c.players);

    newState.simulation.recentEvents = dayEvents;
    newState.simulation.liveStats = {
        leagueTable: [...activeLeague.clubs].sort((a, b) => b.stats.points - a.stats.points),
        topScorers: [...allPlayers].sort((a, b) => b.season_stats.goals - a.season_stats.goals).slice(0, 10).map(p => ({ name: p.name, club: activeLeague.clubs.find(c => c.id === p.clubId)?.name || '', goals: p.season_stats.goals })),
        topAssisters: [...allPlayers].sort((a, b) => b.season_stats.assists - a.season_stats.assists).slice(0, 10).map(p => ({ name: p.name, club: activeLeague.clubs.find(c => c.id === p.clubId)?.name || '', assists: p.season_stats.assists }))
    };

    return { newState, events: dayEvents };
};