import React from 'react';
import { useIncidentSocket } from '../hooks/useIncidentSocket';
import { 
  ShieldAlert, 
  Terminal, 
  Code2, 
  CheckCircle2, 
  XCircle, 
  Cpu, 
  Play, 
  Zap, 
  Activity, 
  Layers, 
  FileCode,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';

const INCIDENTS = [
  { id: 'bug_db_pool.py', label: 'DB Pool Crash', type: 'ServerCrash' },
  { id: 'bug_session_cleanup.py', label: 'In-place Dict Mutation', type: 'RuntimeError' },
  { id: 'bug_token_validator.py', label: 'Datetime Naive vs Aware', type: 'TypeError' },
  { id: 'bug_cache_leak.py', label: 'Mutable Default Arg Contamination', type: 'SecurityLeak' },
  { id: 'bug_org_tree.py', label: 'Circular Hierarchy Traversal', type: 'RecursionError' },
  { id: 'bug_rate_limiter.py', label: 'Thread Lock Acquisition Leak', type: 'TimeoutError' },
];

export default function Dashboard() {
  const {
    isSwarmRunning,
    activeIncident,
    setActiveIncident,
    agentStreams,
    incidentClassification,
    triggerSwarm,
  } = useIncidentSocket();

  return (
    <div className="min-h-screen bg-[#030712] text-gray-100 p-4 md:p-8 selection:bg-emerald-500/30">
      {/* Background Mesh Glows */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-[600px] h-[600px] bg-rose-500/5 blur-[150px] rounded-full pointer-events-none" />

      {/* Floating Glass Navigation Header */}
      <header className="sticky top-4 z-50 mb-8 mx-auto w-full max-w-7xl">
        <div className="p-1.5 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-2xl shadow-2xl">
          <div className="px-6 py-4 rounded-[calc(2rem-0.375rem)] bg-black/60 flex flex-wrap items-center justify-between gap-4 border border-white/5">
            {/* Brand Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Cpu className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-lg tracking-wider text-white">FIXXY</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono tracking-widest uppercase">
                    SwarmOps v2.4
                  </span>
                </div>
                <p className="text-xs text-gray-400">Autonomous Incident Verification Swarm</p>
              </div>
            </div>

            {/* Dynamic Autonomous Classification Telemetry Badge */}
            <div className="hidden lg:flex items-center gap-3 px-4 py-2 rounded-full bg-black/80 border border-white/10 text-xs font-mono">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
              <span className="text-rose-400 font-semibold">[AUTONOMOUS TELEMETRY TRIAGE]</span>
              <span className="text-gray-400">|</span>
              <span className="text-emerald-400">{activeIncident}</span>
              <span className="text-gray-400">|</span>
              <span className="text-amber-400">P1-CRITICAL</span>
            </div>

            {/* Primary Action Button */}
            <button
              onClick={() => triggerSwarm(activeIncident)}
              disabled={isSwarmRunning}
              className={`group relative inline-flex items-center gap-3 px-6 py-3 rounded-full font-semibold text-sm transition-all duration-300 active:scale-95 shadow-[0_0_25px_rgba(16,185,129,0.3)] ${
                isSwarmRunning
                  ? 'bg-gray-800 text-gray-400 cursor-not-allowed border border-white/10'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/25'
              }`}
            >
              <Play className={`w-4 h-4 ${isSwarmRunning ? 'animate-spin' : 'fill-current'}`} />
              <span>{isSwarmRunning ? 'Swarm Resolving Incident...' : 'Trigger Swarm Resolution'}</span>
              <div className="w-6 h-6 rounded-full bg-black/10 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl space-y-6">
        
        {/* Incident Scenario Selector Toolbar */}
        <section className="p-1 rounded-[1.5rem] bg-white/5 border border-white/10 backdrop-blur-xl">
          <div className="p-4 rounded-[calc(1.5rem-0.25rem)] bg-black/40 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>SELECT ENTERPRISE INCIDENT SCENARIO:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {INCIDENTS.map((inc) => (
                <button
                  key={inc.id}
                  onClick={() => setActiveIncident(inc.id)}
                  disabled={isSwarmRunning}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all border ${
                    activeIncident === inc.id
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                      : 'bg-white/5 text-gray-400 border-white/5 hover:border-white/20 hover:text-gray-200'
                  }`}
                >
                  <span className="text-gray-500 mr-1">[{inc.type}]</span>
                  {inc.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* 4-Column Upper Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* PANE 1: DETECTIVE AGENT */}
          <AgentPaneCard
            title="Detective Agent"
            subtitle="Root Cause Analysis"
            icon={<ShieldAlert className="w-5 h-5 text-cyan-400" />}
            accentColor="cyan"
            status={agentStreams.detective.status}
            skill="[SKILL: StackTraceParser]"
            content={agentStreams.detective.text}
            placeholder="Awaiting incident log telemetry stream..."
          />

          {/* PANE 2: ARCHITECT AGENT */}
          <AgentPaneCard
            title="Architect Agent"
            subtitle="Code Patch Synthesizer"
            icon={<Code2 className="w-5 h-5 text-amber-400" />}
            accentColor="amber"
            status={agentStreams.architect.status}
            skill="[SKILL: CodeDiffSynthesizer]"
            content={agentStreams.architect.text}
            placeholder="Awaiting root cause diagnostics from Detective..."
          />

          {/* PANE 3: AUDITOR AGENT */}
          <AgentPaneCard
            title="Auditor Agent"
            subtitle="Safety & Edge Case Gate"
            icon={<Activity className="w-5 h-5 text-rose-400" />}
            accentColor="rose"
            status={agentStreams.auditor.status}
            skill="[SKILL: SecurityLinter]"
            content={agentStreams.auditor.text}
            placeholder="Awaiting code patch proposal from Architect..."
            isAuditor
          />

          {/* PANE 4: COMMUNICATOR AGENT */}
          <AgentPaneCard
            title="Communicator Agent"
            subtitle="Post-Mortem & Slack Report"
            icon={<Zap className="w-5 h-5 text-purple-400" />}
            accentColor="purple"
            status={agentStreams.communicator.status}
            skill="[SKILL: SlackNotifierAPI]"
            content={agentStreams.communicator.text}
            placeholder="Awaiting verification & resolution signals..."
          />
        </div>

        {/* FEATURED PANE 5 (THE MONEY SHOT): VERIFIER AGENT SUBPROCESS TEST RUNNER */}
        <section className="p-1.5 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-2xl shadow-2xl">
          <div className="p-6 rounded-[calc(2rem-0.375rem)] bg-black/80 space-y-6 border border-white/5">
            
            {/* Header & Skill Badge */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <FileCode className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-lg text-white">Verifier Agent — Subprocess Pytest Engine</h3>
                    <span className="px-3 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs uppercase tracking-wider">
                      [SKILL EXECUTED: PytestSubprocessRunner]
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">Generates unit test & executes pytest via Python subprocess against broken vs patched code</p>
                </div>
              </div>

              {/* Real-time Status Indicator */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono">
                {agentStreams.verifier.status === 'typing' && (
                  <span className="flex items-center gap-2 text-amber-400">
                    <Sparkles className="w-3.5 h-3.5 animate-spin" /> RUNNING SUBPROCESS TEST...
                  </span>
                )}
                {agentStreams.verifier.status === 'test_pass' && (
                  <span className="flex items-center gap-2 text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-4 h-4" /> VERIFICATION PASSED (RED FAIL &rarr; GREEN PASS)
                  </span>
                )}
                {agentStreams.verifier.status === 'idle' && (
                  <span className="text-gray-400">STANDBY</span>
                )}
              </div>
            </div>

            {/* Subprocess Output Terminal Display */}
            <div className="font-mono text-xs rounded-xl bg-black border border-white/10 p-4 h-80 overflow-y-auto space-y-4 shadow-inner">
              {agentStreams.verifier.text ? (
                <pre className="whitespace-pre-wrap text-gray-300 leading-relaxed">
                  {agentStreams.verifier.text}
                </pre>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-600 space-y-2">
                  <Terminal className="w-8 h-8 opacity-40 animate-pulse" />
                  <p>Subprocess execution log will appear here after Verifier generates tests...</p>
                </div>
              )}
            </div>

          </div>
        </section>

        {/* Swarm Skill & Tool Registry Footer */}
        <footer className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xl text-center text-xs font-mono text-gray-400">
          <div className="flex flex-wrap items-center justify-center gap-4">
            <span className="text-emerald-400 font-semibold">ACTIVE AGENT SKILLS:</span>
            <span>|</span>
            <span>Detective: <code className="text-cyan-300">StackTraceParser</code></span>
            <span>|</span>
            <span>Architect: <code className="text-amber-300">CodeDiffSynthesizer</code></span>
            <span>|</span>
            <span>Auditor: <code className="text-rose-300">SecurityLinter</code></span>
            <span>|</span>
            <span>Verifier: <code className="text-emerald-300">PytestSubprocessRunner</code></span>
            <span>|</span>
            <span>Communicator: <code className="text-purple-300">SlackNotifierAPI</code></span>
          </div>
        </footer>

      </main>
    </div>
  );
}

function AgentPaneCard({ title, subtitle, icon, accentColor, status, skill, content, placeholder, isAuditor }) {
  const isRejected = isAuditor && content.includes('[DECISION: REJECTED]');

  return (
    <div className="p-1 rounded-[1.75rem] bg-white/5 border border-white/10 backdrop-blur-xl transition-all duration-300 hover:border-white/20">
      <div className="p-5 rounded-[calc(1.75rem-0.25rem)] bg-black/60 h-96 flex flex-col justify-between border border-white/5">
        
        {/* Card Header */}
        <div className="space-y-3 pb-3 border-b border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                {icon}
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">{title}</h4>
                <p className="text-[11px] text-gray-400">{subtitle}</p>
              </div>
            </div>
            {/* Status Pulse */}
            {status === 'typing' && (
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            )}
          </div>

          {/* Skill Tag Badge */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-gray-300">
              {skill}
            </span>
            {isRejected && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
                ATTEMPT 1 REJECTED
              </span>
            )}
          </div>
        </div>

        {/* Content Stream Terminal */}
        <div className="my-3 flex-1 font-mono text-[11px] bg-black/80 rounded-xl border border-white/5 p-3 overflow-y-auto shadow-inner text-gray-300 leading-relaxed">
          {content ? (
            <pre className="whitespace-pre-wrap font-mono">{content}</pre>
          ) : (
            <span className="text-gray-600 italic">{placeholder}</span>
          )}
        </div>

        {/* Card Status Footer */}
        <div className="pt-2 flex items-center justify-between text-[10px] font-mono text-gray-500">
          <span>STATUS: <strong className="text-gray-300 uppercase">{status}</strong></span>
          <span className="text-gray-600">LIVE FEED</span>
        </div>

      </div>
    </div>
  );
}
