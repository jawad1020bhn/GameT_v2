
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
