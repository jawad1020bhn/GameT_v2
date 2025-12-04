
import React, { useMemo } from 'react';
import { useGame } from '../../context/GameContext';
import { formatDate } from '../../services/engine';
import { NewsItem } from '../../types';

// --- FLAVOR GENERATORS (Fallback for legacy items) ---
const SOURCES = [
  { name: "Club Official", tier: "Tier 0" },
  { name: "National Press", tier: "Tier 2" },
  { name: "Local Gazette", tier: "Tier 3" },
  { name: "The Athletic Dept", tier: "Tier 1" },
  { name: "Social Trends", tier: "Viral" },
  { name: "Transfer Insider", tier: "Tier 2" }
];

const HASHTAGS = {
  transfer: ["#DeadlineDay", "#HereWeGo", "#Transfers", "#NewSigning"],
  match: ["#Matchday", "#UCL", "#PremierLeague", "#DerbyDay"],
  injury: ["#InjuryUpdate", "#PhysioRoom", "#Breaking"],
  finance: ["#Business", "#Takeover", "#MoneyTalks"],
  award: ["#POTM", "#GoldenBoot", "#BallonDor"],
  general: ["#Football", "#News"]
};

const REACTIONS = [
  "Fans are delighted with the recent results.",
  "Pundits are praising the manager's tactical approach.",
  "A controversial decision that will be debated for weeks.",
  "Supporters are gathering outside the stadium in celebration.",
  "Social media is buzzing with speculation.",
  "Rival fans are skeptical of the news.",
  "Club statement expected shortly.",
  "Insider sources suggest more updates soon."
];

// Helper to generate consistent fake metadata based on ID (only if missing)
const enrichNewsItem = (item: NewsItem) => {
  if (item.meta) return item; // Use pre-calculated meta if available

  const seed = item.id;
  const source = SOURCES[seed % SOURCES.length];
  const tags = HASHTAGS[item.image_type] || HASHTAGS.general;
  const tag = tags[seed % tags.length];
  const likes = (seed * 123) % 50000 + 500;
  const comments = Math.floor(likes / 20);
  const reaction = REACTIONS[seed % REACTIONS.length];
  
  return { ...item, meta: { source, tag, likes, comments, reaction } };
};

export const News: React.FC = () => {
  const { state } = useGame();
  const [filter, setFilter] = React.useState<string>('all');

  const enrichedNews = useMemo(() => state.news.map(enrichNewsItem), [state.news]);

  const filteredNews = filter === 'all' 
    ? enrichedNews 
    : enrichedNews.filter(n => n.image_type === filter);

  // Sort by date descending
  const sortedNews = [...filteredNews].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  const heroNews = sortedNews[0];
  const secondaryNews = sortedNews.slice(1, 4); // Next 3 items
  const feedNews = sortedNews.slice(4); // The rest

  const getTypeStyles = (item: NewsItem) => {
      // Advanced subType styling
      if (item.subType) {
          switch(item.subType) {
              case 'punditry': return { color: 'text-purple-400', border: 'border-purple-400', bg: 'bg-purple-600', gradient: 'from-purple-900/50 to-neutral-900' };
              case 'scandal': return { color: 'text-red-500', border: 'border-red-500', bg: 'bg-red-600', gradient: 'from-red-900/50 to-neutral-900' };
              case 'tactical_analysis': return { color: 'text-indigo-400', border: 'border-indigo-400', bg: 'bg-indigo-600', gradient: 'from-indigo-900/50 to-neutral-900' };
              case 'fan_reaction': return { color: 'text-pink-400', border: 'border-pink-400', bg: 'bg-pink-600', gradient: 'from-pink-900/50 to-neutral-900' };
              case 'rumour': return { color: 'text-amber-400', border: 'border-amber-400', bg: 'bg-amber-600', gradient: 'from-amber-900/50 to-neutral-900' };
              case 'statement': return { color: 'text-white', border: 'border-white', bg: 'bg-neutral-600', gradient: 'from-neutral-800 to-neutral-900' };
          }
      }

      // Fallback to basic image_type styling
      switch(item.image_type) {
          case 'transfer': return { color: 'text-amber-400', border: 'border-amber-400', bg: 'bg-amber-500', gradient: 'from-amber-900/50 to-neutral-900' };
          case 'injury': return { color: 'text-rose-500', border: 'border-rose-500', bg: 'bg-rose-500', gradient: 'from-rose-900/50 to-neutral-900' };
          case 'finance': return { color: 'text-emerald-400', border: 'border-emerald-400', bg: 'bg-emerald-500', gradient: 'from-emerald-900/50 to-neutral-900' };
          case 'award': return { color: 'text-purple-400', border: 'border-purple-400', bg: 'bg-purple-500', gradient: 'from-purple-900/50 to-neutral-900' };
          default: return { color: 'text-blue-400', border: 'border-blue-400', bg: 'bg-blue-500', gradient: 'from-blue-900/50 to-neutral-900' };
      }
  };

  const formatNumber = (num: number) => {
      if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
      return num.toString();
  };

  return (
    <div className="h-full flex flex-col bg-neutral-950 overflow-hidden">
      
      {/* TICKER */}
      <div className="h-8 bg-neutral-900 border-b border-neutral-800 flex items-center shrink-0 overflow-hidden relative z-20">
          <div className="bg-red-600 text-white text-[10px] font-bold uppercase px-3 h-full flex items-center z-20 shadow-lg tracking-widest">
              Breaking
          </div>
          <div className="whitespace-nowrap animate-marquee flex items-center gap-12 px-4">
              {state.news.filter(n => (n.importance || 0) > 6).slice(0, 5).map(n => (
                  <span key={n.id} className="text-neutral-300 text-xs font-mono uppercase flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                      <span className="text-neutral-500">{formatDate(n.date)}:</span> 
                      <span className="text-white font-bold">{n.headline}</span>
                  </span>
              ))}
          </div>
          {/* CSS for Marquee would usually go in global styles, inline simulation here for simplicity */}
          <style>{`
            @keyframes marquee {
                0% { transform: translateX(0); }
                100% { transform: translateX(-100%); }
            }
            .animate-marquee {
                animation: marquee 30s linear infinite;
            }
          `}</style>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
        
        {/* MAIN FEED AREA */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
            
            {/* HERO STORY */}
            {heroNews && (() => {
                const style = getTypeStyles(heroNews);
                return (
                    <div className={`relative w-full h-80 rounded-2xl overflow-hidden mb-8 border border-neutral-800 shadow-2xl group cursor-pointer transition-all hover:scale-[1.01]`}>
                        {/* Background Graphic */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${style.gradient}`}></div>
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
                        
                        <div className="absolute inset-0 p-8 flex flex-col justify-end z-10 bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-transparent">
                            <div className="flex items-center gap-3 mb-3">
                                <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded text-white ${style.bg} shadow-lg`}>
                                    {heroNews.image_type}
                                </span>
                                <span className="text-neutral-400 text-xs font-mono flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    {formatDate(heroNews.date)}
                                </span>
                                {heroNews.subType && (
                                    <span className="text-[10px] font-bold uppercase text-white bg-neutral-800/80 px-2 py-0.5 rounded border border-neutral-600">
                                        {heroNews.subType.replace('_', ' ')}
                                    </span>
                                )}
                            </div>
                            
                            <h1 className="text-4xl md:text-5xl font-bold text-white font-oswald uppercase leading-[0.9] mb-4 drop-shadow-lg max-w-3xl">
                                {heroNews.headline}
                            </h1>
                            
                            <div className="flex items-center justify-between border-t border-white/10 pt-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white font-bold font-serif">
                                        {heroNews.meta?.source.name.charAt(0)}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs text-white font-bold">{heroNews.meta?.source.name}</span>
                                        <span className="text-[10px] text-neutral-400">{heroNews.meta?.source.tier} Source</span>
                                    </div>
                                </div>
                                <div className="flex gap-4 text-xs text-neutral-300 font-mono">
                                    <span className="flex items-center gap-1 text-red-400">♥ {formatNumber(heroNews.meta?.likes || 0)}</span>
                                    <span className="flex items-center gap-1">💬 {formatNumber(heroNews.meta?.comments || 0)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })()}

            {/* FILTER TABS */}
            <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
                {['all', 'match', 'transfer', 'injury', 'finance'].map(cat => (
                    <button
                        key={cat}
                        onClick={() => setFilter(cat)}
                        className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all border flex-shrink-0 ${filter === cat ? 'bg-white text-neutral-950 border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'bg-neutral-900 text-neutral-500 border-neutral-800 hover:border-neutral-600 hover:text-neutral-300'}`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* SECONDARY GRID */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {secondaryNews.map(item => {
                    const style = getTypeStyles(item);
                    return (
                        <div key={item.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 flex flex-col justify-between hover:border-neutral-600 transition-all group">
                            <div>
                                <div className="flex justify-between items-start mb-3">
                                    <span className={`text-[10px] font-bold uppercase ${style.color}`}>{item.image_type}</span>
                                    <span className="text-[10px] text-neutral-600 font-mono">{item.meta?.tag}</span>
                                </div>
                                <h3 className="text-white font-bold font-oswald text-lg uppercase leading-tight mb-2 group-hover:text-emerald-400 transition-colors">
                                    {item.headline}
                                </h3>
                                <p className="text-neutral-400 text-xs line-clamp-2 mb-4">
                                    {item.content}
                                </p>
                            </div>
                            <div className="flex items-center gap-2 pt-3 border-t border-neutral-800">
                                <div className={`w-2 h-2 rounded-full ${style.bg}`}></div>
                                <span className="text-[10px] text-neutral-500 uppercase font-bold">{item.meta?.source.name}</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* FEED LIST */}
            <div className="space-y-4">
                <h3 className="text-neutral-500 font-bold uppercase text-xs tracking-widest mb-2">Earlier Updates</h3>
                {feedNews.map(item => (
                    <div key={item.id} className="flex gap-4 p-4 bg-neutral-900/50 border border-neutral-800 rounded-lg hover:bg-neutral-800 transition-colors">
                        <div className="flex-shrink-0 w-16 flex flex-col items-center justify-center border-r border-neutral-800 pr-4">
                             <span className="text-lg font-bold text-neutral-300 font-oswald">{new Date(item.date).getDate()}</span>
                             <span className="text-[10px] text-neutral-500 uppercase font-bold">{new Date(item.date).toLocaleString('default', { month: 'short' })}</span>
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <span className={`text-[10px] font-bold uppercase px-1.5 rounded border ${getTypeStyles(item).border} ${getTypeStyles(item).color} bg-neutral-950`}>
                                    {item.image_type}
                                </span>
                                <span className="text-xs text-neutral-500">• {item.meta?.source.name}</span>
                                {item.subType && <span className="text-[10px] text-neutral-600 uppercase font-bold tracking-wider">• {item.subType.replace('_',' ')}</span>}
                            </div>
                            <h4 className="text-white font-bold text-sm mb-1">{item.headline}</h4>
                            <p className="text-neutral-400 text-xs">{item.content}</p>
                        </div>
                    </div>
                ))}
            </div>

        </div>

        {/* RIGHT SIDEBAR (Trending & Extras) */}
        <div className="w-full md:w-80 bg-neutral-900 border-l border-neutral-800 p-6 flex flex-col gap-8 overflow-y-auto">
            
            {/* Trending Topics */}
            <div>
                <h3 className="text-white font-bold font-oswald uppercase text-lg mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-emerald-500"></span> Trending Now
                </h3>
                <div className="flex flex-wrap gap-2">
                    {["#DeadlineDay", "#VAR", "#SackRace", "#UCLDraw", "#Wonderkid", "#OilMoney", "#GoldenBoy"].map(tag => (
                        <span key={tag} className="px-3 py-1 bg-neutral-800 text-neutral-300 text-xs font-bold rounded-full hover:bg-neutral-700 hover:text-white cursor-pointer transition-colors">
                            {tag}
                        </span>
                    ))}
                </div>
            </div>

            {/* Social Feed Simulation */}
            <div>
                <h3 className="text-white font-bold font-oswald uppercase text-lg mb-4 flex items-center gap-2">
                     <span className="w-1.5 h-4 bg-blue-500"></span> Social Pulse
                </h3>
                <div className="space-y-4">
                    {enrichedNews.slice(0, 3).map(item => (
                        <div key={item.id} className="bg-neutral-950 p-3 rounded border border-neutral-800 relative">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-400 to-blue-600"></div>
                                <span className="text-xs font-bold text-white">FootballFan_99</span>
                                <span className="text-[10px] text-neutral-500">@footyfan</span>
                            </div>
                            <p className="text-xs text-neutral-300 italic mb-2">"{item.meta?.reaction}"</p>
                            <div className="text-[10px] text-neutral-500 font-mono bg-neutral-900 px-2 py-1 rounded inline-block truncate max-w-full">
                                Replying to: {item.headline.substring(0, 20)}...
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Rumour Mill */}
            <div className="bg-gradient-to-br from-neutral-800 to-neutral-900 p-4 rounded-xl border border-yellow-900/30">
                <h3 className="text-yellow-500 font-bold font-oswald uppercase text-lg mb-3">Rumour Mill</h3>
                <ul className="space-y-3">
                    <li className="text-xs text-neutral-300 pb-2 border-b border-neutral-700/50">
                        <span className="font-bold text-white">Mbappé</span> linked with shock move to <span className="font-bold text-white">Man City</span>?
                    </li>
                    <li className="text-xs text-neutral-300 pb-2 border-b border-neutral-700/50">
                        <span className="font-bold text-white">Klopp</span> spotted at <span className="font-bold text-white">Barcelona</span> airport.
                    </li>
                    <li className="text-xs text-neutral-300">
                        Scouts from <span className="font-bold text-white">Real Madrid</span> watching <span className="font-bold text-white">Brighton</span> youngster.
                    </li>
                </ul>
            </div>

        </div>

      </div>
    </div>
  );
};
