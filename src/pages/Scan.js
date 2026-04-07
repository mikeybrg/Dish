import { useState, useRef } from 'react';
import RecipeGuide from '../components/RecipeGuide';

function parseJSON(text) {
  try { return JSON.parse(text); } catch {
    const m = text.match(/\{[\s\S]*\}/);
    if (m) return JSON.parse(m[0]);
    throw new Error('Could not parse response');
  }
}

async function analyzeFood(apiKey, base64, mimeType) {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mimeType, data: base64 } },
          { type: 'text', text: 'Identify this food. Return ONLY valid JSON, no markdown: {"name":string,"difficulty":"Easy"|"Medium"|"Hard","cookTime":string,"ingredients":string[],"steps":string[]}' },
        ],
      }],
    }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return parseJSON(data.content[0].text);
}

const DIFF_COLORS = {
  Easy:   'bg-green-500/15 text-green-400 border-green-500/20',
  Medium: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
  Hard:   'bg-red-500/15 text-red-400 border-red-500/20',
};

export default function Scan({ apiKey, onNavigate }) {
  const [dragging, setDragging] = useState(false);
  const [preview,  setPreview]  = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [recipe,   setRecipe]   = useState(null);
  const [error,    setError]    = useState(null);
  const inputRef = useRef();

  const handleFile = async (file) => {
    if (!file?.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      setPreview(e.target.result);
      setRecipe(null);
      setError(null);
      setLoading(true);
      try {
        const result = await analyzeFood(apiKey, e.target.result.split(',')[1], file.type);
        setRecipe(result);
      } catch (err) {
        setError(apiKey === 'YOUR_KEY_HERE'
          ? 'Set your Anthropic API key in App.js to analyze photos.'
          : 'Could not analyze the image. Please try another photo.');
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-[1200px] mx-auto px-8 py-16">
      <div className="max-w-2xl">
        <h1 className="text-4xl font-bold mb-2">Scan Food</h1>
        <p className="text-gray-400 mb-10">Upload a photo of any ingredient or dish to get an instant AI-powered recipe.</p>
      </div>

      <div className="grid grid-cols-2 gap-12 items-start">

        {/* ── Upload column ─────────────────────────────────────── */}
        <div>
          <div
            onClick={() => inputRef.current.click()}
            onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            className={`relative rounded-2xl border-2 border-dashed cursor-pointer transition-all flex items-center justify-center overflow-hidden ${
              dragging ? 'border-orange-500 bg-orange-500/5' : 'border-white/10 hover:border-orange-500/40 hover:bg-white/[0.02]'
            }`}
            style={{ height: 320 }}
          >
            {preview ? (
              <>
                <img src={preview} alt="Food" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-sm font-medium text-white bg-black/60 px-4 py-2 rounded-lg">Change Photo</span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-3 text-center px-8">
                <div className="text-5xl">📷</div>
                <div>
                  <p className="font-medium text-gray-300">Drop a food photo here</p>
                  <p className="text-sm text-gray-500 mt-1">or click to browse · JPG, PNG, WEBP</p>
                </div>
              </div>
            )}
            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
          </div>

          {loading && (
            <div className="mt-6 flex items-center gap-3 text-gray-400">
              <div className="w-5 h-5 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
              <span>Analyzing your photo with AI...</span>
            </div>
          )}
          {error && (
            <div className="mt-6 p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* ── Recipe column ─────────────────────────────────────── */}
        <div>
          {!recipe && !loading && (
            <div className="h-80 rounded-2xl border border-white/5 bg-white/[0.02] flex flex-col items-center justify-center gap-3 text-gray-600">
              <div className="text-4xl">🍽️</div>
              <p className="text-sm">Your recipe will appear here</p>
            </div>
          )}

          {recipe && (
            <div className="space-y-5">
              {/* Recipe header */}
              <div>
                <h2 className="text-3xl font-bold mb-3">{recipe.name}</h2>
                <div className="flex gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${DIFF_COLORS[recipe.difficulty] || DIFF_COLORS.Medium}`}>
                    {recipe.difficulty}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-medium border border-white/10 bg-white/5 text-gray-400">
                    ⏱ {recipe.cookTime}
                  </span>
                </div>
              </div>

              {/* Ingredients */}
              <div className="p-5 rounded-2xl border border-white/5 bg-white/[0.02]">
                <h3 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wide">Ingredients</h3>
                <ul className="space-y-2">
                  {recipe.ingredients.map((ing, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-gray-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 flex-shrink-0" />
                      {ing}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Visual step guide */}
              <RecipeGuide
                recipe={recipe}
                onShare={() => onNavigate('Profile')}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
