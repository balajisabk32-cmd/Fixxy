import { useState, useRef, useCallback } from 'react';

export function useIncidentSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [isSwarmRunning, setIsSwarmRunning] = useState(false);
  const [activeIncident, setActiveIncident] = useState('bug_db_pool.py');
  
  // Real-time text streams for each of the 5 agents
  const [agentStreams, setAgentStreams] = useState({
    detective: { text: '', status: 'idle', skill: 'StackTraceParser' },
    architect: { text: '', status: 'idle', skill: 'CodeDiffSynthesizer' },
    auditor: { text: '', status: 'idle', skill: 'SecurityLinter' },
    verifier: { text: '', status: 'idle', skill: 'PytestSubprocessRunner' },
    communicator: { text: '', status: 'idle', skill: 'SlackNotifierAPI' },
  });

  // Dynamic incident classification telemetry extracted live
  const [incidentClassification, setIncidentClassification] = useState(null);

  const socketRef = useRef(null);

  const triggerSwarm = useCallback((incidentFile = activeIncident) => {
    setActiveIncident(incidentFile);
    setIsSwarmRunning(true);
    setIncidentClassification(null);

    // Reset stream buffers
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
      // Request specific incident scenario payload
      ws.send(JSON.stringify({ incident: incidentFile }));
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

        // Extract Telemetry Badge info from Detective logs
        if (agent === 'detective' && text.includes('Ingesting Telemetry for')) {
          setIncidentClassification({
            filename: incidentFile,
            status: 'ANALYZING',
            priority: 'P1-CRITICAL',
          });
        }

        if (status === 'done' && agent === 'communicator') {
          setIsSwarmRunning(false);
        }
      } catch (err) {
        console.error('Error parsing WebSocket message frame:', err);
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
  }, [activeIncident]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.close();
    }
  }, []);

  return {
    isConnected,
    isSwarmRunning,
    activeIncident,
    setActiveIncident,
    agentStreams,
    incidentClassification,
    triggerSwarm,
    disconnect,
  };
}
