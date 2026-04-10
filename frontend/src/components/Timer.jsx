import { useState, useEffect, useRef } from 'react';
import { Play, Square, Music, Volume2, VolumeX } from 'lucide-react';

const AUDIO_STREAMS = [
  { name: 'Rain', url: 'https://cdn.freesound.org/previews/538/538743_5583272-lq.mp3' },
  { name: 'Focus Noise', url: 'https://cdn.freesound.org/previews/410/410291_6424074-lq.mp3' }
];

export default function Timer({ tracker, onSummary }) {
  const [seconds, setSeconds] = useState(0);
  const [audioIndex, setAudioIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);
  
  const [logs, setLogs] = useState([{ time: new Date(), msg: 'System initialized. Ready.' }]);

  const addLog = (msg) => {
    setLogs(prev => [...prev.slice(-3), { time: new Date(), msg }]);
  };

  useEffect(() => {
    if (tracker.sessionId) {
      addLog(`Session started tracking [STATE: ${tracker.state}]`);
    } else {
      addLog('Session stopped. Idle.');
    }
  }, [tracker.sessionId]);

  useEffect(() => {
    if (tracker.sessionId) {
      addLog(`State transition -> ${tracker.state}`);
    }
  }, [tracker.state]);

  useEffect(() => {
    let interval = null;
    if (tracker.sessionId) {
      interval = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    } else {
      setSeconds(0);
    }
    return () => clearInterval(interval);
  }, [tracker.sessionId]);

  useEffect(() => {
    if (tracker.strictViolation) {
      addLog('CRITICAL: Strict mode violation detected.');
      const ping = new Audio('https://cdn.freesound.org/previews/337/337049_3232293-lq.mp3');
      ping.play().catch(e => console.log(e));
    }
  }, [tracker.strictViolation]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(err => {
          console.error("Audio playback failed:", err);
          setIsPlaying(false);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, audioIndex]);

  const toggleAudio = () => {
    if (audioIndex === -1) {
      setAudioIndex(0);
      setIsPlaying(true);
      addLog(`Audio stream connected: ${AUDIO_STREAMS[0].name}`);
    } else {
      setIsPlaying(!isPlaying);
      addLog(`Audio stream ${!isPlaying ? 'resumed' : 'paused'}.`);
    }
  };

  const nextAudio = () => {
    const nextIdx = (audioIndex + 1) % AUDIO_STREAMS.length;
    setAudioIndex(nextIdx);
    setIsPlaying(true);
    addLog(`Audio stream switched: ${AUDIO_STREAMS[nextIdx].name}`);
  };

  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStateColorClass = (state) => {
    switch (state) {
      case 'ACTIVE': return "bg-green-500";
      case 'DISTRACTED': return "bg-red-500 animate-pulse";
      case 'RECOVERING': return "bg-amber-500";
      default: return "bg-white/20";
    }
  };

  const handleEnd = async () => {
    const sum = await tracker.endSession();
    if (sum) {
      onSummary(sum);
    }
    setIsPlaying(false);
  };

  return (
    <div className={`w-full flex justify-center flex-col min-h-[600px] relative transition-all duration-300`}>
      <audio 
        ref={audioRef} 
        src={audioIndex >= 0 ? AUDIO_STREAMS[audioIndex].url : ''} 
        loop 
        preload="auto"
      />

      {/* Top Left Badge */}
      <div className="absolute top-0 left-0 flex items-center gap-2">
        <div className={`w-2.5 h-2.5 rounded-full ${getStateColorClass(tracker.sessionId ? tracker.state : 'IDLE')}`}></div>
        <span className="text-[11px] font-bold text-white/50 tracking-widest uppercase">
          {tracker.sessionId ? tracker.state : 'IDLE'}
        </span>
      </div>

      {/* Center Row: Timer & Main Actions */}
      <div className="flex flex-col items-center justify-center flex-1 w-full relative z-10 py-12">
        <div className={`text-[150px] sm:text-[180px] md:text-[220px] leading-[0.8] font-bold font-sans tracking-tight tabular-nums mb-12 ${tracker.strictViolation && tracker.sessionId ? 'text-red-500 opacity-90' : 'text-white'}`}>
          {formatTime(seconds)}
        </div>

        <div className="flex flex-col items-center gap-10">
          <div className="flex items-center gap-4">
            {!tracker.sessionId ? (
              <button
                onClick={tracker.startSession}
                className="premium-btn px-8 py-3.5 rounded-md font-bold text-sm tracking-wide"
              >
                START FOCUS
              </button>
            ) : (
              <button
                onClick={handleEnd}
                className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 hover:border-red-500/40 px-8 py-3.5 rounded-md font-bold text-sm tracking-wide transition-all"
              >
                TERMINATE
              </button>
            )}

            {/* Minimal Audio Controls inline */}
            <div className="flex items-center gap-1">
              <button 
                onClick={toggleAudio}
                className="h-12 w-12 flex items-center justify-center rounded-md hover:bg-white/5 text-white/40 hover:text-white transition-colors"
              >
                {isPlaying ? <Volume2 size={18} /> : <VolumeX size={18} />}
              </button>
              {(audioIndex >= 0) && (
                <button 
                  onClick={nextAudio}
                  className="px-3 h-12 flex items-center justify-center rounded-md hover:bg-white/5 text-[11px] font-bold tracking-widest uppercase text-white/40 hover:text-white transition-colors gap-2"
                >
                  <Music size={14} className="text-indigo-500" />
                  {AUDIO_STREAMS[audioIndex].name}
                </button>
              )}
            </div>
          </div>

          <div className="flex gap-8 text-[12px] uppercase font-bold tracking-widest text-white/30 border-t border-white/5 pt-8 min-w-[300px] justify-center">
            <div className="flex gap-2">
              <span>Distractions:</span>
              <span className="text-white/80 font-mono">{tracker.sessionId ? tracker.distractions : '—'}</span>
            </div>
            <div className="flex gap-2">
              <span>Focus Score:</span>
              <span className="text-white/80 font-mono">—</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Raw Event Log */}
      <div className="absolute bottom-0 left-0 border-t border-white/5 pt-6 w-full text-[11px] font-mono text-white/30 space-y-2 pb-2">
        <div className="text-white/20 uppercase tracking-widest font-bold mb-4 font-sans text-[10px]">System Event Log</div>
        {logs.map((log, i) => (
          <div key={i} className="flex gap-4">
            <span className="opacity-50">[{log.time.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' })}]</span>
            <span className={log.msg.includes('DISTRACTED') || log.msg.includes('CRITICAL') ? 'text-red-400' : 'text-white/60'}>{log.msg}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
