import React, { useState } from 'react';
import { XIcon, GitCommitIcon, BugIcon } from './Icons';
import { analyzeGuiltCommit } from '../services/geminiService';
import { GuiltCommit, GuiltAnalysis, Issue } from '../types';

interface NewCommitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCommit: (commit: GuiltCommit) => void;
  issues: Issue[];
}

const NewCommitModal: React.FC<NewCommitModalProps> = ({ isOpen, onClose, onCommit, issues }) => {
  const [message, setMessage] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<GuiltAnalysis | null>(null);
  const [selectedIssueId, setSelectedIssueId] = useState<string>('');

  if (!isOpen) return null;

  const handleAnalyze = async () => {
    if (!message.trim()) return;
    setIsAnalyzing(true);
    try {
      const result = await analyzeGuiltCommit(message);
      setAnalysis(result);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleConfirm = () => {
    if (!analysis) return;
    
    const newCommit: GuiltCommit = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      timestamp: Date.now(),
      message: message,
      analysis: analysis,
      issueId: selectedIssueId || undefined,
    };
    
    onCommit(newCommit);
    handleClose();
  };

  const handleClose = () => {
    setMessage('');
    setAnalysis(null);
    setSelectedIssueId('');
    onClose();
  };

  const openIssues = issues.filter(i => i.status === 'open');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-void/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="glass-panel rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden relative">
        
        {/* Decorative Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-neon-red to-transparent opacity-50" />

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <h2 className="text-lg font-light tracking-wide text-white flex items-center gap-3">
            <div className="p-2 bg-neon-red/10 rounded-lg">
              <GitCommitIcon className="w-5 h-5 text-neon-red" />
            </div>
            Log Anomaly
          </h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-white transition-colors">
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-8 overflow-y-auto custom-scrollbar">
          {!analysis ? (
            <div className="space-y-6 animate-slide-up">
              <div>
                <label className="block text-xs font-mono text-neon-blue mb-2 uppercase tracking-widest">Description of Incident</label>
                <textarea
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:border-neon-red/50 outline-none h-40 resize-none font-sans text-lg leading-relaxed transition-all placeholder-gray-600"
                  placeholder="Describe the system failure..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="flex justify-end">
                <button
                  onClick={handleAnalyze}
                  disabled={!message.trim() || isAnalyzing}
                  className={`px-6 py-3 rounded-full font-medium text-white transition-all flex items-center gap-2 shadow-lg
                    ${!message.trim() || isAnalyzing 
                      ? 'bg-gray-800 cursor-not-allowed opacity-50' 
                      : 'bg-neon-red/80 hover:bg-neon-red hover:shadow-neon-red/30'}`}
                >
                  {isAnalyzing ? 'Processing...' : 'Run Diagnostics'}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-8 animate-slide-up">
              
              {/* Edit Message */}
              <div className="relative group">
                 <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-1 font-mono text-center">Commit Message</label>
                 <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-transparent border-b border-white/10 p-2 text-white text-xl font-light outline-none resize-none font-sans text-center focus:border-neon-blue transition-colors"
                    rows={2}
                 />
                 <div className="absolute right-0 bottom-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[10px] text-neon-blue font-mono bg-white/5 px-2 py-1 rounded">EDITABLE</span>
                 </div>
              </div>

              {/* Issue Linking */}
              <div className="relative">
                <label className="block text-[10px] text-gray-500 uppercase tracking-widest mb-2 font-mono">Link to Recurring Issue (Optional)</label>
                <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <BugIcon className="w-4 h-4 text-gray-500" />
                    </div>
                    <select
                        value={selectedIssueId}
                        onChange={(e) => setSelectedIssueId(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-300 outline-none focus:border-neon-blue appearance-none cursor-pointer hover:bg-white/10 transition-colors"
                    >
                        <option value="" className="bg-void-900 text-gray-500">None (Isolated Incident)</option>
                        {openIssues.map(issue => (
                            <option key={issue.id} value={issue.id} className="bg-void-900 text-white">
                                #{issue.number} {issue.title}
                            </option>
                        ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                </div>
              </div>

              {/* Risk Gauge */}
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10 relative overflow-hidden group">
                 <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-neon-red to-transparent" />
                 
                 <div className="flex justify-between items-center mb-4">
                   <span className="font-mono text-xs text-gray-400 uppercase tracking-widest">Threat Level</span>
                   <span className="text-2xl font-bold text-neon-red">{analysis.severity}/4</span>
                 </div>
                 
                 <input 
                   type="range" 
                   min="1" 
                   max="4" 
                   step="1" 
                   value={analysis.severity}
                   onChange={(e) => setAnalysis({...analysis, severity: parseInt(e.target.value)})}
                   className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-neon-red mb-6"
                 />

                 {/* Editable Roast */}
                 <div className="relative">
                   <textarea
                     value={analysis.roast}
                     onChange={(e) => setAnalysis({...analysis, roast: e.target.value})}
                     className="w-full bg-transparent text-gray-300 text-center italic text-lg font-light leading-relaxed outline-none border-b border-transparent focus:border-white/20 resize-none"
                     rows={3}
                   />
                   <span className="absolute -top-4 -right-0 text-[9px] text-gray-600 font-mono opacity-0 group-hover:opacity-100 transition-opacity">EDIT AI RESPONSE</span>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                  <span className="block text-[10px] text-gray-500 uppercase tracking-widest mb-1">Vector</span>
                  <input
                    value={analysis.category}
                    onChange={(e) => setAnalysis({...analysis, category: e.target.value})}
                    className="w-full bg-transparent text-white font-mono text-sm outline-none border-b border-transparent focus:border-white/20"
                  />
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                  <span className="block text-[10px] text-gray-500 uppercase tracking-widest mb-1">Patch Protocol</span>
                  <textarea
                     value={analysis.penance}
                     onChange={(e) => setAnalysis({...analysis, penance: e.target.value})}
                     className="w-full bg-transparent text-white font-mono text-sm outline-none border-b border-transparent focus:border-white/20 resize-none"
                     rows={2}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button
                  onClick={() => setAnalysis(null)}
                  className="px-6 py-2 rounded-full text-gray-400 hover:text-white hover:bg-white/5 transition-colors text-sm"
                >
                  Back
                </button>
                <button
                  onClick={handleConfirm}
                  className="px-8 py-2 rounded-full bg-gradient-to-r from-neon-red to-red-600 text-white font-medium shadow-lg shadow-neon-red/20 hover:shadow-neon-red/40 transition-all transform hover:scale-105"
                >
                  Initialize Commit
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewCommitModal;