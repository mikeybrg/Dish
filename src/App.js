import { useState } from 'react';
import Home from './pages/Home';
import Scan from './pages/Scan';
import Explore from './pages/Explore';
import Recipes from './pages/Recipes';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import Community from './pages/Community';

// ─────────────────────────────────────────
const ANTHROPIC_API_KEY = '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';
// ─────────────────────────────────────────

const NAV = ['Home', 'Scan', 'Explore', 'Recipes', 'Chat', 'Profile', 'Community'];

export default function App() {
  const [page, setPage] = useState('Home');

  return (
    <div className="min-h-screen text-white" style={{ backgroundColor: '#0a0a0a' }}>
      <nav className="sticky top-0 z-50 border-b border-white/5 backdrop-blur-md" style={{ backgroundColor: 'rgba(10,10,10,0.9)' }}>
        <div className="max-w-[1200px] mx-auto px-8 flex items-center justify-between h-16">
          <button onClick={() => setPage('Home')} className="text-xl font-bold text-orange-500 tracking-tight">
            dish
          </button>
          <div className="flex gap-1">
            {NAV.map(id => (
              <button
                key={id}
                onClick={() => setPage(id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  page === id ? 'bg-orange-500 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {id}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {page === 'Home'      && <Home onNavigate={setPage} />}
      {page === 'Scan'      && <Scan apiKey={ANTHROPIC_API_KEY} onNavigate={setPage} />}
      {page === 'Explore'   && <Explore apiKey={ANTHROPIC_API_KEY} onNavigate={setPage} />}
      {page === 'Recipes'   && <Recipes apiKey={ANTHROPIC_API_KEY} />}
      {page === 'Chat'      && <Chat apiKey={ANTHROPIC_API_KEY} />}
      {page === 'Profile'   && <Profile />}
      {page === 'Community' && <Community />}
    </div>
  );
}
