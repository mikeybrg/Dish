import { useState, useEffect } from 'react';
import RecipeGuide from '../components/RecipeGuide';

const API_BASE = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3001';

function parseJSON(text) {
  try { return JSON.parse(text); } catch {
    const m = text.match(/\{[\s\S]*\}/);
    if (m) return JSON.parse(m[0]);
    throw new Error('Could not parse response');
  }
}

async function fetchRecipe(name) {
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

const DIFF_COLORS = {
  Easy:   'bg-green-500/15 text-green-400 border border-green-500/20',
  Medium: 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/20',
  Hard:   'bg-red-500/15 text-red-400 border border-red-500/20',
};

const SECTIONS = [
  {
    id: 'beginner',
    label: 'Just Starting Out',
    textColor: 'text-green-400',
    dotColor: 'bg-green-500',
    btnBase: 'bg-green-500/10 border-green-500/20 text-green-400',
    recipes: [
      { id: 'b1',  name: 'Avocado Toast',        time: '5 min',  cuisine: 'American',      color: 'from-green-500 to-teal-500' },
      { id: 'b2',  name: 'Scrambled Eggs',        time: '5 min',  cuisine: 'American',      color: 'from-yellow-400 to-amber-500' },
      { id: 'b3',  name: 'PB&J Sandwich',         time: '3 min',  cuisine: 'American',      color: 'from-amber-600 to-orange-600' },
      { id: 'b4',  name: 'Overnight Oats',        time: '5 min',  cuisine: 'American',      color: 'from-stone-500 to-amber-600' },
      { id: 'b5',  name: 'Banana Pancakes',       time: '15 min', cuisine: 'American',      color: 'from-yellow-300 to-amber-400' },
      { id: 'b6',  name: 'Grilled Cheese',        time: '8 min',  cuisine: 'American',      color: 'from-yellow-400 to-amber-600' },
      { id: 'b7',  name: 'BLT Sandwich',          time: '8 min',  cuisine: 'American',      color: 'from-red-400 to-rose-500' },
      { id: 'b8',  name: 'Upgraded Ramen',        time: '10 min', cuisine: 'Asian',         color: 'from-orange-500 to-red-600' },
      { id: 'b9',  name: 'Fried Rice',            time: '15 min', cuisine: 'Asian',         color: 'from-amber-500 to-yellow-600' },
      { id: 'b10', name: 'Cheese Quesadilla',     time: '10 min', cuisine: 'Mexican',       color: 'from-orange-500 to-red-700' },
      { id: 'b11', name: 'Tomato Soup',           time: '20 min', cuisine: 'American',      color: 'from-red-500 to-orange-600' },
      { id: 'b12', name: 'Mac & Cheese',          time: '25 min', cuisine: 'American',      color: 'from-orange-300 to-orange-500' },
      { id: 'b13', name: 'Caprese Salad',         time: '5 min',  cuisine: 'Italian',       color: 'from-red-500 to-pink-600' },
      { id: 'b14', name: 'Greek Salad',           time: '10 min', cuisine: 'Mediterranean', color: 'from-blue-500 to-teal-600' },
      { id: 'b15', name: 'Smoothie Bowl',         time: '5 min',  cuisine: 'American',      color: 'from-pink-500 to-purple-600' },
      { id: 'b16', name: 'Hummus & Pita',         time: '5 min',  cuisine: 'Mediterranean', color: 'from-amber-400 to-orange-500' },
      { id: 'b17', name: 'Bruschetta',            time: '10 min', cuisine: 'Italian',       color: 'from-red-600 to-orange-500' },
      { id: 'b18', name: 'Guacamole',             time: '10 min', cuisine: 'Mexican',       color: 'from-green-500 to-lime-500' },
      { id: 'b19', name: 'Miso Soup',             time: '10 min', cuisine: 'Japanese',      color: 'from-amber-600 to-yellow-700' },
      { id: 'b20', name: 'Yogurt Parfait',        time: '5 min',  cuisine: 'American',      color: 'from-pink-400 to-rose-500' },
      { id: 'b21', name: 'Cheese Omelet',         time: '8 min',  cuisine: 'American',      color: 'from-yellow-300 to-yellow-500' },
      { id: 'b22', name: 'Cinnamon Toast',        time: '3 min',  cuisine: 'American',      color: 'from-amber-500 to-orange-500' },
      { id: 'b23', name: 'Tuna Salad Wrap',       time: '10 min', cuisine: 'American',      color: 'from-blue-400 to-cyan-500' },
      { id: 'b24', name: 'No-Bake Energy Balls',  time: '15 min', cuisine: 'American',      color: 'from-amber-700 to-stone-700' },
      { id: 'b25', name: 'Cucumber Sushi Roll',   time: '20 min', cuisine: 'Japanese',      color: 'from-green-400 to-emerald-500' },
    ],
  },
  {
    id: 'intermediate',
    label: 'Getting Comfortable',
    textColor: 'text-yellow-400',
    dotColor: 'bg-yellow-500',
    btnBase: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
    recipes: [
      { id: 'm1',  name: 'Pasta Carbonara',       time: '20 min', cuisine: 'Italian',       color: 'from-yellow-600 to-orange-600' },
      { id: 'm2',  name: 'Chicken Stir Fry',      time: '20 min', cuisine: 'Asian',         color: 'from-red-500 to-rose-600' },
      { id: 'm3',  name: 'Beef Tacos',            time: '25 min', cuisine: 'Mexican',       color: 'from-orange-600 to-red-700' },
      { id: 'm4',  name: 'Pesto Pasta',           time: '15 min', cuisine: 'Italian',       color: 'from-green-500 to-emerald-600' },
      { id: 'm5',  name: 'Burrito Bowl',          time: '30 min', cuisine: 'Mexican',       color: 'from-green-600 to-teal-700' },
      { id: 'm6',  name: 'Pad Thai',              time: '25 min', cuisine: 'Asian',         color: 'from-amber-500 to-orange-600' },
      { id: 'm7',  name: 'Shakshuka',             time: '20 min', cuisine: 'Mediterranean', color: 'from-red-600 to-orange-500' },
      { id: 'm8',  name: 'French Toast',          time: '15 min', cuisine: 'American',      color: 'from-yellow-500 to-amber-600' },
      { id: 'm9',  name: 'Chicken Fried Rice',    time: '25 min', cuisine: 'Asian',         color: 'from-amber-500 to-yellow-600' },
      { id: 'm10', name: 'Beef Stir Fry',         time: '20 min', cuisine: 'Asian',         color: 'from-red-600 to-rose-700' },
      { id: 'm11', name: 'Margherita Pizza',      time: '30 min', cuisine: 'Italian',       color: 'from-red-500 to-orange-400' },
      { id: 'm12', name: 'Chicken Caesar Salad',  time: '15 min', cuisine: 'American',      color: 'from-blue-600 to-indigo-700' },
      { id: 'm13', name: 'Lemon Garlic Pasta',    time: '20 min', cuisine: 'Italian',       color: 'from-yellow-400 to-green-500' },
      { id: 'm14', name: 'Butter Chicken',        time: '30 min', cuisine: 'Indian',        color: 'from-orange-500 to-amber-600' },
      { id: 'm15', name: 'Dal Tadka',             time: '30 min', cuisine: 'Indian',        color: 'from-yellow-600 to-amber-700' },
      { id: 'm16', name: 'Teriyaki Salmon',       time: '20 min', cuisine: 'Japanese',      color: 'from-orange-400 to-amber-500' },
      { id: 'm17', name: 'Korean BBQ Beef Bowl',  time: '25 min', cuisine: 'Asian',         color: 'from-red-600 to-rose-700' },
      { id: 'm18', name: 'Chicken Tortilla Soup', time: '30 min', cuisine: 'Mexican',       color: 'from-orange-600 to-red-700' },
      { id: 'm19', name: 'Banana Bread',          time: '60 min', cuisine: 'American',      color: 'from-amber-700 to-orange-800' },
      { id: 'm20', name: 'Falafel Wrap',          time: '25 min', cuisine: 'Mediterranean', color: 'from-teal-500 to-cyan-600' },
      { id: 'm21', name: 'Mushroom Risotto',      time: '35 min', cuisine: 'Italian',       color: 'from-stone-600 to-amber-700' },
      { id: 'm22', name: 'Mango Salsa Tacos',     time: '25 min', cuisine: 'Mexican',       color: 'from-orange-400 to-pink-500' },
      { id: 'm23', name: 'Niçoise Salad',         time: '25 min', cuisine: 'Mediterranean', color: 'from-blue-500 to-teal-600' },
      { id: 'm24', name: 'Vegetable Curry',       time: '30 min', cuisine: 'Indian',        color: 'from-orange-600 to-yellow-700' },
      { id: 'm25', name: 'Honey Garlic Chicken',  time: '25 min', cuisine: 'Asian',         color: 'from-amber-500 to-orange-600' },
    ],
  },
  {
    id: 'advanced',
    label: 'Ready to Impress',
    textColor: 'text-red-400',
    dotColor: 'bg-red-500',
    btnBase: 'bg-red-500/10 border-red-500/20 text-red-400',
    recipes: [
      { id: 'a1',  name: 'Chicken Tikka Masala',  time: '45 min',  cuisine: 'Indian',       color: 'from-orange-600 to-red-800' },
      { id: 'a2',  name: 'Pan Seared Steak',      time: '20 min',  cuisine: 'American',     color: 'from-red-700 to-red-900' },
      { id: 'a3',  name: 'Homemade Sushi Rolls',  time: '60 min',  cuisine: 'Japanese',     color: 'from-pink-600 to-rose-700' },
      { id: 'a4',  name: 'Beef Birria Tacos',     time: '90 min',  cuisine: 'Mexican',      color: 'from-red-700 to-orange-800' },
      { id: 'a5',  name: 'Homemade Ramen',        time: '90 min',  cuisine: 'Japanese',     color: 'from-amber-700 to-orange-800' },
      { id: 'a6',  name: 'Lamb Shawarma',         time: '45 min',  cuisine: 'Mediterranean',color: 'from-amber-600 to-orange-700' },
      { id: 'a7',  name: 'Tiramisu',              time: '30 min',  cuisine: 'Italian',      color: 'from-amber-800 to-stone-800' },
      { id: 'a8',  name: 'Crème Brûlée',          time: '60 min',  cuisine: 'American',     color: 'from-amber-600 to-yellow-800' },
      { id: 'a9',  name: 'Chocolate Lava Cake',   time: '25 min',  cuisine: 'American',     color: 'from-stone-700 to-stone-900' },
      { id: 'a10', name: 'Baklava',               time: '60 min',  cuisine: 'Mediterranean',color: 'from-amber-500 to-yellow-700' },
      { id: 'a11', name: 'Mochi Ice Cream',       time: '45 min',  cuisine: 'Japanese',     color: 'from-pink-500 to-purple-600' },
      { id: 'a12', name: 'Chicken Biryani',       time: '60 min',  cuisine: 'Indian',       color: 'from-orange-600 to-amber-700' },
      { id: 'a13', name: 'Beef Bulgogi',          time: '40 min',  cuisine: 'Asian',        color: 'from-red-600 to-rose-800' },
      { id: 'a14', name: 'Paella',                time: '60 min',  cuisine: 'Mediterranean',color: 'from-yellow-600 to-orange-700' },
      { id: 'a15', name: 'Pho',                   time: '2 hours', cuisine: 'Asian',        color: 'from-amber-600 to-orange-700' },
      { id: 'a16', name: 'Homemade Dumplings',    time: '60 min',  cuisine: 'Asian',        color: 'from-orange-700 to-red-800' },
      { id: 'a17', name: 'Osso Buco',             time: '2 hours', cuisine: 'Italian',      color: 'from-red-700 to-rose-900' },
      { id: 'a18', name: 'Carne Asada',           time: '45 min',  cuisine: 'Mexican',      color: 'from-red-500 to-orange-700' },
      { id: 'a19', name: 'Beef Wellington',       time: '90 min',  cuisine: 'American',     color: 'from-stone-600 to-gray-800' },
      { id: 'a20', name: 'Homemade Croissants',   time: '3 hours', cuisine: 'American',     color: 'from-amber-300 to-yellow-500' },
      { id: 'a21', name: 'Eggs Benedict',         time: '30 min',  cuisine: 'American',     color: 'from-yellow-500 to-amber-700' },
      { id: 'a22', name: 'Lobster Bisque',        time: '60 min',  cuisine: 'American',     color: 'from-orange-700 to-red-800' },
      { id: 'a23', name: 'Peking Duck',           time: '2 hours', cuisine: 'Asian',        color: 'from-red-700 to-orange-800' },
      { id: 'a24', name: 'French Macarons',       time: '90 min',  cuisine: 'American',     color: 'from-pink-600 to-purple-700' },
      { id: 'a25', name: 'Tteokbokki',            time: '40 min',  cuisine: 'Asian',        color: 'from-red-600 to-orange-700' },
    ],
  },
];

export default function Recipes({ apiKey }) {
  const [search, setSearch] = useState('');
  const [modal, setModal]   = useState(null);
  const [cache, setCache]   = useState({});

  useEffect(() => {
    const close = (e) => e.key === 'Escape' && setModal(null);
    if (modal) window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [modal]);

  const openRecipe = async (recipe) => {
    if (cache[recipe.id]) {
      setModal({ recipe, data: cache[recipe.id], loading: false, error: null });
      return;
    }
    setModal({ recipe, data: null, loading: true, error: null });
    try {
      const data = await fetchRecipe(recipe.name);
      setCache(prev => ({ ...prev, [recipe.id]: data }));
      setModal(prev => prev ? { ...prev, data, loading: false } : null);
    } catch {
      setModal(prev => prev ? {
        ...prev, loading: false,
        error: apiKey === 'YOUR_KEY_HERE' ? 'Set your API key in App.js to generate recipes.' : 'Failed to load recipe.',
      } : null);
    }
  };

  const q = search.toLowerCase();
  const filteredSections = search
    ? SECTIONS.map(s => ({
        ...s,
        recipes: s.recipes.filter(r =>
          r.name.toLowerCase().includes(q) || r.cuisine.toLowerCase().includes(q)
        ),
      })).filter(s => s.recipes.length > 0)
    : SECTIONS;

  return (
    <div className="max-w-[1200px] mx-auto px-8 py-16">
      <h1 className="text-4xl font-bold mb-2">Recipes</h1>
      <p className="text-gray-400 mb-8">75 college-friendly meals from around the world — click any card to get a full recipe.</p>

      {/* Search */}
      <div className="relative mb-12 max-w-md">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">🔍</span>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search recipes or cuisines..."
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-orange-500/50 transition-colors"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 text-lg"
          >
            ×
          </button>
        )}
      </div>

      {/* Sections */}
      {filteredSections.map(section => (
        <div key={section.id} className="mb-12">
          <div className="flex items-center gap-3 mb-5">
            <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${section.dotColor}`} />
            <h2 className={`text-xl font-bold ${section.textColor}`}>{section.label}</h2>
            <span className="text-gray-600 text-sm">{section.recipes.length} recipes</span>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-3 hide-scrollbar">
            {section.recipes.map(recipe => (
              <button
                key={recipe.id}
                onClick={() => openRecipe(recipe)}
                className="flex-shrink-0 w-48 rounded-2xl overflow-hidden border border-white/5 hover:border-white/20 hover:scale-[1.02] transition-all text-left group cursor-pointer"
              >
                <div className={`h-28 bg-gradient-to-br ${recipe.color} relative`}>
                  <span className="absolute bottom-2 left-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-black/40 text-white backdrop-blur-sm">
                    {recipe.cuisine}
                  </span>
                </div>
                <div className="p-3 bg-white/[0.02]">
                  <h3 className="font-semibold text-sm mb-1 truncate group-hover:text-orange-400 transition-colors">
                    {recipe.name}
                  </h3>
                  <p className="text-[11px] text-gray-500 mb-3">⏱ {recipe.time}</p>
                  <div className={`w-full py-1.5 text-[11px] rounded-lg border text-center font-semibold transition-colors ${section.btnBase} group-hover:bg-orange-500 group-hover:border-orange-500 group-hover:text-white`}>
                    View Recipe
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Empty state */}
      {filteredSections.length === 0 && (
        <div className="text-center py-24 text-gray-600">
          <div className="text-5xl mb-4">🔍</div>
          <p className="text-lg">No recipes found for "{search}"</p>
          <p className="text-sm mt-2 text-gray-700">Try searching for a cuisine like "Italian" or "Japanese"</p>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/70 backdrop-blur-sm"
          onClick={e => e.target === e.currentTarget && setModal(null)}
        >
          <div className="bg-[#111] rounded-2xl border border-white/10 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className={`h-44 bg-gradient-to-br ${modal.recipe.color} relative rounded-t-2xl flex-shrink-0`}>
              <span className="absolute bottom-4 left-5 text-xs font-semibold px-3 py-1 rounded-full bg-black/40 text-white backdrop-blur-sm">
                {modal.recipe.cuisine}
              </span>
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
                  <p className="text-gray-400 text-sm">Generating recipe with AI...</p>
                </div>
              )}

              {modal.error && (
                <p className="text-red-400 text-sm text-center py-8">{modal.error}</p>
              )}

              {modal.data && (
                <>
                  <div className="mb-5">
                    <h2 className="text-2xl font-bold">{modal.data.name}</h2>
                    <div className="flex gap-2 mt-2">
                      <span className={`text-[11px] px-2.5 py-1 rounded-full font-medium ${DIFF_COLORS[modal.data.difficulty]}`}>
                        {modal.data.difficulty}
                      </span>
                      <span className="text-[11px] px-2.5 py-1 rounded-full border border-white/10 bg-white/5 text-gray-400">
                        ⏱ {modal.data.cookTime}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02] mb-5">
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Ingredients</h3>
                    <ul className="space-y-1.5">
                      {modal.data.ingredients.map((ing, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                          <span className="w-1 h-1 rounded-full bg-orange-500 mt-1.5 flex-shrink-0" />
                          {ing}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <RecipeGuide
                    recipe={modal.data}
                    onShare={() => setModal(null)}
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
