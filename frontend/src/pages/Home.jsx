import { useState, useEffect, useRef, useCallback } from "react";

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
    { id: 1, text: "Implement binary search tree", done: false, resurfaced: false },
    { id: 2, text: "Solve 2 LeetCode mediums", done: false, resurfaced: true },
    { id: 3, text: "Read Ch. 4 of CLRS", done: true, resurfaced: false },
  ]);
  const [taskInput, setTaskInput] = useState("");
  const [aiSummary, setAiSummary] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const timerRef = useRef(null);
  const idleRef = useRef(null);

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

  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) handleDistraction("tab_switch");
      else handleResume();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [handleDistraction, handleResume]);

  useEffect(() => {
    if (focusState === STATES.ACTIVE) {
      const resetIdle = () => {
        clearTimeout(idleRef.current);
        idleRef.current = setTimeout(() => handleDistraction("idle"), 120000);
      };
      window.addEventListener("mousemove", resetIdle);
      window.addEventListener("keydown", resetIdle);
      resetIdle();
      return () => {
        window.removeEventListener("mousemove", resetIdle);
        window.removeEventListener("keydown", resetIdle);
        clearTimeout(idleRef.current);
      };
    }
  }, [focusState, handleDistraction]);

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

  const fmt = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  const addTask = () => {
    if (!taskInput.trim()) return;
    setTasks((t) => [...t, { id: Date.now(), text: taskInput.trim(), done: false, resurfaced: false }]);
    setTaskInput("");
  };

  const toggleTask = (id) => setTasks((t) => t.map((tk) => tk.id === id ? { ...tk, done: !tk.done } : tk));

  const sc = STATE_COLORS[focusState];
  const isRunning = focusState !== STATES.IDLE;

  const EVENT_COLORS = {
    tab_switch: "#ef4444",
    idle: "#f59e0b",
    resume: "#22c55e",
    start: "#6366f1",
  };

  return (
    <div style={{
      background: "#080808",
      height: "100vh",
      color: "#fff",
      fontFamily: "'DM Mono', 'Fira Code', 'Courier New', monospace",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
    }}>
      {/* NAV */}
      <nav style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "20px 48px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 8, height: 8, borderRadius: "50%",
            background: sc.dot,
            boxShadow: focusState === STATES.ACTIVE ? `0 0 8px ${sc.dot}` : "none",
            transition: "all 0.4s",
          }} />
          <span style={{ fontSize: 18, fontWeight: 600, letterSpacing: "-0.5px", color: "#fff" }}>
            FocusFlow
          </span>
        </div>
        <div style={{ display: "flex", gap: 32 }}>
          {["HOME", "ANALYTICS"].map((l) => (
            <span key={l} style={{
              fontSize: 14,
              letterSpacing: "2px",
              color: l === "HOME" ? "#fff" : "rgba(255,255,255,0.3)",
              cursor: "pointer",
            }}>{l}</span>
          ))}
        </div>
      </nav>

      {/* BODY */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 420px", flex: 1, minHeight: 0 }}>

        {/* LEFT — TIMER */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          padding: "0 64px",
          borderRight: "1px solid rgba(255,255,255,0.06)",
          height: "100%",
          overflowY: "auto",
        }}>
          {/* State pill */}
          <div style={{
            fontSize: 14,
            letterSpacing: "3px",
            color: sc.text,
            background: sc.bg,
            border: `1px solid ${sc.text}33`,
            padding: "8px 18px",
            borderRadius: 2,
            marginBottom: 40,
            transition: "all 0.4s",
          }}>{focusState}</div>

          {/* Timer */}
          <div style={{
            fontSize: "clamp(100px, 12vw, 140px)",
            fontWeight: 700,
            letterSpacing: "-8px",
            lineHeight: 1,
            color: isRunning ? "#fff" : "rgba(255,255,255,0.15)",
            transition: "color 0.4s",
            marginBottom: 48,
            fontVariantNumeric: "tabular-nums",
          }}>{fmt(seconds)}</div>

          {/* Score row */}
          <div style={{ display: "flex", gap: 40, marginBottom: 48 }}>
            {[
              { label: "FOCUS SCORE", value: isRunning ? `${focusScore}` : "—", color: focusScore < 50 ? "#ef4444" : "#6366f1" },
              { label: "DISTRACTIONS", value: isRunning ? `${distractions}` : "—", color: distractions > 3 ? "#ef4444" : "#fff" },
            ].map((s) => (
              <div key={s.label}>
                <div style={{ fontSize: 13, letterSpacing: "2px", color: "rgba(255,255,255,0.25)", marginBottom: 8 }}>{s.label}</div>
                <div style={{ fontSize: 44, fontWeight: 700, color: s.color, transition: "color 0.4s" }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Button */}
          <button
            onClick={isRunning ? endSession : startSession}
            style={{
              background: isRunning ? "transparent" : "#6366f1",
              color: isRunning ? "#ef4444" : "#fff",
              border: isRunning ? "1px solid #ef444466" : "none",
              padding: "16px 40px",
              borderRadius: 2,
              fontSize: 15,
              fontWeight: 600,
              letterSpacing: "3px",
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "all 0.3s",
              marginBottom: 48,
            }}
          >{isRunning ? "END SESSION" : "START FOCUS"}</button>

          {/* Event log */}
          <div>
            <div style={{ fontSize: 13, letterSpacing: "2px", color: "rgba(255,255,255,0.2)", marginBottom: 16 }}>
              SYSTEM EVENT LOG
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {events.length === 0 && (
                <div style={{ fontSize: 14, color: "rgba(255,255,255,0.15)" }}>No events yet. Start a session.</div>
              )}
              {events.map((e, i) => (
                <div key={i} style={{ display: "flex", gap: 16, alignItems: "center" }}>
                  <span style={{ fontSize: 14, color: "rgba(255,255,255,0.2)", fontVariantNumeric: "tabular-nums" }}>
                    [{e.time}]
                  </span>
                  <span style={{ fontSize: 13, color: EVENT_COLORS[e.type] || "#fff", letterSpacing: "1px" }}>
                    {e.type.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div style={{ display: "flex", flexDirection: "column", background: "#0c0c0c", height: "100%", overflowY: "auto" }}>

          {/* Tasks */}
          <div style={{ padding: "32px 28px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ fontSize: 13, letterSpacing: "2px", color: "rgba(255,255,255,0.25)", marginBottom: 20 }}>
              TASKS — {tasks.filter(t => !t.done).length} REMAINING
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
              <input
                value={taskInput}
                onChange={(e) => setTaskInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTask()}
                placeholder="Add task..."
                style={{
                  flex: 1,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 2,
                  padding: "12px 14px",
                  fontSize: 15,
                  color: "#fff",
                  outline: "none",
                  fontFamily: "inherit",
                }}
              />
              <button
                onClick={addTask}
                style={{
                  background: "#6366f1",
                  border: "none",
                  borderRadius: 2,
                  width: 44,
                  color: "#fff",
                  fontSize: 24,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}>+</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {tasks.map((t) => (
                <div
                  key={t.id}
                  onClick={() => toggleTask(t.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px 14px",
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.05)",
                    borderRadius: 2,
                    cursor: "pointer",
                  }}
                >
                  <div style={{
                    width: 18, height: 18, borderRadius: 2,
                    border: t.done ? "none" : "1px solid rgba(255,255,255,0.2)",
                    background: t.done ? "#6366f1" : "transparent",
                    flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 13, color: "#fff",
                  }}>{t.done ? "✓" : ""}</div>
                  <span style={{
                    fontSize: 15,
                    color: t.done ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.7)",
                    flex: 1,
                    textDecoration: t.done ? "line-through" : "none",
                  }}>{t.text}</span>
                  {t.resurfaced && (
                    <span style={{
                      fontSize: 11, letterSpacing: "1px",
                      color: "#f59e0b", background: "rgba(245,158,11,0.1)",
                      border: "1px solid rgba(245,158,11,0.2)",
                      padding: "2px 8px", borderRadius: 2,
                    }}>↑ RESURFACE</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div style={{ padding: "28px 28px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ fontSize: 13, letterSpacing: "2px", color: "rgba(255,255,255,0.25)", marginBottom: 20 }}>
              QUICK STATS
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              {[
                { label: "FOCUS SCORE", value: isRunning ? focusScore : "—" },
                { label: "SESSIONS", value: "0" },
                { label: "AVG TIME", value: "—" },
              ].map((s) => (
                <div key={s.label} style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 2,
                  padding: "16px 12px",
                }}>
                  <div style={{ fontSize: 26, fontWeight: 700, color: "#fff", marginBottom: 6 }}>{s.value}</div>
                  <div style={{ fontSize: 11, letterSpacing: "1.5px", color: "rgba(255,255,255,0.25)" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Insights */}
          <div style={{ padding: "28px 28px" }}>
            <div style={{ fontSize: 13, letterSpacing: "2px", color: "rgba(255,255,255,0.25)", marginBottom: 20 }}>
              AI INSIGHTS
            </div>
            <div style={{
              borderLeft: "2px solid #6366f1",
              paddingLeft: 16,
              background: "rgba(99,102,241,0.04)",
              padding: "18px 16px",
              borderRadius: "0 2px 2px 0",
            }}>
              <div style={{ fontSize: 13, letterSpacing: "1.5px", color: "#6366f1", marginBottom: 10 }}>
                FOCUSFLOW AI
              </div>
              <div style={{ fontSize: 15, color: "rgba(255,255,255,0.4)", lineHeight: 1.8, fontStyle: "italic" }}>
                {aiSummary || "Complete a session to generate your personalized focus analysis."}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
