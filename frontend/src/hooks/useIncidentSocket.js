import { useState, useRef, useCallback } from 'react';

export function useIncidentSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [isSwarmRunning, setIsSwarmRunning] = useState(false);
  
  // Real-time agent text streams
  const [agentStreams, setAgentStreams] = useState({
    detective: { text: '', status: 'idle', skill: 'StackTraceParser' },
    architect: { text: '', status: 'idle', skill: 'CodeDiffSynthesizer' },
    auditor: { text: '', status: 'idle', skill: 'SecurityLinter' },
    verifier: { text: '', status: 'idle', skill: 'PytestSubprocessRunner' },
    communicator: { text: '', status: 'idle', skill: 'SlackNotifierAPI' },
  });

  // Dynamic incident classification telemetry extracted live by Detective Agent
  const [incidentClassification, setIncidentClassification] = useState(null);

  const socketRef = useRef(null);

  const triggerSwarm = useCallback(() => {
    setIsSwarmRunning(true);
    setIncidentClassification(null);

    // Reset streams
    setAgentStreams({
      detective: { text: '', status: 'typing', skill: 'StackTraceParser' },
      architect: { text: '', status: 'idle', skill: 'CodeDiffSynthesizer' },
      auditor: { text: '', status: 'idle', skill: 'SecurityLinter' },
      verifier: { text: '', status: 'idle', skill: 'PytestSubprocessRunner' },
      communicator: { text: '', status: 'idle', skill: 'SlackNotifierAPI' },
    });

    if (socketRef.current) {
      socketRef.current.close();
    }

    const ws = new WebSocket('ws://localhost:8000/ws/incident');
    socketRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      // Trigger execution stream
      ws.send(JSON.stringify({ action: 'start_telemetry_triage' }));
    };

    ws.onmessage = (event) => {
      try {
        const frame = JSON.parse(event.data);
        const { agent, text, status } = frame;

        if (!agent) return;

        setAgentStreams((prev) => {
          const currentText = prev[agent]?.text || '';
          return {
            ...prev,
            [agent]: {
              ...prev[agent],
              text: currentText + text,
              status: status || 'typing',
            },
          };
        });

        // Parse Autonomous Classification Metadata from Detective output stream
        if (agent === 'detective') {
          if (text.includes('Ingesting Telemetry for [')) {
            const match = text.match(/Ingesting Telemetry for \[(.*?)\]/);
            if (match) {
              setIncidentClassification({
                filename: match[1],
                type: 'AUTONOMOUS DETECTED CRASH',
                status: 'ANALYZING',
              });
            }
          }
        }

        if (status === 'done' && agent === 'communicator') {
          setIsSwarmRunning(false);
        }
      } catch (err) {
        console.error('Error parsing WebSocket frame:', err);
      }
    };

    ws.onerror = (err) => {
      console.error('WebSocket Error:', err);
      setIsConnected(false);
      setIsSwarmRunning(false);
    };

    ws.onclose = () => {
      setIsConnected(false);
      setIsSwarmRunning(false);
    };
  }, []);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.close();
    }
  }, []);

  return {
    isConnected,
    isSwarmRunning,
    agentStreams,
    incidentClassification,
    triggerSwarm,
    disconnect,
  };
}
