import { useState, useEffect, useRef } from 'react';

function timeAgo(ts) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

const POST_GRADIENTS = [
  'from-orange-500 to-red-600', 'from-green-500 to-teal-600', 'from-blue-500 to-indigo-600',
  'from-pink-500 to-rose-600', 'from-amber-500 to-orange-600', 'from-purple-500 to-violet-600',
  'from-teal-500 to-cyan-600', 'from-red-500 to-pink-600', 'from-yellow-500 to-amber-600',
];

const NOW = Date.now();

const INITIAL_POSTS = [
  {
    id: 'p1', name: 'Maya Rodriguez', username: 'mayacooks', initials: 'MR',
    avatarColor: 'from-pink-500 to-rose-600', ts: NOW - 2 * 3600000,
    caption: 'finally made pasta without burning it 😭 took me 4 tries but we got there',
    color: 'from-yellow-600 to-orange-600', baseL: 47,
    preComments: [
      { user: 'Jake T.', text: 'looks so good omg' },
      { user: 'Emma C.', text: 'the glow up is real 🍝' },
      { user: 'Sarah K.', text: 'what recipe did you use??' },
    ],
  },
  {
    id: 'p2', name: 'Jake Thompson', username: 'jakeeats', initials: 'JT',
    avatarColor: 'from-blue-500 to-indigo-600', ts: NOW - 4 * 3600000,
    caption: 'ramen upgrade hits different at midnight before finals 🍜🔥',
    color: 'from-orange-500 to-red-600', baseL: 89,
    preComments: [
      { user: 'Liam O.', text: 'the egg looks PERFECT' },
      { user: 'Zoe M.', text: 'teach me your ways' },
    ],
  },
  {
    id: 'p3', name: 'Sarah Kim', username: 'sarahkimchi', initials: 'SK',
    avatarColor: 'from-purple-500 to-violet-600', ts: NOW - 6 * 3600000,
    caption: 'meal prepped for the whole week and it only took 2 hours!! feeling so adult rn',
    color: 'from-green-500 to-teal-600', baseL: 134,
    preComments: [
      { user: 'Maya R.', text: 'how are you so organized 😭' },
      { user: 'Marcus D.', text: 'what did you make?' },
      { user: 'Priya P.', text: 'goals honestly' },
    ],
  },
  {
    id: 'p4', name: 'Tyler Brooks', username: 'tylerbeats', initials: 'TB',
    avatarColor: 'from-amber-500 to-orange-600', ts: NOW - 8 * 3600000,
    caption: 'my first attempt at homemade sushi. not terrible for a guy who ate frozen pizza for 3 years',
    color: 'from-pink-500 to-rose-600', baseL: 62,
    preComments: [
      { user: 'Hannah P.', text: 'this is actually impressive wtf' },
      { user: 'Noah W.', text: 'the rolls are actually straight?? 🔥' },
    ],
  },
  {
    id: 'p5', name: 'Emma Chen', username: 'emmachenn', initials: 'EC',
    avatarColor: 'from-teal-500 to-cyan-600', ts: NOW - 10 * 3600000,
    caption: 'avocado toast era never ending. added everything bagel seasoning and it is a DIFFERENT meal',
    color: 'from-green-400 to-teal-500', baseL: 91,
    preComments: [
      { user: 'Jordan L.', text: 'the everything bagel seasoning is the secret ingredient every time' },
      { user: 'Mia J.', text: 'obsessed with yours 😍' },
    ],
  },
  {
    id: 'p6', name: 'Marcus Davis', username: 'marcusd', initials: 'MD',
    avatarColor: 'from-green-500 to-emerald-600', ts: NOW - 12 * 3600000,
    caption: 'made chicken tikka masala from SCRATCH. called my mom for the whole recipe over FaceTime 😂',
    color: 'from-orange-600 to-red-700', baseL: 203,
    preComments: [
      { user: 'Priya P.', text: 'as a desi I approve 👏' },
      { user: 'Tyler B.', text: 'this looks restaurant quality no cap' },
      { user: 'Maya R.', text: 'can you make this for the whole dorm' },
    ],
  },
  {
    id: 'p7', name: 'Priya Patel', username: 'priyacooks', initials: 'PP',
    avatarColor: 'from-yellow-500 to-orange-500', ts: NOW - 14 * 3600000,
    caption: "finally cracked my mom's dal recipe after 3 semesters of trying. she said it tastes \"almost right\" which is basically a michelin star",
    color: 'from-yellow-600 to-amber-700', baseL: 156,
    preComments: [
      { user: 'Marcus D.', text: '"almost right" from a desi mom is higher praise than you think 😂' },
      { user: 'Sarah K.', text: 'this looks so comforting 🥺' },
    ],
  },
  {
    id: 'p8', name: "Liam O'Brien", username: 'liamob', initials: 'LO',
    avatarColor: 'from-sky-500 to-blue-600', ts: NOW - 18 * 3600000,
    caption: 'grilled cheese at 2am before my operating systems exam. some things just hit different',
    color: 'from-yellow-400 to-amber-500', baseL: 178,
    preComments: [
      { user: 'Jordan L.', text: 'studying or stress eating?? (both)' },
      { user: 'Jake T.', text: 'the crust on that 😤' },
      { user: 'Emma C.', text: 'good luck on your exam!!' },
    ],
  },
  {
    id: 'p9', name: 'Zoe Martinez', username: 'zoemarteats', initials: 'ZM',
    avatarColor: 'from-rose-500 to-pink-600', ts: NOW - 22 * 3600000,
    caption: 'homemade burrito bowl > chipotle. there I said it. fight me.',
    color: 'from-green-600 to-teal-700', baseL: 241,
    preComments: [
      { user: 'Tyler B.', text: 'okay but what about the chipotle atmosphere' },
      { user: 'Zoe M.', text: 'the atmosphere at my apartment is free 💀' },
      { user: 'Maya R.', text: "she's RIGHT" },
    ],
  },
  {
    id: 'p10', name: 'Alex Chen', username: 'alexcooks', initials: 'AC',
    avatarColor: 'from-orange-500 to-red-500', ts: NOW - 26 * 3600000,
    caption: 'pasta carbonara on a tuesday because adulting means choosing when to cook fancy',
    color: 'from-yellow-500 to-orange-600', baseL: 88,
    preComments: [
      { user: 'Liam O.', text: 'the egg yolk sauce 😭' },
      { user: 'Sarah K.', text: 'this is what peak performance looks like' },
    ],
  },
  {
    id: 'p11', name: 'Jordan Lee', username: 'jordanleefood', initials: 'JL',
    avatarColor: 'from-violet-500 to-purple-600', ts: NOW - 30 * 3600000,
    caption: 'smoothie bowl looked better on pinterest 💀 but it tastes amazing so win?',
    color: 'from-pink-500 to-purple-600', baseL: 312,
    preComments: [
      { user: 'Emma C.', text: 'honestly pinterest lied to all of us' },
      { user: 'Mia J.', text: 'the taste is what matters 😭' },
    ],
  },
  {
    id: 'p12', name: 'Mia Johnson', username: 'miajcooks', initials: 'MJ',
    avatarColor: 'from-indigo-500 to-violet-600', ts: NOW - 36 * 3600000,
    caption: "made chocolate lava cake for my roommate's birthday!! she cried actual tears. I'm a chef now.",
    color: 'from-stone-700 to-stone-900', baseL: 287,
    preComments: [
      { user: 'Jordan L.', text: 'the ooze 😭 I need this in my life' },
      { user: 'Marcus D.', text: 'you are literally a chef' },
      { user: 'Tyler B.', text: "I'm coming over next time" },
      { user: 'Hannah P.', text: 'happy birthday to your roommate!!' },
    ],
  },
  {
    id: 'p13', name: 'Carlos Reyes', username: 'carlosreyes', initials: 'CR',
    avatarColor: 'from-red-500 to-rose-600', ts: NOW - 42 * 3600000,
    caption: 'carne asada birria tacos from scratch. we are SO cooking. dorm room smelled incredible all day',
    color: 'from-red-600 to-orange-700', baseL: 445,
    preComments: [
      { user: 'Zoe M.', text: 'INVITE ME NEXT TIME' },
      { user: 'Alex C.', text: 'the consommé for dipping??? 🔥' },
      { user: 'Maya R.', text: 'this is peak college cooking' },
    ],
  },
  {
    id: 'p14', name: 'Hannah Park', username: 'hannahpeats', initials: 'HP',
    avatarColor: 'from-cyan-500 to-teal-600', ts: NOW - 48 * 3600000,
    caption: 'made teriyaki salmon after watching too many food tiktoks. actually turned out incredible? who am I',
    color: 'from-orange-500 to-amber-600', baseL: 167,
    preComments: [
      { user: 'Liam O.', text: 'the glaze on that is perfect' },
      { user: 'Priya P.', text: 'food tiktok changing lives every day' },
    ],
  },
  {
    id: 'p15', name: 'Noah Williams', username: 'noahwcooks', initials: 'NW',
    avatarColor: 'from-lime-500 to-green-600', ts: NOW - 54 * 3600000,
    caption: 'made croissants at 3am during finals week. some of us stress cook instead of stress eat. they came out PERFECT',
    color: 'from-amber-300 to-yellow-500', baseL: 521,
    preComments: [
      { user: 'Jordan L.', text: 'the lamination on those 😭😭😭' },
      { user: 'Carlos R.', text: 'this is insane at 3am' },
      { user: 'Mia J.', text: 'you did the LAYERS at 3am??' },
      { user: 'Emma C.', text: 'I need to know your secret' },
    ],
  },
];

const TRENDING = [
  { name: 'Birria Tacos',     count: '2.4k views' },
  { name: 'Pasta Carbonara',  count: '1.8k views' },
  { name: 'Teriyaki Salmon',  count: '1.2k views' },
  { name: 'Overnight Oats',   count: '987 views' },
  { name: 'Chicken Tikka',    count: '856 views' },
  { name: 'Avocado Toast',    count: '741 views' },
];

const ACTIVE_COOKS = [
  { name: 'Carlos Reyes',  username: 'carlosreyes',  initials: 'CR', color: 'from-red-500 to-rose-600',      activity: 'Made birria tacos' },
  { name: 'Noah Williams', username: 'noahwcooks',   initials: 'NW', color: 'from-lime-500 to-green-600',    activity: 'Baked croissants' },
  { name: 'Priya Patel',   username: 'priyacooks',   initials: 'PP', color: 'from-yellow-500 to-orange-500', activity: 'Cooked dal tadka' },
  { name: 'Sarah Kim',     username: 'sarahkimchi',  initials: 'SK', color: 'from-purple-500 to-violet-600', activity: 'Meal prepping' },
  { name: 'Marcus Davis',  username: 'marcusd',      initials: 'MD', color: 'from-green-500 to-emerald-600', activity: 'Made tikka masala' },
];

export default function Community() {
  const [userPosts, setUserPosts] = useState(() => {
    try { return JSON.parse(localStorage.getItem('dish-user-posts') || '[]'); } catch { return []; }
  });
  const [likes, setLikes] = useState(() => {
    try { return JSON.parse(localStorage.getItem('dish-community-likes') || '{}'); } catch { return {}; }
  });
  const [comments, setComments] = useState(() => {
    try { return JSON.parse(localStorage.getItem('dish-community-comments') || '{}'); } catch { return {}; }
  });
  const [expanded, setExpanded] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareCaption, setShareCaption] = useState('');
  const [shareImage, setShareImage] = useState(null);
  const fileRef = useRef();

  useEffect(() => { localStorage.setItem('dish-user-posts', JSON.stringify(userPosts)); }, [userPosts]);
  useEffect(() => { localStorage.setItem('dish-community-likes', JSON.stringify(likes)); }, [likes]);
  useEffect(() => { localStorage.setItem('dish-community-comments', JSON.stringify(comments)); }, [comments]);

  useEffect(() => {
    const close = (e) => e.key === 'Escape' && setShowShareModal(false);
    if (showShareModal) window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [showShareModal]);

  const allPosts = [...userPosts, ...INITIAL_POSTS];

  const toggleLike = (id) => setLikes(p => ({ ...p, [id]: !p[id] }));
  const toggleExpand = (id) => setExpanded(p => ({ ...p, [id]: !p[id] }));

  const addComment = (id) => {
    const text = commentInputs[id]?.trim();
    if (!text) return;
    setComments(prev => ({ ...prev, [id]: [...(prev[id] || []), { user: 'you', text, time: Date.now() }] }));
    setCommentInputs(p => ({ ...p, [id]: '' }));
  };

  const submitPost = () => {
    if (!shareCaption.trim()) return;
    const newPost = {
      id: `user-${Date.now()}`,
      name: 'You',
      username: 'you',
      initials: 'ME',
      avatarColor: 'from-green-600 to-teal-600',
      ts: Date.now(),
      caption: shareCaption,
      color: POST_GRADIENTS[Math.floor(Math.random() * POST_GRADIENTS.length)],
      image: shareImage,
      baseL: 0,
      preComments: [],
      isUserPost: true,
    };
    setUserPosts(prev => [newPost, ...prev]);
    setShareCaption('');
    setShareImage(null);
    setShowShareModal(false);
  };

  return (
    <div className="max-w-[1200px] mx-auto px-8 py-16">
      <div className="flex gap-8 items-start">

        {/* ── Main feed ─────────────────────────────────────────── */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-1" style={{ color: '#1A1A1A' }}>Community</h1>
              <p className="text-sm" style={{ color: '#6B7280' }}>What students are cooking right now</p>
            </div>
            <button
              onClick={() => setShowShareModal(true)}
              className="flex-shrink-0 px-5 py-2.5 text-white font-semibold rounded-xl text-sm transition-all hover:opacity-90"
              style={{ backgroundColor: '#2D6A4F' }}
            >
              + Share Your Meal
            </button>
          </div>

          <div className="space-y-5">
            {allPosts.map(post => {
              const liked          = !!likes[post.id];
              const userComments   = comments[post.id] || [];
              const totalLikes     = post.baseL + (liked ? 1 : 0);
              const totalComments  = (post.preComments?.length || 0) + userComments.length;
              const isExpanded     = !!expanded[post.id];

              return (
                <div key={post.id} className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
                  {/* Header */}
                  <div className="flex items-center gap-3 p-4 pb-3">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${post.avatarColor} flex items-center justify-center text-xs font-bold text-white flex-shrink-0`}>
                      {post.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm" style={{ color: '#1A1A1A' }}>{post.name}</p>
                      <p className="text-xs" style={{ color: '#9CA3AF' }}>@{post.username} · {timeAgo(post.ts)}</p>
                    </div>
                  </div>

                  {/* Image or gradient */}
                  {post.image
                    ? <img src={post.image} alt="meal" className="w-full aspect-video object-cover" />
                    : <div className={`w-full h-60 bg-gradient-to-br ${post.color}`} />
                  }

                  {/* Caption + actions */}
                  <div className="p-4">
                    <p className="text-sm mb-3 leading-relaxed" style={{ color: '#374151' }}>{post.caption}</p>

                    <div className="flex items-center gap-5">
                      <button
                        onClick={() => toggleLike(post.id)}
                        className={`flex items-center gap-1.5 text-sm transition-colors ${liked ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}`}
                      >
                        <span>{liked ? '❤️' : '🤍'}</span>
                        <span>{totalLikes}</span>
                      </button>
                      <button
                        onClick={() => toggleExpand(post.id)}
                        className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors"
                      >
                        <span>💬</span>
                        <span>{totalComments}</span>
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        {(post.preComments?.length > 0 || userComments.length > 0) && (
                          <div className="space-y-2 mb-3 max-h-32 overflow-y-auto">
                            {(post.preComments || []).map((c, i) => (
                              <p key={`pre-${i}`} className="text-xs text-gray-500">
                                <span className="font-medium text-gray-700">{c.user}</span> {c.text}
                              </p>
                            ))}
                            {userComments.map((c, i) => (
                              <p key={`user-${i}`} className="text-xs text-gray-500">
                                <span className="font-medium text-gray-700">you</span> {c.text}
                              </p>
                            ))}
                          </div>
                        )}
                        <div className="flex gap-2">
                          <input
                            value={commentInputs[post.id] || ''}
                            onChange={e => setCommentInputs(p => ({ ...p, [post.id]: e.target.value }))}
                            onKeyDown={e => e.key === 'Enter' && addComment(post.id)}
                            placeholder="Add a comment..."
                            className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs placeholder-gray-400 outline-none transition-colors"
                            style={{ color: '#1A1A1A' }}
                            onFocus={e => e.target.style.borderColor = '#2D6A4F'}
                            onBlur={e => e.target.style.borderColor = '#E5E7EB'}
                          />
                          <button
                            onClick={() => addComment(post.id)}
                            className="px-3 py-1.5 text-white rounded-lg text-xs font-medium transition-all hover:opacity-90"
                            style={{ backgroundColor: '#2D6A4F' }}
                          >
                            Post
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Sidebar ───────────────────────────────────────────── */}
        <div className="w-64 flex-shrink-0 space-y-5 sticky top-24">
          {/* Trending */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="font-semibold text-sm mb-4" style={{ color: '#1A1A1A' }}>🔥 Trending Dishes</h3>
            <div className="space-y-3">
              {TRENDING.map((item, i) => (
                <div key={i} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-xs text-gray-400 w-4 flex-shrink-0">{i + 1}</span>
                    <span className="text-sm truncate" style={{ color: '#374151' }}>{item.name}</span>
                  </div>
                  <span className="text-[11px] text-gray-400 flex-shrink-0">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Active cooks */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="font-semibold text-sm mb-4" style={{ color: '#1A1A1A' }}>👨‍🍳 Active Cooks</h3>
            <div className="space-y-4">
              {ACTIVE_COOKS.map((cook, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${cook.color} flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0`}>
                    {cook.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium truncate" style={{ color: '#1A1A1A' }}>{cook.name}</p>
                    <p className="text-[11px] truncate" style={{ color: '#9CA3AF' }}>{cook.activity}</p>
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Share modal ───────────────────────────────────────────── */}
      {showShareModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm"
          onClick={e => e.target === e.currentTarget && setShowShareModal(false)}
        >
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold" style={{ color: '#1A1A1A' }}>Share Your Meal</h2>
                <button onClick={() => setShowShareModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
              </div>

              {/* Photo upload */}
              <div
                onClick={() => fileRef.current.click()}
                className={`relative rounded-xl border-2 border-dashed cursor-pointer transition-all mb-4 flex items-center justify-center overflow-hidden ${
                  shareImage ? 'border-transparent' : 'border-gray-200 hover:border-[#2D6A4F]/40 hover:bg-gray-50'
                }`}
                style={{ height: 200 }}
              >
                {shareImage ? (
                  <>
                    <img src={shareImage} alt="preview" className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <span className="text-sm font-medium text-white bg-black/50 px-4 py-2 rounded-lg">Change Photo</span>
                    </div>
                  </>
                ) : (
                  <div className="text-center">
                    <div className="text-4xl mb-2">📷</div>
                    <p className="text-sm font-medium" style={{ color: '#6B7280' }}>Add a photo</p>
                    <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>Optional · JPG, PNG, WEBP</p>
                  </div>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => {
                    const f = e.target.files[0];
                    if (!f) return;
                    const reader = new FileReader();
                    reader.onload = ev => setShareImage(ev.target.result);
                    reader.readAsDataURL(f);
                  }}
                />
              </div>

              {/* Caption */}
              <textarea
                value={shareCaption}
                onChange={e => setShareCaption(e.target.value)}
                placeholder="What did you make? How did it go? 🍳"
                rows={3}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm placeholder-gray-400 outline-none transition-colors resize-none mb-4"
                style={{ color: '#1A1A1A' }}
                onFocus={e => e.target.style.borderColor = '#2D6A4F'}
                onBlur={e => e.target.style.borderColor = '#E5E7EB'}
              />

              <div className="flex gap-3">
                <button
                  onClick={() => { setShowShareModal(false); setShareCaption(''); setShareImage(null); }}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-500 hover:text-gray-700 hover:border-gray-300 rounded-xl text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={submitPost}
                  disabled={!shareCaption.trim()}
                  className="flex-1 py-2.5 text-white rounded-xl text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#2D6A4F' }}
                >
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
