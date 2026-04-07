import { useState, useRef } from 'react';
import RecipeGuide from '../components/RecipeGuide';

const API_BASE = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3001';

function parseJSON(text) {
  try { return JSON.parse(text); } catch {
    const m = text.match(/\{[\s\S]*\}/);
    if (m) return JSON.parse(m[0]);
    throw new Error('Could not parse response');
  }
}

async function analyzeFood(apiKey, base64, mimeType) {
  const res = await fetch(`${API_BASE}/api/chat`, {
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

async function analyzeIngredients(apiKey, ingredients) {
  const res = await fetch(`${API_BASE}/api/chat`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `I have these ingredients: ${ingredients}. Suggest the best meal I can make with them. Return ONLY valid JSON, no markdown: {"name":string,"difficulty":"Easy"|"Medium"|"Hard","cookTime":string,"ingredients":string[],"steps":string[]}`,
      }],
    }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return parseJSON(data.content[0].text);
}

const DIFF_COLORS = {
  Easy:   { bg: '#DCFCE7', text: '#15803D', border: '#86EFAC' },
  Medium: { bg: '#FEF9C3', text: '#A16207', border: '#FDE047' },
  Hard:   { bg: '#FEE2E2', text: '#B91C1C', border: '#FCA5A5' },
};

export default function Scan({ apiKey, onNavigate }) {
  const [dragging, setDragging] = useState(false);
  const [preview,  setPreview]  = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [recipe,   setRecipe]   = useState(null);
  const [error,    setError]    = useState(null);
  const [textInput, setTextInput] = useState('');
  const [textLoading, setTextLoading] = useState(false);
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

  const handleTextSubmit = async () => {
    if (!textInput.trim()) return;
    setRecipe(null);
    setError(null);
    setTextLoading(true);
    try {
      const result = await analyzeIngredients(apiKey, textInput.trim());
      setRecipe(result);
    } catch (err) {
      setError(apiKey === 'YOUR_KEY_HERE'
        ? 'Set your Anthropic API key in App.js to generate recipes.'
        : 'Could not generate a recipe. Please try again.');
    } finally {
      setTextLoading(false);
    }
  };

  const diff = DIFF_COLORS[recipe?.difficulty] || DIFF_COLORS.Medium;

  return (
    <div className="max-w-[1200px] mx-auto px-8 py-16">
      <div className="max-w-2xl">
        <h1 className="text-4xl font-bold mb-2" style={{ color: '#1A1A1A' }}>Scan Food</h1>
        <p className="mb-10" style={{ color: '#6B7280' }}>Upload a photo of any ingredient or dish to get an instant AI-powered recipe.</p>
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
              dragging ? 'bg-[#2D6A4F]/5' : 'hover:bg-gray-50'
            }`}
            style={{
              height: 320,
              borderColor: dragging ? '#2D6A4F' : '#D1D5DB',
            }}
          >
            {preview ? (
              <>
                <img src={preview} alt="Food" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-sm font-medium text-white bg-black/50 px-4 py-2 rounded-lg">Change Photo</span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-3 text-center px-8">
                <div className="text-5xl">📷</div>
                <div>
                  <p className="font-medium" style={{ color: '#374151' }}>Drop a food photo here</p>
                  <p className="text-sm mt-1" style={{ color: '#9CA3AF' }}>or click to browse · JPG, PNG, WEBP</p>
                </div>
              </div>
            )}
            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
          </div>

          {loading && (
            <div className="mt-6 flex items-center gap-3" style={{ color: '#6B7280' }}>
              <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#2D6A4F', borderTopColor: 'transparent' }} />
              <span>Analyzing your photo with AI...</span>
            </div>
          )}

          {/* ── Text ingredient input ── */}
          <div className="mt-8">
            <div className="flex items-center gap-4 mb-5">
              <div className="flex-1 border-t border-gray-200" />
              <span className="text-sm font-medium" style={{ color: '#9CA3AF' }}>or type your ingredients</span>
              <div className="flex-1 border-t border-gray-200" />
            </div>

            <textarea
              value={textInput}
              onChange={e => setTextInput(e.target.value)}
              placeholder="e.g. eggs, cheese, spinach, garlic, olive oil..."
              rows={3}
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm placeholder-gray-400 outline-none transition-colors resize-none mb-3"
              style={{ color: '#1A1A1A' }}
              onFocus={e => e.target.style.borderColor = '#2D6A4F'}
              onBlur={e => e.target.style.borderColor = '#E5E7EB'}
            />
            <button
              onClick={handleTextSubmit}
              disabled={!textInput.trim() || textLoading}
              className="w-full py-3 text-white rounded-xl font-medium text-sm transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ backgroundColor: '#2D6A4F' }}
            >
              {textLoading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Generating recipe...
                </>
              ) : 'Get Recipe →'}
            </button>
          </div>

          {error && (
            <div className="mt-4 p-4 rounded-xl border text-sm" style={{ borderColor: '#FCA5A5', backgroundColor: '#FEF2F2', color: '#B91C1C' }}>
              {error}
            </div>
          )}
        </div>

        {/* ── Recipe column ─────────────────────────────────────── */}
        <div>
          {!recipe && !loading && !textLoading && (
            <div className="h-80 rounded-2xl border border-gray-200 bg-white flex flex-col items-center justify-center gap-3 shadow-sm" style={{ color: '#D1D5DB' }}>
              <div className="text-4xl">🍽️</div>
              <p className="text-sm" style={{ color: '#9CA3AF' }}>Your recipe will appear here</p>
            </div>
          )}

          {recipe && (
            <div className="space-y-5">
              {/* Recipe header */}
              <div>
                <h2 className="text-3xl font-bold mb-3" style={{ color: '#1A1A1A' }}>{recipe.name}</h2>
                <div className="flex gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-medium border" style={{ backgroundColor: diff.bg, color: diff.text, borderColor: diff.border }}>
                    {recipe.difficulty}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-medium border border-gray-200 bg-gray-50 text-gray-500">
                    ⏱ {recipe.cookTime}
                  </span>
                </div>
              </div>

              {/* Ingredients */}
              <div className="p-5 rounded-2xl border border-gray-200 bg-white shadow-sm">
                <h3 className="text-sm font-semibold uppercase tracking-wide mb-3" style={{ color: '#6B7280' }}>Ingredients</h3>
                <ul className="space-y-2">
                  {recipe.ingredients.map((ing, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm" style={{ color: '#374151' }}>
                      <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: '#2D6A4F' }} />
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
