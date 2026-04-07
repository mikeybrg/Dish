import { useState, useEffect } from 'react';

const PROFILE = {
  name: 'Alex Chen',
  username: '@alexcooks',
  bio: 'College junior figuring out how to eat well on $50/week 🍳 CSCI major, amateur chef',
  initials: 'AC',
};

const POSTS = [
  { id: 1,  meal: 'Pasta Carbonara',    caption: 'Finally nailed this after 3 attempts 🍝',              color: 'from-yellow-600 to-orange-600', baseL: 42, baseC: 5 },
  { id: 2,  meal: 'Avocado Toast',      caption: 'Healthy breakfast before midterms ☀️',                 color: 'from-green-500 to-teal-500',    baseL: 28, baseC: 2 },
  { id: 3,  meal: 'Fried Rice',         caption: 'Using up leftover veggies, came out perfect',         color: 'from-amber-500 to-yellow-600',  baseL: 19, baseC: 1 },
  { id: 4,  meal: 'Upgraded Ramen',     caption: '50 cent ramen → actual meal 💪',                      color: 'from-orange-500 to-red-600',    baseL: 87, baseC: 12 },
  { id: 5,  meal: 'Smoothie Bowl',      caption: 'Healthy phase, day 3. Still going.',                  color: 'from-pink-500 to-purple-600',   baseL: 34, baseC: 4 },
  { id: 6,  meal: 'Chicken Quesadilla', caption: 'Sunday meal prep done ✅',                            color: 'from-orange-600 to-red-700',    baseL: 51, baseC: 7 },
  { id: 7,  meal: 'Mac & Cheese',       caption: 'This hit different at 2am during finals',             color: 'from-yellow-400 to-amber-500',  baseL: 93, baseC: 15 },
  { id: 8,  meal: 'Banana Pancakes',    caption: '2 ingredients. No way it works. It worked.',          color: 'from-yellow-300 to-orange-400', baseL: 61, baseC: 8 },
  { id: 9,  meal: 'Beef Stir Fry',      caption: 'Quick dinner between classes 🥢',                    color: 'from-red-500 to-rose-600',      baseL: 23, baseC: 2 },
  { id: 10, meal: 'Burrito Bowl',       caption: 'Chipotle at home. Close enough.',                     color: 'from-green-600 to-teal-700',    baseL: 45, baseC: 6 },
  { id: 11, meal: 'Pesto Pasta',        caption: 'Store-bought pesto is not cheating',                  color: 'from-green-400 to-emerald-500', baseL: 37, baseC: 3 },
  { id: 12, meal: 'Tomato Soup',        caption: 'Sick during finals week. This saved me.',             color: 'from-red-500 to-orange-600',    baseL: 29, baseC: 1 },
];

export default function Profile() {
  const [likes, setLikes] = useState(() => {
    try { return JSON.parse(localStorage.getItem('dish-likes') || '{}'); } catch { return {}; }
  });
  const [comments, setComments] = useState(() => {
    try { return JSON.parse(localStorage.getItem('dish-comments') || '{}'); } catch { return {}; }
  });
  const [expanded, setExpanded] = useState({});
  const [inputs, setInputs] = useState({});

  useEffect(() => { localStorage.setItem('dish-likes', JSON.stringify(likes)); }, [likes]);
  useEffect(() => { localStorage.setItem('dish-comments', JSON.stringify(comments)); }, [comments]);

  const toggleLike = (id) => setLikes(p => ({ ...p, [id]: !p[id] }));

  const toggleComments = (id) => setExpanded(p => ({ ...p, [id]: !p[id] }));

  const addComment = (id) => {
    const text = inputs[id]?.trim();
    if (!text) return;
    const updated = { ...comments, [id]: [...(comments[id] || []), { text, time: Date.now() }] };
    setComments(updated);
    setInputs(p => ({ ...p, [id]: '' }));
  };

  const totalLikes = POSTS.reduce((acc, p) => acc + p.baseL + (likes[p.id] ? 1 : 0), 0);

  return (
    <div className="max-w-[1200px] mx-auto px-8 py-16">
      {/* Profile Header */}
      <div className="flex items-start gap-10 mb-14 pb-14 border-b border-white/5">
        <div className="w-28 h-28 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-2xl font-bold text-white flex-shrink-0">
          {PROFILE.initials}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-5 mb-3">
            <h1 className="text-2xl font-bold">{PROFILE.name}</h1>
            <button className="px-5 py-1.5 rounded-lg border border-white/10 text-sm font-medium text-gray-300 hover:text-white hover:border-white/20 transition-colors">
              Edit Profile
            </button>
          </div>
          <p className="text-gray-400 text-sm mb-3">{PROFILE.username}</p>
          <div className="flex gap-8 mb-4">
            <div className="text-sm"><span className="font-bold text-white">{POSTS.length}</span> <span className="text-gray-500">posts</span></div>
            <div className="text-sm"><span className="font-bold text-white">142</span> <span className="text-gray-500">followers</span></div>
            <div className="text-sm"><span className="font-bold text-white">89</span> <span className="text-gray-500">following</span></div>
            <div className="text-sm"><span className="font-bold text-white">{totalLikes}</span> <span className="text-gray-500">likes</span></div>
          </div>
          <p className="text-gray-300 text-sm leading-relaxed max-w-md">{PROFILE.bio}</p>
        </div>
      </div>

      {/* Posts Grid */}
      <div className="grid grid-cols-3 gap-6">
        {POSTS.map(post => {
          const liked = !!likes[post.id];
          const postComments = comments[post.id] || [];
          const commentCount = post.baseC + postComments.length;
          const showComments = !!expanded[post.id];

          return (
            <div key={post.id} className="rounded-2xl overflow-hidden border border-white/5 bg-white/[0.02]">
              <div className={`h-52 bg-gradient-to-br ${post.color}`} />
              <div className="p-4">
                <p className="font-semibold text-sm mb-1">{post.meal}</p>
                <p className="text-xs text-gray-400 mb-4 leading-relaxed">{post.caption}</p>
                <div className="flex items-center gap-5">
                  <button
                    onClick={() => toggleLike(post.id)}
                    className={`flex items-center gap-1.5 text-xs transition-colors ${liked ? 'text-red-400' : 'text-gray-500 hover:text-red-400'}`}
                  >
                    <span>{liked ? '❤️' : '🤍'}</span>
                    <span>{post.baseL + (liked ? 1 : 0)}</span>
                  </button>
                  <button
                    onClick={() => toggleComments(post.id)}
                    className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-white transition-colors"
                  >
                    <span>💬</span>
                    <span>{commentCount}</span>
                  </button>
                </div>

                {showComments && (
                  <div className="mt-4 pt-4 border-t border-white/5">
                    {postComments.length > 0 && (
                      <div className="space-y-2 mb-3 max-h-28 overflow-y-auto">
                        {postComments.map((c, i) => (
                          <p key={i} className="text-xs text-gray-400">
                            <span className="font-medium text-gray-300">you</span> {c.text}
                          </p>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <input
                        value={inputs[post.id] || ''}
                        onChange={e => setInputs(p => ({ ...p, [post.id]: e.target.value }))}
                        onKeyDown={e => e.key === 'Enter' && addComment(post.id)}
                        placeholder="Add a comment..."
                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-gray-600 outline-none focus:border-orange-500/50 transition-colors"
                      />
                      <button
                        onClick={() => addComment(post.id)}
                        className="px-3 py-1.5 bg-orange-500 hover:bg-orange-400 text-white rounded-lg text-xs font-medium transition-colors"
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
  );
}
