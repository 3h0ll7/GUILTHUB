import React, { useMemo } from 'react';
import { GuiltCommit, GuiltLevel, DayData } from '../types';

interface ContributionGraphProps {
  commits: GuiltCommit[];
}

const ContributionGraph: React.FC<ContributionGraphProps> = ({ commits }) => {
  const days = useMemo(() => {
    const result: DayData[] = [];
    const today = new Date();
    for (let i = 364; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      
      const dayCommits = commits.filter(c => c.date.startsWith(dateStr));
      let level = GuiltLevel.NONE;
      if (dayCommits.length > 0) {
         const maxSev = Math.max(...dayCommits.map(c => c.analysis.severity));
         level = maxSev as GuiltLevel;
      }

      result.push({ date: dateStr, count: dayCommits.length, level });
    }
    return result;
  }, [commits]);

  const weeks = useMemo(() => {
    const w: DayData[][] = [];
    let currentWeek: DayData[] = [];
    days.forEach((day) => {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        w.push(currentWeek);
        currentWeek = [];
      }
    });
    if (currentWeek.length > 0) w.push(currentWeek);
    return w;
  }, [days]);

  const getLevelColor = (level: GuiltLevel) => {
    switch (level) {
      case GuiltLevel.NONE: return 'bg-white/5';
      case GuiltLevel.LOW: return 'bg-neon-red/20 shadow-[0_0_5px_rgba(255,42,109,0.2)]';
      case GuiltLevel.MEDIUM: return 'bg-neon-red/50 shadow-[0_0_8px_rgba(255,42,109,0.4)]';
      case GuiltLevel.HIGH: return 'bg-neon-red/80 shadow-[0_0_12px_rgba(255,42,109,0.6)]';
      case GuiltLevel.EXTREME: return 'bg-neon-red shadow-[0_0_15px_rgba(255,42,109,0.9)]';
      default: return 'bg-white/5';
    }
  };

  return (
    <div className="glass-card p-6 rounded-2xl w-full overflow-x-auto">
      <div className="min-w-[700px]">
        <div className="flex justify-between items-end mb-4">
          <span className="text-xs font-mono text-neon-blue tracking-widest uppercase">Temporal Anomaly Map</span>
        </div>
        
        <div className="flex gap-[4px]">
          {weeks.map((week, i) => (
            <div key={i} className="flex flex-col gap-[4px]">
              {week.map((day) => (
                <div
                  key={day.date}
                  className={`w-2.5 h-2.5 rounded-[2px] ${getLevelColor(day.level)} transition-all duration-500 hover:scale-125 relative group`}
                >
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block w-max z-20 pointer-events-none">
                    <div className="bg-void-900 text-white text-[10px] font-mono rounded px-2 py-1 border border-white/10 shadow-xl">
                       {day.date} • {day.count} Exceptions
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContributionGraph;