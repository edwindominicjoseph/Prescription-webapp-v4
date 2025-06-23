// src/App.jsx
import Navbar from './components/Navbar';
import Footer from './components/footer';
import AppRouter from './router';

export default function App() {
  return (
    <div className="flex flex-col min-h-screen text-gray-200 w-full">
      <Navbar />
      <main className="flex-grow max-w-7xl mx-auto px-4 py-6 w-full">
        <AppRouter />
      </main>
      <Footer />
    </div>
  );
}
