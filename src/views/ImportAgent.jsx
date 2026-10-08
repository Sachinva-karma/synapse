import React, { useState } from 'react';
import { Download, Workflow, GitBranch, AlertTriangle, Eye, Play } from 'lucide-react';

export default function ImportAgent() {
  const [activeTab, setActiveTab] = useState('n8n');
  const [url, setUrl] = useState('http://localhost:5678/api/v1/workflows/1');

  return (
    <div className="w-full h-full flex flex-col bg-[#fafafa] text-black font-sans relative overflow-hidden">
      
      {/* ── TOP HEADER (Screenshot Match) ── */}
      <div className="h-16 border-b border-black/5 bg-white flex items-center px-6 z-20 shrink-0 gap-6">
        <div className="flex items-center gap-2">
          <Download size={18} className="text-black/50" />
          <h1 className="text-sm font-bold tracking-tight">Import Agent</h1>
        </div>
        
        <div className="flex items-center gap-2 bg-black/5 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('n8n')}
            className={`flex items-center gap-2 px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'n8n' ? 'bg-white shadow-sm text-black' : 'text-black/50 hover:text-black'
            }`}
          >
            <Workflow size={14} /> n8n Workflow
          </button>
          <button
            onClick={() => setActiveTab('github')}
            className={`flex items-center gap-2 px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'github' ? 'bg-white shadow-sm text-black' : 'text-black/50 hover:text-black'
            }`}
          >
            <GitBranch size={14} /> GitHub Repo
          </button>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 relative w-full h-full overflow-y-auto p-8">
        
        {/* CSS Grid Background */}
        <div 
          className="absolute inset-0 z-0 pointer-events-none opacity-40"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px)
            `,
            backgroundSize: '100px 100px',
            backgroundPosition: 'top left'
          }}
        />

        <div className="relative z-10 max-w-5xl mx-auto">
          <div className="bg-white border border-black/10 rounded-2xl p-8 shadow-sm">
            
            <h2 className="text-xl font-bold tracking-tight mb-2">Import from n8n Workflow</h2>
            <p className="text-sm text-black/50 mb-6">
              Paste a public n8n workflow URL to preview and import it as a monitored agent swarm.
            </p>

            {/* Warning Alert */}
            <div className="flex items-start gap-3 p-4 bg-orange-50/50 border border-orange-200 rounded-xl mb-8">
              <AlertTriangle className="text-orange-500 shrink-0 mt-0.5" size={18} />
              <div>
                <h4 className="text-sm font-semibold text-orange-900 flex items-center gap-2">
                  n8n is unreachable. Make sure it's running via <code className="px-1.5 py-0.5 bg-orange-100 rounded text-orange-800 text-xs font-mono">docker-compose up</code>
                </h4>
                <p className="text-xs text-orange-700/70 mt-1">
                  Could not reach the backend server.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-[10px] font-bold tracking-[0.1em] uppercase text-black/40 mb-3">Demo Workflows</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Card 1 */}
                  <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-50/30 hover:border-blue-500/40 cursor-pointer transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="text-blue-500"><SettingsIcon /></div>
                      <h4 className="text-sm font-bold text-black/80">Basic Data Sync</h4>
                    </div>
                    <p className="text-xs text-black/50 mb-3">Simple Postgres to CRM sync workflow</p>
                    <span className="inline-block px-2 py-1 bg-blue-500/10 text-blue-600 text-[9px] font-bold tracking-widest uppercase rounded">Demo</span>
                  </div>

                  {/* Card 2 */}
                  <div className="p-4 rounded-xl border border-black/5 hover:border-black/15 bg-black/[0.01] cursor-pointer transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="text-black/40"><SettingsIcon /></div>
                      <h4 className="text-sm font-bold text-black/80">Customer Onboarding</h4>
                    </div>
                    <p className="text-xs text-black/50 mb-3">Complex email and Slack notification flow</p>
                    <span className="inline-block px-2 py-1 bg-purple-500/10 text-purple-600 text-[9px] font-bold tracking-widest uppercase rounded">Automation</span>
                  </div>

                  {/* Card 3 */}
                  <div className="p-4 rounded-xl border border-black/5 hover:border-black/15 bg-black/[0.01] cursor-pointer transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="text-black/40"><SettingsIcon /></div>
                      <h4 className="text-sm font-bold text-black/80">AI Support Agent</h4>
                    </div>
                    <p className="text-xs text-black/50 mb-3">LLM-powered ticket routing and resolution</p>
                    <span className="inline-block px-2 py-1 bg-purple-500/10 text-purple-600 text-[9px] font-bold tracking-widest uppercase rounded">AI-Agent</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-[10px] font-bold tracking-[0.1em] uppercase text-black/40 mb-3">Workflow URL</h3>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="flex-1 px-4 py-2.5 bg-white border border-black/10 rounded-lg text-sm text-black/30 font-mono outline-none focus:border-cyan-500 transition-colors"
                  />
                  <button className="flex items-center gap-2 px-6 py-2.5 bg-cyan-200/50 hover:bg-cyan-300/50 text-cyan-800 text-sm font-bold rounded-lg transition-colors">
                    <Eye size={16} /> Preview
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const SettingsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);
