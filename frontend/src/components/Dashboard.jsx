import React from 'react';
import { useIncidentSocket } from '../hooks/useIncidentSocket';
import { 
  ShieldAlert, 
  Terminal, 
  Code2, 
  CheckCircle2, 
  Cpu, 
  Play, 
  Zap, 
  Activity, 
  FileCode,
  ArrowUpRight,
  Sparkles,
  Radio
} from 'lucide-react';

export default function Dashboard() {
  const {
    isSwarmRunning,
    agentStreams,
    incidentClassification,
    triggerSwarm,
  } = useIncidentSocket();

  return (
    <div className="min-h-screen bg-[#030712] text-gray-100 p-4 md:p-8 selection:bg-emerald-500/30">
      {/* Background Radial Glows */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-[600px] h-[600px] bg-rose-500/5 blur-[150px] rounded-full pointer-events-none" />

      {/* Floating Ultra-Clean Glass Header */}
      <header className="sticky top-4 z-50 mb-8 mx-auto w-full max-w-7xl">
        <div className="p-1.5 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-2xl shadow-2xl">
          <div className="px-6 py-4 rounded-[calc(2rem-0.375rem)] bg-black/60 flex flex-wrap items-center justify-between gap-4 border border-white/5">
            
            {/* Brand Title */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                <Cpu className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-lg tracking-wider text-white">FIXXY</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono tracking-widest uppercase">
                    SwarmOps v2.4
                  </span>
                </div>
                <p className="text-xs text-gray-400">Autonomous Telemetry Ingestion & Test-Verified Fixes</p>
              </div>
            </div>

            {/* Live Autonomous Detection Telemetry Badge */}
            <div className="flex items-center gap-3 px-5 py-2 rounded-full bg-black/80 border border-white/10 text-xs font-mono">
              <span className="relative flex h-2.5 w-2.5">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isSwarmRunning ? 'bg-rose-400' : 'bg-emerald-400'} opacity-75`}></span>
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isSwarmRunning ? 'bg-rose-500' : 'bg-emerald-500'}`}></span>
              </span>

              {incidentClassification ? (
                <div className="flex items-center gap-2 text-rose-400">
                  <span className="font-bold">[DETECTED INCIDENT]</span>
                  <span className="text-gray-400">|</span>
                  <span className="text-amber-300 font-semibold">{incidentClassification.type || 'CRITICAL FAILURE'}</span>
                  <span className="text-gray-400">|</span>
                  <span className="text-gray-300">{incidentClassification.filename}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-emerald-400">
                  <Radio className="w-3.5 h-3.5 animate-spin" />
                  <span>SYSTEM MONITORING: ACTIVE</span>
                  <span className="text-gray-500">|</span>
                  <span className="text-gray-400">AUTONOMOUS DETECTION READY</span>
                </div>
              )}
            </div>

            {/* Single Action Button (Zero Manual Selector) */}
            <button
              onClick={() => triggerSwarm()}
              disabled={isSwarmRunning}
              className={`group relative inline-flex items-center gap-3 px-6 py-3 rounded-full font-semibold text-sm transition-all duration-300 active:scale-95 shadow-[0_0_25px_rgba(16,185,129,0.3)] ${
                isSwarmRunning
                  ? 'bg-gray-800 text-gray-400 cursor-not-allowed border border-white/10'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/25'
              }`}
            >
              <Play className={`w-4 h-4 ${isSwarmRunning ? 'animate-spin' : 'fill-current'}`} />
              <span>{isSwarmRunning ? 'Swarm Triage & Resolution Running...' : 'Simulate Telemetry Stream & Resolve'}</span>
              <div className="w-6 h-6 rounded-full bg-black/10 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
            </button>

          </div>
        </div>
      </header>

      {/* Main 5-Pane Bento Architecture */}
      <main className="mx-auto max-w-7xl space-y-6">
        
        {/* 4-Column Upper Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* PANE 1: DETECTIVE AGENT */}
          <AgentPaneCard
            title="Detective Agent"
            subtitle="Autonomous Root Cause Analysis"
            icon={<ShieldAlert className="w-5 h-5 text-cyan-400" />}
            status={agentStreams.detective.status}
            skill="[SKILL: StackTraceParser]"
            content={agentStreams.detective.text}
            placeholder="Awaiting raw telemetry log stream..."
          />

          {/* PANE 2: ARCHITECT AGENT */}
          <AgentPaneCard
            title="Architect Agent"
            subtitle="Code Patch Synthesizer"
            icon={<Code2 className="w-5 h-5 text-amber-400" />}
            status={agentStreams.architect.status}
            skill="[SKILL: CodeDiffSynthesizer]"
            content={agentStreams.architect.text}
            placeholder="Awaiting diagnostic report from Detective..."
          />

          {/* PANE 3: AUDITOR AGENT */}
          <AgentPaneCard
            title="Auditor Agent"
            subtitle="Safety & Debate Gatekeeper"
            icon={<Activity className="w-5 h-5 text-rose-400" />}
            status={agentStreams.auditor.status}
            skill="[SKILL: SecurityLinter]"
            content={agentStreams.auditor.text}
            placeholder="Awaiting patch proposal from Architect..."
            isAuditor
          />

          {/* PANE 4: COMMUNICATOR AGENT */}
          <AgentPaneCard
            title="Communicator Agent"
            subtitle="Post-Mortem & Slack Dispatch"
            icon={<Zap className="w-5 h-5 text-purple-400" />}
            status={agentStreams.communicator.status}
            skill="[SKILL: SlackNotifierAPI]"
            content={agentStreams.communicator.text}
            placeholder="Awaiting resolution and verification signals..."
          />
        </div>

        {/* FEATURED PANE 5: VERIFIER AGENT SUBPROCESS TEST ENGINE */}
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
                  <p className="text-xs text-gray-400">Generates test suite & executes subprocess pytest against original (FAIL) vs patched (PASS) code</p>
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
                  <span className="text-gray-400">SYSTEM STANDBY</span>
                )}
              </div>
            </div>

            {/* Terminal Window Output */}
            <div className="font-mono text-xs rounded-xl bg-black border border-white/10 p-4 h-80 overflow-y-auto space-y-4 shadow-inner">
              {agentStreams.verifier.text ? (
                <pre className="whitespace-pre-wrap text-gray-300 leading-relaxed font-mono">
                  {agentStreams.verifier.text}
                </pre>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-600 space-y-2">
                  <Terminal className="w-8 h-8 opacity-40 animate-pulse" />
                  <p>Subprocess verification logs will appear here live during execution...</p>
                </div>
              )}
            </div>

          </div>
        </section>

        {/* Skill & Capability Footnote */}
        <footer className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xl text-center text-xs font-mono text-gray-400">
          <div className="flex flex-wrap items-center justify-center gap-4">
            <span className="text-emerald-400 font-semibold">SWARM AGENT SKILL REGISTRY:</span>
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

function AgentPaneCard({ title, subtitle, icon, status, skill, content, placeholder, isAuditor }) {
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
            {/* Active Typing Pulse */}
            {status === 'typing' && (
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            )}
          </div>

          {/* Skill Badge */}
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

        {/* Content Stream Box */}
        <div className="my-3 flex-1 font-mono text-[11px] bg-black/80 rounded-xl border border-white/5 p-3 overflow-y-auto shadow-inner text-gray-300 leading-relaxed">
          {content ? (
            <pre className="whitespace-pre-wrap font-mono">{content}</pre>
          ) : (
            <span className="text-gray-600 italic">{placeholder}</span>
          )}
        </div>

        {/* Status Indicator Bar */}
        <div className="pt-2 flex items-center justify-between text-[10px] font-mono text-gray-500">
          <span>STATUS: <strong className="text-gray-300 uppercase">{status}</strong></span>
          <span className="text-gray-600">LIVE FEED</span>
        </div>

      </div>
    </div>
  );
}
