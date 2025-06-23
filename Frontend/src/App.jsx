import { useState } from 'react';
import Navbar from './components/Navbar';
import TrendingBanner from './components/TrendingBanner';
import NewPrescription from './components/NewPrescription';
import Footer from './components/footer';
import AppRouter from './router';

export default function App() {
  const [showNew, setShowNew] = useState(false);

  return (
    <div className="flex flex-col min-h-screen text-gray-800 w-full">
      <Navbar onNew={() => setShowNew(true)} />
      <TrendingBanner />
      <main className="flex-grow max-w-7xl mx-auto px-4 py-6 w-full">
        <AppRouter />
      </main>
      <Footer />
      <NewPrescription isOpen={showNew} onClose={() => setShowNew(false)} />
    </div>
  );
}
