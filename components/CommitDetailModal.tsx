import React from 'react';
import { XIcon, GitCommitIcon, TagIcon, BugIcon, AlertCircleIcon } from './Icons';
import { GuiltCommit, Issue } from '../types';

interface CommitDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  commit: GuiltCommit | null;
  issues: Issue[];
}

const CommitDetailModal: React.FC<CommitDetailModalProps> = ({ isOpen, onClose, commit, issues }) => {
  if (!isOpen || !commit) return null;

  const linkedIssue = commit.issueId ? issues.find(i => i.id === commit.issueId) : null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-void/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="glass-panel rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden relative border border-white/10">
        
        {/* Top Accent */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-neon-red to-transparent opacity-70" />

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/5">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-xs font-mono text-gray-500 uppercase tracking-widest mb-1">
               <GitCommitIcon className="w-3 h-3" />
               <span>Commit {commit.id.slice(0, 8)}</span>
            </div>
            <div className="text-gray-400 text-xs">
               {new Date(commit.timestamp).toLocaleString(undefined, { dateStyle: 'full', timeStyle: 'short' })}
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full">
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-8 overflow-y-auto custom-scrollbar space-y-8">
          
          {/* Main Message */}
          <div className="space-y-2">
            <h2 className="text-2xl font-light text-white leading-snug">{commit.message}</h2>
            {linkedIssue && (
               <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neon-blue/10 border border-neon-blue/20 text-neon-blue text-xs font-mono">
                  <BugIcon className="w-3 h-3" />
                  Linked to Issue #{linkedIssue.number}: {linkedIssue.title}
               </div>
            )}
          </div>

          {/* Severity & Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="bg-white/5 rounded-xl p-5 border border-white/5 relative overflow-hidden group">
                <div className={`absolute right-0 top-0 w-20 h-20 blur-2xl rounded-full opacity-20 -mr-5 -mt-5 transition-colors duration-500 ${
                    commit.analysis.severity >= 3 ? 'bg-neon-red' : 'bg-neon-blue'
                }`} />
                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-mono block mb-2">Severity Level</span>
                <div className="flex items-end gap-2">
                   <span className={`text-4xl font-bold ${commit.analysis.severity >= 3 ? 'text-neon-red' : 'text-white'}`}>
                      {commit.analysis.severity}
                   </span>
                   <span className="text-gray-500 text-sm mb-1">/ 4</span>
                </div>
             </div>

             <div className="bg-white/5 rounded-xl p-5 border border-white/5 flex flex-col justify-center">
                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-mono block mb-2">Category</span>
                <span className="text-lg text-white font-light">{commit.analysis.category}</span>
             </div>
          </div>

          {/* Roast */}
          <div className="relative pl-6 border-l-2 border-neon-red/30 py-2">
             <span className="absolute -left-[9px] -top-2 bg-void text-neon-red text-2xl leading-none">“</span>
             <p className="text-gray-300 italic text-lg font-light leading-relaxed">
                {commit.analysis.roast}
             </p>
          </div>

          {/* Penance */}
          <div className="bg-black/30 rounded-xl p-5 border border-white/5 font-mono text-sm">
             <div className="flex items-center gap-2 text-neon-green mb-3 uppercase tracking-wider text-[10px]">
                <AlertCircleIcon className="w-3 h-3" />
                Recommended Protocol
             </div>
             <p className="text-gray-300">{commit.analysis.penance}</p>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 pt-2">
             {commit.analysis.tags.map(tag => (
                <div key={tag} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-400">
                   <TagIcon className="w-3 h-3 opacity-50" />
                   {tag}
                </div>
             ))}
          </div>

        </div>
      </div>
    </div>
  );
};

export default CommitDetailModal;