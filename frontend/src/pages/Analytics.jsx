import { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import Navbar from '../components/Navbar';
import { Flame, Clock, Trophy } from 'lucide-react';

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
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 md:p-8 space-y-8">
        <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-surface border border-white/5 p-6 rounded-3xl flex items-center gap-6 shadow-xl">
            <div className="w-16 h-16 rounded-2xl bg-orange-500/20 text-orange-500 flex items-center justify-center flex-shrink-0">
              <Flame size={32} />
            </div>
            <div>
              <div className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-1">Current Streak</div>
              <div className="text-3xl font-black">{streak} Day{streak !== 1 ? 's' : ''}</div>
            </div>
          </div>
          
          <div className="bg-surface border border-white/5 p-6 rounded-3xl flex items-center gap-6 shadow-xl">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center flex-shrink-0">
              <Trophy size={32} />
            </div>
            <div>
              <div className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-1">Best Focus Hour</div>
              <div className="text-3xl font-black">{bestHour.hour}</div>
              <div className="text-xs text-indigo-400 font-medium mt-1">Avg Score: {bestHour.score}</div>
            </div>
          </div>

          <div className="bg-surface border border-white/5 p-6 rounded-3xl flex flex-col justify-center gap-2 shadow-xl md:col-span-2 lg:col-span-1">
            <div className="flex justify-between items-end mb-1">
              <div>
                <div className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-1">Focus Rank: {gamification.rank}</div>
                <div className="text-3xl font-black">Level {gamification.level}</div>
              </div>
              <div className="text-xs text-purple-400 font-bold bg-purple-500/10 px-2 py-1 rounded-lg">
                {gamification.xp} XP
              </div>
            </div>
            
            <div className="w-full bg-white/5 rounded-full h-3 mt-2 overflow-hidden border border-white/5">
              <div 
                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all duration-1000 ease-out" 
                style={{ width: `${gamification.progress}%` }}
              ></div>
            </div>
            <div className="text-[10px] text-white/40 text-right font-bold tracking-wider mt-1">
              {gamification.next_level_xp - gamification.xp} XP TO NEXT LEVEL
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-surface border border-white/5 p-8 rounded-3xl shadow-xl">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              Focus Score Trend
              <span className="text-sm font-medium text-white/40 block ml-auto">Last 7 Days</span>
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyData}>
                  <XAxis dataKey="date" stroke="#ffffff40" fontSize={12} tickMargin={10} axisLine={false} tickLine={false} />
                  <YAxis stroke="#ffffff40" fontSize={12} tickMargin={10} axisLine={false} tickLine={false} domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e1e1e', borderColor: '#ffffff1a', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#6366f1" 
                    strokeWidth={4}
                    dot={{ fill: '#1e1e1e', stroke: '#6366f1', strokeWidth: 3, r: 6 }} 
                    activeDot={{ r: 8, strokeWidth: 0, fill: '#818cf8' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-surface border border-white/5 p-8 rounded-3xl shadow-xl">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              Activity Heatmap
              <span className="text-sm font-medium text-white/40 block ml-auto">Hourly Distribution</span>
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={heatmapData}>
                  <XAxis dataKey="hour" stroke="#ffffff40" fontSize={12} tickMargin={10} axisLine={false} tickLine={false} />
                  <YAxis stroke="#ffffff40" fontSize={12} tickMargin={10} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e1e1e', borderColor: '#ffffff1a', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff' }}
                    cursor={{ fill: '#ffffff0a' }}
                  />
                  <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
