import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import NewPrescription from './pages/NewPrescription';
import FlaggedPrescriptions from './pages/FlaggedPrescriptions';
import Settings from './pages/Settings';
import UserPage from './pages/UserPage';
import Login from './pages/login';

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/new" element={<NewPrescription />} />
      <Route path="/flagged" element={<FlaggedPrescriptions />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/profile" element={<UserPage />} />
        <Route path="/logout" element={<Login />} /> {/* Redirect to Home on logout */}
        <Route path="/login" element={<Login />} />
    </Routes>
  );
}
