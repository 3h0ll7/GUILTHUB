import React, { useMemo } from 'react';
import { GitCommitIcon } from './Icons';
import { GuiltCommit } from '../types';

interface CommitListProps {
  commits: GuiltCommit[];
  onSelectCommit: (commit: GuiltCommit) => void;
}

const CommitList: React.FC<CommitListProps> = ({ commits, onSelectCommit }) => {
  const groupedCommits = useMemo(() => {
    const sorted = [...commits].sort((a, b) => b.timestamp - a.timestamp);
    const groups: { date: string; commits: GuiltCommit[] }[] = [];
    
    sorted.forEach(commit => {
      const dateStr = new Date(commit.date).toLocaleDateString(undefined, { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      
      let group = groups.find(g => g.date === dateStr);
      if (!group) {
        group = { date: dateStr, commits: [] };
        groups.push(group);
      }
      group.commits.push(commit);
    });
    return groups;
  }, [commits]);

  if (commits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500 animate-fade-in">
        <GitCommitIcon className="w-12 h-12 mb-4 opacity-20" />
        <p className="font-mono text-sm">System Clean.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-12 pb-20 animate-fade-in">
      {groupedCommits.map((group, groupIndex) => (
        <div key={group.date} className="relative">
          {/* Date Marker */}
          <div className="sticky top-4 z-10 mb-6 flex justify-center">
            <span className="glass-panel px-4 py-1 rounded-full text-xs font-mono text-neon-blue uppercase tracking-widest backdrop-blur-xl shadow-lg">
              {group.date}
            </span>
          </div>

          <div className="space-y-6">
             {group.commits.map((commit, i) => (
                 <div key={commit.id} 
                      onClick={() => onSelectCommit(commit)}
                      className="glass-card p-6 rounded-2xl relative overflow-hidden group cursor-pointer hover:border-neon-blue/30 transition-all duration-300"
                      style={{ animationDelay: `${i * 50}ms` }}>
                      
                      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-white/20 to-transparent opacity-50 group-hover:from-neon-blue group-hover:to-transparent transition-all" />
                      
                      <div className="flex items-start justify-between gap-4 relative z-10">
                          <div>
                              <p className="text-lg text-white font-light leading-snug mb-2 group-hover:text-neon-blue transition-colors">
                                  {commit.message}
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {commit.analysis.tags.map(tag => (
                                    <span key={tag} className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-gray-400 border border-white/5">
                                        #{tag}
                                    </span>
                                ))}
                              </div>
                          </div>
                          
                          <div className="flex flex-col items-end gap-2">
                              <span className={`text-xs px-2 py-1 rounded-md font-mono ${
                                  commit.analysis.severity >= 3 ? 'text-neon-red bg-neon-red/10 border border-neon-red/20' : 'text-gray-400 bg-white/5'
                              }`}>
                                  LVL {commit.analysis.severity}
                              </span>
                              <span className="text-[10px] text-gray-600 font-mono">
                                  {new Date(commit.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </span>
                          </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-white/5 text-sm text-gray-400 font-light italic">
                          "{commit.analysis.roast}"
                      </div>
                 </div>
             ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CommitList;