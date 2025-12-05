
import { Club, Fixture, League, Player, PlayerAttributes } from './types';

export const START_YEAR = 2025;
export const INITIAL_DATE = `${START_YEAR}-07-01`;

// ------------------------------------------------------------------
// Player Generators Helpers
// ------------------------------------------------------------------

export const generateAttributes = (position: string, overall: number): PlayerAttributes => {
    const base = overall;
    const rand = () => Math.floor(Math.random() * 10) - 5;

    if (position === 'GK') {
        return {
            pace: 40 + rand(), shooting: 30 + rand(), passing: 60 + rand(), dribbling: 40 + rand(),
            defending: 50 + rand(), physical: 70 + rand(), mental: base + rand(),
            goalkeeping: base + rand(), set_pieces: 40 + rand()
        };
    }

    return {
        pace: base + rand(),
        shooting: position === 'FWD' || position === 'ST' ? base + rand() : base - 20 + rand(),
        passing: position === 'MID' ? base + rand() : base - 10 + rand(),
        dribbling: position === 'FWD' || position === 'MID' ? base + rand() : base - 15 + rand(),
        defending: position === 'DEF' || position === 'GK' ? base + rand() : base - 30 + rand(),
        physical: base + rand(),
        mental: base + rand(),
        goalkeeping: 10 + rand(),
        set_pieces: base - 10 + rand()
    };
};

export const generatePlayer = (id: number, clubId: number, position: "GK" | "DEF" | "MID" | "FWD" | "ST", overall: number, age: number): Player => {
    const attributes = generateAttributes(position, overall);
    return {
        id,
        name: `Player ${id}`,
        position,
        age,
        overall,
        potential: overall + Math.floor(Math.random() * 10),
        nationality: "Unknown",
        salary: overall * 1500,
        attributes,
        market_value: overall * 1000000 * (position === 'FWD' ? 1.5 : 1),
        contract_end: `${START_YEAR + 2}-06-30`,
        release_clause: null,
        sell_on_clause_pct: 0,
        agent: { fee_pct: 5, stubbornness: 50 },
        squad_role: overall > 80 ? "key" : "rotation",
        morale: 80,
        form: 70,
        fitness: 100,
        sharpness: 50,
        condition: 100,
        injury_status: { type: "none", weeks_remaining: 0, proneness: 20 },
        suspension: { matches_remaining: 0 },
        personality: { professionalism: 50, ambition: 50, loyalty: 50, leadership: 50, temperament: 50 },
        reputation: overall,
        homegrown_status: "foreign",
        fan_favorite: false,
        transfer_status: "not_for_sale",
        on_loan: false,
        clubId,
        season_stats: { goals: 0, assists: 0, clean_sheets: 0, yellow_cards: 0, red_cards: 0, appearances: 0, avg_rating: 0, mom_awards: 0 },
        competition_stats: {},
        roles: [],
        years_at_club: 0,
        awards: [],
        monthly_stats: { goals: 0, assists: 0, clean_sheets: 0, yellow_cards: 0, red_cards: 0, appearances: 0, avg_rating: 0, mom_awards: 0 }
    };
};

// --- NAME DATABASES ---
const EN_FIRST = ["James", "John", "Robert", "Michael", "William", "David", "Richard", "Joseph", "Thomas", "Charles", "Harry", "Jack", "Oliver", "George", "Noah", "Charlie", "Jacob", "Alfie", "Freddie", "Oscar", "Leo", "Logan", "Archie", "Theo", "Thomas", "James", "Joshua", "Henry", "William", "Max", "Lucas", "Ethan", "Arthur", "Mason", "Isaac", "Harrison", "Teddy", "Finley", "Daniel", "Riley", "Edward", "Joseph", "Alexander", "Adam", "Reggie", "Samuel", "Jaxon", "Sebastian", "Elijah", "Harley", "Toby", "Arlo", "Dylan", "Jude", "Benjamin", "Rory", "Tommy", "Jake", "Louie", "Carter", "Jenson", "Hugo", "Bobby", "Frankie", "Ollie", "Zachary", "Albert", "Reuben", "Jayden", "Caleb", "Hunter", "Ezra", "Roman", "Gabriel", "Yusuf", "Liam", "Erik", "Connor", "Callum", "Kyle", "Ryan", "Aaron", "Luke", "Matthew", "Nathan", "Sam"];
const EN_LAST = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Wilson", "Evans", "Taylor", "Moore", "White", "Thompson", "Harris", "Martin", "Ferguson", "Nicholson", "Riley", "Gilmore", "McDonald", "O'Connor", "Byrne", "Murphy", "Walsh", "O'Brien", "Ryan", "Doyle", "Kelly", "Sullivan", "O'Neill", "Reilly", "Kennedy", "Lynch", "McCarthy", "Murray", "Quinn", "Moore", "McLaughlin", "Carroll", "Connolly", "Daly", "O'Connell", "Wilson", "Dunne", "Brennan", "Burke", "Collins", "Campbell", "Clarke", "Johnston", "Hughes", "O'Doherty", "O'Donnell", "Fitzgerald", "Brown", "Martin", "Maguire", "Nolan", "Flynn", "Healy", "O'Malley", "O'Keefe", "Kavanagh", "Cotter", "Power", "McGrath", "Moran", "Brady", "Fox", "Cunningham", "Barry", "Griffin", "Hogan", "O'Leary", "Sheehan", "Cahill", "Duffy", "Whelan", "Maher", "Higgins", "Cullen", "Keane", "Farrell", "Casey", "Barrett", "Foley", "Sheridan", "McMahon", "Hayes", "Buckley", "Egan", "Sweeney", "Kenny", "Carey", "Phelan", "Donovan", "Burns", "Lowry", "Corbett", "Molloy", "Duggan", "Hennessey", "Dempsey", "Beirne", "Traynor", "Thornton", "Finn"];

const ES_FIRST = ["Jose", "Carlos", "Juan", "Luis", "Pedro", "Miguel", "Pablo", "Sergio", "Fernando", "Jorge", "Alejandro", "Diego", "Alvaro", "Iker", "Unai", "Gavi", "Xavi", "Andres", "Gerard", "Cesc", "David", "Isco", "Thiago", "Koke", "Saul", "Dani", "Jordi", "Pau", "Marc", "Victor", "Hector", "Cesar", "Raul", "Ivan", "Ruben", "Roberto", "Antonio", "Manuel", "Francisco", "Javier", "Alberto", "Enrique", "Rafael", "Mario", "Adrian", "Marcos", "Lucas", "Hugo", "Mateo", "Leo"];
const ES_LAST = ["Garcia", "Rodriguez", "Gonzalez", "Fernandez", "Lopez", "Martinez", "Sanchez", "Perez", "Gomez", "Martin", "Ruiz", "Hernandez", "Diaz", "Moreno", "Torres", "Alvarez", "Romero", "Alonso", "Gutierrez", "Navarro", "Domínguez", "Vazquez", "Ramos", "Gil", "Ramirez", "Serrano", "Blanco", "Molina", "Morales", "Suarez", "Ortega", "Delgado", "Castro", "Ortiz", "Rubio", "Marin", "Sanz", "Iglesias", "Nuñez", "Medina", "Garrido", "Santos", "Castillo", "Cortes", "Lozano", "Guerrero", "Cano", "Prieto", "Mendez", "Cruz"];

const DE_FIRST = ["Thomas", "Manuel", "Lukas", "Felix", "Julian", "Leon", "Joshua", "Kai", "Florian", "Jamal", "Serge", "Leroy", "Niklas", "Timo", "Mats", "Max", "Jonas", "Elias", "Ben", "Noah", "Paul", "Finn", "Luis", "Luca", "Emil", "Henri", "Oskar", "Anton", "Jakob", "Theo", "Matteo", "Moritz", "Hannes", "Samuel", "Maximilian", "Alexander", "David", "Fabian", "Philipp", "Simon", "Johannes", "Daniel", "Jan", "Marco", "Tobias", "Christian", "Patrick", "Dennis", "Kevin", "Marcel"];
const DE_LAST = ["Müller", "Schmidt", "Schneider", "Fischer", "Weber", "Meyer", "Wagner", "Becker", "Schulz", "Hoffmann", "Koch", "Bauer", "Richter", "Klein", "Wolf", "Schröder", "Neumann", "Schwarz", "Zimmermann", "Braun", "Krüger", "Hofmann", "Hartmann", "Lange", "Schmitt", "Werner", "Schmitz", "Krause", "Meier", "Lehmann", "Schmid", "Schulze", "Maier", "Köhler", "Herrmann", "König", "Walter", "Mayer", "Huber", "Kaiser", "Fuchs", "Peters", "Lang", "Scholz", "Möller", "Weiss", "Jung", "Hahn", "Keller", "Vogel"];

const FR_FIRST = ["Kylian", "Antoine", "Olivier", "Hugo", "Raphael", "Paul", "N'Golo", "Kingsley", "Ousmane", "Eduardo", "William", "Theo", "Lucas", "Adrien", "Jules", "Leo", "Gabriel", "Adam", "Louis", "Arthur", "Raphaël", "Maël", "Liam", "Ethan", "Sacha", "Tom", "Gabin", "Timéo", "Mathis", "Nathan", "Enzo", "Eden", "Aaron", "Noé", "Léon", "Malo", "Naël", "Marius", "Nino", "Ayden", "Yanis", "Eliott", "Robin", "Valentin", "Clément", "Baptiste", "Maxime", "Alexandre", "Pierre", "Romain"];
const FR_LAST = ["Martin", "Bernard", "Thomas", "Petit", "Robert", "Richard", "Durand", "Dubois", "Moreau", "Laurent", "Simon", "Michel", "Lefebvre", "Leroy", "Roux", "David", "Bertrand", "Morel", "Fournier", "Girard", "Bonnet", "Dupont", "Lambert", "Fontaine", "Rousseau", "Vincent", "Muller", "Lefevre", "Faure", "Andre", "Mercier", "Blanc", "Guerin", "Boyer", "Garnier", "Chevalier", "Francois", "Legrand", "Gauthier", "Garcia", "Perrin", "Robin", "Clement", "Morin", "Nicolas", "Henry", "Roussel", "Mathieu", "Gautier", "Masson"];

const IT_FIRST = ["Gianluigi", "Alessandro", "Leonardo", "Federico", "Lorenzo", "Nicolo", "Marco", "Francesco", "Giorgio", "Andrea", "Matteo", "Davide", "Ciro", "Giacomo", "Sandro", "Giovanni", "Giuseppe", "Antonio", "Luca", "Paolo", "Enrico", "Vincenzo", "Pietro", "Salvatore", "Luigi", "Mario", "Roberto", "Stefano", "Domenico", "Raffaele", "Angelo", "Michele", "Fabio", "Alberto", "Daniele", "Massimo", "Simone", "Filippo", "Claudio", "Emanuele", "Christian", "Gabriele", "Edoardo", "Tommaso", "Samuele", "Mattia", "Riccardo", "Davide", "Giulio", "Elia"];
const IT_LAST = ["Rossi", "Russo", "Ferrari", "Esposito", "Bianchi", "Romano", "Colombo", "Ricci", "Marino", "Greco", "Bruno", "Gallo", "Conti", "De Luca", "Costa", "Giordano", "Mancini", "Rizzo", "Lombardi", "Moretti", "Barbieri", "Fontana", "Santoro", "Mariani", "Rinaldi", "Caruso", "Ferrara", "Galli", "Martini", "Leone", "Longo", "Gentile", "Martinelli", "Vitale", "Lombardo", "Serra", "Coppola", "De Santis", "D'Angelo", "Marchetti", "Parisi", "Villa", "Conte", "Ferraro", "Ferri", "Fabbri", "Bianco", "Marini", "Grasso", "Valentini"];

export const getRandomName = (region: 'EN' | 'ES' | 'DE' | 'FR' | 'IT' = 'EN') => {
    if (region === 'ES') return `${ES_FIRST[Math.floor(Math.random() * ES_FIRST.length)]} ${ES_LAST[Math.floor(Math.random() * ES_LAST.length)]}`;
    if (region === 'DE') return `${DE_FIRST[Math.floor(Math.random() * DE_FIRST.length)]} ${DE_LAST[Math.floor(Math.random() * DE_LAST.length)]}`;
    if (region === 'FR') return `${FR_FIRST[Math.floor(Math.random() * FR_FIRST.length)]} ${FR_LAST[Math.floor(Math.random() * FR_LAST.length)]}`;
    if (region === 'IT') return `${IT_FIRST[Math.floor(Math.random() * IT_FIRST.length)]} ${IT_LAST[Math.floor(Math.random() * IT_LAST.length)]}`;
    return `${EN_FIRST[Math.floor(Math.random() * EN_FIRST.length)]} ${EN_LAST[Math.floor(Math.random() * EN_LAST.length)]}`;
};

export const generateSquad = (clubId: number, reputation: number, region: 'EN' | 'ES' | 'DE' | 'FR' | 'IT' = 'EN'): Player[] => {
    const players: Player[] = [];
    let pid = clubId * 100;
    let nation = 'England';
    if (region === 'ES') nation = 'Spain';
    if (region === 'DE') nation = 'Germany';
    if (region === 'FR') nation = 'France';
    if (region === 'IT') nation = 'Italy';

    // 3 GKs
    for (let i = 0; i < 3; i++) players.push({ ...generatePlayer(pid++, clubId, "GK", reputation - (i * 5), 20 + i * 4), name: getRandomName(region), nationality: nation });
    // 8 Defenders
    for (let i = 0; i < 8; i++) players.push({ ...generatePlayer(pid++, clubId, "DEF", reputation - (i % 3) * 3, 20 + i * 2), name: getRandomName(region), nationality: nation });
    // 8 Midfielders
    for (let i = 0; i < 8; i++) players.push({ ...generatePlayer(pid++, clubId, "MID", reputation - (i % 3) * 3, 19 + i * 2), name: getRandomName(region), nationality: nation });
    // 6 Forwards
    for (let i = 0; i < 6; i++) players.push({ ...generatePlayer(pid++, clubId, i % 2 === 0 ? "ST" : "FWD", reputation - (i % 2) * 2, 18 + i * 3), name: getRandomName(region), nationality: nation });

    return players;
};

// --- PREMIER LEAGUE STARTERS ---
export const CITY_PLAYERS: Player[] = [
    { ...generatePlayer(1001, 1, "ST", 91, 23), name: "Erling Haaland", nationality: "Norway" },
    { ...generatePlayer(1002, 1, "MID", 91, 32), name: "Kevin De Bruyne", nationality: "Belgium" },
    { ...generatePlayer(1003, 1, "MID", 90, 27), name: "Rodri", nationality: "Spain" },
    { ...generatePlayer(1004, 1, "MID", 88, 23), name: "Phil Foden", nationality: "England" },
    { ...generatePlayer(1005, 1, "DEF", 87, 26), name: "Ruben Dias", nationality: "Portugal" },
    { ...generatePlayer(1006, 1, "GK", 88, 30), name: "Ederson", nationality: "Brazil" },
    { ...generatePlayer(1007, 1, "MID", 85, 29), name: "Bernardo Silva", nationality: "Portugal" },
    { ...generatePlayer(1008, 1, "DEF", 84, 29), name: "John Stones", nationality: "England" },
    { ...generatePlayer(1009, 1, "DEF", 85, 33), name: "Kyle Walker", nationality: "England" },
    { ...generatePlayer(1010, 1, "FWD", 83, 28), name: "Jack Grealish", nationality: "England" },
    { ...generatePlayer(1011, 1, "DEF", 83, 28), name: "Manuel Akanji", nationality: "Switzerland" }
];

// --- LA LIGA STARTERS ---
export const REAL_PLAYERS: Player[] = [
    { ...generatePlayer(2001, 301, "FWD", 94, 25), name: "Kylian Mbappé", nationality: "France" },
    { ...generatePlayer(2002, 301, "FWD", 92, 23), name: "Vinicius Jr", nationality: "Brazil" },
    { ...generatePlayer(2003, 301, "MID", 91, 20), name: "Jude Bellingham", nationality: "England" },
    { ...generatePlayer(2004, 301, "MID", 88, 25), name: "Fede Valverde", nationality: "Uruguay" },
    { ...generatePlayer(2005, 301, "GK", 90, 31), name: "Thibaut Courtois", nationality: "Belgium" },
    { ...generatePlayer(2006, 301, "DEF", 86, 26), name: "Eder Militao", nationality: "Brazil" },
    { ...generatePlayer(2007, 301, "DEF", 85, 32), name: "Dani Carvajal", nationality: "Spain" },
    { ...generatePlayer(2008, 301, "MID", 86, 24), name: "Aurelien Tchouameni", nationality: "France" },
    { ...generatePlayer(2009, 301, "FWD", 87, 23), name: "Rodrygo", nationality: "Brazil" },
    { ...generatePlayer(2010, 301, "MID", 85, 21), name: "Eduardo Camavinga", nationality: "France" },
    { ...generatePlayer(2011, 301, "DEF", 86, 31), name: "Antonio Rudiger", nationality: "Germany" }
];

export const BARCA_PLAYERS: Player[] = [
    { ...generatePlayer(2101, 302, "ST", 89, 35), name: "Robert Lewandowski", nationality: "Poland" },
    { ...generatePlayer(2102, 302, "GK", 89, 31), name: "M. Ter Stegen", nationality: "Germany" },
    { ...generatePlayer(2103, 302, "MID", 87, 21), name: "Pedri", nationality: "Spain" },
    { ...generatePlayer(2104, 302, "MID", 85, 19), name: "Gavi", nationality: "Spain" },
    { ...generatePlayer(2105, 302, "DEF", 86, 25), name: "Ronald Araujo", nationality: "Uruguay" },
    { ...generatePlayer(2106, 302, "MID", 87, 26), name: "Frenkie de Jong", nationality: "Netherlands" },
    { ...generatePlayer(2107, 302, "FWD", 88, 17), name: "Lamine Yamal", nationality: "Spain" },
    { ...generatePlayer(2108, 302, "FWD", 84, 27), name: "Raphinha", nationality: "Brazil" },
    { ...generatePlayer(2109, 302, "DEF", 85, 25), name: "Jules Kounde", nationality: "France" },
    { ...generatePlayer(2110, 302, "MID", 85, 33), name: "Ilkay Gundogan", nationality: "Germany" },
    { ...generatePlayer(2111, 302, "DEF", 82, 17), name: "Pau Cubarsi", nationality: "Spain" }
];

// --- BUNDESLIGA GIANTS ---
export const BAYERN_PLAYERS: Player[] = [
    { ...generatePlayer(3001, 501, "ST", 93, 30), name: "Harry Kane", nationality: "England" },
    { ...generatePlayer(3002, 501, "MID", 87, 21), name: "Jamal Musiala", nationality: "Germany" },
    { ...generatePlayer(3003, 501, "GK", 86, 38), name: "Manuel Neuer", nationality: "Germany" },
    { ...generatePlayer(3004, 501, "MID", 88, 29), name: "Joshua Kimmich", nationality: "Germany" },
    { ...generatePlayer(3005, 501, "FWD", 86, 28), name: "Leroy Sane", nationality: "Germany" },
    { ...generatePlayer(3006, 501, "DEF", 85, 24), name: "Matthijs de Ligt", nationality: "Netherlands" },
    { ...generatePlayer(3007, 501, "DEF", 86, 23), name: "Alphonso Davies", nationality: "Canada" },
    { ...generatePlayer(3008, 501, "DEF", 85, 27), name: "Kim Min-jae", nationality: "South Korea" },
    { ...generatePlayer(3009, 501, "MID", 84, 29), name: "Leon Goretzka", nationality: "Germany" },
    { ...generatePlayer(3010, 501, "FWD", 84, 28), name: "Serge Gnabry", nationality: "Germany" },
    { ...generatePlayer(3011, 501, "FWD", 83, 34), name: "Thomas Muller", nationality: "Germany" }
];

// --- LIGUE 1 GIANTS ---
export const PSG_PLAYERS: Player[] = [
    { ...generatePlayer(4001, 701, "FWD", 87, 27), name: "Ousmane Dembele", nationality: "France" },
    { ...generatePlayer(4002, 701, "DEF", 87, 25), name: "Achraf Hakimi", nationality: "Morocco" },
    { ...generatePlayer(4003, 701, "DEF", 87, 29), name: "Marquinhos", nationality: "Brazil" },
    { ...generatePlayer(4004, 701, "GK", 88, 25), name: "G. Donnarumma", nationality: "Italy" },
    { ...generatePlayer(4005, 701, "MID", 84, 24), name: "Vitinha", nationality: "Portugal" },
    { ...generatePlayer(4006, 701, "MID", 83, 18), name: "Warren Zaire-Emery", nationality: "France" },
    { ...generatePlayer(4007, 701, "DEF", 84, 28), name: "Lucas Hernandez", nationality: "France" },
    { ...generatePlayer(4008, 701, "DEF", 83, 21), name: "Nuno Mendes", nationality: "Portugal" },
    { ...generatePlayer(4009, 701, "FWD", 82, 21), name: "Bradley Barcola", nationality: "France" },
    { ...generatePlayer(4010, 701, "ST", 83, 22), name: "Goncalo Ramos", nationality: "Portugal" },
    { ...generatePlayer(4011, 701, "MID", 83, 28), name: "Fabian Ruiz", nationality: "Spain" }
];

// --- SERIE A GIANTS ---
export const INTER_PLAYERS: Player[] = [
    { ...generatePlayer(5001, 901, "ST", 89, 26), name: "Lautaro Martinez", nationality: "Argentina" },
    { ...generatePlayer(5002, 901, "MID", 87, 27), name: "Nicolo Barella", nationality: "Italy" },
    { ...generatePlayer(5003, 901, "DEF", 86, 25), name: "Alessandro Bastoni", nationality: "Italy" },
    { ...generatePlayer(5004, 901, "MID", 85, 30), name: "Hakan Calhanoglu", nationality: "Turkey" },
    { ...generatePlayer(5005, 901, "FWD", 84, 26), name: "Marcus Thuram", nationality: "France" },
    { ...generatePlayer(5006, 901, "DEF", 84, 28), name: "Benjamin Pavard", nationality: "France" },
    { ...generatePlayer(5007, 901, "GK", 84, 35), name: "Yann Sommer", nationality: "Switzerland" },
    { ...generatePlayer(5008, 901, "DEF", 83, 26), name: "Federico Dimarco", nationality: "Italy" },
    { ...generatePlayer(5009, 901, "MID", 83, 35), name: "Henrikh Mkhitaryan", nationality: "Armenia" },
    { ...generatePlayer(5010, 901, "DEF", 83, 32), name: "Stefan de Vrij", nationality: "Netherlands" },
    { ...generatePlayer(5011, 901, "MID", 82, 24), name: "Davide Frattesi", nationality: "Italy" }
];

export const CITY_FILLER = generateSquad(1, 80, 'EN').slice(0, 12).map((p, i) => ({ ...p, id: 1100 + i }));
export const REAL_FILLER = generateSquad(301, 82, 'ES').slice(0, 12).map((p, i) => ({ ...p, id: 2050 + i }));
export const BARCA_FILLER = generateSquad(302, 81, 'ES').slice(0, 12).map((p, i) => ({ ...p, id: 2150 + i }));
export const BAYERN_FILLER = generateSquad(501, 82, 'DE').slice(0, 12).map((p, i) => ({ ...p, id: 3050 + i }));
export const PSG_FILLER = generateSquad(701, 80, 'FR').slice(0, 12).map((p, i) => ({ ...p, id: 4050 + i }));
export const INTER_FILLER = generateSquad(901, 80, 'IT').slice(0, 12).map((p, i) => ({ ...p, id: 5050 + i }));

export const getSeasonDates = (year: number) => {
    const startYear = year;
    const endYear = year + 1;
    const plMatchDates = [];
    // Generate 50 match weeks to cover the longest league (Championship = 46 rounds)
    let d = new Date(`${startYear}-08-08`);
    while (d.getDay() !== 6) { d.setDate(d.getDate() + 1); }
    for (let i = 0; i < 50; i++) {
        plMatchDates.push(d.toISOString().split('T')[0]);
        d.setDate(d.getDate() + 7);
        // Insert breaks for international windows roughly
        if (i === 4 || i === 8 || i === 12 || i === 26) d.setDate(d.getDate() + 14);
    }
    return {
        PL_MATCH_DATES: plMatchDates,
        UCL_DATES: { R16: `${endYear}-02-18`, QF: `${endYear}-04-08`, SF: `${endYear}-04-29`, Final: `${endYear}-05-31` },
        CUP_DATES: { R3: `${endYear}-01-10`, R4: `${endYear}-02-07`, R5: `${endYear}-03-04`, QF: `${endYear}-03-21`, SF: `${endYear}-04-18`, Final: `${endYear}-05-23` }
    };
};

// ------------------------------------------------------------------
// Club Generators
// ------------------------------------------------------------------
const SPONSOR_NAMES = ["Northern Rail", "Crown Lager", "Apex Motors", "Vertex Insurance", "Kingfisher", "Royal Bank", "Sovereign Oil", "Titan Bet", "Fly Emirates", "Qatar Airways", "Spotify", "T-Mobile", "Accor", "Pirelli", "Jeep"];

const createClub = (id: number, name: string, rep: number, budget: number, leagueId: string, region: 'EN' | 'ES' | 'DE' | 'FR' | 'IT' = 'EN'): Club => {
    // Special Squad Handling
    let players: Player[] = [];
    const isCity = name === "Manchester City";
    const isReal = name === "Real Madrid";
    const isBarca = name === "FC Barcelona";
    const isBayern = name === "Bayern Munich";
    const isPSG = name === "Paris SG";
    const isInter = name === "Inter Milan";

    if (isCity) players = [...CITY_PLAYERS, ...CITY_FILLER];
    else if (isReal) players = [...REAL_PLAYERS, ...REAL_FILLER];
    else if (isBarca) players = [...BARCA_PLAYERS, ...BARCA_FILLER];
    else if (isBayern) players = [...BAYERN_PLAYERS, ...BAYERN_FILLER];
    else if (isPSG) players = [...PSG_PLAYERS, ...PSG_FILLER];
    else if (isInter) players = [...INTER_PLAYERS, ...INTER_FILLER];
    else players = generateSquad(id, rep, region);

    // Competitions
    let cupName = "FA Cup";
    if (region === 'ES') cupName = "Copa del Rey";
    if (region === 'DE') cupName = "DFB Pokal";
    if (region === 'FR') cupName = "Coupe de France";
    if (region === 'IT') cupName = "Coppa Italia";

    const active_competitions = [cupName];
    if (rep > 85) active_competitions.push("Champions League");

    const facilityLevel = Math.min(10, Math.max(1, Math.floor(rep / 10)));
    const baseCapacity = region === 'DE' ? 1100 : region === 'ES' ? 1000 : 800; // Bundesliga stadiums are huge

    return {
        id, name, founded: 1890 + Math.floor(Math.random() * 30), stadium: `${name} Arena`,
        capacity: rep * baseCapacity, budget, wage_budget_weekly: budget / 52, cash_reserves: budget * 2, debt: 0,
        reputation: rep,
        job_security: 80,
        fan_happiness: 60 + (Math.random() * 20),
        fanbase_size: rep * 1000, attendance_rate: 0.95, commercial_power: rep,
        facilities: { training: rep, youth: rep - 5, medical: rep },
        infrastructure: {
            training_ground: {
                level: facilityLevel,
                max_level: 10,
                name: "Training Complex",
                description: "Affects player growth rate and sharpness recovery.",
                next_upgrade_cost: facilityLevel * 5000000,
                next_upgrade_weeks: facilityLevel * 2,
                is_upgrading: false,
                weeks_remaining: 0,
                maintenance_cost: facilityLevel * 50000
            },
            youth_academy: {
                level: Math.max(1, facilityLevel - 1),
                max_level: 10,
                name: "Youth Academy",
                description: "Determines the quality of annual youth intake.",
                next_upgrade_cost: facilityLevel * 4000000,
                next_upgrade_weeks: facilityLevel * 2,
                is_upgrading: false,
                weeks_remaining: 0,
                maintenance_cost: facilityLevel * 40000
            },
            medical_center: {
                level: facilityLevel,
                max_level: 10,
                name: "Medical Center",
                description: "Reduces injury proneness and recovery time.",
                next_upgrade_cost: facilityLevel * 3000000,
                next_upgrade_weeks: facilityLevel * 2,
                is_upgrading: false,
                weeks_remaining: 0,
                maintenance_cost: facilityLevel * 60000
            },
            stadium: {
                capacity: rep * baseCapacity,
                max_expansion: rep * 1200,
                ticket_price: region === 'EN' ? 60 : 45,
                expansion_in_progress: false,
                expansion_weeks_remaining: 0,
                expansion_cost_per_seat: 2000,
                maintenance_cost: rep * 1000
            }
        },
        sponsorships: {
            active: [
                {
                    id: "sponsor_main",
                    name: SPONSOR_NAMES[id % SPONSOR_NAMES.length],
                    type: "kit_main",
                    amount_per_season: rep * 500000,
                    years_remaining: 3,
                    bonus_condition: "top_4",
                    bonus_amount: 5000000
                }
            ],
            offers: []
        },
        financial_history: [
            { date: "2024-06-01", balance: budget * 0.9, profit_loss: 0 },
            { date: "2024-07-01", balance: budget, profit_loss: budget * 0.1 }
        ],
        season_financials: {
            // Revenue Streams
            transfer_income: 0,
            matchday_income: 0,
            tv_income: 0,
            merchandise_income: 0,
            sponsorship_income: 0,
            prize_money: 0,
            friendly_match_income: 0,
            hospitality_income: 0,
            parking_revenue: 0,

            // Expenditures
            transfer_spend: 0,
            wage_bill: 0,
            facility_maintenance: 0,
            scouting_costs: 0,

            // Operating Costs
            coaching_staff_wages: 0,
            administrative_staff_wages: 0,
            medical_staff_wages: 0,
            security_costs: 0,
            utilities_costs: 0,
            insurance_premiums: 0,
            travel_costs: 0,
            catering_costs: 0,
            kit_equipment_costs: 0,
            agent_fees: 0,

            // Financial Obligations
            loan_repayments: 0,
            tax_obligations: 0,
            league_fees: 0,

            // Other
            legal_fees: 0,
            marketing_costs: 0,
            charity_contributions: 0
        },
        scouting: { network_quality: rep, range: rep > 80 ? "global" : "national" },
        owner: { ambition: rep, patience: 50, spend_tendency: 50, interference: 20 },
        board_expectations: { league_position_target: rep > 85 ? 4 : 10, cup_target_stage: "quarters" },
        transfer_policy: { max_age_in: 29, min_overall_in: 75, homegrown_bias: 40, profit_focus: 20, to_rivals_multiplier: 2, wage_structure_strictness: 50, buy_release_clauses: true },
        negotiation_style: { hardness: 50, bid_delay_days: 2, counter_margin_pct: 20 },
        willingness_to_sell: 50, style_identity: { formations: ["4-3-3"], play_style: "balanced" },
        tactics: {
            formation: "4-3-3",
            instructions: { line_height: 50, passing_directness: 50, pressing_intensity: 50, tempo: 50 },
            lineup: [],
            familiarity: 80
        },
        tactical_familiarity: 80,
        staff: [
            { id: id * 100 + 1, name: "Assistant Manager", age: 45, role: 'assistant', attributes: { coaching: rep, judging: rep, healing: 50, man_management: rep }, salary: rep * 2000 },
            { id: id * 100 + 2, name: "Head Scout", age: 50, role: 'scout', attributes: { coaching: 50, judging: rep, healing: 50, man_management: 50 }, salary: rep * 1500 },
            { id: id * 100 + 3, name: "Head Physio", age: 40, role: 'physio', attributes: { coaching: 50, judging: 50, healing: rep, man_management: 50 }, salary: rep * 1500 }
        ],
        rivalries: [],
        players,
        leagueId,
        active_competitions,
        trophies: [],
        stats: { played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 }
    };
};

// --- CLUBS METADATA ---

// England
const PREMIER_CLUBS_META = [
    { n: "Manchester City", r: 96, b: 200000000 }, { n: "Liverpool", r: 93, b: 120000000 }, { n: "Arsenal", r: 92, b: 100000000 },
    { n: "Man Utd", r: 90, b: 150000000 }, { n: "Chelsea", r: 88, b: 180000000 }, { n: "Tottenham", r: 87, b: 90000000 },
    { n: "Newcastle", r: 86, b: 220000000 }, { n: "Aston Villa", r: 83, b: 70000000 }, { n: "West Ham", r: 79, b: 55000000 },
    { n: "Brighton", r: 78, b: 50000000 }, { n: "Wolves", r: 76, b: 40000000 }, { n: "Fulham", r: 75, b: 35000000 },
    { n: "Crystal Palace", r: 74, b: 30000000 }, { n: "Brentford", r: 73, b: 30000000 }, { n: "Everton", r: 75, b: 20000000 },
    { n: "Nottm Forest", r: 72, b: 40000000 }, { n: "Bournemouth", r: 71, b: 25000000 }, { n: "Leicester", r: 74, b: 30000000 },
    { n: "Leeds United", r: 72, b: 25000000 }, { n: "Sunderland", r: 68, b: 15000000 }
];
const PREMIER_CLUBS = PREMIER_CLUBS_META.map((m, i) => createClub(i + 1, m.n, m.r, m.b, "Premier League", "EN"));
const CHAMPIONSHIP_CLUBS = Array.from({ length: 24 }).map((_, i) => createClub(100 + i, `Champ Club ${i + 1}`, 65 + Math.floor(Math.random() * 10), 5000000, "EFL Championship", "EN"));

// Spain
const LALIGA_CLUBS_META = [
    { n: "Real Madrid", r: 98, b: 250000000 }, { n: "FC Barcelona", r: 95, b: 80000000 }, { n: "Atletico Madrid", r: 89, b: 90000000 },
    { n: "Real Sociedad", r: 84, b: 45000000 }, { n: "Athletic Bilbao", r: 83, b: 40000000 }, { n: "Real Betis", r: 82, b: 35000000 },
    { n: "Girona", r: 81, b: 30000000 }, { n: "Villarreal", r: 80, b: 40000000 }, { n: "Valencia", r: 79, b: 25000000 },
    { n: "Sevilla", r: 79, b: 30000000 }, { n: "Osasuna", r: 76, b: 15000000 }, { n: "Getafe", r: 75, b: 12000000 },
    { n: "Celta Vigo", r: 75, b: 15000000 }, { n: "Mallorca", r: 74, b: 12000000 }, { n: "Rayo Vallecano", r: 73, b: 10000000 },
    { n: "Las Palmas", r: 72, b: 10000000 }, { n: "Alaves", r: 72, b: 8000000 }, { n: "Leganes", r: 71, b: 8000000 },
    { n: "Valladolid", r: 71, b: 8000000 }, { n: "Espanyol", r: 74, b: 15000000 }
];
const LALIGA_CLUBS = LALIGA_CLUBS_META.map((m, i) => createClub(301 + i, m.n, m.r, m.b, "La Liga", "ES"));
const SEGUNDA_CLUBS = Array.from({ length: 22 }).map((_, i) => createClub(400 + i, `Segunda Club ${i + 1}`, 62 + Math.floor(Math.random() * 10), 3000000, "La Liga 2", "ES"));
// Rivals
const real = LALIGA_CLUBS.find(c => c.name === "Real Madrid"); const barca = LALIGA_CLUBS.find(c => c.name === "FC Barcelona");
if (real && barca) { real.rivalries.push(barca.id); barca.rivalries.push(real.id); }

// Germany
const BUNDESLIGA_CLUBS_META = [
    { n: "Bayern Munich", r: 96, b: 180000000 }, { n: "Bayer Leverkusen", r: 90, b: 60000000 }, { n: "Dortmund", r: 89, b: 80000000 },
    { n: "RB Leipzig", r: 88, b: 100000000 }, { n: "VfB Stuttgart", r: 84, b: 30000000 }, { n: "Eintracht Frankfurt", r: 83, b: 35000000 },
    { n: "Hoffenheim", r: 79, b: 25000000 }, { n: "Heidenheim", r: 76, b: 10000000 }, { n: "Werder Bremen", r: 78, b: 15000000 },
    { n: "Freiburg", r: 80, b: 20000000 }, { n: "Augsburg", r: 75, b: 12000000 }, { n: "Wolfsburg", r: 78, b: 30000000 },
    { n: "Mainz 05", r: 76, b: 15000000 }, { n: "Gladbach", r: 79, b: 25000000 }, { n: "Union Berlin", r: 77, b: 15000000 },
    { n: "Bochum", r: 73, b: 8000000 }, { n: "FC St. Pauli", r: 72, b: 10000000 }, { n: "Holstein Kiel", r: 71, b: 8000000 }
];
const BUNDESLIGA_CLUBS = BUNDESLIGA_CLUBS_META.map((m, i) => createClub(501 + i, m.n, m.r, m.b, "Bundesliga", "DE"));
const BUNDESLIGA_2_CLUBS = Array.from({ length: 18 }).map((_, i) => createClub(600 + i, `Bundesliga 2 Club ${i + 1}`, 65 + Math.floor(Math.random() * 8), 4000000, "2. Bundesliga", "DE"));
// Rivals
const bayern = BUNDESLIGA_CLUBS.find(c => c.name === "Bayern Munich"); const bvb = BUNDESLIGA_CLUBS.find(c => c.name === "Dortmund");
if (bayern && bvb) { bayern.rivalries.push(bvb.id); bvb.rivalries.push(bayern.id); }

// France
const LIGUE1_CLUBS_META = [
    { n: "Paris SG", r: 92, b: 300000000 }, { n: "Monaco", r: 84, b: 40000000 }, { n: "Lille", r: 82, b: 25000000 },
    { n: "Brest", r: 79, b: 15000000 }, { n: "Nice", r: 80, b: 30000000 }, { n: "Lyon", r: 81, b: 35000000 },
    { n: "Marseille", r: 83, b: 30000000 }, { n: "Lens", r: 79, b: 20000000 }, { n: "Rennes", r: 80, b: 25000000 },
    { n: "Toulouse", r: 76, b: 15000000 }, { n: "Reims", r: 75, b: 12000000 }, { n: "Strasbourg", r: 74, b: 15000000 },
    { n: "Montpellier", r: 75, b: 12000000 }, { n: "Nantes", r: 74, b: 10000000 }, { n: "Le Havre", r: 72, b: 8000000 },
    { n: "Auxerre", r: 71, b: 8000000 }, { n: "Angers", r: 70, b: 7000000 }, { n: "Saint-Etienne", r: 73, b: 10000000 }
];
const LIGUE1_CLUBS = LIGUE1_CLUBS_META.map((m, i) => createClub(701 + i, m.n, m.r, m.b, "Ligue 1", "FR"));
const LIGUE2_CLUBS = Array.from({ length: 18 }).map((_, i) => createClub(800 + i, `Ligue 2 Club ${i + 1}`, 60 + Math.floor(Math.random() * 10), 3000000, "Ligue 2", "FR"));
// Rivals
const psg = LIGUE1_CLUBS.find(c => c.name === "Paris SG"); const om = LIGUE1_CLUBS.find(c => c.name === "Marseille");
if (psg && om) { psg.rivalries.push(om.id); om.rivalries.push(psg.id); }

// Italy
const SERIE_A_CLUBS_META = [
    { n: "Inter Milan", r: 91, b: 80000000 }, { n: "AC Milan", r: 89, b: 70000000 }, { n: "Juventus", r: 88, b: 90000000 },
    { n: "Atalanta", r: 84, b: 40000000 }, { n: "Bologna", r: 80, b: 20000000 }, { n: "AS Roma", r: 83, b: 50000000 },
    { n: "Lazio", r: 82, b: 40000000 }, { n: "Fiorentina", r: 81, b: 35000000 }, { n: "Torino", r: 78, b: 20000000 },
    { n: "Napoli", r: 86, b: 60000000 }, { n: "Genoa", r: 76, b: 15000000 }, { n: "Monza", r: 75, b: 15000000 },
    { n: "Verona", r: 74, b: 10000000 }, { n: "Lecce", r: 73, b: 10000000 }, { n: "Udinese", r: 75, b: 15000000 },
    { n: "Cagliari", r: 74, b: 12000000 }, { n: "Empoli", r: 72, b: 8000000 }, { n: "Parma", r: 74, b: 15000000 },
    { n: "Como", r: 72, b: 25000000 }, { n: "Venezia", r: 71, b: 8000000 }
];
const SERIE_A_CLUBS = SERIE_A_CLUBS_META.map((m, i) => createClub(901 + i, m.n, m.r, m.b, "Serie A", "IT"));
const SERIE_B_CLUBS = Array.from({ length: 20 }).map((_, i) => createClub(1000 + i, `Serie B Club ${i + 1}`, 66 + Math.floor(Math.random() * 6), 3000000, "Serie B", "IT"));
// Rivals
const inter = SERIE_A_CLUBS.find(c => c.name === "Inter Milan"); const milan = SERIE_A_CLUBS.find(c => c.name === "AC Milan");
if (inter && milan) { inter.rivalries.push(milan.id); milan.rivalries.push(inter.id); }

// ------------------------------------------------------------------
// Fixture Generator (Round Robin)
// ------------------------------------------------------------------
export const generateFixtures = (clubs: Club[], leagueName: string, dates: string[], startMatchId: number = 1): Fixture[] => {
    const fixtures: Fixture[] = [];
    let matchId = startMatchId;
    const n = clubs.length;

    const map = [];
    for (let i = 0; i < n; i++) map.push(clubs[i].id);
    const fixed = map[0];
    const rotating = map.slice(1);

    const rounds = [];

    for (let r = 0; r < n - 1; r++) {
        const roundFixtures = [];
        roundFixtures.push([fixed, rotating[0]]);
        for (let i = 1; i < (n / 2); i++) {
            const home = rotating[i];
            const away = rotating[rotating.length - i];
            roundFixtures.push([home, away]);
        }
        rounds.push(roundFixtures);
        rotating.push(rotating.shift()!);
    }

    const allRounds = [...rounds];
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
};

// ------------------------------------------------------------------
// Tournament Tree Generator
// ------------------------------------------------------------------
export const injectCupFixtures = (leagues: { [key: string]: League }, year: number) => {
    const dates = getSeasonDates(year);
    const allClubs: Club[] = [];
    Object.values(leagues).forEach(l => allClubs.push(...l.clubs));

    const createKnockoutFixture = (
        id: number,
        round: Fixture['round'],
        date: string,
        comp: string,
        nextId?: number,
        slot?: 'home' | 'away'
    ): Fixture => ({
        id,
        homeClubId: 0,
        awayClubId: 0,
        homeScore: null,
        awayScore: null,
        date,
        played: false,
        competition: comp,
        is_knockout: true,
        round,
        nextFixtureId: nextId,
        bracketSlot: slot
    });

    // --- CHAMPIONS LEAGUE (Top 16 Global based on Rep) ---
    const clClubs = allClubs
        .filter(c => c.active_competitions.includes("Champions League"))
        .sort((a, b) => b.reputation - a.reputation)
        .slice(0, 16);

    const clFixtures: Fixture[] = [];

    // Final
    const finalCL = createKnockoutFixture(8100, 'Final', dates.UCL_DATES.Final, "Champions League");
    clFixtures.push(finalCL);
    // Semis
    const sf1CL = createKnockoutFixture(8090, 'SF', dates.UCL_DATES.SF, "Champions League", 8100, 'home');
    const sf2CL = createKnockoutFixture(8091, 'SF', dates.UCL_DATES.SF, "Champions League", 8100, 'away');
    clFixtures.push(sf1CL, sf2CL);
    // Quarters
    const qf1CL = createKnockoutFixture(8080, 'QF', dates.UCL_DATES.QF, "Champions League", 8090, 'home');
    const qf2CL = createKnockoutFixture(8081, 'QF', dates.UCL_DATES.QF, "Champions League", 8090, 'away');
    const qf3CL = createKnockoutFixture(8082, 'QF', dates.UCL_DATES.QF, "Champions League", 8091, 'home');
    const qf4CL = createKnockoutFixture(8083, 'QF', dates.UCL_DATES.QF, "Champions League", 8091, 'away');
    clFixtures.push(qf1CL, qf2CL, qf3CL, qf4CL);
    // R16
    const shuffledCL = [...clClubs].sort(() => 0.5 - Math.random());
    const r16Targets = [
        { id: 8080, slot: 'home' }, { id: 8080, slot: 'away' },
        { id: 8081, slot: 'home' }, { id: 8081, slot: 'away' },
        { id: 8082, slot: 'home' }, { id: 8082, slot: 'away' },
        { id: 8083, slot: 'home' }, { id: 8083, slot: 'away' }
    ];

    r16Targets.forEach((target, i) => {
        const fix = createKnockoutFixture(8000 + i, 'R16', dates.UCL_DATES.R16, "Champions League", target.id, target.slot as any);
        if (shuffledCL[i * 2]) fix.homeClubId = shuffledCL[i * 2].id;
        if (shuffledCL[i * 2 + 1]) fix.awayClubId = shuffledCL[i * 2 + 1].id;
        clFixtures.push(fix);
    });

    // Use Premier League as host for Continental fixtures
    leagues["Premier League"].fixtures.push(...clFixtures);

    // --- NATIONAL CUPS (Simplified - One generic cup logic per country) ---
    const injectNationalCup = (leagueName: string, cupName: string) => {
        if (!leagues[leagueName]) return;

        const domesticClubs = leagues[leagueName].clubs;
        if (domesticClubs.length < 16) return; // Need at least 16 for this simplified tree

        const shuffled = [...domesticClubs].sort(() => 0.5 - Math.random()).slice(0, 16);
        const cupFixtures: Fixture[] = [];

        let idBase = 9000 + (domesticClubs[0].id * 10); // Unique ID range per country

        const final = createKnockoutFixture(idBase + 100, 'Final', dates.CUP_DATES.Final, cupName);
        const sf1 = createKnockoutFixture(idBase + 90, 'SF', dates.CUP_DATES.SF, cupName, final.id, 'home');
        const sf2 = createKnockoutFixture(idBase + 91, 'SF', dates.CUP_DATES.SF, cupName, final.id, 'away');

        const qf1 = createKnockoutFixture(idBase + 80, 'QF', dates.CUP_DATES.QF, cupName, sf1.id, 'home');
        const qf2 = createKnockoutFixture(idBase + 81, 'QF', dates.CUP_DATES.QF, cupName, sf1.id, 'away');
        const qf3 = createKnockoutFixture(idBase + 82, 'QF', dates.CUP_DATES.QF, cupName, sf2.id, 'home');
        const qf4 = createKnockoutFixture(idBase + 83, 'QF', dates.CUP_DATES.QF, cupName, sf2.id, 'away');

        cupFixtures.push(final, sf1, sf2, qf1, qf2, qf3, qf4);

        const r16Targets = [
            { id: qf1.id, slot: 'home' }, { id: qf1.id, slot: 'away' },
            { id: qf2.id, slot: 'home' }, { id: qf2.id, slot: 'away' },
            { id: qf3.id, slot: 'home' }, { id: qf3.id, slot: 'away' },
            { id: qf4.id, slot: 'home' }, { id: qf4.id, slot: 'away' }
        ];

        r16Targets.forEach((target, i) => {
            const fix = createKnockoutFixture(idBase + i, 'R16', dates.CUP_DATES.R4, cupName, target.id, target.slot as any);
            if (shuffled[i * 2]) fix.homeClubId = shuffled[i * 2].id;
            if (shuffled[i * 2 + 1]) fix.awayClubId = shuffled[i * 2 + 1].id;
            cupFixtures.push(fix);
        });

        leagues[leagueName].fixtures.push(...cupFixtures);
    };

    injectNationalCup("Premier League", "FA Cup");
    injectNationalCup("La Liga", "Copa del Rey");
    injectNationalCup("Bundesliga", "DFB Pokal");
    injectNationalCup("Ligue 1", "Coupe de France");
    injectNationalCup("Serie A", "Coppa Italia");

    // Sort all fixture lists
    Object.values(leagues).forEach(l => {
        l.fixtures.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    });
};

// ------------------------------------------------------------------
// Final Data Exports
// ------------------------------------------------------------------
const DATES_INIT = getSeasonDates(START_YEAR);

// Helper to create league object
const createLeague = (name: string, country: string, tier: number, clubs: Club[], rounds: number): League => ({
    name, country, tier, structure: 'league', reputation: tier === 1 ? 90 : 70,
    coefficient: tier === 1 ? (name === 'Premier League' ? 1.0 : 0.9) : 0.5,
    currency: name.includes('Premier') || name.includes('Champ') ? 'GBP' : 'EUR',
    club_count: clubs.length,
    registration_rules: { max_squad_size: 25, min_homegrown: 8, work_permit_required: false },
    loan_rules: { max_in_per_season: 5, max_from_one_club: 2, in_league_loans_allowed: true },
    match_sub_rules: { bench_limit: 9, subs_allowed: 5 },
    transfer_windows: [{ name: "Summer", open: "2025-07-01", close: "2025-09-01" }, { name: "Winter", open: "2026-01-01", close: "2026-02-01" }],
    fixture_schedule: { season_start: `${START_YEAR}-08-15`, season_end: `${START_YEAR + 1}-05-24`, rounds },
    continental_qualification: tier === 1 ? { ucl: 4, uel: 2, uecl: 1 } : { ucl: 0, uel: 0, uecl: 0 },
    relegation_slots: 3,
    promotion_relegation_with: tier === 1 ? "Tier 2" : "Tier 3",
    tv_distribution: { equal_share: 0.5, merit: 0.5, facility: 0 },
    prize_money_model: { type: "descending_linear", top: tier === 1 ? 50000000 : 5000000, bottom: tier === 1 ? 2000000 : 500000 },
    var_enabled: tier === 1,
    refereeing_strictness: 50,
    injury_rate_modifier: 1.0,
    ffp: { rolling_loss_limit_3y: 50000000 },
    parachute_payments: { enabled: tier === 1, years: 2, first_year_pct_of_share: 0.5 },
    transfer_market_volatility: 60,
    inflation_rate: 0.04,
    inflation_index: 1.0,
    clubs,
    fixtures: generateFixtures(clubs, name, DATES_INIT.PL_MATCH_DATES),
    history: [],
    monthly_awards: []
});

const LEAGUES_CONTAINER = {
    "Premier League": createLeague("Premier League", "England", 1, PREMIER_CLUBS, 38),
    "EFL Championship": createLeague("EFL Championship", "England", 2, CHAMPIONSHIP_CLUBS, 46),
    "La Liga": createLeague("La Liga", "Spain", 1, LALIGA_CLUBS, 38),
    "La Liga 2": createLeague("La Liga 2", "Spain", 2, SEGUNDA_CLUBS, 42),
    "Bundesliga": createLeague("Bundesliga", "Germany", 1, BUNDESLIGA_CLUBS, 34),
    "2. Bundesliga": createLeague("2. Bundesliga", "Germany", 2, BUNDESLIGA_2_CLUBS, 34),
    "Ligue 1": createLeague("Ligue 1", "France", 1, LIGUE1_CLUBS, 34),
    "Ligue 2": createLeague("Ligue 2", "France", 2, LIGUE2_CLUBS, 34),
    "Serie A": createLeague("Serie A", "Italy", 1, SERIE_A_CLUBS, 38),
    "Serie B": createLeague("Serie B", "Italy", 2, SERIE_B_CLUBS, 38)
};

injectCupFixtures(LEAGUES_CONTAINER, START_YEAR);

export const INITIAL_LEAGUES_DATA = LEAGUES_CONTAINER;
