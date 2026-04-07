import { useState, useEffect } from 'react';
import RecipeGuide from '../components/RecipeGuide';

const FILTERS = ['All', 'Quick', 'Easy', 'Healthy', 'High Protein', 'Budget'];

const MEALS = [
  { id: 1,  name: 'Pasta Carbonara',       difficulty: 'Medium', time: '20 min', tags: ['Budget'],                          color: 'from-yellow-600 to-orange-600' },
  { id: 2,  name: 'Upgraded Ramen',        difficulty: 'Easy',   time: '10 min', tags: ['Quick', 'Easy', 'Budget'],         color: 'from-orange-500 to-red-600' },
  { id: 3,  name: 'Avocado Toast',         difficulty: 'Easy',   time: '5 min',  tags: ['Quick', 'Easy', 'Healthy'],        color: 'from-green-500 to-teal-500' },
  { id: 4,  name: 'Fried Rice',            difficulty: 'Easy',   time: '15 min', tags: ['Quick', 'Easy', 'Budget'],         color: 'from-amber-500 to-yellow-600' },
  { id: 5,  name: 'Grilled Cheese',        difficulty: 'Easy',   time: '8 min',  tags: ['Quick', 'Easy', 'Budget'],         color: 'from-yellow-400 to-amber-500' },
  { id: 6,  name: 'Chicken Quesadilla',    difficulty: 'Easy',   time: '12 min', tags: ['Quick', 'Easy', 'High Protein'],   color: 'from-orange-500 to-red-700' },
  { id: 7,  name: 'Beef Stir Fry',         difficulty: 'Medium', time: '20 min', tags: ['High Protein'],                    color: 'from-red-600 to-rose-700' },
  { id: 8,  name: 'Scrambled Eggs',        difficulty: 'Easy',   time: '5 min',  tags: ['Quick', 'Easy', 'High Protein'],   color: 'from-yellow-300 to-yellow-500' },
  { id: 9,  name: 'Homemade Mac & Cheese', difficulty: 'Easy',   time: '25 min', tags: ['Easy', 'Budget'],                  color: 'from-orange-300 to-orange-500' },
  { id: 10, name: 'Burrito Bowl',          difficulty: 'Medium', time: '30 min', tags: ['Healthy', 'High Protein'],         color: 'from-green-600 to-teal-700' },
  { id: 11, name: 'Pesto Pasta',           difficulty: 'Easy',   time: '15 min', tags: ['Quick', 'Easy'],                   color: 'from-green-400 to-emerald-600' },
  { id: 12, name: 'Tuna Melt',             difficulty: 'Easy',   time: '10 min', tags: ['Quick', 'High Protein', 'Budget'], color: 'from-amber-500 to-orange-600' },
  { id: 13, name: 'Smoothie Bowl',         difficulty: 'Easy',   time: '5 min',  tags: ['Quick', 'Easy', 'Healthy'],        color: 'from-pink-500 to-purple-600' },
  { id: 14, name: 'Chicken Tikka',         difficulty: 'Hard',   time: '45 min', tags: ['High Protein'],                    color: 'from-orange-600 to-red-800' },
  { id: 15, name: 'BLT Sandwich',          difficulty: 'Easy',   time: '8 min',  tags: ['Quick', 'Easy', 'Budget'],         color: 'from-red-400 to-rose-500' },
  { id: 16, name: 'Overnight Oats',        difficulty: 'Easy',   time: '5 min',  tags: ['Quick', 'Easy', 'Healthy'],        color: 'from-stone-400 to-amber-500' },
  { id: 17, name: 'Pan Seared Steak',      difficulty: 'Hard',   time: '20 min', tags: ['High Protein'],                    color: 'from-red-700 to-red-900' },
  { id: 18, name: 'Niçoise Salad',         difficulty: 'Medium', time: '25 min', tags: ['Healthy', 'High Protein'],         color: 'from-green-500 to-green-700' },
  { id: 19, name: 'Banana Pancakes',       difficulty: 'Easy',   time: '15 min', tags: ['Easy', 'Healthy', 'Budget'],       color: 'from-yellow-300 to-amber-400' },
  { id: 20, name: 'Tomato Soup',           difficulty: 'Easy',   time: '20 min', tags: ['Easy', 'Healthy', 'Budget'],       color: 'from-red-500 to-orange-600' },
];

const DIFF_COLORS = {
  Easy:   'bg-green-500/15 text-green-400 border border-green-500/20',
  Medium: 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/20',
  Hard:   'bg-red-500/15 text-red-400 border border-red-500/20',
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

  return (
    <div className="max-w-[1200px] mx-auto px-8 py-16">
      <h1 className="text-4xl font-bold mb-2">Explore Recipes</h1>
      <p className="text-gray-400 mb-8">20 college-friendly meals you can actually make.</p>

      {/* Filters */}
      <div className="flex gap-2 mb-8 flex-wrap">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-orange-500 text-white'
                : 'border border-white/10 text-gray-400 hover:text-white hover:border-white/20'
            }`}
          >
            {f}
          </button>
        ))}
        <span className="ml-auto text-gray-600 text-sm self-center">{filtered.length} meals</span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-4 gap-4">
        {filtered.map(meal => (
          <button
            key={meal.id}
            onClick={() => openMeal(meal)}
            className="text-left rounded-2xl overflow-hidden border border-white/5 hover:border-orange-500/30 transition-all hover:-translate-y-0.5 group"
          >
            <div className={`h-36 bg-gradient-to-br ${meal.color} relative`}>
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
            </div>
            <div className="p-4 bg-white/[0.02]">
              <h3 className="font-semibold text-sm mb-2 truncate">{meal.name}</h3>
              <div className="flex items-center gap-2">
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${DIFF_COLORS[meal.difficulty]}`}>
                  {meal.difficulty}
                </span>
                <span className="text-[11px] text-gray-500">⏱ {meal.time}</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Modal */}
      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/70 backdrop-blur-sm"
          onClick={e => e.target === e.currentTarget && setModal(null)}
        >
          <div className="bg-[#111] rounded-2xl border border-white/10 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Colour banner */}
            <div className={`h-44 bg-gradient-to-br ${modal.meal.color} relative rounded-t-2xl flex-shrink-0`}>
              <button
                onClick={() => setModal(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 text-white text-lg flex items-center justify-center transition-colors"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              {modal.loading && (
                <div className="py-12 flex flex-col items-center gap-3">
                  <div className="w-6 h-6 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
                  <p className="text-gray-400 text-sm">Generating recipe...</p>
                </div>
              )}

              {modal.error && (
                <p className="text-red-400 text-sm text-center py-8">{modal.error}</p>
              )}

              {modal.recipe && (
                <>
                  {/* Recipe header */}
                  <div className="mb-5">
                    <h2 className="text-2xl font-bold">{modal.recipe.name}</h2>
                    <div className="flex gap-2 mt-2">
                      <span className={`text-[11px] px-2.5 py-1 rounded-full font-medium ${DIFF_COLORS[modal.recipe.difficulty]}`}>
                        {modal.recipe.difficulty}
                      </span>
                      <span className="text-[11px] px-2.5 py-1 rounded-full border border-white/10 bg-white/5 text-gray-400">
                        ⏱ {modal.recipe.cookTime}
                      </span>
                    </div>
                  </div>

                  {/* Ingredients */}
                  <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02] mb-5">
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Ingredients</h3>
                    <ul className="space-y-1.5">
                      {modal.recipe.ingredients.map((ing, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                          <span className="w-1 h-1 rounded-full bg-orange-500 mt-1.5 flex-shrink-0" />
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
