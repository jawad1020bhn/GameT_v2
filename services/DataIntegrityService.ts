import { League, Club, Player, PlayerAttributes, PlayerStats } from '../types';

export class DataIntegrityService {
  private static nextPlayerId = 100000;

  static processLeagues(leagues: any[]): League[] {
    console.log("DataIntegrityService: Processing leagues...");
    this.scanMaxIds(leagues);

    return leagues.map(league => {
      // Ensure league has required fields
      if (!league.clubs) league.clubs = [];

      league.clubs.forEach((club: Club) => {
        this.fillSquad(club);
        this.validateClubData(club);
      });

      return league as League;
    });
  }

  private static scanMaxIds(leagues: any[]) {
    let maxId = 0;
    leagues.forEach(l => {
      l.clubs?.forEach((c: any) => {
        c.players?.forEach((p: any) => {
          if (p.id > maxId) maxId = p.id;
        });
      });
    });
    this.nextPlayerId = maxId + 1;
  }

  private static validateClubData(club: Club) {
      if (!club.tactics) {
          club.tactics = {
              formation: "4-4-2",
              instructions: {
                  line_height: 50,
                  passing_directness: 50,
                  pressing_intensity: 50,
                  tempo: 50,
                  attacking_width: 50,
                  creative_freedom: 50,
                  tackling_style: 50
              },
              lineup: [],
              familiarity: 70
          };
      }

      // Ensure stats object exists
      if (!club.stats) {
          club.stats = {
              played: 0, won: 0, drawn: 0, lost: 0,
              goalsFor: 0, goalsAgainst: 0, points: 0
          };
      }

      // Ensure financials exist
      if (!club.financial_history) club.financial_history = [];

      // Ensure new role fields exist on all players
      club.players.forEach(p => {
          if (!p.roles) p.roles = [];
          if (p.years_at_club === undefined) {
              if (p.homegrown_status === 'club_trained') p.years_at_club = Math.max(0, p.age - 16);
              else p.years_at_club = Math.floor(Math.random() * 4);
          }
      });
  }

  private static fillSquad(club: Club) {
    if (!club.players) club.players = [];

    const minSquadSize = 22;
    const currentSize = club.players.length;

    if (currentSize >= minSquadSize) return;

    const needed = minSquadSize - currentSize;
    // console.log(`Club ${club.name} needs ${needed} generated players.`);

    // Simple distribution for filler players
    const positions = ["GK", "DEF", "DEF", "DEF", "DEF", "MID", "MID", "MID", "MID", "FWD", "FWD"];

    for (let i = 0; i < needed; i++) {
        const pos = positions[i % positions.length] as "GK" | "DEF" | "MID" | "FWD";
        const player = this.generatePlayer(club, pos);
        club.players.push(player);
    }
  }

  private static generatePlayer(club: Club, position: "GK" | "DEF" | "MID" | "FWD"): Player {
    const id = this.nextPlayerId++;
    const age = Math.floor(Math.random() * 10) + 18; // 18-28

    // Rating based on club reputation (approx)
    // Reputation 0-10000? 0-100? Assuming 100 scale based on 82 for Ligue 1.
    // Let's assume club reputation is roughly league reputation.
    // If undefined, assume 60.
    const clubRep = club.reputation || 60;
    const baseOverall = Math.max(50, Math.min(90, clubRep - 10 - Math.floor(Math.random() * 10)));
    const potential = baseOverall + Math.floor(Math.random() * 10);

    return {
      id,
      name: `Academy Player ${id}`, // Generic name
      position: position,
      age,
      overall: baseOverall,
      potential,
      nationality: "Unknown",
      salary: baseOverall * 500,
      attributes: this.generateAttributes(position, baseOverall),
      market_value: baseOverall * 10000,
      contract_end: "2026-06-30",
      release_clause: null,
      sell_on_clause_pct: 0,
      agent: { fee_pct: 3, stubbornness: 20 },
      squad_role: "rotation",
      morale: 75,
      form: 60,
      fitness: 100,
      sharpness: 50,
      condition: 100,
      injury_status: { type: "none", weeks_remaining: 0, proneness: 10 },
      suspension: { matches_remaining: 0 },
      personality: { professionalism: 10, ambition: 10, loyalty: 10, leadership: 10, temperament: 10 },
      reputation: baseOverall,
      homegrown_status: "club_trained",
      fan_favorite: false,
      transfer_status: "not_for_sale",
      on_loan: false,
      clubId: club.id,
      season_stats: this.emptyStats(),
      competition_stats: {},
      roles: [],
      years_at_club: 0
    };
  }

  private static generateAttributes(position: string, overall: number): PlayerAttributes {
    // Very basic distribution
    const attrs: PlayerAttributes = {
        pace: overall,
        shooting: overall,
        passing: overall,
        dribbling: overall,
        defending: overall,
        physical: overall,
        mental: overall,
        goalkeeping: 10,
        set_pieces: overall
    };

    if (position === "GK") {
        attrs.goalkeeping = overall;
        attrs.shooting = 10;
        attrs.pace = overall - 20;
    } else if (position === "DEF") {
        attrs.defending = overall + 5;
        attrs.shooting = overall - 10;
    } else if (position === "FWD") {
        attrs.shooting = overall + 5;
        attrs.defending = overall - 15;
    }

    // Clamp
    for (const key in attrs) {
        // @ts-ignore
        attrs[key] = Math.max(1, Math.min(99, attrs[key]));
    }

    return attrs;
  }

  private static emptyStats(): PlayerStats {
      return {
          goals: 0, assists: 0, clean_sheets: 0, yellow_cards: 0, red_cards: 0,
          appearances: 0, avg_rating: 0, mom_awards: 0
      };
  }
}
