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

const GREETING = {
  role: 'assistant',
  content: "Hey! I'm Chef Claude 👋 Tell me what ingredients you have or what you're craving, and I'll help you cook something great.",
  local: true,
};

export default function Chat({ apiKey }) {
  const [messages, setMessages] = useState([GREETING]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
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
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
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
              <div
                className={`max-w-[78%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-orange-500 text-white rounded-br-sm'
                    : 'bg-white/5 border border-white/5 text-gray-200 rounded-bl-sm'
                }`}
              >
                {msg.content}
              </div>
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
