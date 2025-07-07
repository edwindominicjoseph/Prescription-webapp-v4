// src/App.jsx
import Navbar from './components/Navbar';
import NewsTicker from './components/NewsTicker';
import Chatbot from './components/Chatbot';
import Footer from './components/footer';
import AppRouter from './router';
import { useLocation } from 'react-router-dom';

export default function App() {
  const location = useLocation();
  const isLogin = location.pathname === '/login';

  return (
    <div className="flex flex-col min-h-screen text-gray-200 w-full">
      {!isLogin && <Navbar />}
      {!isLogin && <NewsTicker />}
      <main
        className={`flex-grow w-full ${
          isLogin ? '' : 'max-w-7xl mx-auto px-4 py-6'
        }`}
      >
        <AppRouter />
      </main>
      <Footer />
      <Chatbot />
    </div>
  );
}
