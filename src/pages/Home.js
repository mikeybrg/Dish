const FEATURES = [
  {
    icon: '📷',
    title: 'Scan Food',
    desc: 'Snap any ingredient or dish and get an AI-powered recipe with step-by-step instructions in seconds.',
    page: 'Scan',
  },
  {
    icon: '🍳',
    title: 'Explore Recipes',
    desc: 'Browse college-friendly meals filtered by time, budget, difficulty, and dietary needs.',
    page: 'Explore',
  },
  {
    icon: '👨‍🍳',
    title: 'Ask the Chef',
    desc: 'Chat with your personal AI chef for substitutions, techniques, and meal ideas based on what you have.',
    page: 'Chat',
  },
];

export default function Home({ onNavigate }) {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(249,115,22,0.08) 0%, transparent 70%)' }} className="absolute inset-0" />
        </div>
        <div className="max-w-[1200px] mx-auto px-8 pt-32 pb-28 text-center relative">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-orange-500/25 bg-orange-500/10 text-orange-400 text-sm mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
            Now in beta — 100% free for students
          </div>
          <h1 className="text-7xl font-bold tracking-tight leading-[1.05] mb-6">
            Cook anything.<br />
            <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
              No experience needed.
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Dish turns whatever's in your fridge into real meals. Snap a photo, explore recipes,
            or chat with your personal AI chef — no culinary degree required.
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => onNavigate('Scan')}
              className="px-8 py-4 bg-orange-500 hover:bg-orange-400 text-white font-semibold rounded-xl text-base transition-colors"
            >
              Get Started Free →
            </button>
            <button
              onClick={() => onNavigate('Explore')}
              className="px-8 py-4 border border-white/10 text-gray-300 hover:text-white hover:border-white/20 hover:bg-white/5 font-semibold rounded-xl text-base transition-colors"
            >
              Browse Recipes
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-[1200px] mx-auto px-8 pb-28">
        <div className="grid grid-cols-3 gap-6">
          {FEATURES.map(f => (
            <button
              key={f.title}
              onClick={() => onNavigate(f.page)}
              className="text-left p-8 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-orange-500/25 hover:bg-white/[0.04] transition-all group"
            >
              <div className="text-4xl mb-5">{f.icon}</div>
              <h3 className="text-lg font-semibold mb-3 group-hover:text-orange-400 transition-colors">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </button>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="max-w-[1200px] mx-auto px-8 pb-28">
        <div className="rounded-2xl p-12 text-center border border-orange-500/15 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, rgba(249,115,22,0.07) 0%, rgba(249,115,22,0.03) 100%)' }}>
          <h2 className="text-4xl font-bold mb-4">Ready to start cooking?</h2>
          <p className="text-gray-400 mb-8 text-lg">Join thousands of students learning to cook with AI.</p>
          <button
            onClick={() => onNavigate('Scan')}
            className="px-8 py-4 bg-orange-500 hover:bg-orange-400 text-white font-semibold rounded-xl text-base transition-colors"
          >
            Scan Your First Meal
          </button>
        </div>
      </section>
    </div>
  );
}
