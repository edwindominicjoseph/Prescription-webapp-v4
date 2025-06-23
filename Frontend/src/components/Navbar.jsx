import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Home, PlusCircle, Flag, User, Settings, LogOut, Search } from 'lucide-react';

export default function Navbar({ onNew }) {
  const navigate = useNavigate();
  const location = useLocation();

  const linkClass = (path) =>
    location.pathname === path
      ? 'text-white'
      : 'text-white/80 hover:text-white';

  return (
    <nav className="bg-black text-white sticky top-0 z-50 w-full">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <span className="text-pink-500 text-lg">💊</span>
          AI-PrescripSafe
        </div>
        <div className="hidden sm:block flex-1 mx-4">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search medications or news..."
              className="w-full bg-gray-800 text-sm rounded pl-8 pr-2 py-2 focus:outline-none"
            />
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <Link to="/" className={linkClass('/') + ' flex items-center gap-1'}>
            <Home className="w-5 h-5" />
            <span className="hidden md:inline">Home</span>
          </Link>
          <button onClick={onNew} className="flex items-center gap-1 hover:text-white">
            <PlusCircle className="w-5 h-5" />
            <span className="hidden md:inline">New</span>
          </button>
          <Link to="/flagged" className={linkClass('/flagged') + ' flex items-center gap-1'}>
            <Flag className="w-5 h-5" />
            <span className="hidden md:inline">Flagged</span>
          </Link>
          <Link to="/profile" className={linkClass('/profile') + ' flex items-center gap-1'}>
            <User className="w-5 h-5" />
            <span className="hidden md:inline">Profile</span>
          </Link>
          <Link to="/settings" className={linkClass('/settings') + ' flex items-center gap-1'}>
            <Settings className="w-5 h-5" />
            <span className="hidden md:inline">Settings</span>
          </Link>
          <button
            onClick={() => navigate('/login')}
            className="flex items-center gap-1 text-white/80 hover:text-white"
          >
            <LogOut className="w-5 h-5" />
            <span className="hidden md:inline">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
