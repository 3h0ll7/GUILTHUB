import React from 'react';
import { GitPullRequestIcon, GitMergeIcon, CheckIcon, AlertCircleIcon } from './Icons';
import { PullRequest, GuiltCommit } from '../types';

interface PullRequestListProps {
  pullRequests: PullRequest[];
  commits: GuiltCommit[];
}

const PullRequestList: React.FC<PullRequestListProps> = ({ pullRequests, commits }) => {
  if (pullRequests.length === 0) {
    return (
      <div className="text-center py-20 opacity-50">
        <p className="font-light text-gray-400">No active forgiveness protocols.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4 animate-fade-in">
      {pullRequests.map((pr) => {
        const linkedCommit = commits.find(c => c.id === pr.commitId);
        const isMerged = pr.status === 'merged';
        
        return (
          <div key={pr.id} className={`glass-card p-6 rounded-2xl group transition-all ${isMerged ? 'border-purple-500/20' : ''}`}>
            <div className="flex items-start gap-4">
              <div className={`mt-1 p-2 rounded-full ${isMerged ? 'bg-purple-500/10 text-purple-400' : 'bg-neon-green/10 text-green-400'}`}>
                {isMerged ? <GitMergeIcon className="w-5 h-5" /> : <GitPullRequestIcon className="w-5 h-5" />}
              </div>
              
              <div className="flex-1">
                <div className="flex justify-between items-start">
                    <h3 className="text-lg font-medium text-white group-hover:text-neon-blue transition-colors">
                        {pr.title}
                    </h3>
                    <span className="font-mono text-xs text-gray-500">#{pr.number}</span>
                </div>
                
                <div className="text-sm text-gray-400 mt-1 mb-4">
                    Attempting to fix: <span className="italic text-gray-500">{linkedCommit?.message}</span>
                </div>
                
                {pr.review && (
                   <div className={`p-4 rounded-xl border text-sm leading-relaxed ${
                       isMerged ? 'bg-purple-500/5 border-purple-500/10 text-purple-200' : 'bg-yellow-500/5 border-yellow-500/10 text-yellow-200'
                   }`}>
                      <div className="flex items-center gap-2 mb-2 font-mono text-xs uppercase tracking-wider opacity-70">
                         <span className="w-2 h-2 rounded-full bg-current"></span>
                         AI Reviewer
                      </div>
                      {pr.review.comment}
                   </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PullRequestList;