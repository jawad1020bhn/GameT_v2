import React from 'react';

interface Response {
    type: 'aggressive' | 'calm' | 'assertive' | 'dismissive';
    text: string;
    label: string;
    effect: any;
}

interface PressConferenceModalProps {
    data: { text: string, responses: Response[] };
    onClose: () => void;
    onRespond: (response: Response) => void;
}

export const PressConferenceModal: React.FC<PressConferenceModalProps> = ({ data, onClose, onRespond }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/90 backdrop-blur">
            <div className="w-full max-w-2xl bg-neutral-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
                <div className="bg-neutral-950 p-6 border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">🎙️</span>
                        <h2 className="text-xl font-bold text-white font-oswald uppercase tracking-wide">Media Interview</h2>
                    </div>
                    <button onClick={onClose} className="text-neutral-500 hover:text-white">✕</button>
                </div>

                <div className="p-8 text-center">
                    <div className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-4">Journalist Question</div>
                    <h3 className="text-2xl font-bold text-white leading-relaxed">"{data.text}"</h3>
                </div>

                <div className="grid grid-cols-2 gap-4 p-6 bg-neutral-950/50">
                    {data.responses.map((resp, i) => (
                        <button
                            key={i}
                            onClick={() => onRespond(resp)}
                            className={`p-4 rounded-lg border text-left transition-all group relative overflow-hidden
                                ${resp.type === 'aggressive' ? 'bg-red-900/20 border-red-500/30 hover:border-red-500 hover:bg-red-900/40' :
                                  resp.type === 'calm' ? 'bg-blue-900/20 border-blue-500/30 hover:border-blue-500 hover:bg-blue-900/40' :
                                  resp.type === 'assertive' ? 'bg-emerald-900/20 border-emerald-500/30 hover:border-emerald-500 hover:bg-emerald-900/40' :
                                  'bg-neutral-800 border-neutral-700 hover:border-neutral-500'}
                            `}
                        >
                            <div className="text-[10px] font-bold uppercase mb-1 opacity-70 group-hover:opacity-100 flex justify-between">
                                <span>{resp.label}</span>
                                <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                                    {resp.type === 'aggressive' ? '😠' : resp.type === 'calm' ? '😌' : resp.type === 'assertive' ? '😤' : '😑'}
                                </span>
                            </div>
                            <div className="text-sm font-medium text-white">"{resp.text}"</div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
