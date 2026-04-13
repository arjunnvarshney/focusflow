import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Navbar() {
  const location = useLocation();
  
  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'center',
      padding: '24px 48px',
      background: 'rgba(5,5,5,0.7)',
      backdropFilter: 'blur(15px)',
      borderBottom: '1px solid rgba(255,255,255,0.03)',
      position: 'relative',
      zIndex: 100
    }}>
      <div style={{
        width: '100%',
        maxWidth: '1200px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.6, 1, 0.6]
            }}
            transition={{ repeat: Infinity, duration: 4 }}
            style={{ width: 8, height: 8, borderRadius: '50%', background: '#6366f1', boxShadow: '0 0 10px #6366f1' }}
          />
          <span style={{ 
            fontSize: '18px', 
            fontWeight: 800, 
            letterSpacing: '-0.5px', 
            color: '#fff',
            fontFamily: "'DM Mono', monospace"
          }}>FocusFlow</span>
        </Link>
        
        <div style={{ display: 'flex', gap: 40 }}>
          {[
            { name: 'HOME', path: '/' },
            { name: 'ANALYTICS', path: '/analytics' }
          ].map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.name}
                to={item.path} 
                style={{ 
                  textDecoration: 'none',
                  fontSize: '11px',
                  fontWeight: 800,
                  letterSpacing: '2px',
                  color: isActive ? '#fff' : 'rgba(255,255,255,0.25)',
                  position: 'relative',
                  padding: '4px 0',
                  transition: 'color 0.3s'
                }}
              >
                {item.name}
                {isActive && (
                  <motion.div 
                    layoutId="nav-underline"
                    style={{
                      position: 'absolute',
                      bottom: -4,
                      left: 0,
                      right: 0,
                      height: 2,
                      background: '#6366f1',
                      borderRadius: 1
                    }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
