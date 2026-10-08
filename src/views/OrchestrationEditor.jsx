import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Handle,
  Position
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { 
  Activity, Webhook, GitBranch, GitCommit, GitMerge, Clock, 
  Repeat, Layers, Database, Wrench, Users, Filter, Link2, 
  MessageSquare, Terminal, FileText, Cpu, Bot, FileJson, Zap, Mail, Play, Plus, Trash2, Settings2, PlayCircle, MoreHorizontal
} from 'lucide-react';
import { useSynapse } from '../context/SynapseContext';

/* ═══════════════════════════════════
   ICON MAPPER
   ═══════════════════════════════════ */
const ICONS = {
  Activity, Webhook, GitBranch, GitCommit, GitMerge, Clock,
  Repeat, Layers, Database, Wrench, Users, Filter, Link2,
  MessageSquare, Github: Terminal, FileText, Cpu, Bot, FileJson, Zap, Mail, Play
};

/* ═══════════════════════════════════
   CROSSHAIR FRAME (Website Design)
   ═══════════════════════════════════ */
const CrosshairFrame = ({ children, className = "" }) => (
  <div className={`relative ${className}`}>
    <Plus className="absolute -top-2.5 -left-2.5 text-black/20 w-5 h-5 pointer-events-none z-10" strokeWidth={1} />
    <Plus className="absolute -top-2.5 -right-2.5 text-black/20 w-5 h-5 pointer-events-none z-10" strokeWidth={1} />
    <Plus className="absolute -bottom-2.5 -left-2.5 text-black/20 w-5 h-5 pointer-events-none z-10" strokeWidth={1} />
    <Plus className="absolute -bottom-2.5 -right-2.5 text-black/20 w-5 h-5 pointer-events-none z-10" strokeWidth={1} />
    {children}
  </div>
);

/* ═══════════════════════════════════════════════════
   ANIMATED NEURAL GRID
   ═══════════════════════════════════════════════════ */
const NeuralGrid = () => {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width, height;
    const particles = [];
    const PARTICLE_COUNT = 80;
    const CONNECTION_DIST = 120;
    const MOUSE_RADIUS = 200;

    const resize = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      width = canvas.width = rect.width * window.devicePixelRatio;
      height = canvas.height = rect.height * window.devicePixelRatio;
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener('resize', resize);

    const w = canvas.parentElement.getBoundingClientRect().width;
    const h = canvas.parentElement.getBoundingClientRect().height;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2 + 1,
        pulse: Math.random() * Math.PI * 2,
      });
    }

    const animate = () => {
      const rw = canvas.parentElement.getBoundingClientRect().width;
      const rh = canvas.parentElement.getBoundingClientRect().height;
      ctx.clearRect(0, 0, rw, rh);

      particles.forEach((p, i) => {
        p.pulse += 0.02;
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > rw) p.vx *= -1;
        if (p.y < 0 || p.y > rh) p.vy *= -1;

        const dx = p.x - mouseRef.current.x;
        const dy = p.y - mouseRef.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MOUSE_RADIUS) {
          const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS * 0.02;
          p.vx += dx * force;
          p.vy += dy * force;
        }

        p.vx *= 0.99;
        p.vy *= 0.99;

        const alpha = 0.3 + Math.sin(p.pulse) * 0.15;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,0,0,${alpha})`;
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const cdx = p.x - p2.x;
          const cdy = p.y - p2.y;
          const cd = Math.sqrt(cdx * cdx + cdy * cdy);
          if (cd < CONNECTION_DIST) {
            const lineAlpha = (1 - cd / CONNECTION_DIST) * 0.08;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(0,0,0,${lineAlpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      });

      animRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  const handleMouseMove = useCallback((e) => {
    const rect = canvasRef.current?.parentElement?.getBoundingClientRect();
    if (rect) {
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    mouseRef.current = { x: -1000, y: -1000 };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
};

/* ═══════════════════════════════════
   CUSTOM NODE COMPONENT
   ═══════════════════════════════════ */
const SynapseNode = ({ data, selected }) => {
  const IconComponent = ICONS[data.iconName] || Activity;
  
  return (
    <div className={`relative min-w-[260px] group`}>
      
      {/* Label above the node */}
      <div className="absolute -top-7 left-0 px-2 py-1 bg-black text-white text-[10px] font-bold tracking-[0.1em] uppercase rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        {data.category}
      </div>

      <CrosshairFrame className={`bg-white/80 backdrop-blur-xl transition-all duration-300 ${selected ? 'border-black ring-4 ring-black/5 shadow-2xl scale-105' : 'border border-dashed border-black/15 shadow-sm hover:border-black/30'} ${data.status === 'error' ? '!border-red-500 !ring-red-500/20' : ''}`}>
        
        {data.isTarget && <Handle type="target" position={Position.Left} className="w-3 h-3 !bg-white !border-2 !border-black -ml-1.5" />}
        
        <div className="p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${data.iconBg} ${data.iconColor}`}>
                <IconComponent size={20} strokeWidth={2} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-black tracking-tight">{data.label}</span>
                <span className="text-[11px] text-black/45 tracking-wide">{data.letter} • {data.category}</span>
              </div>
            </div>
            <button className="text-black/20 hover:text-black transition-colors">
              <MoreHorizontal size={16} />
            </button>
          </div>
        </div>

        {/* Node Active State Indicator */}
        {data.status === 'active' && (
          <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
        )}
        
        {data.status === 'error' && (
          <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white animate-pulse" />
        )}

        {data.isSource && <Handle type="source" position={Position.Right} className="w-3 h-3 !bg-black !border-2 !border-white -mr-1.5" />}
      </CrosshairFrame>
    </div>
  );
};

/* ═══════════════════════════════════
   INITIAL GRAPH DATA (Mocked a cool pipeline)
   ═══════════════════════════════════ */
const initialNodes = [
  { id: '1', type: 'synapse', position: { x: 50, y: 150 }, data: { label: 'Property Webhook', category: 'Listeners', letter: 'L', iconName: 'Webhook', iconBg: 'bg-blue-500/10', iconColor: 'text-blue-500', isSource: true, status: 'active' } },
  { id: '2', type: 'synapse', position: { x: 400, y: 150 }, data: { label: 'Verify Tenant Data', category: 'Logic & Routing', letter: 'LR', iconName: 'GitBranch', iconBg: 'bg-indigo-500/10', iconColor: 'text-indigo-500', isTarget: true, isSource: true } },
  { id: '3', type: 'synapse', position: { x: 750, y: 50 }, data: { label: 'Update Tenancy DB', category: 'Integrations', letter: 'I', iconName: 'Database', iconBg: 'bg-rose-500/10', iconColor: 'text-rose-500', isTarget: true, isSource: true } },
  { id: '4', type: 'synapse', position: { x: 750, y: 250 }, data: { label: 'Slack Alert (Agent)', category: 'Agent Capabilities', letter: 'AC', iconName: 'Bot', iconBg: 'bg-emerald-500/10', iconColor: 'text-emerald-500', isTarget: true, isSource: true } },
];

const initialEdges = [
  { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#000', strokeWidth: 2, strokeDasharray: '4 4' } },
  { id: 'e2-3', source: '2', target: '3', animated: true, style: { stroke: '#000', strokeWidth: 2 } },
  { id: 'e2-4', source: '2', target: '4', animated: true, style: { stroke: '#000', strokeWidth: 2 } },
];

/* ═══════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════ */
export default function OrchestrationEditor() {
  const { nodeCatalog } = useSynapse(); // Load exact nodes from context!
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [isDeploying, setIsDeploying] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState('Listeners');

  const nodeTypes = useMemo(() => ({ synapse: SynapseNode }), []);

  const onConnect = useCallback((params) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#000', strokeWidth: 2 } }, eds)), [setEdges]);

  const [logs, setLogs] = useState([]);
  
  const handleDeploy = () => {
    if(isDeploying || nodes.length === 0) return;
    setIsDeploying(true);
    setLogs([{ time: new Date().toLocaleTimeString(), msg: 'Initializing Neural Engine v2.0...' }]);
    
    // Reset all nodes and edges
    setNodes(nds => nds.map(n => ({ ...n, data: { ...n.data, status: 'idle' } })));
    setEdges(eds => eds.map(e => ({ ...e, animated: false, style: { ...e.style, stroke: '#000', strokeWidth: 2 } })));

    // Sort nodes left-to-right to simulate execution flow
    const sortedNodes = [...nodes].sort((a, b) => a.position.x - b.position.x);
    const steps = sortedNodes.map(n => n.id);
    let currentStep = 0;

    const interval = setInterval(() => {
      if (currentStep >= steps.length) {
        clearInterval(interval);
        setTimeout(() => {
          setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), msg: '✅ Pipeline execution completed successfully.' }]);
          setIsDeploying(false);
        }, 500);
        return;
      }
      
      const nodeId = steps[currentStep];
      const nodeObj = sortedNodes[currentStep];
      
      setLogs(prev => [...prev, { time: new Date().toLocaleTimeString(), msg: `Executing [${nodeObj.data.label}]...` }]);

      setNodes(nds => nds.map(n => 
        n.id === nodeId ? { ...n, data: { ...n.data, status: 'active' } } : n
      ));

      setEdges(eds => eds.map(e => 
        e.source === nodeId ? { ...e, animated: true, style: { ...e.style, stroke: '#10b981', strokeWidth: 3 } } : e
      ));

      currentStep++;
    }, 1200); // 1.2s per step
  };

  const clearCanvas = () => {
    if(window.confirm('Clear the entire workflow canvas?')) {
      setNodes([]);
      setEdges([]);
      setLogs([]);
    }
  };

  const onDragStart = (event, item, categoryObj, categoryName) => {
    const nodeData = {
      ...item,
      category: categoryName,
      letter: categoryObj.letter
    };
    event.dataTransfer.setData('application/reactflow', JSON.stringify(nodeData));
    event.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const reactFlowBounds = event.target.getBoundingClientRect();
      const dataStr = event.dataTransfer.getData('application/reactflow');
      if (!dataStr) return;
      
      const nodeData = JSON.parse(dataStr);
      
      // Calculate drop position
      const position = {
        x: event.clientX - reactFlowBounds.left - 130,
        y: event.clientY - reactFlowBounds.top - 50,
      };

      const newNode = {
        id: `dndnode_${Date.now()}`,
        type: 'synapse',
        position,
        data: { 
          label: nodeData.name,
          category: nodeData.category,
          letter: nodeData.letter,
          iconName: nodeData.iconName,
          iconBg: nodeData.iconBg,
          iconColor: nodeData.iconColor,
          isSource: true, 
          isTarget: true 
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes]
  );

  return (
    <div className="w-full h-full flex bg-[#f5f5f5] text-black" style={{ fontFamily: "'Inter', sans-serif" }}>
      
      {/* ── LEFT SIDEBAR (NODE CATALOG) ── */}
      <div className="w-80 h-full border-r border-black/10 bg-white shadow-[8px_0_30px_rgba(0,0,0,0.03)] flex flex-col z-20">
        <div className="p-7 border-b border-black/5 bg-gradient-to-b from-black/[0.02] to-transparent">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-black/10 bg-white shadow-sm mb-4">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </span>
            <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-black/60">Synapse Core v2</span>
          </div>
          <h1 className="text-3xl leading-none tracking-tight mb-2">
            <span className="italic" style={{ fontFamily: "'Instrument Serif', serif" }}>Neural</span>
            <br />Orchestrator.
          </h1>
          <p className="text-xs text-black/45 leading-relaxed pr-4">Drag and drop capabilities to build autonomous data pipelines.</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {Object.entries(nodeCatalog).map(([categoryName, categoryObj]) => (
            <div key={categoryName} className="border border-black/5 rounded-xl overflow-hidden bg-black/[0.01]">
              <button 
                onClick={() => setExpandedCategory(expandedCategory === categoryName ? null : categoryName)}
                className="w-full flex items-center justify-between p-4 hover:bg-black/[0.02] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-bold w-6 h-6 rounded bg-white border border-black/5 flex items-center justify-center ${categoryObj.color}`}>{categoryObj.letter}</span>
                  <span className="text-xs font-bold tracking-[0.1em] uppercase text-black/60">{categoryName}</span>
                </div>
                <span className={`text-black/30 transition-transform duration-300 ${expandedCategory === categoryName ? 'rotate-90' : ''}`}>›</span>
              </button>
              
              <div className={`overflow-hidden transition-all duration-300 ${expandedCategory === categoryName ? 'max-h-[500px] opacity-100 border-t border-black/5' : 'max-h-0 opacity-0'}`}>
                <div className="p-3 grid gap-2">
                  {categoryObj.items.map((item, idx) => {
                    const Icon = ICONS[item.iconName] || Activity;
                    return (
                      <div 
                        key={idx}
                        onDragStart={(e) => onDragStart(e, item, categoryObj, categoryName)}
                        draggable
                        className="flex items-center gap-3 p-3 rounded-lg border border-dashed border-transparent hover:border-black/20 hover:bg-white cursor-grab active:cursor-grabbing transition-all group shadow-sm"
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.iconBg} ${item.iconColor} group-hover:scale-110 transition-transform`}>
                          <Icon size={14} strokeWidth={2.5} />
                        </div>
                        <span className="text-[13px] font-semibold tracking-tight text-black/80">{item.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── MAIN CANVAS ── */}
      <div className="flex-1 h-full relative" onDragOver={onDragOver} onDrop={onDrop}>
        
        {/* TOP BAR OVERLAY */}
        <div className="absolute top-8 left-8 right-8 z-10 flex items-center justify-between pointer-events-none">
          <div className="bg-white/90 backdrop-blur-xl border border-black/10 px-5 py-3 rounded-full shadow-xl pointer-events-auto flex items-center gap-4">
            <div className="flex items-center gap-2 border-r border-black/10 pr-4">
              <span className="text-[10px] font-bold tracking-widest uppercase text-black/40">Canvas</span>
              <span className="text-sm font-semibold tracking-tight">Main Tenancy Pipeline</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={clearCanvas} className="w-8 h-8 rounded-full hover:bg-black/5 flex items-center justify-center text-black/40 hover:text-red-500 transition-colors" title="Clear Canvas">
                <Trash2 size={14} />
              </button>
              <button className="w-8 h-8 rounded-full hover:bg-black/5 flex items-center justify-center text-black/40 hover:text-black transition-colors" title="Settings">
                <Settings2 size={14} />
              </button>
            </div>
          </div>
          
          <button 
            onClick={handleDeploy}
            disabled={isDeploying || nodes.length === 0}
            className={`pointer-events-auto flex items-center gap-3 px-8 py-3.5 rounded-full text-sm font-semibold transition-all duration-300 shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-black/5 ${isDeploying || nodes.length === 0 ? 'bg-white text-black/40 cursor-not-allowed' : 'bg-black text-white hover:bg-black/85 hover:-translate-y-1 hover:shadow-[0_16px_40px_-8px_rgba(0,0,0,0.4)]'}`}
          >
            {isDeploying ? (
              <><Clock className="animate-spin" size={18} /> Executing...</>
            ) : (
              <><PlayCircle size={18} className="text-emerald-400" /> Execute Pipeline</>
            )}
          </button>
        </div>

        {/* LOGS TERMINAL OVERLAY */}
        <div className={`absolute bottom-8 right-8 w-[400px] bg-white/90 backdrop-blur-xl border border-black/10 rounded-2xl shadow-2xl p-5 z-20 pointer-events-none transition-all duration-500 origin-bottom-right ${logs.length > 0 ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
          <div className="flex items-center gap-2 mb-3 border-b border-black/5 pb-3">
            <Terminal size={16} className="text-black/50" />
            <h3 className="text-xs font-bold tracking-widest uppercase text-black/50">Execution Console</h3>
          </div>
          <div className="font-mono text-[11px] leading-relaxed h-[180px] overflow-y-auto flex flex-col justify-end">
            <div className="space-y-1">
              {logs.map((log, i) => (
                <div key={i} className="flex gap-3">
                  <span className="text-black/30 shrink-0">[{log.time}]</span>
                  <span className={log.msg.includes('✅') ? 'text-emerald-600 font-bold' : 'text-black/70'}>{log.msg}</span>
                </div>
              ))}
            </div>
            {isDeploying && (
              <div className="flex gap-3 mt-1">
                <span className="text-black/30 shrink-0">[{new Date().toLocaleTimeString()}]</span>
                <span className="text-black/70"><span className="animate-pulse">_</span></span>
              </div>
            )}
          </div>
        </div>

        {/* REACT FLOW CANVAS */}
        <div className="absolute inset-0 z-0">
          <NeuralGrid />
        </div>
        
        <div className="absolute inset-0 z-10">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            className="bg-transparent"
          >
            <Background color="#000000" gap={24} size={1} className="opacity-[0.03]" />
            <Controls className="!bg-white/90 !backdrop-blur-md !border !border-black/10 !rounded-xl !shadow-xl [&>button]:!border-b-black/10 [&>button:hover]:!bg-black/5 !mb-6 !ml-6" />
            <MiniMap 
              nodeColor={(n) => n.data.iconColor ? n.data.iconColor.replace('text-', '') : '#000'}
              className="!bg-white/90 !backdrop-blur-md !border !border-black/10 !rounded-2xl !shadow-2xl !mb-6 !mr-6"
              maskColor="rgba(0,0,0,0.05)"
            />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
}
