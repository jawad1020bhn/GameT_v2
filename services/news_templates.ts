
export const NEWS_SOURCES = [
  { name: "The Athletic Dept", tier: "Tier 1" },
  { name: "Club Official", tier: "Tier 0" },
  { name: "National Press", tier: "Tier 2" },
  { name: "Local Gazette", tier: "Tier 3" },
  { name: "Social Trends", tier: "Viral" },
  { name: "Transfer Insider", tier: "Tier 2" },
  { name: "Tactical View", tier: "Analysis" },
  { name: "Fan TV", tier: "Opinion" },
  { name: "The Pundit", tier: "Opinion" },
  { name: "Financial Times", tier: "Business" },
  { name: "Medical Gazette", tier: "Tier 2" },
  { name: "Youth Watch", tier: "Tier 3" }
];

export const HEADLINES = {
    UPSET_WIN: [
        "GIANT KILLING: {winner} stuns {loser}!",
        "Shock at {stadium} as {winner} takes all three points",
        "Crisis for {loser} after humiliating defeat to {winner}",
        "Underdogs {winner} silence the {loser} faithful"
    ],
    THRILLER: [
        "Match of the Season? {home} and {away} share {goals} goals",
        "Defensive horror show as {home} and {away} draw {score}",
        "End-to-end chaos: {home} {score} {away}",
        "Fans get their money's worth in {goals}-goal thriller"
    ],
    BORE_DRAW: [
        "Sleepy Sunday: Fans leave early at {stadium}",
        "Stalemate: {home} and {away} cancel each other out",
        "Tactical deadlock results in goalless draw",
        "No way through for {home} against stubborn {away}"
    ],
    THRASHING: [
        "Riot at {stadium}: {winner} destroys {loser} {score}",
        "{loser} humiliated by rampant {winner}",
        "Questions asked of {loser} defense after {score} drubbing",
        "Statement victory: {winner} put {score} past helpless {loser}"
    ],
    CLOSE_WIN: [
        "{winner} scrape past {loser} in tight contest",
        "Hard fought victory for {winner} at {stadium}",
        "{winner} edge out {loser} to claim points",
        "Late drama as {winner} secure win"
    ],
    RIVALRY_WIN: [
        "DERBY DELIGHT: {winner} paint the city their color",
        "{winner} claim bragging rights in fierce derby clash",
        "Fans ecstatic as {winner} triumph over rivals {loser}",
        "Humiliation for {loser} in derby day disaster"
    ],
    TRANSFER_RUMOUR: [
        "Sources: {club} monitoring {player} situation",
        "Exclusive: {player} agent spotted in {city}",
        "{club} preparing shock bid for {player}",
        "Is {player} the answer to {club}'s problems?"
    ],
    TRANSFER_STALL: [
        "DEAL OFF? {club} balk at asking price for {player}",
        "Contract talks stall between {player} and {club}",
        "{player} grows frustrated as transfer drags on",
        "Agent demands causing friction in {player} deal"
    ],
    SACK_PRESSURE: [
        "Board meeting called at {club} after poor run",
        "Fans protest outside stadium: 'Time to go'",
        "{club} manager on the brink: 'I can turn this around'",
        "Crisis deepens at {club} after another defeat"
    ],
    PLAYER_FORM: [
        "Unstoppable: {player} hits form at perfect time",
        "Drought over: {player} finally finds the net",
        "Tactical Analysis: How {player} is redefining the role",
        "Pundits praise {player}'s impact on {club}"
    ],
    PLAYER_UNREST: [
        "TROUBLE BREWING: {player} reportedly unhappy at {club}",
        "Training ground bust-up involving {player}",
        "{player} agent demands meeting with board",
        "Crisis talks planned to resolve {player} future"
    ],
    INJURY_BLOW: [
        "Injury Crisis: {club} lose {player} for months",
        "Season over? {player} stretchered off in training",
        "Medical Staff concerned as {player} limps out",
        "{club} blow as star man {player} sidelined"
    ],
    YOUTH_HYPE: [
        "Remember the name: {player} shines for U21s",
        "Academy Jewel: {club} unearth another gem",
        "Scouts flock to watch {player} debut",
        "The new Messi? {player} turns heads at {club}"
    ],
    FINANCIAL_NEWS: [
        "Takeover Rumours: Billionaire eyes {club}",
        "Financial Boost: {club} announce record sponsorship",
        "Debt Concerns: {club} must sell to survive",
        "War Chest: {manager} promised funds for January"
    ],
    MANAGER_TALK: [
        "Mind Games: {manager} piles pressure on rivals",
        "Tactical Revolution: How {manager} changed {club}",
        "Vote of Confidence: Board backs {manager} despite form",
        "{manager} slams schedule: 'Players are exhausted'"
    ],
    WINNING_STREAK: [
        "Unstoppable: {club} make it 5 wins in a row",
        "Title Charge: {club} momentum builds",
        "Perfect Month: {club} dominate the league",
        "Can anyone stop {club}?"
    ],
    LOSING_STREAK: [
        "Freefall: {club} lose again",
        "Relegation form: {club} in desperate trouble",
        "Crisis Meeting: Players called in on day off",
        "Fans turn on {manager} after another defeat"
    ]
};

export const TRANSFER_HEADLINES = {
    RECORD: [
        "WORLD RECORD: {buyer} sign {player} for £{fee}M!",
        "BLOCKBUSTER: {player} joins {buyer} in mega-deal",
        "Bank Broken: {buyer} smash transfer record for {player}",
        "HERE WE GO: {player} to {buyer} confirmed for massive fee"
    ],
    BARGAIN: [
        "Steal of the Century? {buyer} sign {player} for just £{fee}M",
        "Smart Business: {buyer} snap up {player}",
        "Bargain Hunt: {player} arrives at {buyer}",
        "Low Risk, High Reward: {buyer} announce {player}"
    ],
    PROSPECT: [
        "Wonderkid Secured: {buyer} win race for {player}",
        "One for the Future: {buyer} sign teenage sensation {player}",
        "Next Big Thing? {player} joins {buyer}",
        "{buyer} invest in youth with signing of {player}"
    ],
    VETERAN: [
        "Experience Added: {buyer} sign veteran {player}",
        "One Last Dance: {player} joins {buyer}",
        "Proven Winner: {player} brings trophies to {buyer}",
        "Short-term fix? {player} signs for {buyer}"
    ],
    STANDARD: [
        "OFFICIAL: {player} signs for {buyer}",
        "Done Deal: {player} is a {buyer} player",
        "{buyer} bolster ranks with {player} signing",
        "Transfer News: {player} completes move to {buyer}"
    ],
    CHAIN: [
        "DOMINO EFFECT: {buyer} replace star with {player}",
        "Immediate Response: {buyer} sign {player} after sale",
        "Gap Filled: {player} joins {buyer} as replacement",
        "Revolving Door: {player} in at {buyer}"
    ]
};

export const CONTENT = {
    MATCH_GENERIC: [
        "It was a game of contrasting styles as {home} hosted {away}. In the end, the result reflects the balance of play.",
        "Fans will be talking about this one for days. A crucial result in the context of the season.",
        "The atmosphere was electric at {stadium} but the players had to focus on the job at hand."
    ],
    TACTICAL_FAIL: [
        "The high line employed by {loser} was ruthlessly exploited by {winner}. Questions must be asked of the tactical setup.",
        "{winner} sat deep and hit {loser} on the break repeatedly. A tactical masterclass.",
        "{loser} looked disjointed and lacked creativity in the final third."
    ],
    PLAYER_PRAISE: [
        "{mvp} was the difference maker today, controlling the tempo and creating chances at will.",
        "A captain's performance from {mvp} dragged the team over the line.",
        "Scouts from top clubs were reportedly watching {mvp} today, and they won't be disappointed."
    ],
    RIVALRY_INTENSITY: [
        "Tackles were flying in from the first minute in a heated affair.",
        "The noise level was deafening as {winner} took the lead.",
        "This defeat will hurt {loser} fans more than any other this season."
    ],
    TRANSFER_GENERIC: [
        "The {age}-year-old puts pen to paper on a long-term deal.",
        "Fans have gathered at the training ground to welcome the new signing.",
        "The manager stated that {player} was their number one target all summer.",
        "It is believed wages will be around £{wage}k per week."
    ],
    INJURY_DETAIL: [
        "Scans have confirmed the worst fears. {player} is expected to miss a significant portion of the season.",
        "The manager refused to put a timeline on the recovery, simply stating it 'doesn't look good'.",
        "This leaves the squad threadbare in a key position ahead of the busy winter schedule."
    ],
    YOUTH_DETAIL: [
        "His touch and vision were a level above everyone else on the pitch. A star is born.",
        "Sources say the club are rushing to tie {player} down to a long-term professional contract.",
        "It's rare to see such maturity from a teenager. He looks ready for the first team."
    ],
    STREAK_DETAIL: [
        "Confidence is flowing through the veins of the squad. They look unbeatable right now.",
        "The dressing room is buzzing. The belief is growing that this could be a special season.",
        "Every bounce of the ball seems to go their way, but you make your own luck in this game."
    ],
    CRISIS_DETAIL: [
        "Heads dropped after the first goal went in. The fragility of this team is alarming.",
        "There seems to be a complete lack of leadership on the pitch. Who will stand up?",
        "The manager looked a lonely figure on the touchline. Time is running out."
    ]
};
