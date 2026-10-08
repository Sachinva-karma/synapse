import React, { useState, useEffect, useRef } from 'react';
import { Loader2, Terminal, Activity, Cpu, Database, Zap, Sparkles } from 'lucide-react';

/* ═══════════════════════════════════
   LIVE LOGS COMPONENT
   ═══════════════════════════════════ */
const LiveConsole = ({ logs }) => {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="absolute bottom-6 left-6 right-6 h-48 bg-white/90 backdrop-blur-md border border-black/10 rounded-xl shadow-2xl p-4 font-mono text-[11px] flex flex-col z-20">
      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-black/5 shrink-0">
        <Terminal size={14} className="text-black/40" />
        <span className="font-bold tracking-widest text-black/50 uppercase">Live Swarm Telemetry</span>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-1 pr-2">
        {logs.map((log, i) => (
          <div key={i} className="flex gap-3">
            <span className="text-black/30 shrink-0">[{log.time}]</span>
            <span className={
              log.type === 'error' ? 'text-red-500 font-bold' :
              log.type === 'success' ? 'text-emerald-600 font-bold' :
              log.type === 'agent' ? 'text-indigo-600' : 'text-black/70'
            }>{log.msg}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════
   NODE VISUALIZATION
   ═══════════════════════════════════ */
const SwarmNode = ({ x, y, label, icon: Icon, colorClass, active, ping }) => (
  <div 
    className={`absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-700 ${active ? 'scale-100 opacity-100' : 'scale-90 opacity-40'}`}
    style={{ left: `${x}%`, top: `${y}%` }}
  >
    <div className={`relative flex flex-col items-center gap-2 z-10`}>
      <div className={`w-12 h-12 rounded-2xl bg-white shadow-xl border ${active ? 'border-black/20' : 'border-transparent'} flex items-center justify-center relative overflow-hidden`}>
        {ping && <div className={`absolute inset-0 ${colorClass} opacity-20 animate-ping rounded-2xl`} />}
        <Icon size={20} className={colorClass.replace('bg-', 'text-')} />
      </div>
      <div className="px-2 py-1 bg-white/80 backdrop-blur border border-black/10 rounded-md text-[10px] font-bold tracking-wider uppercase whitespace-nowrap shadow-sm">
        {label}
      </div>
    </div>
  </div>
);

/* ═══════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════ */
export default function OrchestrationEditor() {
  const [activeTab, setActiveTab] = useState('demo');
  const [isReceiving, setIsReceiving] = useState(false);
  const [logs, setLogs] = useState([]);
  const [activeNodes, setActiveNodes] = useState({});
  const [metrics, setMetrics] = useState({ tokens: 1420, lat: 24, success: 100 });

  const tabs = [
    { id: 'ocr', label: 'Invoice OCR Process' },
    { id: 'whatsapp', label: 'WhatsApp Custom' },
    { id: 'demo', label: 'Self-Healing Sup...' },
  ];

  const MOCK_EVENTS = [
    { type: 'agent', msg: 'Supervisor Agent: Analyzing incoming ticket #T-8842', target: 'supervisor' },
    { type: 'info', msg: 'Routing ticket to Technical Support Swarm...', target: 'router' },
    { type: 'agent', msg: 'Tech Agent 1: Fetching server logs from Datadog', target: 'tech1' },
    { type: 'success', msg: 'Datadog integration: 200 OK (1.2s)', target: 'db' },
    { type: 'agent', msg: 'Tech Agent 2: Cross-referencing known issues database', target: 'tech2' },
    { type: 'info', msg: 'Consensus reached. Cause identified: OOM Error on pod-xyz', target: 'supervisor' },
    { type: 'agent', msg: 'Action Agent: Executing Kubernetes restart command', target: 'action' },
    { type: 'success', msg: 'Command executed successfully. Verifying health...', target: 'action' },
    { type: 'success', msg: '✅ Ticket #T-8842 resolved. Closing thread.', target: 'supervisor' },
  ];

  useEffect(() => {
    let timeout;
    let logInterval;

    if (activeTab === 'demo') {
      setIsReceiving(false);
      setLogs([]);
      setActiveNodes({});

      timeout = setTimeout(() => {
        setIsReceiving(true);
        setLogs([{ time: new Date().toLocaleTimeString(), type: 'info', msg: 'Connection established. Stream active.' }]);
        
        let step = 0;
        logInterval = setInterval(() => {
          if (step >= MOCK_EVENTS.length) {
            step = 0; // loop it
          }
          
          const event = MOCK_EVENTS[step];
          setLogs(prev => [...prev.slice(-30), { time: new Date().toLocaleTimeString(), ...event }]);
          
          // Flash the node
          setActiveNodes(prev => ({ ...prev, [event.target]: true }));
          setTimeout(() => {
            setActiveNodes(prev => ({ ...prev, [event.target]: false }));
          }, 800);

          // Update metrics
          setMetrics(prev => ({
            tokens: prev.tokens + Math.floor(Math.random() * 150),
            lat: 20 + Math.floor(Math.random() * 30),
            success: prev.success > 95 ? prev.success - Math.random() : 99.8
          }));

          step++;
        }, 1500);

      }, 3000); // Wait 3s before starting
    }

    return () => {
      clearTimeout(timeout);
      clearInterval(logInterval);
    };
  }, [activeTab]);

  return (
    <div className="w-full h-full flex flex-col bg-[#fafafa] text-black font-sans relative overflow-hidden">
      
      {/* ── TOP HEADER (Screenshot Match) ── */}
      <div className="h-16 border-b border-black/5 bg-white flex items-center justify-between px-6 z-30 shrink-0 shadow-sm relative">
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
              <span className="text-[10px] font-medium text-black/40">{isReceiving ? '4 online' : '0 online'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN CANVAS ── */}
      <div className="flex-1 relative w-full h-full flex items-center justify-center overflow-hidden">
        
        {/* Grid Background */}
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

        {!isReceiving ? (
          /* Loading State */
          <div className="relative z-10 flex flex-col items-center justify-center">
            <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mb-4" strokeWidth={1.5} />
            <p className="text-sm font-medium text-black/50 tracking-tight">
              Waiting for first telemetry event for swarm <span className="px-1.5 py-0.5 bg-black/5 rounded text-black/70 mx-1">{activeTab}</span>...
            </p>
          </div>
        ) : (
          /* Live Visualization State */
          <div className="absolute inset-0 z-10 animate-in fade-in duration-1000">
            
            {/* Connection Lines (SVG) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
              <line x1="50%" y1="20%" x2="30%" y2="50%" stroke="black" strokeWidth="2" strokeDasharray="4 4" className={activeNodes['tech1'] ? 'animate-pulse' : ''} />
              <line x1="50%" y1="20%" x2="70%" y2="50%" stroke="black" strokeWidth="2" strokeDasharray="4 4" className={activeNodes['tech2'] ? 'animate-pulse' : ''} />
              <line x1="30%" y1="50%" x2="50%" y2="80%" stroke="black" strokeWidth="2" strokeDasharray="4 4" />
              <line x1="70%" y1="50%" x2="50%" y2="80%" stroke="black" strokeWidth="2" strokeDasharray="4 4" />
            </svg>

            {/* Nodes */}
            <SwarmNode x={50} y={20} label="Supervisor" icon={Sparkles} colorClass="bg-indigo-500" active={true} ping={activeNodes['supervisor']} />
            <SwarmNode x={30} y={50} label="Tech Agent A" icon={Cpu} colorClass="bg-cyan-500" active={true} ping={activeNodes['tech1']} />
            <SwarmNode x={70} y={50} label="Tech Agent B" icon={Cpu} colorClass="bg-cyan-500" active={true} ping={activeNodes['tech2']} />
            <SwarmNode x={50} y={80} label="Action Executor" icon={Zap} colorClass="bg-emerald-500" active={true} ping={activeNodes['action']} />
            <SwarmNode x={15} y={50} label="Logs DB" icon={Database} colorClass="bg-rose-500" active={true} ping={activeNodes['db']} />

            {/* Floating Metrics */}
            <div className="absolute top-6 left-6 flex gap-4">
              <div className="bg-white/80 backdrop-blur border border-black/10 px-4 py-3 rounded-xl shadow-sm">
                <p className="text-[10px] font-bold tracking-widest text-black/40 uppercase mb-1">Avg Latency</p>
                <p className="text-xl font-bold tracking-tight">{metrics.lat}ms</p>
              </div>
              <div className="bg-white/80 backdrop-blur border border-black/10 px-4 py-3 rounded-xl shadow-sm">
                <p className="text-[10px] font-bold tracking-widest text-black/40 uppercase mb-1">Tokens/sec</p>
                <p className="text-xl font-bold tracking-tight">{metrics.tokens.toLocaleString()}</p>
              </div>
              <div className="bg-white/80 backdrop-blur border border-black/10 px-4 py-3 rounded-xl shadow-sm">
                <p className="text-[10px] font-bold tracking-widest text-black/40 uppercase mb-1">Swarm Health</p>
                <p className="text-xl font-bold tracking-tight text-emerald-500">{metrics.success.toFixed(1)}%</p>
              </div>
            </div>

            {/* Live Logs */}
            <LiveConsole logs={logs} />
          </div>
        )}
      </div>
    </div>
  );
}
