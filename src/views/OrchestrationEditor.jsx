import React, { useState, useCallback, useMemo } from 'react';
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
  MessageSquare, Terminal, FileText, Cpu, Bot, FileJson, Zap, Mail, Play
} from 'lucide-react';

/* ═══════════════════════════════════
   MOCK NODE CATALOG
   ═══════════════════════════════════ */
const ICONS = {
  Activity, Webhook, GitBranch, GitCommit, GitMerge, Clock,
  Repeat, Layers, Database, Wrench, Users, Filter, Link2,
  MessageSquare, Terminal, FileText, Cpu, Bot, FileJson, Zap, Mail, Play
};

const NODE_CATALOG = {
  'Triggers & Listeners': [
    { name: 'Webhook Listener', type: 'trigger', icon: 'Webhook', color: 'bg-blue-500' },
    { name: 'Schedule', type: 'trigger', icon: 'Clock', color: 'bg-blue-500' },
  ],
  'Logic & Routing': [
    { name: 'If/Else Router', type: 'logic', icon: 'GitBranch', color: 'bg-indigo-500' },
    { name: 'Merge', type: 'logic', icon: 'GitMerge', color: 'bg-indigo-500' },
  ],
  'Agent Capabilities': [
    { name: 'OpenAI Assistant', type: 'agent', icon: 'Bot', color: 'bg-emerald-500' },
    { name: 'Sub-Agent Delegation', type: 'agent', icon: 'Users', color: 'bg-emerald-500' },
    { name: 'Shared Memory DB', type: 'agent', icon: 'Database', color: 'bg-emerald-500' },
  ],
  'Integrations': [
    { name: 'HTTP Request', type: 'integration', icon: 'Zap', color: 'bg-rose-500' },
    { name: 'Slack Webhook', type: 'integration', icon: 'MessageSquare', color: 'bg-rose-500' },
    { name: 'Notion DB', type: 'integration', icon: 'FileText', color: 'bg-rose-500' },
  ]
};

/* ═══════════════════════════════════
   CUSTOM NODE COMPONENT
   ═══════════════════════════════════ */
const SynapseNode = ({ data, selected }) => {
  const IconComponent = ICONS[data.icon] || Activity;
  
  return (
    <div className={`relative px-4 py-3 shadow-lg rounded-xl border bg-white/80 backdrop-blur-md transition-all duration-300 min-w-[200px] ${selected ? 'border-black ring-4 ring-black/5 scale-105' : 'border-black/10 hover:border-black/30'}`}>
      {data.isTarget && <Handle type="target" position={Position.Left} className="w-2 h-2 !bg-black border-none" />}
      
      <div className="flex items-center gap-3">
        <div className={`flex items-center justify-center w-8 h-8 rounded-lg text-white ${data.color || 'bg-black'}`}>
          <IconComponent size={16} strokeWidth={2} />
        </div>
        <div>
          <div className="text-[10px] font-bold tracking-[0.1em] uppercase text-black/40">{data.type}</div>
          <div className="text-sm font-semibold text-black tracking-tight">{data.label}</div>
        </div>
      </div>

      {data.status === 'active' && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
      )}

      {data.isSource && <Handle type="source" position={Position.Right} className="w-2 h-2 !bg-black border-none" />}
    </div>
  );
};

/* ═══════════════════════════════════
   INITIAL GRAPH DATA
   ═══════════════════════════════════ */
const initialNodes = [
  { id: '1', type: 'synapse', position: { x: 50, y: 150 }, data: { label: 'Webhook Listener', type: 'Trigger', icon: 'Webhook', color: 'bg-blue-500', isSource: true, status: 'active' } },
  { id: '2', type: 'synapse', position: { x: 350, y: 150 }, data: { label: 'OpenAI Assistant', type: 'AI Agent', icon: 'Bot', color: 'bg-emerald-500', isTarget: true, isSource: true, status: 'active' } },
  { id: '3', type: 'synapse', position: { x: 650, y: 50 }, data: { label: 'Notion DB', type: 'Integration', icon: 'FileText', color: 'bg-rose-500', isTarget: true, isSource: true } },
  { id: '4', type: 'synapse', position: { x: 650, y: 250 }, data: { label: 'Slack Webhook', type: 'Integration', icon: 'MessageSquare', color: 'bg-rose-500', isTarget: true, isSource: true } },
];

const initialEdges = [
  { id: 'e1-2', source: '1', target: '2', animated: true, style: { stroke: '#000', strokeWidth: 1.5 } },
  { id: 'e2-3', source: '2', target: '3', animated: true, style: { stroke: '#000', strokeWidth: 1.5 } },
  { id: 'e2-4', source: '2', target: '4', animated: true, style: { stroke: '#000', strokeWidth: 1.5 } },
];

/* ═══════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════ */
export default function OrchestrationEditor() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [isDeploying, setIsDeploying] = useState(false);

  const nodeTypes = useMemo(() => ({ synapse: SynapseNode }), []);

  const onConnect = useCallback((params) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#000', strokeWidth: 1.5 } }, eds)), [setEdges]);

  const handleDeploy = () => {
    setIsDeploying(true);
    setTimeout(() => setIsDeploying(false), 2000);
  };

  const onDragStart = (event, nodeData) => {
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
        x: event.clientX - reactFlowBounds.left - 100,
        y: event.clientY - reactFlowBounds.top - 40,
      };

      const newNode = {
        id: `dndnode_${Date.now()}`,
        type: 'synapse',
        position,
        data: { 
          label: nodeData.name, 
          type: nodeData.type, 
          icon: nodeData.icon, 
          color: nodeData.color, 
          isSource: true, 
          isTarget: true 
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes]
  );

  return (
    <div className="w-full h-full flex bg-[#fbfbfb] text-black font-sans">
      
      {/* ── LEFT SIDEBAR (NODE CATALOG) ── */}
      <div className="w-72 h-full border-r border-black/10 bg-white shadow-[4px_0_24px_rgba(0,0,0,0.02)] flex flex-col z-20">
        <div className="p-6 border-b border-black/5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white shadow-md">
              <Zap size={16} strokeWidth={2.5} />
            </div>
            <h1 className="text-xl font-bold tracking-tight">Synapse Core</h1>
          </div>
          <p className="text-xs text-black/40 font-medium uppercase tracking-widest">Orchestration Engine</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {Object.entries(NODE_CATALOG).map(([category, items]) => (
            <div key={category}>
              <h3 className="text-[10px] font-bold tracking-[0.15em] uppercase text-black/30 mb-3 px-2">{category}</h3>
              <div className="space-y-2">
                {items.map((item, idx) => {
                  const Icon = ICONS[item.icon] || Activity;
                  return (
                    <div 
                      key={idx}
                      onDragStart={(e) => onDragStart(e, item)}
                      draggable
                      className="flex items-center gap-3 p-3 rounded-xl border border-transparent hover:border-black/10 hover:bg-black/[0.02] cursor-grab active:cursor-grabbing transition-colors"
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${item.color} shadow-sm`}>
                        <Icon size={14} strokeWidth={2.5} />
                      </div>
                      <span className="text-sm font-semibold tracking-tight">{item.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── MAIN CANVAS ── */}
      <div className="flex-1 h-full relative" onDragOver={onDragOver} onDrop={onDrop}>
        
        {/* TOP BAR */}
        <div className="absolute top-6 left-6 right-6 z-10 flex items-center justify-between pointer-events-none">
          <div className="bg-white/80 backdrop-blur-md border border-black/10 px-4 py-2 rounded-full shadow-sm pointer-events-auto">
            <span className="text-xs font-bold tracking-widest uppercase text-black/50">Workflow: </span>
            <span className="text-sm font-semibold ml-1">Tenancy Sync Pipeline</span>
          </div>
          
          <button 
            onClick={handleDeploy}
            className={`pointer-events-auto flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 shadow-lg ${isDeploying ? 'bg-black/10 text-black/50 cursor-not-allowed' : 'bg-black text-white hover:bg-black/85 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_-6px_rgba(0,0,0,0.3)]'}`}
          >
            {isDeploying ? (
              <><Clock className="animate-spin" size={16} /> Deploying...</>
            ) : (
              <><Play size={16} /> Deploy Workflow</>
            )}
          </button>
        </div>

        {/* REACT FLOW CANVAS */}
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
          <Background color="#000000" gap={16} size={1} className="opacity-10" />
          <Controls className="!bg-white !border-black/10 !rounded-xl !shadow-lg [&>button]:!border-b-black/10 [&>button:hover]:!bg-black/5" />
          <MiniMap 
            nodeColor={(n) => n.data.color ? n.data.color.replace('bg-', '') : '#000'}
            className="!bg-white/80 !backdrop-blur-md !border-black/10 !rounded-xl !shadow-lg"
          />
        </ReactFlow>
      </div>
    </div>
  );
}
