import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import Navbar from '../components/Navbar';
import ParticleBackground from '../components/ParticleBackground';
import { Flame, Clock, Trophy, Zap, Activity, Target } from 'lucide-react';

const API_URL = 'http://localhost:8000';

export default function Analytics() {
  const [dailyData, setDailyData] = useState([]);
  const [heatmapData, setHeatmapData] = useState([]);
  const [streak, setStreak] = useState(0);
  const [bestHour, setBestHour] = useState({ hour: 'N/A', score: 0 });
  const [gamification, setGamification] = useState({ xp: 0, level: 1, rank: 'Novice', next_level_xp: 100, progress: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dailyRes, heatmapRes, streakRes, hourRes, gameRes] = await Promise.all([
          axios.get(`${API_URL}/analytics/daily`),
          axios.get(`${API_URL}/analytics/heatmap`),
          axios.get(`${API_URL}/analytics/streak`),
          axios.get(`${API_URL}/analytics/best-hour`),
          axios.get(`${API_URL}/analytics/gamification`)
        ]);
        
        setDailyData(dailyRes.data);
        setHeatmapData(heatmapRes.data);
        setStreak(streakRes.data.streak);
        setBestHour(hourRes.data);
        setGamification(gameRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  return (
    <div style={{
      background: "#050505",
      minHeight: "100vh",
      color: "#fff",
      fontFamily: "'DM Mono', monospace",
      display: "flex",
      flexDirection: "column",
      overflowX: "hidden"
    }}>
      <ParticleBackground />
      <Navbar />

      <main style={{ 
        flex: 1, 
        maxWidth: "1200px", 
        width: "100%", 
        margin: "0 auto", 
        padding: "64px 48px", 
        zIndex: 10,
        position: "relative"
      }}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: 64 }}
        >
          <div style={{ fontSize: 11, letterSpacing: "5px", color: "rgba(255,255,255,0.2)", fontWeight: 800, marginBottom: 16 }}>COGNITIVE PERFORMANCE</div>
          <h1 style={{ fontSize: 44, fontWeight: 800, letterSpacing: "-2px" }}>Analytics Engine</h1>
        </motion.div>
        
        {/* Top Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24, marginBottom: 48 }}>
          {[
            { label: "FOCUS STREAK", value: `${streak} DAYS`, icon: <Flame size={24} />, color: "#f59e0b" },
            { label: "PEAK EFFICIENCY", value: bestHour.hour, icon: <Zap size={24} />, color: "#6366f1", sub: `Score: ${bestHour.score}` },
            { label: "CURRENT RANK", value: gamification.rank, icon: <Trophy size={24} />, color: "#22c55e", sub: `LEVEL ${gamification.level}` }
          ].map((card, i) => (
            <motion.div 
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.04)",
                padding: "32px",
                borderRadius: 12,
                display: "flex",
                flexDirection: "column",
                gap: 16,
                backdropFilter: "blur(10px)"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ color: card.color }}>{card.icon}</div>
                <div style={{ fontSize: 10, letterSpacing: "2px", fontWeight: 800, color: "rgba(255,255,255,0.2)" }}>{card.label}</div>
              </div>
              <div>
                <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-1px" }}>{card.value}</div>
                {card.sub && <div style={{ fontSize: 12, color: card.color, fontWeight: 700, marginTop: 4 }}>{card.sub}</div>}
              </div>
            </motion.div>
          ))}
        </div>

        {/* LVL Progress */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          style={{
            background: "rgba(99,102,241,0.02)",
            border: "1px solid rgba(99,102,241,0.1)",
            padding: "32px",
            borderRadius: 12,
            marginBottom: 48,
            backdropFilter: "blur(10px)"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 16 }}>
             <div>
               <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "2px", color: "#6366f1", marginBottom: 8 }}>PROGRESSION PATH</div>
               <div style={{ fontSize: 24, fontWeight: 800 }}>Leveling Up to {gamification.level + 1}</div>
             </div>
             <div style={{ fontSize: 14, fontWeight: 800, color: "#6366f1" }}>{gamification.xp} / {gamification.next_level_xp} XP</div>
          </div>
          <div style={{ width: "100%", height: 8, background: "rgba(255,255,255,0.05)", borderRadius: 4, overflow: "hidden" }}>
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${gamification.progress}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              style={{ height: "100%", background: "linear-gradient(90deg, #6366f1, #a855f7)", borderRadius: 4 }}
            />
          </div>
        </motion.div>

        {/* Charts */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
          <div style={{ background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.03)", padding: "40px", borderRadius: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
              <Activity size={18} color="#6366f1" />
              <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: "1px" }}>FOCUS SCORE TREND</div>
            </div>
            <div style={{ h: 300, width: "100%" }}>
               <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={dailyData}>
                    <XAxis dataKey="date" hide />
                    <YAxis hide domain={[0, 100]} />
                    <Tooltip contentStyle={{ background: "#0c0c0c", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
                    <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={4} dot={{ r: 4, fill: "#6366f1" }} activeDot={{ r: 8, fill: "#fff" }} />
                  </LineChart>
               </ResponsiveContainer>
            </div>
          </div>

          <div style={{ background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.03)", padding: "40px", borderRadius: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
              <Target size={18} color="#22c55e" />
              <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: "1px" }}>HOURLY DISTRIBUTION</div>
            </div>
            <div style={{ h: 300, width: "100%" }}>
               <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={heatmapData}>
                    <XAxis dataKey="hour" hide />
                    <YAxis hide />
                    <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ background: "#0c0c0c", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {heatmapData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#6366f1" : "#4f46e5"} />
                      ))}
                    </Bar>
                  </BarChart>
               </ResponsiveContainer>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
