// src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // Here, you can add real auth logic
    if (email && password) {
      // Fake auth success → redirect to home
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <form onSubmit={handleLogin} className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md space-y-4">
        <h2 className="text-2xl font-bold text-center text-violet-600">Login</h2>
        <div>
          <label className="block text-sm font-medium text-gray-600">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border px-3 py-2 rounded-md mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-600">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border px-3 py-2 rounded-md mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-violet-600 text-white py-2 rounded-md hover:bg-violet-700 transition"
        >
          Sign In
        </button>
      </form>
    </div>
  );
}
