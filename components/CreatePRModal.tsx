import React, { useState } from 'react';
import { XIcon, GitPullRequestIcon } from './Icons';
import { reviewPullRequest } from '../services/geminiService';
import { GuiltCommit, PullRequest } from '../types';

interface CreatePRModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetCommit: GuiltCommit | null;
  onCreatePR: (pr: PullRequest) => void;
  nextPrNumber: number;
}

const CreatePRModal: React.FC<CreatePRModalProps> = ({ isOpen, onClose, targetCommit, onCreatePR, nextPrNumber }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !targetCommit) return null;

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) return;
    setIsSubmitting(true);

    try {
      // AI Review
      const review = await reviewPullRequest(targetCommit.message, description);

      const newPR: PullRequest = {
        id: crypto.randomUUID(),
        commitId: targetCommit.id,
        number: nextPrNumber,
        title: title,
        description: description,
        status: review.status,
        createdAt: new Date().toISOString(),
        review: review
      };

      onCreatePR(newPR);
      handleClose();
    } catch (e) {
      console.error("Failed to create PR", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-canvas border border-canvas-border rounded-lg w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-canvas-border bg-canvas-subtle">
          <h2 className="text-lg font-mono font-bold text-white flex items-center gap-2">
            <GitPullRequestIcon className="w-5 h-5 text-accent" />
            Open a Forgiveness PR
          </h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-white">
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Context Diff */}
          <div className="bg-canvas border border-canvas-border rounded-md p-3 text-sm">
             <div className="flex items-center justify-between mb-2 text-xs text-gray-500 font-mono border-b border-canvas-border pb-2">
                <span>base: <strong>main</strong></span>
                <span>&larr;</span>
                <span>compare: <strong>fix/sin-{targetCommit.id.slice(0,6)}</strong></span>
             </div>
             <div className="font-mono text-gray-400 mb-1">
               <span className="text-guilt-4">- {targetCommit.message}</span>
             </div>
             <div className="text-xs text-gray-500 italic">
                Fixing sin with severity level {targetCommit.analysis.severity}
             </div>
          </div>

          <div className="space-y-4">
             <div>
               <label className="block text-sm font-bold text-white mb-1">Title</label>
               <input 
                 type="text" 
                 className="w-full bg-canvas border border-canvas-border rounded-md px-3 py-2 text-white focus:ring-1 focus:ring-accent outline-none"
                 placeholder="Fixing the karma imbalance..."
                 value={title}
                 onChange={(e) => setTitle(e.target.value)}
               />
             </div>
             
             <div>
               <label className="block text-sm font-bold text-white mb-1">Description (Atonement)</label>
               <textarea
                 className="w-full bg-canvas border border-canvas-border rounded-md p-3 text-white focus:ring-1 focus:ring-accent outline-none h-32 resize-none font-mono text-sm"
                 placeholder="Describe what you did to make up for your sin. The AI Maintainer will review this."
                 value={description}
                 onChange={(e) => setDescription(e.target.value)}
               />
               <p className="text-xs text-gray-500 mt-2">
                  * Suggestion: {targetCommit.analysis.penance}
               </p>
             </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-canvas-border bg-canvas-subtle flex justify-end gap-3">
           <button onClick={handleClose} className="px-4 py-2 text-gray-400 hover:text-white text-sm font-medium">
              Cancel
           </button>
           <button 
             onClick={handleSubmit}
             disabled={isSubmitting || !title.trim() || !description.trim()}
             className={`px-4 py-2 rounded-md bg-green-600 text-white font-bold text-sm flex items-center gap-2 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-700'}`}
           >
             {isSubmitting ? 'Running Checks...' : 'Create Pull Request'}
           </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePRModal;