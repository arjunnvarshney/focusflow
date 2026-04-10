import { useState, useEffect } from 'react';
import axios from 'axios';
import { Check, X, Plus, Repeat } from 'lucide-react';

const API_URL = 'http://localhost:8000';

export default function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [resurfacedTasks, setResurfacedTasks] = useState([]);

  const fetchTasks = async () => {
    try {
      const [resAll, resResurfaced] = await Promise.all([
        axios.get(`${API_URL}/tasks/`),
        axios.get(`${API_URL}/tasks/resurface`)
      ]);
      setTasks(resAll.data.filter(t => t.status !== 'done'));
      setResurfacedTasks(resResurfaced.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    
    const title = newTask.trim();
    const tempTask = { id: Date.now(), title, status: 'pending', fail_count: 0 };
    
    setTasks(prev => [...prev, tempTask]);
    setNewTask('');
    
    try {
      await axios.post(`${API_URL}/tasks/`, { title });
      fetchTasks();
    } catch (err) {
      console.error(err);
      fetchTasks();
    }
  };

  const handleUpdateStatus = async (id, status) => {
    if (status === 'done') {
      setTasks(prev => prev.filter(t => t.id !== id));
    } else {
      setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
    }
    try {
      await axios.put(`${API_URL}/tasks/${id}`, { status });
      fetchTasks();
    } catch (err) {
      console.error(err);
      fetchTasks();
    }
  };

  const isResurfaced = (id) => resurfacedTasks.some(t => t.id === id);

  return (
    <div className="flex flex-col h-full relative">
      <h3 className="text-[11px] font-bold text-white/40 tracking-widest uppercase mb-4 flex justify-between items-center">
        <span>Active Objectives</span>
        <span className="text-white/60">{tasks.length} pending</span>
      </h3>
      
      <form onSubmit={handleCreate} className="mb-4 relative group">
        <input
          type="text"
          value={newTask}
          onChange={e => setNewTask(e.target.value)}
          placeholder="Declare intention..."
          className="w-full bg-transparent border-b border-white/20 pb-3 text-[15px] font-medium text-white focus:outline-none focus:border-indigo-500 transition-colors placeholder-white/30"
        />
        <button type="submit" className="absolute right-0 top-0 bottom-3 text-white/30 hover:text-white transition-colors">
          <Plus size={20} />
        </button>
      </form>

      <div className="flex-1 space-y-0 text-sm">
        {tasks.map((task, i) => (
          <div 
            key={task.id} 
            className={`group/task relative border-b border-white/5 py-4 transition-all flex items-start gap-4 ${task.status === 'incomplete' ? 'bg-red-500/5 -mx-4 px-4 border-red-500/20' : ''}`}
          >
            <button 
              onClick={() => handleUpdateStatus(task.id, 'done')}
              className="mt-0.5 w-5 h-5 flex items-center justify-center text-transparent hover:text-green-400 transition-colors flex-shrink-0 border border-white/20 rounded hover:border-green-400"
            >
              <Check size={14} strokeWidth={3} />
            </button>
            
            <div className={`flex-1 font-medium ${task.status === 'incomplete' ? 'text-red-100' : 'text-white/80'}`}>
              {task.title}
              <div className="flex gap-2 mt-2">
                {isResurfaced(task.id) && (
                  <span className="text-[10px] uppercase font-bold tracking-widest text-amber-500 flex items-center gap-1">
                    <Repeat size={10} /> Escaping Focus
                  </span>
                )}
                {task.status === 'incomplete' && (
                  <span className="text-[10px] uppercase font-bold tracking-widest text-red-400">
                    Slipped
                  </span>
                )}
              </div>
            </div>
            
            <button 
              onClick={() => handleUpdateStatus(task.id, 'incomplete')}
              className="opacity-0 group-hover/task:opacity-100 text-white/30 hover:text-red-400 transition-colors flex-shrink-0"
            >
              <X size={16} />
            </button>
          </div>
        ))}
        {tasks.length === 0 && (
          <div className="text-white/30 text-[13px] py-4 italic">No pending objectives.</div>
        )}
      </div>
    </div>
  );
}
