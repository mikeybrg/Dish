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
    page: 'Recipes',
  },
  {
    icon: '👨‍🍳',
    title: 'Ask the Chef',
    desc: 'Chat with your personal AI chef for substitutions, techniques, and meal ideas based on what you have.',
    page: 'Chat',
  },
  {
    icon: '🎨',
    title: 'AI Visual Guides',
    desc: 'Every cooking step gets a unique AI-generated image — so you can see exactly what to do, not just read it.',
    page: 'Scan',
  },
];

const STATS = [
  '75+ Recipes',
  'AI Step Images',
  'Free Forever',
  'No Experience Needed',
];

export default function Home({ onNavigate }) {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(45,106,79,0.07) 0%, transparent 70%)' }} className="absolute inset-0" />
        </div>
        <div className="max-w-[1200px] mx-auto px-8 pt-32 pb-16 text-center relative">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm mb-8" style={{ borderColor: 'rgba(45,106,79,0.3)', backgroundColor: 'rgba(45,106,79,0.06)', color: '#2D6A4F' }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: '#2D6A4F' }} />
            Now in beta — 100% free for students
          </div>
          <h1 className="text-7xl font-bold tracking-tight leading-[1.05] mb-6" style={{ color: '#1A1A1A' }}>
            Cook anything.<br />
            <span style={{ background: 'linear-gradient(135deg, #2D6A4F, #C9A84C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              No experience needed.
            </span>
          </h1>
          <p className="text-xl max-w-2xl mx-auto mb-10 leading-relaxed" style={{ color: '#6B7280' }}>
            Snap a photo, get AI-generated step-by-step visual guides for any meal. No experience needed.
          </p>
          <div className="flex gap-4 justify-center mb-10">
            <button
              onClick={() => onNavigate('Scan')}
              className="px-8 py-4 text-white font-semibold rounded-xl text-base transition-all hover:opacity-90"
              style={{ backgroundColor: '#2D6A4F' }}
            >
              Get Started Free →
            </button>
            <button
              onClick={() => onNavigate('Recipes')}
              className="px-8 py-4 border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50 font-semibold rounded-xl text-base transition-colors"
            >
              Browse Recipes
            </button>
          </div>

          {/* Stats bar */}
          <div className="flex items-center justify-center gap-0 flex-wrap">
            {STATS.map((stat, i) => (
              <div key={stat} className="flex items-center">
                <span className="text-sm font-medium px-4" style={{ color: '#6B7280' }}>{stat}</span>
                {i < STATS.length - 1 && (
                  <span style={{ color: '#D1D5DB' }}>·</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-[1200px] mx-auto px-8 pb-28 pt-12">
        <div className="grid grid-cols-4 gap-5">
          {FEATURES.map(f => (
            <button
              key={f.title}
              onClick={() => onNavigate(f.page)}
              className="text-left p-7 rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all group"
            >
              <div className="text-4xl mb-5">{f.icon}</div>
              <h3 className="text-base font-semibold mb-2 transition-colors group-hover:text-[#2D6A4F]" style={{ color: '#1A1A1A' }}>{f.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: '#6B7280' }}>{f.desc}</p>
            </button>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="max-w-[1200px] mx-auto px-8 pb-28">
        <div className="rounded-2xl p-12 text-center border relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, rgba(45,106,79,0.06) 0%, rgba(201,168,76,0.04) 100%)', borderColor: 'rgba(45,106,79,0.2)' }}>
          <h2 className="text-4xl font-bold mb-4" style={{ color: '#1A1A1A' }}>Ready to start cooking?</h2>
          <p className="mb-8 text-lg" style={{ color: '#6B7280' }}>Join thousands of students learning to cook with AI.</p>
          <button
            onClick={() => onNavigate('Scan')}
            className="px-8 py-4 text-white font-semibold rounded-xl text-base transition-all hover:opacity-90"
            style={{ backgroundColor: '#2D6A4F' }}
          >
            Scan Your First Meal
          </button>
        </div>
      </section>
    </div>
  );
}
