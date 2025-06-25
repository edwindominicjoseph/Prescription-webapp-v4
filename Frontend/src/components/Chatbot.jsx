import { MessageCircle } from 'lucide-react';

export default function Chatbot() {
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="relative group">
        <button className="bg-pink-600 text-white p-3 rounded-full shadow-lg">
          <MessageCircle className="w-6 h-6" />
        </button>
        <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block text-xs bg-gray-800 text-white px-2 py-1 rounded">
          Ask AI about risk levels, patient behavior, or system usage.
        </div>
      </div>
    </div>
  );
}
