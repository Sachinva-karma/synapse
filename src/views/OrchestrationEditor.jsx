import React, { useState } from 'react';
import { Play, PlayCircle, Loader2 } from 'lucide-react';

export default function OrchestrationEditor() {
  const [activeTab, setActiveTab] = useState('demo');

  const tabs = [
    { id: 'ocr', label: 'Invoice OCR Process' },
    { id: 'whatsapp', label: 'WhatsApp Custom' },
    { id: 'demo', label: 'Self-Healing Sup...' },
  ];

  return (
    <div className="w-full h-full flex flex-col bg-[#fafafa] text-black font-sans relative overflow-hidden">
      
      {/* ── TOP HEADER (Screenshot Match) ── */}
      <div className="h-16 border-b border-black/5 bg-white flex items-center justify-between px-6 z-20 shrink-0">
        
        {/* Left side: Title and Tabs */}
        <div className="flex items-center h-full">
          <div className="flex items-center gap-3 pr-6 border-r border-black/5 h-full">
            <h1 className="text-lg font-bold tracking-tight">Observatory</h1>
          </div>
          
          <div className="flex items-center h-full px-2 gap-1 overflow-x-auto hide-scrollbar">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap flex items-center gap-2 ${
                  activeTab === tab.id 
                    ? 'bg-white shadow-sm border border-black/5 text-black' 
                    : 'text-black/50 hover:bg-black/5'
                }`}
              >
                {tab.id === 'demo' ? (
                  <span className="w-4 h-4 rounded-full border-[3px] border-indigo-400 flex items-center justify-center">
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                  </span>
                ) : tab.id === 'whatsapp' ? (
                  <span className="text-purple-400">💬</span>
                ) : (
                  <span className="text-gray-400">📄</span>
                )}
                {tab.label}
              </button>
            ))}
            <button className="px-3 py-2 text-xs font-medium text-black/40 hover:text-black border border-dashed border-black/15 rounded-md ml-2 hover:bg-black/5 transition-colors">
              ✨ Custom
            </button>
          </div>
        </div>

        {/* Right side: Status indicators */}
        <div className="flex items-center gap-4">
          <div className="flex items-center border border-emerald-500/30 bg-emerald-50 rounded-md overflow-hidden h-8">
            <div className="px-3 h-full flex items-center gap-1.5 bg-emerald-500 text-white text-[10px] font-bold tracking-wider">
              <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> LIVE AI
            </div>
            <div className="px-3 h-full flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50/50">
              Demo
            </div>
          </div>

          <div className="flex items-center rounded-md overflow-hidden h-8 border border-cyan-500/30">
            <button className="px-3 h-full bg-cyan-500 text-white text-[10px] font-bold tracking-wider hover:bg-cyan-600 transition-colors">
              Live Swarm
            </button>
            <button className="px-3 h-full bg-white text-black/60 text-[10px] font-bold hover:bg-black/5 transition-colors">
              Agent Flow
            </button>
          </div>

          <div className="flex items-center gap-3 px-3 h-8 rounded-full border border-emerald-500/20 bg-white">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
              <span className="text-[10px] font-bold text-emerald-600 tracking-wider">AI READY</span>
            </div>
            <div className="w-px h-3 bg-black/10" />
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
              <span className="text-[10px] font-medium text-black/40">0 online</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN CANVAS (Grid + Telemetry Waiting) ── */}
      <div className="flex-1 relative w-full h-full flex items-center justify-center overflow-hidden">
        
        {/* CSS Grid Background */}
        <div 
          className="absolute inset-0 z-0 pointer-events-none opacity-40"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px)
            `,
            backgroundSize: '100px 100px',
            backgroundPosition: 'center center'
          }}
        />

        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-400/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-400/5 blur-[120px] rounded-full pointer-events-none" />

        {/* Center Loading State */}
        <div className="relative z-10 flex flex-col items-center justify-center">
          <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mb-4" strokeWidth={1.5} />
          <p className="text-sm font-medium text-black/50 tracking-tight">
            Waiting for first telemetry event for swarm <span className="px-1.5 py-0.5 bg-black/5 rounded text-black/70 mx-1">demo</span>...
          </p>
        </div>
      </div>
    </div>
  );
}
