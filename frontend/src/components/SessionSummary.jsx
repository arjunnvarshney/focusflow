import { Target, Clock, AlertTriangle, Sparkles, X } from 'lucide-react';

export default function SessionSummary({ summary, onClose }) {
  if (!summary) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
      <div className="premium-card w-full max-w-lg p-10 shadow-2xl relative animate-in fade-in zoom-in duration-300">
        <button onClick={onClose} className="absolute top-6 right-6 text-white/40 hover:text-white transition-colors">
          <X size={24} />
        </button>
        
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-[#1a1a1a] text-indigo-500 rounded-2xl flex items-center justify-center mb-4 border border-white/5 shadow-inner">
            <Target size={32} strokeWidth={2.5} />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-[#ededed]">Session Complete</h2>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-[#1a1a1a] p-5 rounded-xl border border-white/5 flex flex-col items-center shadow-sm">
            <Clock className="text-white/40 mb-2" size={20} />
            <div className="text-2xl font-mono font-bold text-[#ededed]">{Math.floor(summary.duration_seconds / 60)}m {summary.duration_seconds % 60}s</div>
            <div className="text-[10px] text-white/50 uppercase tracking-widest font-bold mt-1.5">Duration</div>
          </div>
          
          <div className="bg-[#1a1a1a] p-5 rounded-xl border border-white/5 flex flex-col items-center shadow-sm">
            <AlertTriangle className="text-red-400 mb-2" size={20} />
            <div className="text-2xl font-mono font-bold text-[#ededed]">{summary.distraction_count}</div>
            <div className="text-[10px] text-white/50 uppercase tracking-widest font-bold mt-1.5">Distractions</div>
          </div>
        </div>

        <div className="text-center mb-8">
          <div className="text-[11px] text-white/40 uppercase tracking-widest font-bold mb-3">Focus Score</div>
          <div className="text-7xl font-black font-mono tracking-tighter text-indigo-500 drop-shadow-[0_0_15px_rgba(99,102,241,0.3)]">
            {summary.focus_score}
          </div>
        </div>

        {summary.ai_summary && (
          <div className="bg-[#1a1a1a] p-6 rounded-xl border border-indigo-500/20 relative mt-4">
            <Sparkles className="absolute -top-3 -left-3 text-indigo-400 fill-indigo-500/20 p-1.5 bg-[#0f0f0f] border border-indigo-500/30 rounded-lg shadow-sm" size={32} />
            <p className="text-[14px] font-medium leading-relaxed text-[#ededed]">{summary.ai_summary}</p>
          </div>
        )}

        <div className="flex gap-4 mt-8">
          <button onClick={onClose} className="premium-btn flex-1 py-4 rounded-xl font-bold text-[15px]">
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
