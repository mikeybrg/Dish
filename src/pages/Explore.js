import { useState, useEffect } from 'react';
import RecipeGuide from '../components/RecipeGuide';

const FILTERS = ['All', 'Quick', 'Easy', 'Healthy', 'High Protein', 'Budget'];

const MEALS = [
  { id: 1,  name: 'Pasta Carbonara',       difficulty: 'Medium', time: '20 min', tags: ['Budget'] },
  { id: 2,  name: 'Upgraded Ramen',        difficulty: 'Easy',   time: '10 min', tags: ['Quick', 'Easy', 'Budget'] },
  { id: 3,  name: 'Avocado Toast',         difficulty: 'Easy',   time: '5 min',  tags: ['Quick', 'Easy', 'Healthy'] },
  { id: 4,  name: 'Fried Rice',            difficulty: 'Easy',   time: '15 min', tags: ['Quick', 'Easy', 'Budget'] },
  { id: 5,  name: 'Grilled Cheese',        difficulty: 'Easy',   time: '8 min',  tags: ['Quick', 'Easy', 'Budget'] },
  { id: 6,  name: 'Chicken Quesadilla',    difficulty: 'Easy',   time: '12 min', tags: ['Quick', 'Easy', 'High Protein'] },
  { id: 7,  name: 'Beef Stir Fry',         difficulty: 'Medium', time: '20 min', tags: ['High Protein'] },
  { id: 8,  name: 'Scrambled Eggs',        difficulty: 'Easy',   time: '5 min',  tags: ['Quick', 'Easy', 'High Protein'] },
  { id: 9,  name: 'Homemade Mac & Cheese', difficulty: 'Easy',   time: '25 min', tags: ['Easy', 'Budget'] },
  { id: 10, name: 'Burrito Bowl',          difficulty: 'Medium', time: '30 min', tags: ['Healthy', 'High Protein'] },
  { id: 11, name: 'Pesto Pasta',           difficulty: 'Easy',   time: '15 min', tags: ['Quick', 'Easy'] },
  { id: 12, name: 'Tuna Melt',             difficulty: 'Easy',   time: '10 min', tags: ['Quick', 'High Protein', 'Budget'] },
  { id: 13, name: 'Smoothie Bowl',         difficulty: 'Easy',   time: '5 min',  tags: ['Quick', 'Easy', 'Healthy'] },
  { id: 14, name: 'Chicken Tikka',         difficulty: 'Hard',   time: '45 min', tags: ['High Protein'] },
  { id: 15, name: 'BLT Sandwich',          difficulty: 'Easy',   time: '8 min',  tags: ['Quick', 'Easy', 'Budget'] },
  { id: 16, name: 'Overnight Oats',        difficulty: 'Easy',   time: '5 min',  tags: ['Quick', 'Easy', 'Healthy'] },
  { id: 17, name: 'Pan Seared Steak',      difficulty: 'Hard',   time: '20 min', tags: ['High Protein'] },
  { id: 18, name: 'Niçoise Salad',         difficulty: 'Medium', time: '25 min', tags: ['Healthy', 'High Protein'] },
  { id: 19, name: 'Banana Pancakes',       difficulty: 'Easy',   time: '15 min', tags: ['Easy', 'Healthy', 'Budget'] },
  { id: 20, name: 'Tomato Soup',           difficulty: 'Easy',   time: '20 min', tags: ['Easy', 'Healthy', 'Budget'] },
];

const DIFF_COLORS = {
  Easy:   { bg: '#DCFCE7', text: '#15803D', border: '#86EFAC' },
  Medium: { bg: '#FEF9C3', text: '#A16207', border: '#FDE047' },
  Hard:   { bg: '#FEE2E2', text: '#B91C1C', border: '#FCA5A5' },
};

const API_BASE = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3001';

function parseJSON(text) {
  try { return JSON.parse(text); } catch {
    const m = text.match(/\{[\s\S]*\}/);
    if (m) return JSON.parse(m[0]);
    throw new Error('Could not parse response');
  }
}

async function fetchRecipe(apiKey, name) {
  const res = await fetch(`${API_BASE}/api/chat`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `Give a beginner-friendly recipe for "${name}" for a college student. Return ONLY valid JSON, no markdown: {"name":string,"difficulty":"Easy"|"Medium"|"Hard","cookTime":string,"ingredients":string[],"steps":string[]}`,
      }],
    }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return parseJSON(data.content[0].text);
}

function getImageUrl(name) {
  const term = encodeURIComponent(name.toLowerCase().replace(/\s+/g, '+'));
  return `https://source.unsplash.com/400x300/?${term},food`;
}

export default function Explore({ apiKey, onNavigate }) {
  const [filter, setFilter] = useState('All');
  const [modal,  setModal]  = useState(null);
  const [cache,  setCache]  = useState({});

  const filtered = filter === 'All' ? MEALS : MEALS.filter(m => m.tags.includes(filter));

  useEffect(() => {
    const close = (e) => e.key === 'Escape' && setModal(null);
    if (modal) window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [modal]);

  const openMeal = async (meal) => {
    if (cache[meal.id]) {
      setModal({ meal, recipe: cache[meal.id], loading: false, error: null });
      return;
    }
    setModal({ meal, recipe: null, loading: true, error: null });
    try {
      const recipe = await fetchRecipe(apiKey, meal.name);
      setCache(prev => ({ ...prev, [meal.id]: recipe }));
      setModal(prev => prev ? { ...prev, recipe, loading: false } : null);
    } catch {
      setModal(prev => prev ? {
        ...prev, loading: false,
        error: apiKey === 'YOUR_KEY_HERE' ? 'Set your API key in App.js to generate recipes.' : 'Failed to load recipe.',
      } : null);
    }
  };

  const diff = modal?.recipe ? (DIFF_COLORS[modal.recipe.difficulty] || DIFF_COLORS.Medium) : null;

  return (
    <div className="max-w-[1200px] mx-auto px-8 py-16">
      <h1 className="text-4xl font-bold mb-2" style={{ color: '#1A1A1A' }}>Explore Recipes</h1>
      <p className="mb-8" style={{ color: '#6B7280' }}>20 college-friendly meals you can actually make.</p>

      {/* Filters */}
      <div className="flex gap-2 mb-8 flex-wrap">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === f ? 'text-white' : 'border border-gray-200 text-gray-500 hover:text-gray-800 hover:border-gray-300 bg-white'
            }`}
            style={filter === f ? { backgroundColor: '#2D6A4F' } : {}}
          >
            {f}
          </button>
        ))}
        <span className="ml-auto text-sm self-center" style={{ color: '#9CA3AF' }}>{filtered.length} meals</span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-4 gap-4">
        {filtered.map(meal => {
          const d = DIFF_COLORS[meal.difficulty];
          return (
            <button
              key={meal.id}
              onClick={() => openMeal(meal)}
              className="text-left rounded-2xl overflow-hidden border border-gray-200 bg-white hover:border-gray-300 hover:shadow-md transition-all hover:-translate-y-0.5 group shadow-sm"
            >
              <div className="h-36 relative overflow-hidden bg-gray-100">
                <img
                  src={getImageUrl(meal.name)}
                  alt={meal.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={e => { e.currentTarget.style.display = 'none'; }}
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-sm mb-2 truncate" style={{ color: '#1A1A1A' }}>{meal.name}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] px-2 py-0.5 rounded-full font-medium border" style={{ backgroundColor: d.bg, color: d.text, borderColor: d.border }}>
                    {meal.difficulty}
                  </span>
                  <span className="text-[11px]" style={{ color: '#9CA3AF' }}>⏱ {meal.time}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Modal */}
      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm"
          onClick={e => e.target === e.currentTarget && setModal(null)}
        >
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Photo banner */}
            <div className="h-44 relative rounded-t-2xl overflow-hidden bg-gray-100 flex-shrink-0">
              <img
                src={getImageUrl(modal.meal.name)}
                alt={modal.meal.name}
                className="absolute inset-0 w-full h-full object-cover"
                onError={e => { e.currentTarget.style.display = 'none'; }}
              />
              <button
                onClick={() => setModal(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-gray-700 text-lg flex items-center justify-center transition-colors shadow-sm"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              {modal.loading && (
                <div className="py-12 flex flex-col items-center gap-3">
                  <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#2D6A4F', borderTopColor: 'transparent' }} />
                  <p className="text-sm" style={{ color: '#6B7280' }}>Generating recipe...</p>
                </div>
              )}

              {modal.error && (
                <p className="text-sm text-center py-8" style={{ color: '#B91C1C' }}>{modal.error}</p>
              )}

              {modal.recipe && (
                <>
                  {/* Recipe header */}
                  <div className="mb-5">
                    <h2 className="text-2xl font-bold" style={{ color: '#1A1A1A' }}>{modal.recipe.name}</h2>
                    <div className="flex gap-2 mt-2">
                      <span className="text-[11px] px-2.5 py-1 rounded-full font-medium border" style={{ backgroundColor: diff.bg, color: diff.text, borderColor: diff.border }}>
                        {modal.recipe.difficulty}
                      </span>
                      <span className="text-[11px] px-2.5 py-1 rounded-full border border-gray-200 bg-gray-50 text-gray-500">
                        ⏱ {modal.recipe.cookTime}
                      </span>
                    </div>
                  </div>

                  {/* Ingredients */}
                  <div className="p-4 rounded-xl border border-gray-200 bg-gray-50 mb-5">
                    <h3 className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: '#6B7280' }}>Ingredients</h3>
                    <ul className="space-y-1.5">
                      {modal.recipe.ingredients.map((ing, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm" style={{ color: '#374151' }}>
                          <span className="w-1 h-1 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: '#2D6A4F' }} />
                          {ing}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Visual step guide */}
                  <RecipeGuide
                    recipe={modal.recipe}
                    onShare={() => { setModal(null); onNavigate('Profile'); }}
                    compact
                  />
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
