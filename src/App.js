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

const NAV = ['Home', 'Scan', 'Recipes', 'Chat', 'Community'];

export default function App() {
  const [page, setPage] = useState('Home');

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F8F8F6', color: '#1A1A1A' }}>
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-[1200px] mx-auto px-8 flex items-center justify-between h-16">
          <button onClick={() => setPage('Home')} className="text-xl font-bold tracking-tight flex items-center gap-2" style={{ color: '#2D6A4F' }}>
            👨‍🍳 Apron AI
          </button>

          <div className="flex items-center gap-1">
            {NAV.map(id => (
              <button
                key={id}
                onClick={() => setPage(id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  page === id
                    ? 'text-white'
                    : 'text-gray-500 hover:text-[#1A1A1A] hover:bg-gray-100'
                }`}
                style={page === id ? { backgroundColor: '#2D6A4F' } : {}}
              >
                {id}
              </button>
            ))}

            {/* Profile avatar */}
            <button
              onClick={() => setPage('Profile')}
              className="ml-2 w-9 h-9 rounded-full flex items-center justify-center text-white text-base transition-all hover:opacity-80"
              style={{ backgroundColor: page === 'Profile' ? '#245a42' : '#2D6A4F' }}
              title="Profile"
            >
              👤
            </button>
          </div>
        </div>
      </nav>

      {page === 'Home'      && <Home onNavigate={setPage} />}
      {page === 'Scan'      && <Scan apiKey={ANTHROPIC_API_KEY} onNavigate={setPage} />}
      {page === 'Recipes'   && <Recipes apiKey={ANTHROPIC_API_KEY} />}
      {page === 'Explore'   && <Explore apiKey={ANTHROPIC_API_KEY} onNavigate={setPage} />}
      {page === 'Chat'      && <Chat apiKey={ANTHROPIC_API_KEY} />}
      {page === 'Profile'   && <Profile />}
      {page === 'Community' && <Community />}
    </div>
  );
}
