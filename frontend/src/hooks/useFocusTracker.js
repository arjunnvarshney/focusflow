import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:8000';

export function useFocusTracker() {
  const [sessionId, setSessionId] = useState(null);
  const [state, setState] = useState('IDLE'); // IDLE, ACTIVE, DISTRACTED, RECOVERING
  const [distractions, setDistractions] = useState(0);
  const [isStrict, setIsStrict] = useState(false);
  const [strictViolation, setStrictViolation] = useState(false);
  
  const idleTimeoutRef = useRef(null);
  
  const IDLE_THRESHOLD = 2 * 60 * 1000; // 2 minutes

  const logEvent = async (eventType) => {
    if (!sessionId) return;
    try {
      await axios.post(`${API_URL}/sessions/event`, {
        session_id: sessionId,
        event_type: eventType
      });
      
      // Update local state based on event
      if (eventType === 'tab_switch' || eventType === 'idle') {
        if (state === 'ACTIVE' || state === 'RECOVERING') {
          setState('DISTRACTED');
          setDistractions(d => d + 1);
          
          if (isStrict && eventType === 'tab_switch') {
            setStrictViolation(true);
            setTimeout(() => setStrictViolation(false), 3000);
          }
        }
      } else if (eventType === 'resume') {
        if (state === 'DISTRACTED') {
          setState('RECOVERING');
        } else if (state === 'RECOVERING') {
          setState('ACTIVE');
        }
      }
    } catch (err) {
      console.error("Failed to log event", err);
    }
  };

  useEffect(() => {
    if (!sessionId || state === 'IDLE') return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        logEvent('tab_switch');
      } else {
        logEvent('resume');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [sessionId, state]);

  useEffect(() => {
    if (!sessionId || state === 'IDLE') return;

    const resetIdleTimer = () => {
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
      if (state === 'DISTRACTED') {
          logEvent('resume');
      }
      
      idleTimeoutRef.current = setTimeout(() => {
        logEvent('idle');
      }, IDLE_THRESHOLD);
    };

    resetIdleTimer(); // INIT

    // Listen to mouse and keyboard events
    window.addEventListener('mousemove', resetIdleTimer);
    window.addEventListener('keydown', resetIdleTimer);

    return () => {
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
      window.removeEventListener('mousemove', resetIdleTimer);
      window.removeEventListener('keydown', resetIdleTimer);
    };
  }, [sessionId, state]);

  const startSession = async () => {
    try {
      const res = await axios.post(`${API_URL}/sessions/start`);
      setSessionId(res.data.id);
      setState('ACTIVE');
      setDistractions(0);
    } catch (err) {
      console.error("Started session failed", err);
    }
  };

  const endSession = async () => {
    if (!sessionId) return null;
    try {
      const res = await axios.post(`${API_URL}/sessions/end/${sessionId}`);
      setSessionId(null);
      setState('IDLE');
      return res.data;
    } catch (err) {
      console.error("End session failed", err);
      return null;
    }
  };

  return {
    sessionId,
    state,
    distractions,
    isStrict,
    setIsStrict,
    strictViolation,
    startSession,
    endSession
  };
}
