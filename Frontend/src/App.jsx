// src/App.jsx
import Navbar from './components/Navbar';
import Footer from './components/footer';
import AppRouter from './router';

export default function App() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100  text-gray-800 font-sans antialiased w-full">
      <Navbar />
      <main className="flex-grow">
        <AppRouter />
      </main>
      <Footer />
    </div>
  );
}
