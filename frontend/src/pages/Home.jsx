import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Square, Check, Plus, Volume2, VolumeX, Zap, Clock, Keyboard, Sparkles, Flame, Wand2 } from "lucide-react";
import Navbar from "../components/Navbar";
import ParticleBackground from "../components/ParticleBackground";

const STATES = {
  IDLE: "IDLE",
  ACTIVE: "ACTIVE",
  DISTRACTED: "DISTRACTED",
  RECOVERING: "RECOVERING",
};

const STATE_COLORS = {
  IDLE: { dot: "#444", text: "#555", bg: "rgba(255,255,255,0.03)" },
  ACTIVE: { dot: "#22c55e", text: "#22c55e", bg: "rgba(34,197,94,0.06)" },
  DISTRACTED: { dot: "#ef4444", text: "#ef4444", bg: "rgba(239,68,68,0.06)" },
  RECOVERING: { dot: "#f59e0b", text: "#f59e0b", bg: "rgba(245,158,11,0.06)" },
};

export default function Home() {
  const [focusState, setFocusState] = useState(STATES.IDLE);
  const [seconds, setSeconds] = useState(0);
  const [distractions, setDistractions] = useState(0);
  const [focusScore, setFocusScore] = useState(100);
  const [events, setEvents] = useState([]);
  const [tasks, setTasks] = useState([
    { id: 1, text: "Implement binary search tree", done: false },
    { id: 2, text: "Solve 2 LeetCode mediums", done: false },
    { id: 3, text: "Read Ch. 4 of CLRS", done: true },
  ]);
  const [taskInput, setTaskInput] = useState("");
  const [aiSummary, setAiSummary] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [soundType, setSoundType] = useState("LOFI");
  const [xpPopups, setXpPopups] = useState([]);

  const audioRef = useRef(null);

  const SOUND_URLS = {
    LOFI: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-17.mp3",
    RAIN: "https://www.soundjay.com/nature/rain-07.mp3",
    JAZZ: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3"
  };

  // Audio Management
  useEffect(() => {
    if (soundEnabled) {
      if (!audioRef.current) {
        audioRef.current = new Audio(SOUND_URLS[soundType]);
        audioRef.current.loop = true;
        audioRef.current.volume = 0.3;
      } else {
        audioRef.current.src = SOUND_URLS[soundType];
      }
      
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.warn("Audio playback issue (User interaction may be required):", error);
          // Do not setSoundEnabled(false) here, just log it.
        });
      }
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [soundEnabled, soundType]);

  const [zenMode, setZenMode] = useState(false);
  const [mantra, setMantra] = useState("Stay sharp. Stay focused.");
  const [theme, setTheme] = useState("NEON");
  const [history, setHistory] = useState([
    { id: 1, date: "12 Apr", time: "45m", score: 92 },
    { id: 2, date: "11 Apr", time: "1h 20m", score: 88 },
    { id: 3, date: "10 Apr", time: "30m", score: 95 }
  ]);

  const [streak, setStreak] = useState(12);

  const THEMES = {
    NEON: { primary: "#6366f1", accent: "#a855f7", bg: "radial-gradient(circle at 50% 50%, #0d0d1a 0%, #050505 100%)" },
    FOREST: { primary: "#10b981", accent: "#34d399", bg: "radial-gradient(circle at 50% 50%, #061a15 0%, #050505 100%)" },
    SAKURA: { primary: "#fb7185", accent: "#fda4af", bg: "radial-gradient(circle at 50% 50%, #1a0d11 0%, #050505 100%)" }
  };

  const startRitual = () => {
    setTheme("FOREST");
    setSoundEnabled(true);
    setSoundType("RAIN");
    setZenMode(true);
    startSession();
  };

  const breakTask = (id) => {
    setTasks(prev => {
      const task = prev.find(t => t.id === id);
      if (!task || task.isBroken) return prev;
      
      const subs = [
        { id: Date.now() + 1, text: `→ Stage 1: Initial setup & planning`, done: false },
        { id: Date.now() + 2, text: `→ Stage 2: Deep execution phase`, done: false },
        { id: Date.now() + 3, text: `→ Stage 3: Quality audit & cleanup`, done: false }
      ];
      
      return prev.flatMap(t => t.id === id ? [{ ...t, isBroken: true }, ...subs] : t);
    });
  };

  const timerRef = useRef(null);
  const idleRef = useRef(null);
  const inputRef = useRef(null);

  const MANTRAS = {
    IDLE: ["Ready for deep work?", "Your next breakthrough awaits.", "Focus is a superpower."],
    ACTIVE: ["You're in the flow.", "Deep work in progress.", "Quiet the noise. Focus on the craft."],
    DISTRACTED: ["Breathe. Come back to center.", "The path is still there. Rejoin it.", "One small step back to focus."],
    RECOVERING: ["Resetting neural pathways...", "Re-centering...", "Flow state returning..."]
  };

  useEffect(() => {
    const pool = MANTRAS[focusState];
    const pick = pool[Math.floor(Math.random() * pool.length)];
    setMantra(pick);
  }, [focusState]);

  const logEvent = useCallback((type) => {
    const now = new Date();
    const label = now.toLocaleTimeString("en-US", { hour12: false });
    setEvents((prev) => [{ type, time: label }, ...prev].slice(0, 8));
    if (sessionId) {
      fetch(`http://localhost:8000/sessions/event`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, event_type: type }),
      }).catch(() => {});
    }
  }, [sessionId]);

  const handleDistraction = useCallback((type) => {
    if (focusState === STATES.ACTIVE) {
      setFocusState(STATES.DISTRACTED);
      setDistractions((d) => {
        const next = d + 1;
        setFocusScore(Math.max(0, 100 - next * 10));
        return next;
      });
      logEvent(type);
    }
  }, [focusState, logEvent]);

  const handleResume = useCallback(() => {
    if (focusState === STATES.DISTRACTED) {
      setFocusState(STATES.RECOVERING);
      logEvent("resume");
      setTimeout(() => setFocusState(STATES.ACTIVE), 2000);
    }
  }, [focusState, logEvent]);

  // Session Controls
  const startSession = async () => {
    try {
      const res = await fetch("http://localhost:8000/sessions/start", { method: "POST" });
      const data = await res.json();
      setSessionId(data.id);
    } catch {}
    setFocusState(STATES.ACTIVE);
    setSeconds(0);
    setDistractions(0);
    setFocusScore(100);
    setEvents([]);
    setAiSummary("");
    logEvent("start");
    timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
  };

  const endSession = async () => {
    clearInterval(timerRef.current);
    setFocusState(STATES.IDLE);
    if (sessionId) {
      try {
        const res = await fetch(`http://localhost:8000/sessions/end/${sessionId}`, { method: "POST" });
        const data = await res.json();
        if (data.ai_summary) setAiSummary(data.ai_summary);
      } catch {}
    }
    setSessionId(null);
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (document.activeElement.tagName === "INPUT") return;
      
      if (e.code === "Space") {
        e.preventDefault();
        if (focusState === STATES.IDLE) startSession();
        else endSession();
      }
      if (e.key.toLowerCase() === "d" && focusState === STATES.ACTIVE) {
        handleDistraction("manual_shortcut");
      }
      if (e.altKey && e.key.toLowerCase() === "t") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [focusState, handleDistraction]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) handleDistraction("tab_switch");
      else handleResume();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [handleDistraction, handleResume]);

  const addTask = () => {
    if (!taskInput.trim()) return;
    setTasks((t) => [{ id: Date.now(), text: taskInput.trim(), done: false }, ...t]);
    setTaskInput("");
  };

  const toggleTask = (id) => {
    setTasks((t) => {
      const target = t.find(tk => tk.id === id);
      if (target && !target.done) {
        // XP POPUP - Randomized Fountain Path
        const newPopup = { 
          id: Date.now(), 
          x: Math.random() * 200 - 100, 
          rot: Math.random() * 40 - 20 
        };
        setXpPopups(prev => [...prev, newPopup]);
        setTimeout(() => setXpPopups(prev => prev.filter(p => p.id !== newPopup.id)), 1200);
      }
      return t.map((tk) => tk.id === id ? { ...tk, done: !tk.done } : tk);
    });
  };

  const fmt = (s) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;
  const sc = STATE_COLORS[focusState];
  const isRunning = focusState !== STATES.IDLE;

  return (
    <div style={{
      background: THEMES[theme].bg,
      height: "100vh",
      color: "#fff",
      fontFamily: "'DM Mono', monospace",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      transition: "background 1s ease"
    }}>
      <ParticleBackground color={THEMES[theme].primary} />
      {!zenMode && <Navbar />}

      {/* Control Area: Zen & Themes - Repositioned to avoid Navbar overlap */}
      <div style={{ position: "fixed", top: 110, left: 24, zIndex: 1000, display: "flex", alignItems: "center", gap: 20 }}>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setZenMode(!zenMode)}
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "50%", width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", color: zenMode ? THEMES[theme].primary : "rgba(255,255,255,0.4)", cursor: "pointer", backdropFilter: "blur(10px)" }}
        >
          {zenMode ? <Sparkles size={20} /> : <Zap size={20} />}
        </motion.button>
        
        {!zenMode && (
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ display: "flex", gap: 8, background: "rgba(0,0,0,0.2)", padding: "4px", borderRadius: 20, border: "1px solid rgba(255,255,255,0.05)" }}>
              {Object.keys(THEMES).map(t => (
                <button 
                  key={t}
                  onClick={() => setTheme(t)}
                  style={{ 
                    width: 12, height: 12, borderRadius: "50%", border: "none", cursor: "pointer",
                    background: THEMES[t].primary,
                    opacity: theme === t ? 1 : 0.3,
                    transition: "opacity 0.3s"
                  }}
                />
              ))}
            </div>
            <motion.button
              whileHover={{ scale: 1.05, background: "rgba(255,255,255,0.1)" }}
              whileTap={{ scale: 0.95 }}
              onClick={startRitual}
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: "8px 16px", fontSize: 10, fontWeight: 800, color: THEMES[theme].primary, cursor: "pointer", letterSpacing: "1px" }}
            >
              FOCUS RITUAL
            </motion.button>
          </div>
        )}
      </div>

      {/* Main Body */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: zenMode ? "1fr" : "1fr 440px", 
        flex: 1, 
        minHeight: 0, 
        zIndex: 10,
        transition: "grid-template-columns 0.6s cubic-bezier(0.16, 1, 0.3, 1)"
      }}>
        
        {/* Left Section */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: zenMode ? "0 20%" : "0 80px",
          borderRight: zenMode ? "none" : "1px solid rgba(255,255,255,0.04)",
          position: "relative",
          transition: "padding 0.6s cubic-bezier(0.16, 1, 0.3, 1)"
        }}>
          {/* Streak Burner */}
          {!zenMode && (
            <motion.div 
              style={{ position: "absolute", top: 40, right: 40, textAlign: "right", display: "flex", alignItems: "center", gap: 12 }}
            >
              <div>
                <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "2px", color: "rgba(255,255,255,0.2)" }}>STREAK</div>
                <div style={{ fontSize: 24, fontWeight: 900, color: "#fff" }}>{streak}</div>
              </div>
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  filter: ["drop-shadow(0 0 5px #f97316)", "drop-shadow(0 0 15px #f97316)", "drop-shadow(0 0 5px #f97316)"]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ color: "#f97316" }}
              >
                <Flame size={32} />
              </motion.div>
            </motion.div>
          )}

          {/* AI Focus Coach Mantra */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={mantra}
            style={{ 
              fontSize: 14, 
              color: "rgba(255,255,255,0.3)", 
              fontStyle: "italic", 
              letterSpacing: "0.5px",
              fontWeight: 400,
              marginBottom: 24,
              marginTop: zenMode ? -100 : 0 // Shift up slightly in Zen Mode
            }}
          >
            — {mantra}
          </motion.div>
          {/* XP Popups - Fountain Effect in Bottom Right */}
          {xpPopups.map(p => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, scale: 0, y: 0, x: 0 }}
              animate={{ 
                opacity: [0, 1, 1, 0], 
                scale: [0.5, 1, 1, 0.8], 
                y: -150, 
                x: p.x, 
                rotate: p.rot 
              }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              style={{
                position: "fixed",
                bottom: 100,
                right: 100,
                color: THEMES[theme].primary,
                fontWeight: 900,
                fontSize: 32,
                pointerEvents: "none",
                textShadow: `0 0 30px ${THEMES[theme].primary}88`,
                zIndex: 2000,
                fontFamily: "'DM Mono', monospace"
              }}
            >+20 XP</motion.div>
          ))}

          <motion.div 
            animate={{ color: sc.text, backgroundColor: sc.bg, borderColor: `${sc.text}33` }}
            style={{ fontSize: 11, letterSpacing: "4px", border: "1px solid", padding: "10px 24px", borderRadius: 3, marginBottom: 48, fontWeight: 800, alignSelf: "flex-start" }}
          >{focusState}</motion.div>

          <AnimatePresence mode="wait">
            <motion.div 
              key={seconds}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              style={{ fontSize: "clamp(120px, 15vw, 200px)", fontWeight: 800, letterSpacing: "-10px", lineHeight: 0.9, color: isRunning ? "#fff" : "rgba(255,255,255,0.1)", fontVariantNumeric: "tabular-nums", marginBottom: 56 }}
            >{fmt(seconds)}</motion.div>
          </AnimatePresence>

          <div style={{ display: "flex", gap: 64, marginBottom: 64 }}>
            {[
              { label: "QUALITY", value: isRunning ? `${focusScore}%` : "—", color: focusScore < 60 ? "#ef4444" : THEMES[theme].primary, icon: <Zap size={16} /> },
              { label: "DISTRACTIONS", value: isRunning ? `${distractions}` : "—", color: distractions > 2 ? "#f59e0b" : "#fff", icon: <Keyboard size={16} /> },
            ].map((s) => (
              <div key={s.label}>
                <div style={{ fontSize: 10, letterSpacing: "2px", color: "rgba(255,255,255,0.2)", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>{s.icon} {s.label}</div>
                <div style={{ fontSize: 48, fontWeight: 700, color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 20 }}>
            <motion.button
              whileHover={{ scale: 1.02, backgroundColor: isRunning ? "rgba(239,68,68,0.1)" : THEMES[theme].accent }}
              whileTap={{ scale: 0.98 }}
              onClick={isRunning ? endSession : startSession}
              style={{ background: isRunning ? "transparent" : THEMES[theme].primary, color: isRunning ? "#ef4444" : "#fff", border: isRunning ? "1px solid rgba(239,68,68,0.3)" : "none", padding: "20px 56px", borderRadius: 4, fontSize: 14, fontWeight: 700, letterSpacing: "3px", cursor: "pointer", display: "flex", alignItems: "center", gap: 16 }}
            >
              {isRunning ? <Square size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
              {isRunning ? "DEACTIVATE" : "INITIATE FOCUS"}
            </motion.button>
            
            <div style={{ display: "flex", alignItems: "center", gap: 12, color: "rgba(255,255,255,0.15)", fontSize: 11, fontWeight: 600 }}>
              <Keyboard size={14} /> [SPACE] TO TOGGLE
            </div>
          </div>
        </div>

        {/* Right Section */}
        <AnimatePresence>
          {!zenMode && (
            <motion.div 
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 100 }}
              style={{ display: "flex", flexDirection: "column", background: "rgba(8,8,8,0.4)", backdropFilter: "blur(40px)" }}
            >
              
              {/* Sounds */}
              <div style={{ padding: "32px", borderBottom: "1px solid rgba(255,255,255,0.04)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", gap: 16 }}>
                  <motion.button 
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    style={{ background: "none", border: "none", color: soundEnabled ? THEMES[theme].primary : "rgba(255,255,255,0.2)", cursor: "pointer" }}
                  >
                    {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                  </motion.button>
                  {soundEnabled && (
                    <div style={{ display: "flex", gap: 8 }}>
                      {["LOFI", "RAIN", "JAZZ"].map(s => (
                        <span key={s} onClick={() => setSoundType(s)} style={{ fontSize: 10, fontWeight: 800, letterSpacing: "1px", color: soundType === s ? "#fff" : "rgba(255,255,255,0.2)", cursor: "pointer", padding: "4px 8px", background: soundType === s ? `${THEMES[theme].primary}22` : "transparent", borderRadius: 4 }}>{s}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div style={{ fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.1)", padding: "4px 10px", borderRadius: 4, display: "flex", alignItems: "center", gap: 6 }}>
                  <Sparkles size={12} /> XP SYSTEM ACTIVE
                </div>
              </div>

              {/* Tasks */}
              <div style={{ padding: "32px", flex: 1, overflowY: "auto" }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "2.5px", color: "rgba(255,255,255,0.2)", marginBottom: 24 }}>PRIORITY QUEUE</div>
                <div style={{ display: "flex", gap: 10, marginBottom: 32 }}>
                  <input
                    ref={inputRef}
                    value={taskInput}
                    onChange={(e) => setTaskInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addTask()}
                    placeholder="Next objective... (Alt+T)"
                    style={{ flex: 1, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 4, padding: "16px 20px", fontSize: 14, color: "#fff", outline: "none" }}
                  />
                  <button onClick={addTask} style={{ background: THEMES[theme].primary, border: "none", borderRadius: 4, width: 52, color: "#fff", cursor: "pointer" }}><Plus size={20} /></button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <AnimatePresence mode="popLayout">
                    {tasks.map((t) => (
                      <motion.div
                        key={t.id}
                        layout
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        onClick={() => toggleTask(t.id)}
                        style={{ display: "flex", alignItems: "center", gap: 16, padding: "18px 20px", background: t.done ? "transparent" : "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.03)", borderRadius: 6, cursor: "pointer", position: "relative" }}
                      >
                        <div style={{ width: 20, height: 20, borderRadius: "50%", border: t.done ? "none" : "2px solid rgba(255,255,255,0.15)", background: t.done ? THEMES[theme].primary : "transparent", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>{t.done && <Check size={12} strokeWidth={4} />}</div>
                        <span style={{ fontSize: 14, fontWeight: 500, color: t.done ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.7)", flex: 1, textDecoration: t.done ? "line-through" : "none" }}>{t.text}</span>
                        {!t.done && !t.isBroken && (
                          <motion.button
                            whileHover={{ scale: 1.2, color: THEMES[theme].primary }}
                            onClick={(e) => { e.stopPropagation(); breakTask(t.id); }}
                            style={{ background: "none", border: "none", color: "rgba(255,255,255,0.1)", cursor: "pointer", display: "flex", alignItems: "center", padding: 4 }}
                            title="AI Break Down"
                          >
                            <Wand2 size={16} />
                          </motion.button>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              {/* Session History (Cognitive Audit) */}
              <div style={{ padding: "32px", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "2.5px", color: "rgba(255,255,255,0.2)", marginBottom: 20 }}>COGNITIVE AUDIT</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {history.map(h => (
                    <div key={h.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.6)" }}>{h.date} — {h.time}</div>
                        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", letterSpacing: "1px" }}>SESSION PERFORMANCE</div>
                      </div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: THEMES[theme].primary }}>{h.score}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Stats */}
              <div style={{ padding: "32px", background: "rgba(255,255,255,0.02)", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  {[
                    { label: "SESSION XP", value: "+140", icon: <Sparkles size={14} /> },
                    { label: "TIME WORKED", value: fmt(seconds), icon: <Clock size={14} /> },
                  ].map((s) => (
                    <div key={s.label}>
                      <div style={{ fontSize: 24, fontWeight: 700, color: "#fff", marginBottom: 4 }}>{s.value}</div>
                      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "1.5px", color: "rgba(255,255,255,0.25)", display: "flex", alignItems: "center", gap: 6 }}>{s.icon} {s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
