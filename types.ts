export enum View {
  DASHBOARD = 'dashboard',
  SQUAD = 'squad',
  TABLE = 'table',
  NEWS = 'news',
  FIXTURES = 'fixtures',
  HISTORY = 'history',
  TRANSFERS = 'transfers',
  HEADQUARTERS = 'headquarters',
  DATA_HUB = 'data_hub',
  WORLD = 'world',
  SETTINGS = 'settings'
}

export enum PlayerRole {
  // Tier 1: Foundation
  ACADEMY_GRADUATE = 'Academy Graduate',
  EMERGING_TALENT = 'Emerging Talent',
  SQUAD_PLAYER = 'Squad Player',
  WORKHORSE = 'Workhorse',

  // Tier 2: Established
  CONSISTENT_PERFORMER = 'Consistent Performer',
  MENTOR = 'Mentor',
  FAN_FAVORITE = 'Fan Favorite',
  CLUTCH_PLAYER = 'Clutch Player',
  TACTICAL_ANCHOR = 'Tactical Anchor',

  // Tier 3: Elite
  TEAM_LEADER = 'Team Leader',
  FRANCHISE_PLAYER = 'Franchise Player',
  CLUB_ICON = 'Club Icon',
  LEGACY_LEGEND = 'Legacy Legend',

  // Specialized
  WILDCARD = 'Wildcard',
  ENFORCER = 'Enforcer',
  CAPTAIN_MATERIAL = 'Captain Material',
  SUPER_SUB = 'Super Sub',
  VETERAN_PRESENCE = 'Veteran Presence'
}

export interface PlayerAttributes {
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physical: number;
  mental: number;
  goalkeeping: number;
  set_pieces: number;
}

export interface PlayerStats {
  goals: number;
  assists: number;
  clean_sheets: number;
  yellow_cards: number;
  red_cards: number;
  appearances: number;
  avg_rating: number;
  mom_awards: number;
}

export interface Player {
  id: number;
  name: string;
  position: "GK" | "DEF" | "MID" | "FWD" | "ST";
  age: number;
  overall: number;
  potential: number;
  nationality: string;
  salary: number;
  attributes: PlayerAttributes;
  market_value: number;
  contract_end: string;
  release_clause: number | null;
  sell_on_clause_pct: number;
  agent: {
    fee_pct: number;
    stubbornness: number; // 0-100
  };
  squad_role: "key" | "star" | "important" | "rotation" | "prospect";
  morale: number;
  form: number;
  fitness: number;
  sharpness: number;
  condition: number; // 0-100, short term stamina
  injury_status: {
    type: "none" | "hamstring" | "ankle" | "knee" | "broken_leg";
    weeks_remaining: number;
    proneness: number;
  };
  suspension: { matches_remaining: number };
  personality: {
    professionalism: number;
    ambition: number;
    loyalty: number;
    leadership: number;
    temperament: number;
  };
  reputation: number;
  homegrown_status: "foreign" | "club_trained" | "association_trained";
  fan_favorite: boolean;
  transfer_status: "not_for_sale" | "listed" | "loan_listed" | "release_clause_active";
  on_loan: boolean;
  clubId: number;
  season_stats: PlayerStats;
  monthly_stats?: PlayerStats;
  competition_stats: { [key: string]: PlayerStats };
  roles: PlayerRole[];
  years_at_club: number;
  mentorId?: number;
  awards: string[];
}

export interface ClubFacilities {
  training: number;
  youth: number;
  medical: number;
}

export interface FacilityDetails {
  level: number; // 1-10
  max_level: number;
  name: string;
  description: string;
  next_upgrade_cost: number;
  next_upgrade_weeks: number;
  is_upgrading: boolean;
  weeks_remaining: number;
  maintenance_cost: number;
}

export interface SponsorDeal {
  id: string;
  name: string;
  type: 'kit_main' | 'kit_sleeve' | 'stadium';
  amount_per_season: number;
  years_remaining: number;
  bonus_condition?: string; // e.g. "top_4"
  bonus_amount?: number;
}

export interface Infrastructure {
  training_ground: FacilityDetails;
  youth_academy: FacilityDetails;
  medical_center: FacilityDetails;
  stadium: {
    capacity: number;
    max_expansion: number;
    ticket_price: number;
    expansion_in_progress: boolean;
    expansion_weeks_remaining: number;
    expansion_cost_per_seat: number;
    maintenance_cost: number;
  }
}

export interface FinancialRecord {
  date: string;
  balance: number;
  profit_loss: number;
}

export interface SeasonFinancials {
  // Revenue Streams
  transfer_income: number;
  matchday_income: number;
  tv_income: number;
  merchandise_income: number;
  sponsorship_income: number;
  prize_money: number;
  friendly_match_income: number;
  hospitality_income: number;
  parking_revenue: number;

  // Expenditures
  transfer_spend: number;
  wage_bill: number;
  facility_maintenance: number;
  scouting_costs: number;

  // Operating Costs
  coaching_staff_wages: number;
  administrative_staff_wages: number;
  medical_staff_wages: number;
  security_costs: number;
  utilities_costs: number;  // electricity, water, heating
  insurance_premiums: number;
  travel_costs: number;
  catering_costs: number;
  kit_equipment_costs: number;
  agent_fees: number;

  // Financial Obligations
  loan_repayments: number;
  tax_obligations: number;
  league_fees: number;

  // Other
  legal_fees: number;
  marketing_costs: number;
  charity_contributions: number;
}

export interface FinancialStrategy {
  ticket_pricing: 'very_low' | 'low' | 'normal' | 'high' | 'very_high';
  merchandise_focus: 'local' | 'national' | 'global';
  debt_repayment: 'minimum' | 'balanced' | 'aggressive';
  wage_budget_allocation: number; // 40-80%
}

export interface ScoutAssignment {
    id: string;
    region: 'UK' | 'Europe' | 'South America' | 'Asia' | 'Global';
    position: 'GK' | 'DEF' | 'MID' | 'FWD' | 'ALL';
    scope: 'youth' | 'first_team';
    weeks_remaining: number;
    assigned_scout_id: number;
    reports: number[];
}

export interface Trophy {
  id: number;
  name: string;
  season: string; // e.g. "2025/26"
  date_won: string;
}

export interface Tactics {
  formation: "4-3-3" | "4-4-2" | "3-5-2" | "5-3-2" | "4-2-3-1";
  instructions: {
    line_height: number;
    passing_directness: number;
    pressing_intensity: number;
    tempo: number;
    attacking_width: number;
    creative_freedom: number;
    tackling_style: number;
  };
  lineup: number[];
  familiarity: number;
  temporary_boost?: {
    type: 'demand_more' | 'praise' | 'calm_down' | 'encourage';
    expires: number;
  };
}

export interface Club {
  id: number;
  name: string;
  founded: number;
  stadium: string;
  capacity: number;
  budget: number;
  wage_budget_weekly: number;
  cash_reserves: number;
  debt: number;
  reputation: number;
  job_security: number; // 0-100
  fan_happiness: number; // 0-100
  fanbase_size: number;
  attendance_rate: number;
  commercial_power: number;
  facilities: ClubFacilities;
  infrastructure: Infrastructure;
  sponsorships: {
    active: SponsorDeal[];
    offers: SponsorDeal[];
  };
  financial_history: FinancialRecord[];
  season_financials: SeasonFinancials;
  scouting: {
    network_quality: number;
    range: "local" | "national" | "continental" | "global";
    assignments: ScoutAssignment[];
  };
  owner: {
    ambition: number;
    patience: number;
    spend_tendency: number;
    interference: number;
  };
  board_expectations: {
    league_position_target: number;
    cup_target_stage: string;
  };
  transfer_policy: {
    max_age_in: number;
    min_overall_in: number;
    homegrown_bias: number;
    profit_focus: number;
    to_rivals_multiplier: number;
    wage_structure_strictness: number;
    buy_release_clauses: boolean;
  };
  negotiation_style: {
    hardness: number;
    bid_delay_days: number;
    counter_margin_pct: number;
  };
  willingness_to_sell: number;
  style_identity: {
    formations: string[];
    play_style: string;
  };
  tactics?: Tactics;
  tactical_familiarity: number; // 0-100
  financial_strategy: FinancialStrategy;
  staff: StaffMember[];
  rivalries: number[];
  players: Player[];
  leagueId: string;
  active_competitions: string[];
  trophies: Trophy[];
  stats: {
    played: number;
    won: number;
    drawn: number;
    lost: number;
    goalsFor: number;
    goalsAgainst: number;
    points: number;
  };
}

export interface MatchEvent {
  minute: number;
  type: 'goal' | 'card' | 'sub' | 'injury' | 'commentary';
  text: string;
  team: 'home' | 'away' | 'neutral';
  xg?: number; // Expected Goals value if it's a shot/goal
}

export interface Fixture {
  id: number;
  homeClubId: number;
  awayClubId: number;
  homeScore: number | null;
  awayScore: number | null;
  date: string;
  played: boolean;
  competition: string;
  is_knockout: boolean;
  round?: 'R32' | 'R16' | 'QF' | 'SF' | 'Final' | string;
  nextFixtureId?: number;
  bracketSlot?: 'home' | 'away';
  match_events?: MatchEvent[];
  weather?: 'sunny' | 'rain' | 'snow' | 'cloudy';
  attendance?: number;
}

export interface League {
  name: string;
  country: string;
  tier: number;
  structure: 'league' | 'cup' | 'tournament';
  reputation: number;
  coefficient: number;
  currency: 'GBP' | 'EUR' | 'USD';
  club_count: number;
  registration_rules: any;
  loan_rules: any;
  match_sub_rules: any;
  transfer_windows: { name: string; open: string; close: string }[];
  fixture_schedule: any;
  continental_qualification: any;
  relegation_slots: number;
  promotion_relegation_with: string;
  tv_distribution: any;
  prize_money_model: any;
  var_enabled: boolean;
  refereeing_strictness: number;
  injury_rate_modifier: number;
  ffp: any;
  parachute_payments: any;
  transfer_market_volatility: number;
  inflation_rate: number;
  inflation_index: number; // Base 1.0
  clubs: Club[];
  fixtures: Fixture[];
  history: any[];
  monthly_awards: MonthlyAward[];
}

export interface NewsItem {
  id: number;
  date: string;
  headline: string;
  content: string;
  image_type: 'transfer' | 'match' | 'injury' | 'finance' | 'award' | 'general';
  subType?: 'punditry' | 'scandal' | 'tactical_analysis' | 'fan_reaction' | 'rumour' | 'statement' | 'match_report';
  clubId?: number;
  importance?: number; // 1-10
  sentiment?: 'positive' | 'negative' | 'neutral';
  meta?: {
    source: { name: string; tier: string };
    tag: string;
    likes: number;
    comments: number;
    reaction: string;
  };
}

export interface SocialPost {
  id: number;
  author: string;
  handle: string;
  content: string;
  timestamp: string;
  likes: number;
  type: 'fan' | 'journalist' | 'player' | 'viral';
  avatarColor: string;
}

export interface GameMessage {
  id: number;
  date: string;
  sender: string;
  subject: string;
  body: string;
  read: boolean;
  type: 'email' | 'news' | 'scout_report' | 'transfer_bid' | 'board';
  actionLink?: { view: View; id?: string | number };
}

export interface Negotiation {
  id: string;
  playerId: number;
  sellingClubId: number;
  buyingClubId: number;
  status: 'active' | 'agreed_fee' | 'signed' | 'collapsed' | 'completed';
  stage: 'club_fee' | 'contract' | 'medical';
  latest_offer?: TransferOffer;
  latest_contract_offer?: ContractOffer;
  ai_valuation?: {
    min_fee: number;
    patience: number; // 0-100
    demanded_wage: number;
    demanded_role: string;
    agent_patience: number;
  };
  last_updated: string;
  next_response_date: string;
  agent_comments?: string;
  dialogue_history?: NegotiationDialogue[];
}

export interface NegotiationDialogue {
    speaker: 'agent' | 'club';
    text: string;
    sentiment: 'positive' | 'negative' | 'neutral';
    timestamp: number;
}

export interface TransferOffer {
  fee: number;
  installments: number;
  sell_on_clause_pct: number;
}

export interface ContractOffer {
  wage: number;
  duration: number;
  signing_bonus: number;
  role: "key" | "star" | "important" | "rotation" | "prospect";
  release_clause?: number;
  performance_bonus?: number;
  yearly_wage_rise?: number;
}

export interface StaffMember {
  id: number;
  name: string;
  age: number;
  role: 'assistant' | 'scout' | 'physio' | 'youth_coach';
  attributes: {
    coaching: number; // For assistant/youth
    judging: number; // For scouts
    healing: number; // For physios
    man_management: number; // For assistant
  };
  salary: number;
}

export interface ManagerProfile {
  id: number;
  name: string;
  age: number;
  nationality: string;
  currentClubId: number | null;
  style: 'tactician' | 'motivator' | 'youth_development' | 'disciplinarian';
  stats: {
    man_management: number;
    tactical_knowledge: number;
    youth_development: number;
    financial_acumen: number;
    media_handling: number;
  };
  career_stats: {
    matches_managed: number;
    wins: number;
    draws: number;
    losses: number;
    trophies_won: number;
  };
  reputation: number; // 0-10000
  avatar_id: number;
  history: { season: string; clubId: number; achievement: string }[];
  awards: string[];
}

export interface AwardWinner {
    name: string;
    club: string;
    value: string;
}

export interface MonthlyAward {
    id: string;
    month: string;
    year: number;
    leagueId: string;
    playerOfTheMonth: AwardWinner;
    managerOfTheMonth: AwardWinner;
    teamOfTheMonth: { position: string; name: string; club: string }[];
}

export interface BallonDorWinner {
    year: number;
    name: string;
    club: string;
    nationality: string;
    rating: number;
}

export interface GalaData {
  season: string;
  leagueName: string;
  championId: number;
  playerPos: number;
  awards: {
    poty: { name: string, club: string, value: string };
    ypos: { name: string, club: string, value: string };
    goldenBoot: { name: string, club: string, value: number };
    goldenGlove: { name: string, club: string, value: number };
    playmaker: { name: string, club: string, value: number };
    breakthrough: { name: string, club: string, value: string };
    managerOfTheSeason: { name: string, club: string, value: string };
    clubOfTheYear: { name: string, value: string };
    mostImprovedClub: { name: string, value: string };
    bestAttack: { name: string, value: number };
    bestDefense: { name: string, value: number };
    teamOfTheSeason: { position: string; name: string; club: string }[];
  };
  uclAwards?: {
    bestPlayer: { name: string, club: string, value: string };
    topScorer: { name: string, club: string, value: number };
  };
  history: { date: string, event: string }[];
}

export interface GameState {
  currentDate: string;
  currentSeasonStartYear: number;
  playerClubId: number | null;
  manager: ManagerProfile; // The player's manager profile
  aiManagers: ManagerProfile[]; // AI Managers
  leagues: { [key: string]: League };
  messages: GameMessage[];
  news: NewsItem[];
  social_feed: SocialPost[];
  negotiations: Negotiation[];
  recent_transfers: any[]; // For the transfer history
  isProcessing: boolean;
  simulation: {
    isActive: boolean;
    type: 'day' | 'week';
    progress: number;
    statusText: string;
    recentEvents: string[];
    liveStats?: any;
  };
  seasonGala?: GalaData;
  ballonDorHistory: BallonDorWinner[];
}