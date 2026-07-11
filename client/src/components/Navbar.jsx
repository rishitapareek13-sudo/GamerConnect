import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex items-center justify-between px-6 py-3 border-b border-shell-border">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 bg-accent" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 70%, 70% 100%, 0 100%)' }} />
        <span className="text-text-onDark font-display font-semibold text-lg tracking-wide">
          GAMERCONNECT
        </span>
      </div>

      <div className="flex items-center gap-6">
        <Link to="/dashboard" className="text-text-onDarkMuted text-sm hover:text-text-onDark">
          Dashboard
        </Link>
        <Link to="/find-teammates" className="text-text-onDarkMuted text-sm hover:text-text-onDark">
          Find teammates
        </Link>
        <Link to="/my-teams" className="text-text-onDarkMuted text-sm hover:text-text-onDark">
          Teams
        </Link>
        <Link to="/profile" className="text-text-onDarkMuted text-sm hover:text-text-onDark">
        Profile
        </Link>
        <Link to="/my-requests" className="text-text-onDarkMuted text-sm hover:text-text-onDark">
         Requests
        </Link>

        <div className="flex items-center gap-2 bg-shell-panel px-3 py-1.5 clip-hud">
          <div className="w-5 h-5 bg-accent-soft border border-accent flex items-center justify-center text-accent text-[10px] font-mono">
            {user?.username?.slice(0, 2).toUpperCase()}
          </div>
          <span className="text-text-onDark text-xs">{user?.username}</span>
        </div>

        <button onClick={handleLogout} className="text-text-onDarkMuted text-sm hover:text-red-400">
          Logout
        </button>
      </div>
    </div>
  );
}