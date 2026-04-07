import { useState, useRef, useEffect } from 'react';

const SYSTEM = 'You are Chef Claude, a friendly cooking assistant for college students. Give practical, beginner-friendly advice. Be warm, encouraging, and concise. Use simple language.';

const API_URL = process.env.NODE_ENV === 'production'
  ? 'https://dish-gd8t.onrender.com/api/chat'
  : '/api/chat';

async function sendToAPI(apiKey, messages) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: SYSTEM,
      messages,
    }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.content[0].text;
}

// ── Food image helpers ──────────────────────────────────────────────────────

const FOOD_KEYWORDS = [
  'recipe', 'ingredient', 'tablespoon', 'teaspoon', 'cup of', 'oven',
  'simmer', 'sauté', 'fry', 'bake', 'boil', 'roast', 'grill', 'cook',
  'dish', 'meal', 'serve', 'delicious', 'tasty', 'skillet', 'stir',
];

const EXTRACT_PATTERNS = [
  /(?:recipe for|how to make|make|making|cook(?:ing)?|bake|baking|prepare|try)\s+(?:a\s+|an\s+|some\s+)?([A-Z][A-Za-z\s&'-]{2,32}?)(?:[,!.\n(]|$)/,
  /^([A-Z][A-Za-z\s&'-]{3,30}?)\s+(?:is\s+(?:a|an|one)|are\s+(?:a|great|easy))/m,
  /Here(?:'s| is) (?:a |an |)?(?:simple |quick |easy |great )?(?:recipe for |)?([A-Z][A-Za-z\s&'-]{3,30}?)(?:[,!.\n]|$)/i,
  /\*\*([A-Z][A-Za-z\s&'-]{3,30}?)\*\*/,
];

function extractFoodName(text) {
  for (const pattern of EXTRACT_PATTERNS) {
    const m = text.match(pattern);
    const name = m?.[1]?.trim();
    if (name && name.length > 2 && name.length < 35 && !/^(Here|Let|Sure|Great|I|You|This|That)$/i.test(name)) {
      return name;
    }
  }
  return null;
}

function isFoodResponse(text) {
  const lower = text.toLowerCase();
  return FOOD_KEYWORDS.some(kw => lower.includes(kw));
}

function getFoodImageUrl(name) {
  const term = encodeURIComponent(name.toLowerCase().replace(/\s+/g, '+'));
  return `https://source.unsplash.com/400x300/?${term},food`;
}

// ── Component ───────────────────────────────────────────────────────────────

const GREETING = {
  role: 'assistant',
  content: "Hey! I'm Chef Claude 👋 Tell me what ingredients you have or what you're craving, and I'll help you cook something great.",
  local: true,
};

export default function Chat({ apiKey }) {
  const [messages, setMessages] = useState([GREETING]);
  const [input, setInput]       = useState('');
  const [loading, setLoading]   = useState(false);
  const bottomRef = useRef();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const userMsg = { role: 'user', content: text };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput('');
    setLoading(true);
    try {
      const apiMessages = next.filter(m => !m.local).map(({ role, content }) => ({ role, content }));
      const reply = await sendToAPI(apiKey, apiMessages);

      let imageUrl = null;
      if (isFoodResponse(reply)) {
        const foodName = extractFoodName(reply);
        if (foodName) imageUrl = getFoodImageUrl(foodName);
      }

      setMessages(prev => [...prev, { role: 'assistant', content: reply, imageUrl }]);
    } catch (err) {
      const msg = apiKey === 'YOUR_KEY_HERE'
        ? 'Add your Anthropic API key in App.js to start chatting.'
        : 'Something went wrong. Please try again.';
      setMessages(prev => [...prev, { role: 'assistant', content: msg }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto px-8">
      <div className="max-w-2xl mx-auto flex flex-col" style={{ height: 'calc(100vh - 64px)' }}>
        <div className="pt-10 pb-6 border-b border-white/5">
          <h1 className="text-3xl font-bold">Ask the Chef</h1>
          <p className="text-gray-500 text-sm mt-1">Your personal AI cooking assistant</p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto py-6 space-y-5">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>

              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-base flex-shrink-0 mt-0.5">
                  👨‍🍳
                </div>
              )}

              {/* Assistant bubble — with or without image */}
              {msg.role === 'assistant' ? (
                <div className="max-w-[78%] rounded-2xl rounded-bl-sm overflow-hidden border border-white/5 bg-white/5 text-sm text-gray-200 leading-relaxed">
                  {msg.imageUrl && (
                    <img
                      src={msg.imageUrl}
                      alt="food"
                      className="w-full object-cover"
                      style={{ height: 200 }}
                      onError={e => { e.currentTarget.style.display = 'none'; }}
                    />
                  )}
                  <p className="px-4 py-3 whitespace-pre-wrap">{msg.content}</p>
                </div>
              ) : (
                <div className="max-w-[78%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap bg-orange-500 text-white rounded-br-sm">
                  {msg.content}
                </div>
              )}

            </div>
          ))}

          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-base flex-shrink-0">👨‍🍳</div>
              <div className="px-4 py-3.5 rounded-2xl rounded-bl-sm bg-white/5 border border-white/5 flex gap-1.5 items-center">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: `${i * 160}ms` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="pb-6 pt-4 border-t border-white/5">
          <div className="flex gap-3">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), send())}
              placeholder="What's in your fridge? What are you craving?"
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-orange-500/50 transition-colors"
            />
            <button
              onClick={send}
              disabled={!input.trim() || loading}
              className="px-5 py-3 bg-orange-500 hover:bg-orange-400 text-white rounded-xl font-medium disabled:opacity-40 disabled:cursor-not-allowed text-sm transition-colors"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
