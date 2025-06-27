import { Link } from 'react-router-dom';
import {
  Home,
  PlusCircle,
  LayoutDashboard,
  User,
  Settings,
  LogOut,
  Search,
  Sun,
  Moon,
} from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved) setTheme(saved);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  return (

    <nav className="bg-black text-white w-full">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3 space-x-4">
        <div className="flex items-center space-x-2 whitespace-nowrap">
          <img src="/favicon.svg" alt="logo" className="w-6 h-6" />
          <span className="font-bold">AI-PrescripSafe</span>
        </div>
        <div className="flex-1 max-w-md hidden sm:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search medications or news..."
              className="w-full bg-gray-800 rounded text-sm pl-8 pr-3 py-2 placeholder-gray-400 focus:outline-none"
            />
          </div>
        </div>
        <div className="flex items-center space-x-4 text-sm">
          <Link to="/" className="flex items-center gap-1 hover:text-pink-400 transition">
            <Home className="w-5 h-5" />
            <span className="hidden sm:inline">Home</span>
          </Link>
          <Link to="/new" className="flex items-center gap-1 hover:text-pink-400 transition">
            <PlusCircle className="w-5 h-5" />
            <span className="hidden sm:inline">New</span>
          </Link>
          <Link to="/dashboard" className="flex items-center gap-1 hover:text-pink-400 transition">
            <LayoutDashboard className="w-5 h-5" />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>
          <Link to="/profile" className="flex items-center gap-1 hover:text-pink-400 transition">
            <User className="w-5 h-5" />
            <span className="hidden sm:inline">Profile</span>
          </Link>
          <Link to="/settings" className="flex items-center gap-1 hover:text-pink-400 transition">
            <Settings className="w-5 h-5" />
            <span className="hidden sm:inline">Settings</span>
          </Link>
          <Link to="/logout" className="flex items-center gap-1 hover:text-pink-400 transition">
            <LogOut className="w-5 h-5" />
            <span className="hidden sm:inline">Logout</span>
          </Link>
          <button onClick={toggleTheme} className="flex items-center gap-1 hover:text-pink-400 transition">
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

        </div>
      </div>
    </nav>
  );
}
