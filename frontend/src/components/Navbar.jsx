import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="bg-[#0a0a0a] px-8 py-5 flex items-center z-50">
      <div className="w-full flex justify-between items-center max-w-[1200px] mx-auto">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-indigo-500"></div>
          <span className="text-[17px] font-medium tracking-tight text-white mb-px">FocusFlow</span>
        </Link>
        <div className="flex gap-8 text-[13px] font-semibold tracking-wider">
          <Link to="/" className="text-white hover:text-indigo-400 transition-colors">HOME</Link>
          <Link to="/analytics" className="text-white/40 hover:text-white transition-colors">ANALYTICS</Link>
        </div>
      </div>
    </nav>
  );
}
