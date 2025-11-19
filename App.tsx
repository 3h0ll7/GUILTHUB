import React, { useState, useEffect } from 'react';
import { GitCommitIcon, GitPullRequestIcon, ActivityIcon, FlameIcon, PlusIcon, AlertCircleIcon, HistoryIcon, MessageSquareIcon, BugIcon, SignalIcon, LayoutIcon, CpuIcon, ShieldAlertIcon } from './components/Icons';
import ContributionGraph from './components/ContributionGraph';
import NewCommitModal from './components/NewCommitModal';
import CreatePRModal from './components/CreatePRModal';
import CommitDetailModal from './components/CommitDetailModal';
import PullRequestList from './components/PullRequestList';
import CommitList from './components/CommitList';
import ChatInterface from './components/ChatInterface';
import IssuesList from './components/IssuesList';
import { GuiltCommit, PullRequest, Issue } from './types';
import { getKernelStatus } from './services/geminiService';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const App = () => {
  const [commits, setCommits] = useState<GuiltCommit[]>([]);
  const [pullRequests, setPullRequests] = useState<PullRequest[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [kernelStatus, setKernelStatus] = useState("Initializing System...");
  
  const [activeView, setActiveView] = useState<'dashboard' | 'pulls' | 'commits' | 'chat' | 'issues'>('dashboard');
  const [isCommitModalOpen, setIsCommitModalOpen] = useState(false);
  const [isPrModalOpen, setIsPrModalOpen] = useState(false);
  const [selectedCommitForPR, setSelectedCommitForPR] = useState<GuiltCommit | null>(null);
  
  // Detail View State
  const [selectedCommit, setSelectedCommit] = useState<GuiltCommit | null>(null);

  // Load Data & Init
  useEffect(() => {
    const savedCommits = localStorage.getItem('guilthub_commits');
    const savedPRs = localStorage.getItem('guilthub_prs');
    const savedIssues = localStorage.getItem('guilthub_issues');
    
    if (savedCommits) {
      try {
        const parsed = JSON.parse(savedCommits);
        setCommits(parsed);
        updateKernelStatus(parsed);
      } catch (e) {}
    }
    if (savedPRs) setPullRequests(JSON.parse(savedPRs));
    if (savedIssues) setIssues(JSON.parse(savedIssues));
  }, []);

  useEffect(() => {
    localStorage.setItem('guilthub_commits', JSON.stringify(commits));
    localStorage.setItem('guilthub_prs', JSON.stringify(pullRequests));
    localStorage.setItem('guilthub_issues', JSON.stringify(issues));
  }, [commits, pullRequests, issues]);

  const updateKernelStatus = async (currentCommits: GuiltCommit[]) => {
      const status = await getKernelStatus(currentCommits);
      setKernelStatus(status);
  };

  const handleNewCommit = (commit: GuiltCommit) => {
    const newCommits = [commit, ...commits];
    setCommits(newCommits);
    updateKernelStatus(newCommits);
  };

  const handleOpenPR = (commit: GuiltCommit) => {
    setSelectedCommitForPR(commit);
    setIsPrModalOpen(true);
  };

  const handleCreatePR = (pr: PullRequest) => {
    setPullRequests(prev => [pr, ...prev]);
    setActiveView('pulls');
  };

  const handleCreateIssue = (issue: Issue) => {
    setIssues(prev => [issue, ...prev]);
  };

  const handleCloseIssue = (id: string) => {
    setIssues(prev => prev.map(i => i.id === id ? { ...i, status: 'closed' } : i));
  };

  const handleSelectCommit = (commit: GuiltCommit) => {
    setSelectedCommit(commit);
  };

  // Metrics
  const chartData = commits.slice().sort((a, b) => a.timestamp - b.timestamp).map(c => ({
      date: new Date(c.date).toLocaleDateString(undefined, {month: 'short', day: 'numeric'}),
      severity: c.analysis.severity,
    })).slice(-15);

  const avgSeverity = commits.length > 0 ? (commits.reduce((acc, c) => acc + c.analysis.severity, 0) / commits.length).toFixed(1) : '0.0';

  return (
    <div className="min-h-screen flex flex-col lg:flex-row font-sans text-sm bg-void text-gray-300 overflow-hidden">
      
      {/* Floating Dock / Sidebar */}
      <aside className="w-full lg:w-24 lg:h-screen flex lg:flex-col items-center justify-between p-4 bg-void/80 border-r border-white/5 z-50 backdrop-blur-xl">
        <div className="p-3 bg-white/5 rounded-2xl shadow-inner border border-white/5 mb-8">
          <FlameIcon className="w-6 h-6 text-neon-red" />
        </div>

        <nav className="flex lg:flex-col gap-4 flex-1 w-full items-center justify-center">
          {[
            { id: 'dashboard', icon: LayoutIcon, label: 'Dash' },
            { id: 'commits', icon: HistoryIcon, label: 'Log' },
            { id: 'issues', icon: BugIcon, label: 'Issues' },
            { id: 'pulls', icon: GitPullRequestIcon, label: 'PRs' },
            { id: 'chat', icon: MessageSquareIcon, label: 'AI' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id as any)}
              className={`p-3 rounded-xl transition-all relative group ${
                activeView === item.id 
                ? 'bg-white/10 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)]' 
                : 'text-gray-500 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon className="w-6 h-6" />
              <span className="absolute left-14 bg-void-800 px-2 py-1 rounded text-xs text-white opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap border border-white/10 z-50">
                  {item.label}
              </span>
            </button>
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-4">
           <div className="w-full h-[1px] bg-white/10"></div>
           <img src="https://api.dicebear.com/7.x/shapes/svg?seed=user" className="w-8 h-8 rounded-full opacity-50 hover:opacity-100 transition-opacity cursor-pointer" />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-screen overflow-hidden flex flex-col relative">
        
        {/* Top Bar & Hero */}
        <header className="p-8 pb-0">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
               <div className="flex items-center gap-3 mb-2 text-neon-blue font-mono text-xs uppercase tracking-[0.2em]">
                  <SignalIcon className="w-4 h-4 animate-pulse" />
                  {kernelStatus}
               </div>
               <h1 className="text-3xl font-light text-white tracking-tight">
                  Mission Control
               </h1>
            </div>
            
            <button 
              onClick={() => setIsCommitModalOpen(true)}
              className="glass-card px-6 py-3 rounded-full text-white font-medium flex items-center gap-2 hover:bg-white/10 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-neon-red/10 border-neon-red/20 border"
            >
              <PlusIcon className="w-5 h-5 text-neon-red" />
              Log Anomaly
            </button>
          </div>
        </header>

        {/* Scrollable Viewport */}
        <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
          
          {/* Metrics Bar (Floating) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             <div className="glass-panel p-4 rounded-2xl flex flex-col">
                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">Total Sins</span>
                <span className="text-2xl text-white font-light mt-1">{commits.length}</span>
             </div>
             <div className="glass-panel p-4 rounded-2xl flex flex-col">
                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">Avg Severity</span>
                <span className={`text-2xl font-light mt-1 ${parseFloat(avgSeverity) > 2.5 ? 'text-neon-red' : 'text-white'}`}>{avgSeverity}</span>
             </div>
             <div className="glass-panel p-4 rounded-2xl flex flex-col">
                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">Pending PRs</span>
                <span className="text-2xl text-white font-light mt-1">{pullRequests.filter(p => p.status === 'open').length}</span>
             </div>
             <div className="glass-panel p-4 rounded-2xl flex flex-col relative overflow-hidden">
                <div className="absolute right-0 top-0 w-16 h-16 bg-neon-blue/20 blur-xl rounded-full -mr-8 -mt-8"></div>
                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">System Health</span>
                <span className="text-2xl text-white font-light mt-1">{issues.filter(i => i.status === 'open').length > 2 ? 'Degraded' : 'Optimal'}</span>
             </div>
          </div>

          {activeView === 'dashboard' && (
            <div className="space-y-8 animate-fade-in">
               <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-6">
                     <ContributionGraph commits={commits} />
                     
                     <div className="flex items-center justify-between pt-4">
                        <h3 className="text-lg font-light text-white">Recent Activity</h3>
                        <button onClick={() => setActiveView('commits')} className="text-xs text-neon-blue hover:text-white transition-colors">View Full Log &rarr;</button>
                     </div>
                     
                     <div className="space-y-4">
                        {commits.slice(0, 3).map(commit => (
                           <div 
                              key={commit.id} 
                              onClick={() => handleSelectCommit(commit)}
                              className="glass-card p-5 rounded-2xl flex items-center justify-between group cursor-pointer hover:border-neon-blue/30 transition-all"
                           >
                              <div className="flex items-center gap-4">
                                 <div className={`w-2 h-2 rounded-full ${commit.analysis.severity >= 3 ? 'bg-neon-red' : 'bg-gray-500'}`}></div>
                                 <div>
                                    <p className="text-white font-light group-hover:text-neon-blue transition-colors">{commit.message}</p>
                                    <p className="text-xs text-gray-500 font-mono mt-1">{new Date(commit.timestamp).toLocaleTimeString()} • LVL {commit.analysis.severity}</p>
                                 </div>
                              </div>
                              {!pullRequests.some(pr => pr.commitId === commit.id) && (
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleOpenPR(commit); }} 
                                  className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white"
                                >
                                   <GitPullRequestIcon className="w-4 h-4" />
                                </button>
                              )}
                           </div>
                        ))}
                     </div>
                  </div>

                  <div className="space-y-6">
                     <div className="glass-card p-6 rounded-2xl h-64 flex flex-col">
                        <h3 className="text-sm font-mono text-gray-500 uppercase tracking-widest mb-4">Severity Vector</h3>
                        <div className="flex-1 w-full">
                           <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorSev" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#ff2a6d" stopOpacity={0.3}/>
                                      <stop offset="95%" stopColor="#ff2a6d" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <Area type="monotone" dataKey="severity" stroke="#ff2a6d" strokeWidth={2} fillOpacity={1} fill="url(#colorSev)" />
                              </AreaChart>
                           </ResponsiveContainer>
                        </div>
                     </div>

                     <div className="glass-card p-6 rounded-2xl">
                        <div className="flex items-center gap-3 mb-4">
                           <ShieldAlertIcon className="w-5 h-5 text-yellow-500" />
                           <h3 className="text-white font-light">Active Issues</h3>
                        </div>
                        <div className="space-y-3">
                           {issues.filter(i => i.status === 'open').slice(0, 3).map(i => (
                              <div key={i.id} className="text-sm text-gray-400 border-l border-white/10 pl-3 hover:border-yellow-500 transition-colors cursor-pointer">
                                 {i.title}
                              </div>
                           ))}
                           {issues.filter(i => i.status === 'open').length === 0 && (
                              <p className="text-xs text-gray-600 italic">System clean.</p>
                           )}
                        </div>
                     </div>
                  </div>
               </section>
            </div>
          )}

          {activeView === 'commits' && <CommitList commits={commits} onSelectCommit={handleSelectCommit} />}
          {activeView === 'pulls' && <PullRequestList pullRequests={pullRequests} commits={commits} />}
          {activeView === 'issues' && <IssuesList issues={issues} onCreateIssue={handleCreateIssue} onCloseIssue={handleCloseIssue} />}
          {activeView === 'chat' && <ChatInterface />}
        </div>
      </main>

      {/* Modals */}
      <NewCommitModal 
        isOpen={isCommitModalOpen} 
        onClose={() => setIsCommitModalOpen(false)} 
        onCommit={handleNewCommit}
        issues={issues}
      />

      <CreatePRModal
        isOpen={isPrModalOpen}
        onClose={() => setIsPrModalOpen(false)}
        targetCommit={selectedCommitForPR}
        onCreatePR={handleCreatePR}
        nextPrNumber={pullRequests.length + 1}
      />

      <CommitDetailModal
        isOpen={!!selectedCommit}
        onClose={() => setSelectedCommit(null)}
        commit={selectedCommit}
        issues={issues}
      />
    </div>
  );
};

export default App;