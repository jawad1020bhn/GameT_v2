import { GameState } from '../types';

export const InteractionEngine = {
    generatePressConference: (state: GameState) => {
        const recentEvent = state.simulation.recentEvents[state.simulation.recentEvents.length - 1];

        if (recentEvent && recentEvent.includes('loss')) {
            return {
                text: "A disappointing result. Do you feel the pressure mounting?",
                responses: [
                    { type: 'aggressive', text: "The referee was an absolute disgrace.", label: "Blame Refs", effect: { board: -5, fans: 10, morale: 5 } },
                    { type: 'calm', text: "We were unlucky, the performance was there.", label: "Stay Calm", effect: { board: 2, fans: 0, morale: 2 } },
                    { type: 'assertive', text: "The players know that standard isn't acceptable.", label: "Criticize Squad", effect: { board: 5, fans: -5, morale: -10 } },
                    { type: 'dismissive', text: "I don't pay attention to outside noise.", label: "Dismiss", effect: { board: 0, fans: -2, morale: 0 } }
                ]
            };
        } else if (recentEvent && (recentEvent.includes('win') || recentEvent.includes('GOAL'))) {
             return {
                text: "A fantastic performance today. Is this the real level of your team?",
                responses: [
                    { type: 'aggressive', text: "We silenced the critics today.", label: "Attack Critics", effect: { board: 2, fans: 5, morale: 5 } },
                    { type: 'calm', text: "It's just three points. We stay grounded.", label: "Stay Humble", effect: { board: 5, fans: 2, morale: 0 } },
                    { type: 'assertive', text: "This is exactly what we worked on in training.", label: "Praise Tactics", effect: { board: 5, fans: 0, morale: 2 } },
                    { type: 'dismissive', text: "We move on to the next one.", label: "Focus", effect: { board: 2, fans: 0, morale: 0 } }
                ]
            };
        }

        return {
            text: "What is your primary focus for the upcoming period?",
            responses: [
                { type: 'calm', text: "Consistency is key.", label: "Consistency", effect: { board: 2, fans: 2, morale: 2 } },
                { type: 'assertive', text: "We are aiming for the title.", label: "Ambition", effect: { board: 5, fans: 10, morale: 5 } },
                { type: 'dismissive', text: "I'm just doing my job.", label: "Deflect", effect: { board: -2, fans: -2, morale: 0 } },
                { type: 'aggressive', text: "We will crush anyone in our way.", label: "Intimidate", effect: { board: -5, fans: 15, morale: 10 } }
            ]
        };
    }
};
