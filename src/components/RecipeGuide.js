import { useState, useEffect, useRef } from 'react';

const API_BASE = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3001';

// ── Step keyword → emoji + colour theme ─────────────────────────────────────
const PATTERNS = [
  { re: /chop|dice|slice|cut|mince|julienne|shred|peel|grat/,  emoji: '🔪',  theme: 'blue'   },
  { re: /boil|simmer|blanch/,                                   emoji: '♨️',  theme: 'orange' },
  { re: /mix|stir|whisk|combine|fold|toss|beat/,                emoji: '🥄',  theme: 'blue'   },
  { re: /fry|sauté|saute|sear|pan.fry|skillet|oil/,            emoji: '🍳',  theme: 'orange' },
  { re: /bake|roast|oven|broil/,                                emoji: '🔥',  theme: 'orange' },
  { re: /grill|bbq|barbecue/,                                   emoji: '🥩',  theme: 'orange' },
  { re: /steam/,                                                emoji: '💨',  theme: 'orange' },
  { re: /plate|serve|garnish|present/,                          emoji: '🍽️',  theme: 'green'  },
  { re: /wash|rinse|clean/,                                     emoji: '🚿',  theme: 'green'  },
  { re: /season|salt|spice|pepper|marinate/,                    emoji: '🧂',  theme: 'blue'   },
  { re: /pour|drizzle|sprinkle|measure/,                        emoji: '🫗',  theme: 'blue'   },
  { re: /rest|wait|cool|refrigerate|chill/,                     emoji: '⏱️',  theme: 'blue'   },
  { re: /blend|puree|process/,                                  emoji: '🫙',  theme: 'blue'   },
  { re: /heat|warm/,                                            emoji: '🔥',  theme: 'orange' },
  { re: /cook/,                                                 emoji: '🍳',  theme: 'orange' },
];

function getStepMeta(text) {
  const lower = text.toLowerCase();
  for (const { re, emoji, theme } of PATTERNS) {
    if (re.test(lower)) return { emoji, theme };
  }
  return { emoji: '👨‍🍳', theme: 'blue' };
}

// ── Light colour palettes ────────────────────────────────────────────────────
const T = {
  orange: {
    bg:         '#FFF7F0',
    blob:       '#f97316',
    bar:        '#EA580C',
    ring:       'rgba(249,115,22,0.10)',
    ringBorder: 'rgba(249,115,22,0.28)',
    label:      '#C2410C',
    border:     'rgba(249,115,22,0.18)',
    btn:        '#2D6A4F',
    btnHov:     '#245a42',
    text:       '#1A1A1A',
  },
  blue: {
    bg:         '#F0F6FF',
    blob:       '#3b82f6',
    bar:        '#2563EB',
    ring:       'rgba(59,130,246,0.10)',
    ringBorder: 'rgba(59,130,246,0.28)',
    label:      '#1D4ED8',
    border:     'rgba(59,130,246,0.18)',
    btn:        '#2D6A4F',
    btnHov:     '#245a42',
    text:       '#1A1A1A',
  },
  green: {
    bg:         '#F0FDF4',
    blob:       '#22c55e',
    bar:        '#16A34A',
    ring:       'rgba(34,197,94,0.10)',
    ringBorder: 'rgba(34,197,94,0.28)',
    label:      '#15803D',
    border:     'rgba(34,197,94,0.18)',
    btn:        '#2D6A4F',
    btnHov:     '#245a42',
    text:       '#1A1A1A',
  },
};

// ── Shared sub-components ────────────────────────────────────────────────────
function ModeToggle({ mode, setMode }) {
  const btn = (id, label) => (
    <button
      onClick={() => setMode(id)}
      style={{
        padding: '5px 13px',
        borderRadius: '8px',
        fontSize: '12px',
        fontWeight: 600,
        background: mode === id ? '#2D6A4F' : 'transparent',
        color: mode === id ? '#fff' : '#6B7280',
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.15s',
      }}
    >
      {label}
    </button>
  );
  return (
    <div style={{ display: 'flex', background: 'rgba(0,0,0,0.05)', borderRadius: '10px', padding: '3px', gap: '2px' }}>
      {btn('guided', 'Guided')}
      {btn('quickview', 'Quick View')}
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────
export default function RecipeGuide({ recipe, onShare, compact = false }) {
  const [step, setStep]               = useState(0);
  const [mode, setMode]               = useState('guided');
  const [slideDir, setSlideDir]       = useState('right');
  const [slideKey, setSlideKey]       = useState(0);
  const [stepImg, setStepImg]         = useState(null);
  const [stepImgLoading, setStepImgLoading] = useState(false);
  const imgCacheRef = useRef({});

  // Reset whenever a new recipe is loaded
  useEffect(() => {
    setStep(0);
    setMode('guided');
    setSlideKey(0);
    setStepImg(null);
  }, [recipe]);

  // Fetch AI-generated image for the current step
  useEffect(() => {
    if (step >= recipe.steps.length) return;
    const key = `${recipe.name}::${step}`;
    if (imgCacheRef.current[key]) {
      setStepImg(imgCacheRef.current[key]);
      setStepImgLoading(false);
      return;
    }
    setStepImg(null);
    setStepImgLoading(true);
    fetch(`${API_BASE}/api/generate-image`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        prompt: `simple clean illustration of ${recipe.steps[step]}, cooking, food photography, white background`,
      }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.url) {
          imgCacheRef.current[key] = data.url;
          setStepImg(data.url);
        }
      })
      .catch(() => {})
      .finally(() => setStepImgLoading(false));
  }, [step, recipe]);

  const done     = step >= recipe.steps.length;
  const meta     = done ? null : getStepMeta(recipe.steps[step]);
  const theme    = T[done ? 'green' : meta.theme];
  const progress = Math.min(((step + 1) / recipe.steps.length) * 100, 100);

  const goNext = () => { setSlideDir('right'); setSlideKey(k => k + 1); setStep(s => s + 1); };
  const goBack = () => { setSlideDir('left');  setSlideKey(k => k + 1); setStep(s => s - 1); };
  const jumpTo = (i) => {
    setSlideDir(i > step ? 'right' : 'left');
    setSlideKey(k => k + 1);
    setStep(i);
    setMode('guided');
  };
  const restart = () => { setSlideDir('left'); setSlideKey(k => k + 1); setStep(0); };

  // ── Quick View ─────────────────────────────────────────────────────────────
  if (mode === 'quickview') {
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            All {recipe.steps.length} Steps
          </span>
          <button
            onClick={() => setMode('guided')}
            style={{ fontSize: '13px', color: '#2D6A4F', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer' }}
          >
            ← Guided Mode
          </button>
        </div>

        <div
          className="rg-quickview-list"
          style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: compact ? '360px' : '460px', overflowY: 'auto', paddingRight: '4px' }}
        >
          {recipe.steps.map((txt, i) => {
            const m = getStepMeta(txt);
            const t = T[m.theme];
            const active = step === i;
            return (
              <button
                key={i}
                onClick={() => jumpTo(i)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '12px 14px',
                  borderRadius: '14px',
                  border: `1px solid ${active ? t.ringBorder : 'rgba(0,0,0,0.08)'}`,
                  background: active ? t.ring : '#FAFAFA',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  width: '100%',
                }}
              >
                {/* Mini emoji badge */}
                <div style={{
                  width: '38px', height: '38px', flexShrink: 0,
                  borderRadius: '10px',
                  background: t.ring,
                  border: `1px solid ${t.ringBorder}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '19px',
                }}>
                  {m.emoji}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: t.label, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '3px' }}>
                    Step {i + 1}
                  </div>
                  <div style={{
                    fontSize: '13px', color: '#374151', lineHeight: '1.5',
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                  }}>
                    {txt}
                  </div>
                </div>

                {/* Checkmark for completed steps */}
                {i < step && (
                  <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, alignSelf: 'center' }}>
                    <span style={{ fontSize: '10px', color: '#fff' }}>✓</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Completion screen ──────────────────────────────────────────────────────
  if (done) {
    return (
      <div>
        {/* Keep mode toggle visible */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <ModeToggle mode={mode} setMode={setMode} />
          <span style={{ fontSize: '12px', color: '#6B7280' }}>Done!</span>
        </div>

        <div
          className="rg-pop-in"
          style={{
            borderRadius: '20px',
            border: `1px solid ${T.green.border}`,
            background: T.green.bg,
            padding: compact ? '28px 22px' : '44px 32px',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Pulsing blobs */}
          <div className="rg-pulse-blob" style={{ position: 'absolute', width: '180px', height: '180px', borderRadius: '50%', background: '#22c55e', opacity: 0.06, top: '-50px', right: '-50px', filter: 'blur(48px)', pointerEvents: 'none' }} />
          <div className="rg-pulse-blob" style={{ position: 'absolute', width: '140px', height: '140px', borderRadius: '50%', background: '#22c55e', opacity: 0.04, bottom: '-40px', left: '-40px', filter: 'blur(40px)', pointerEvents: 'none', animationDelay: '1.4s' }} />

          <div style={{ fontSize: compact ? '54px' : '68px', lineHeight: 1, marginBottom: '14px' }}>🎉</div>
          <h3 style={{ fontSize: compact ? '20px' : '26px', fontWeight: 700, color: '#1A1A1A', marginBottom: '6px' }}>You did it!</h3>
          <p style={{ fontSize: compact ? '14px' : '15px', color: '#15803D', marginBottom: '28px' }}>
            Your {recipe.name} is ready to enjoy.
          </p>

          <button
            onClick={onShare}
            style={{
              display: 'block', width: '100%',
              padding: compact ? '11px' : '14px',
              borderRadius: '12px',
              background: '#2D6A4F',
              color: '#fff',
              fontWeight: 600,
              fontSize: compact ? '14px' : '15px',
              border: 'none',
              cursor: 'pointer',
              marginBottom: '10px',
              transition: 'background 0.15s',
            }}
            onMouseOver={e => { e.currentTarget.style.background = '#245a42'; }}
            onMouseOut={e =>  { e.currentTarget.style.background = '#2D6A4F'; }}
          >
            🎉 Share your meal
          </button>

          <button
            onClick={restart}
            style={{
              display: 'block', width: '100%',
              padding: compact ? '9px' : '11px',
              borderRadius: '12px',
              background: 'rgba(0,0,0,0.04)',
              border: '1px solid rgba(0,0,0,0.08)',
              color: '#6B7280',
              fontWeight: 500,
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseOver={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.08)'; e.currentTarget.style.color = '#1A1A1A'; }}
            onMouseOut={e =>  { e.currentTarget.style.background = 'rgba(0,0,0,0.04)'; e.currentTarget.style.color = '#6B7280'; }}
          >
            ← Start Over
          </button>
        </div>
      </div>
    );
  }

  // ── Guided step card ───────────────────────────────────────────────────────
  const isLast = step === recipe.steps.length - 1;

  return (
    <div>
      {/* Header row: mode toggle + counter */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <ModeToggle mode={mode} setMode={setMode} />
        <span style={{ fontSize: '12px', color: '#6B7280' }}>
          Step {step + 1} of {recipe.steps.length}
        </span>
      </div>

      {/* Animated card — key forces remount so CSS animation replays */}
      <div
        key={slideKey}
        className={slideDir === 'right' ? 'rg-slide-right' : 'rg-slide-left'}
        style={{
          borderRadius: '20px',
          overflow: 'hidden',
          border: `1px solid ${theme.border}`,
          background: theme.bg,
          position: 'relative',
        }}
      >
        {/* Pulsing colour blobs */}
        <div
          className="rg-pulse-blob"
          style={{
            position: 'absolute',
            width: '220px', height: '220px',
            borderRadius: '50%',
            background: theme.blob,
            opacity: 0.06,
            top: '-60px', right: '-60px',
            filter: 'blur(56px)',
            pointerEvents: 'none',
          }}
        />
        <div
          className="rg-pulse-blob"
          style={{
            position: 'absolute',
            width: '140px', height: '140px',
            borderRadius: '50%',
            background: theme.blob,
            opacity: 0.03,
            bottom: '-30px', left: '20px',
            filter: 'blur(40px)',
            pointerEvents: 'none',
            animationDelay: '1.4s',
          }}
        />

        <div style={{ padding: compact ? '22px' : '30px', position: 'relative' }}>

          {/* Emoji badge */}
          <div style={{
            width: compact ? '60px' : '76px',
            height: compact ? '60px' : '76px',
            borderRadius: '18px',
            background: theme.ring,
            border: `1px solid ${theme.ringBorder}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: compact ? '30px' : '38px',
            marginBottom: compact ? '18px' : '22px',
          }}>
            {meta.emoji}
          </div>

          {/* Step label */}
          <div style={{ fontSize: '11px', fontWeight: 700, color: theme.label, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
            Step {step + 1}
          </div>

          {/* Progress bar */}
          <div style={{ width: '100%', height: '3px', background: 'rgba(0,0,0,0.08)', borderRadius: '4px', marginBottom: compact ? '16px' : '22px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: theme.bar, borderRadius: '4px', transition: 'width 0.5s ease' }} />
          </div>

          {/* AI-generated step image */}
          {stepImgLoading && (
            <div
              className="skeleton"
              style={{ height: 160, borderRadius: 12, marginBottom: compact ? 16 : 20 }}
            />
          )}
          {stepImg && !stepImgLoading && (
            <img
              src={stepImg}
              alt={`Step ${step + 1}`}
              style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 12, marginBottom: compact ? 16 : 20 }}
            />
          )}

          {/* Instruction text */}
          <p style={{
            fontSize: compact ? '15px' : '18px',
            color: '#1A1A1A',
            lineHeight: '1.68',
            fontWeight: 400,
            marginBottom: compact ? '22px' : '30px',
          }}>
            {recipe.steps[step]}
          </p>

          {/* Navigation buttons */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={goBack}
              disabled={step === 0}
              style={{
                padding: compact ? '10px 16px' : '12px 20px',
                borderRadius: '12px',
                border: '1px solid rgba(0,0,0,0.10)',
                background: 'rgba(0,0,0,0.04)',
                color: step === 0 ? '#D1D5DB' : '#6B7280',
                fontSize: '13px',
                fontWeight: 500,
                cursor: step === 0 ? 'not-allowed' : 'pointer',
                flexShrink: 0,
                transition: 'all 0.15s',
              }}
              onMouseOver={e => { if (step !== 0) { e.currentTarget.style.background = 'rgba(0,0,0,0.08)'; e.currentTarget.style.color = '#1A1A1A'; } }}
              onMouseOut={e =>  { if (step !== 0) { e.currentTarget.style.background = 'rgba(0,0,0,0.04)'; e.currentTarget.style.color = '#6B7280'; } }}
            >
              ← Back
            </button>

            <button
              onClick={goNext}
              style={{
                flex: 1,
                padding: compact ? '10px' : '13px',
                borderRadius: '12px',
                background: theme.btn,
                color: '#fff',
                fontSize: compact ? '14px' : '15px',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                transition: 'background 0.15s',
              }}
              onMouseOver={e => { e.currentTarget.style.background = theme.btnHov; }}
              onMouseOut={e =>  { e.currentTarget.style.background = theme.btn; }}
            >
              {isLast ? '✓ Finish Cooking' : 'Next Step →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
