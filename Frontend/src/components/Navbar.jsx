import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    // 🔐 Clear tokens or session here if needed
    navigate('/login'); // Redirect to login page
  };

  const linkClass = (path) =>
    location.pathname === path
      ? 'text-violet-600 font-semibold'
      : 'text-gray-700 hover:text-violet-600';

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50 w-full">
      <div className="w-full px-4 py-3 flex justify-between items-center">
        {/* Logo + Brand */}
        <div className="flex items-center space-x-2">
          <img src="https://img.icons8.com/fluency/48/pill.png" alt="pill-icon" className="w-6 h-6" />
          <h1 className="text-xl font-bold text-violet-600">Fraud Detector</h1>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex space-x-6 items-center">
          <Link to="/" className={linkClass('/')}>Home</Link>
          <Link to="/new" className={linkClass('/new')}>New</Link>
          <Link to="/dashboard" className={linkClass('/dashboard')}>Dashboard</Link>
          <Link to="/profile" className={linkClass('/profile')}>Profile</Link>
          <Link to="/settings" className={linkClass('/settings')}>Settings</Link>
          <button onClick={handleLogout} className="text-gray-700 hover:text-red-600">Logout</button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-gray-700"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {isOpen && (
        <div className="md:hidden px-4 pb-4 space-y-2 bg-white">
          <Link to="/" className={linkClass('/')}>Home</Link>
          <Link to="/new" className={linkClass('/new')}>New</Link>
          <Link to="/dashboard" className={linkClass('/dashboard')}>Dashboard</Link>
          <Link to="/profile" className={linkClass('/profile')}>Profile</Link>
          <Link to="/settings" className={linkClass('/settings')}>Settings</Link>
          <button
            onClick={handleLogout}
            className="block text-left w-full text-gray-700 hover:text-red-600"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
