import React, { useState } from 'react';
import { BugIcon, PlusIcon, XIcon, CheckIcon } from './Icons';
import { Issue } from '../types';

interface IssuesListProps {
  issues: Issue[];
  onCreateIssue: (issue: Issue) => void;
  onCloseIssue: (id: string) => void;
}

const IssuesList: React.FC<IssuesListProps> = ({ issues, onCreateIssue, onCloseIssue }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');

  const handleCreate = () => {
    if (!newTitle.trim()) return;
    const issue: Issue = {
      id: crypto.randomUUID(),
      number: issues.length + 1,
      title: newTitle,
      description: newDescription,
      status: 'open',
      createdAt: new Date().toISOString(),
      labels: ['bad-habit', 'recurring']
    };
    onCreateIssue(issue);
    setNewTitle('');
    setNewDescription('');
    setIsCreating(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-light text-white tracking-wide flex items-center gap-3">
          <BugIcon className="w-6 h-6 text-neon-red" />
          System Defects (Habits)
        </h2>
        <button 
          onClick={() => setIsCreating(true)}
          className="glass-card px-4 py-2 rounded-full text-sm text-white flex items-center gap-2 hover:bg-white/10 transition-all"
        >
          <PlusIcon className="w-4 h-4" />
          New Issue
        </button>
      </div>

      {isCreating && (
        <div className="glass-panel p-6 rounded-2xl animate-slide-up mb-6">
          <div className="flex justify-between mb-4">
            <h3 className="text-lg font-medium text-white">Log New Recurring Defect</h3>
            <button onClick={() => setIsCreating(false)}><XIcon className="w-5 h-5 text-gray-400" /></button>
          </div>
          <input 
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Issue Title (e.g., 'Doomscrolling Loop')"
            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white mb-3 focus:border-neon-blue outline-none transition-colors"
          />
          <textarea 
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            placeholder="Description of the behavior pattern..."
            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white mb-4 h-24 resize-none focus:border-neon-blue outline-none transition-colors"
          />
          <div className="flex justify-end">
            <button 
              onClick={handleCreate}
              className="bg-neon-blue/20 text-neon-blue border border-neon-blue/50 px-6 py-2 rounded-full font-medium hover:bg-neon-blue/30 transition-all"
            >
              Submit Issue
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {issues.map((issue) => (
          <div key={issue.id} className={`glass-card p-6 rounded-2xl relative group ${issue.status === 'closed' ? 'opacity-50 grayscale' : ''}`}>
            <div className="flex justify-between items-start mb-4">
              <span className="font-mono text-xs text-gray-500">ISSUE #{issue.number}</span>
              <span className={`px-2 py-1 rounded-full text-[10px] uppercase tracking-wider border ${issue.status === 'open' ? 'border-neon-red/50 text-neon-red bg-neon-red/10' : 'border-green-500/50 text-green-500 bg-green-500/10'}`}>
                {issue.status}
              </span>
            </div>
            <h3 className="text-lg font-medium text-white mb-2">{issue.title}</h3>
            <p className="text-sm text-gray-400 line-clamp-3 mb-4">{issue.description}</p>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {issue.labels.map(label => (
                <span key={label} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-gray-400 border border-white/10">
                  {label}
                </span>
              ))}
            </div>

            {issue.status === 'open' && (
              <button 
                onClick={() => onCloseIssue(issue.id)}
                className="w-full py-2 rounded-lg border border-white/10 text-xs text-gray-400 hover:text-white hover:bg-white/5 transition-all flex items-center justify-center gap-2"
              >
                <CheckIcon className="w-3 h-3" />
                Mark Resolved
              </button>
            )}
          </div>
        ))}
        
        {issues.length === 0 && !isCreating && (
           <div className="col-span-full glass-panel p-12 rounded-2xl text-center border-dashed border-white/10">
              <p className="text-gray-500">System Optimized. No known defects.</p>
           </div>
        )}
      </div>
    </div>
  );
};

export default IssuesList;