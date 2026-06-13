import React, { useState, useEffect, useMemo } from "react";
import {
  Home, Users, Target, User, LifeBuoy, X, Heart, Sparkles, Shield,
  Flag, MessageCircle, Plus, CheckCircle2, Wind, Phone, Send,
  ChevronRight, Award, Lock, Download, Trash2, EyeOff, Eye, RotateCcw,
} from "lucide-react";
/* ------------------------------------------------------------------ */
/*  ORBIT — recovery community, rebuilt                                */
/*  Design tokens (see <style> below):                                 */
/*   --mist  #F3F4F8  calm cool background                             */
/*   --space #1B2138  deep twilight (hero + nav)                       */
/*   --horizon #6B7FD7 periwinkle — primary / trust                    */
/*   --sage  #6FAF95  growth / progress                                */
/*   --dawn  #E0954B  warm amber — milestones + help (you're doing it) */
/* ------------------------------------------------------------------ */
const MILESTONES = [
  { d: 1, r: 34, label: "First day" },
  { d: 7, r: 47, label: "One week" },
  { d: 30, r: 60, label: "One month" },
  { d: 90, r: 73, label: "90 days" },
  { d: 180, r: 86, label: "Half a year" },
  { d: 365, r: 99, label: "One year" },
];
const PROMPTS = [
  "Name one small thing that helped you get through today.",
  "Who could you reach out to before the urge gets loud?",
  "What does the next 10 minutes look like if you just stay still?",
  "What's one reason today was worth showing up for?",
];
const seedPosts = () => [
  {
    id: 1, name: "Maya R.", circle: "Just for today", mood: "steady",
    text: "Day 12. The evenings are the hardest, but I made tea instead and texted my sister. Small win, but it's mine.",
    reactions: { support: 14, hope: 9, strength: 6 }, sensitive: false,
    createdAt: Date.now() - 1000 * 60 * 42, comments: 3,
  },
  {
    id: 2, name: "Devon", circle: "Sober mornings", mood: "tired",
    text: "Honest check-in: I had a really hard craving at lunch. Didn't act on it. Came here instead. That counts, right?",
    reactions: { support: 31, hope: 18, strength: 22 }, sensitive: true,
    createdAt: Date.now() - 1000 * 60 * 60 * 3, comments: 7,
  },
  {
    id: 3, name: "Priya", circle: "Parents in recovery", mood: "hopeful",
    text: "My daughter said she's proud of me today. I'm keeping that one in my pocket for the next rough night.",
    reactions: { support: 47, hope: 33, strength: 12 }, sensitive: false,
    createdAt: Date.now() - 1000 * 60 * 60 * 9, comments: 11,
  },
];
const CIRCLES = [
  { name: "Just for today", members: 1240, blurb: "One day at a time, together." },
  { name: "Sober mornings", members: 873, blurb: "Start the day with company." },
  { name: "Parents in recovery", members: 512, blurb: "Recovery while raising kids." },
  { name: "Late-night urges", members: 689, blurb: "Someone's always awake here." },
];
const ROOMS = [
  { id: "r1", title: "21-day reset", objective: "Rebuild a calm evening routine", members: 4, cap: 6, days: 21, progress: 38 },
  { id: "r2", title: "Morning anchors", objective: "Check in before 9am, every day", members: 5, cap: 6, days: 14, progress: 64 },
];
const MOODS = [
  { key: "rough", label: "Rough", emoji: "😣" },
  { key: "tired", label: "Tired", emoji: "😮‍💨" },
  { key: "steady", label: "Steady", emoji: "😌" },
  { key: "hopeful", label: "Hopeful", emoji: "🙂" },
  { key: "strong", label: "Strong", emoji: "💪" },
];
function timeAgo(ts) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}
/* ---- lightweight persistence so the prototype remembers a session --- */
const STORE_KEY = "orbit.state.v1";
const todayStamp = () => new Date().toISOString().slice(0, 10);
function loadState() {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY)) || null;
  } catch {
    return null;
  }
}
/* ---------------------------- Orbit hero --------------------------- */
function OrbitRing({ days }) {
  const reached = MILESTONES.filter((m) => days >= m.d);
  const outer = reached.length ? reached[reached.length - 1] : { r: 34, d: 0 };
  const next = MILESTONES.find((m) => days < m.d);
  return (
    <div className="orbit-wrap">
      <svg viewBox="0 0 220 220" className="orbit-svg" role="img"
           aria-label={`${days} days in orbit`}>
        <defs>
          <radialGradient id="core" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#E0954B" stopOpacity="0.9" />
            <stop offset="60%" stopColor="#6B7FD7" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#6B7FD7" stopOpacity="0" />
          </radialGradient>
        </defs>
        {MILESTONES.map((m) => (
          <circle key={m.d} cx="110" cy="110" r={m.r} fill="none"
            stroke={days >= m.d ? "#9DB0F0" : "#3A4266"}
            strokeWidth={days >= m.d ? 1.4 : 0.8}
            strokeOpacity={days >= m.d ? 0.8 : 0.5} />
        ))}
        <circle cx="110" cy="110" r="26" fill="url(#core)" className="orbit-core" />
        {/* traveler on the highest reached ring */}
        <g className="orbit-traveler" style={{ transformOrigin: "110px 110px" }}>
          <circle cx="110" cy={110 - outer.r} r="5" fill="#E0954B" />
          <circle cx="110" cy={110 - outer.r} r="9" fill="#E0954B" opacity="0.25" />
        </g>
      </svg>
      <div className="orbit-center">
        <div className="orbit-num">{days}</div>
        <div className="orbit-label">{days === 1 ? "day" : "days"} in orbit</div>
      </div>
      {next && (
        <div className="orbit-next">
          {next.d - days} {next.d - days === 1 ? "day" : "days"} to {next.label.toLowerCase()}
        </div>
      )}
    </div>
  );
}
/* ----------------------------- Help overlay ------------------------ */
function HelpSheet({ open, onClose }) {
  const [breath, setBreath] = useState(false);
  if (!open) return null;
  return (
    <div className="sheet-scrim" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()} role="dialog"
           aria-label="Get help now">
        <div className="sheet-head">
          <div className="sheet-title"><LifeBuoy size={20} /> You're not alone right now</div>
          <button className="icon-btn" onClick={onClose} aria-label="Close"><X size={20} /></button>
        </div>
        <p className="sheet-sub">If you're in danger or thinking about harming yourself, please reach out. These lines are free, confidential, and open 24/7.</p>
        <a className="help-line" href="tel:988">
          <Phone size={18} />
          <div><strong>988 Suicide &amp; Crisis Lifeline</strong><span>Call or text 988 (US)</span></div>
          <ChevronRight size={18} />
        </a>
        <a className="help-line" href="tel:18006624357">
          <Phone size={18} />
          <div><strong>SAMHSA National Helpline</strong><span>1-800-662-4357 · treatment referrals (US)</span></div>
          <ChevronRight size={18} />
        </a>
        <button className="breathe-btn" onClick={() => setBreath((b) => !b)}>
          <Wind size={18} /> {breath ? "Stop" : "Try a 60-second breath"}
        </button>
        {breath && (
          <div className="breathe-box">
            <div className="breathe-ball" />
            <p>Breathe in as it grows, out as it shrinks. Urges peak and pass — you can ride this one out.</p>
          </div>
        )}
        <p className="help-note">
          These are U.S. examples for the prototype. Before launch, swap in verified,
          localized crisis &amp; recovery lines for every country and language you support.
        </p>
      </div>
    </div>
  );
}
/* ----------------------------- Feed post --------------------------- */
function Post({ post, onReact, onReport }) {
  const [revealed, setRevealed] = useState(!post.sensitive);
  const [reported, setReported] = useState(false);
  const initials = post.name.split(" ").map((w) => w[0]).join("").slice(0, 2);
  return (
    <article className="post">
      <div className="post-head">
        <div className="avatar">{initials}</div>
        <div className="post-meta">
          <strong>{post.name}</strong>
          <span>{post.circle} · {timeAgo(post.createdAt)}</span>
        </div>
        <button className="report-btn" aria-label="Report post"
          onClick={() => { setReported(true); onReport?.(); }}>
          <Flag size={15} />
        </button>
      </div>
      {!revealed ? (
        <button className="sensitive-veil" onClick={() => setRevealed(true)}>
          <EyeOff size={16} /> This post mentions a difficult moment. Tap to read.
        </button>
      ) : (
        <p className="post-body">{post.text}</p>
      )}
      <div className="react-row">
        <button onClick={() => onReact(post.id, "support")}>
          <Heart size={15} /> {post.reactions.support}
        </button>
        <button onClick={() => onReact(post.id, "hope")}>
          <Sparkles size={15} /> {post.reactions.hope}
        </button>
        <button onClick={() => onReact(post.id, "strength")}>
          <Shield size={15} /> {post.reactions.strength}
        </button>
        <span className="comment-count"><MessageCircle size={15} /> {post.comments}</span>
      </div>
      {reported && <div className="reported-note">Thanks — a moderator will review this quietly.</div>}
    </article>
  );
}
/* ------------------------------- App ------------------------------- */
export default function Orbit() {
  const saved = useMemo(() => loadState(), []);
  const [tab, setTab] = useState("home");
  const [helpOpen, setHelpOpen] = useState(false);
  const [days, setDays] = useState(saved?.days ?? 12);
  const [checkedToday, setCheckedToday] = useState(saved?.checkInDate === todayStamp());
  const [mood, setMood] = useState(saved?.mood ?? null);
  const [posts, setPosts] = useState(saved?.posts ?? seedPosts);
  const [draft, setDraft] = useState("");
  const [draftCircle, setDraftCircle] = useState(CIRCLES[0].name);
  const [joined, setJoined] = useState(saved?.joined ?? ["Just for today"]);
  const [inRoom, setInRoom] = useState(saved?.inRoom ?? []);
  const [toast, setToast] = useState(null);
  const [celebrate, setCelebrate] = useState(null);
  const [resetOpen, setResetOpen] = useState(false);
  const prompt = useMemo(() => PROMPTS[days % PROMPTS.length], [days]);
  const flash = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2600); };
  /* persist the bits that should survive a reload (nice for live demos) */
  useEffect(() => {
    const state = {
      days, mood, posts, joined, inRoom,
      checkInDate: checkedToday ? todayStamp() : saved?.checkInDate ?? null,
    };
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch { /* ignore */ }
  }, [days, mood, posts, joined, inRoom, checkedToday]); // eslint-disable-line react-hooks/exhaustive-deps
  const logCheckIn = () => {
    if (checkedToday) return;
    const newDays = days + 1;
    setDays(newDays);
    setCheckedToday(true);
    const hit = MILESTONES.find((m) => m.d === newDays);
    if (hit) setCelebrate(hit);
    else flash("Check-in logged. That's the whole job today.");
  };
  const doReset = () => {
    setDays(0); setResetOpen(false); setCheckedToday(false);
    flash("Reset noted. A return isn't a failure — it's still the path.");
  };
  const react = (id, kind) =>
    setPosts((ps) => ps.map((p) =>
      p.id === id ? { ...p, reactions: { ...p.reactions, [kind]: p.reactions[kind] + 1 } } : p));
  const publish = () => {
    if (!draft.trim()) return;
    setPosts((ps) => [{
      id: Date.now(), name: "You", circle: draftCircle, mood: mood || "steady",
      text: draft.trim(), reactions: { support: 0, hope: 0, strength: 0 },
      sensitive: false, createdAt: Date.now(), comments: 0,
    }, ...ps]);
    setDraft("");
    flash("Shared with your circle.");
  };
  const reachedCount = MILESTONES.filter((m) => days >= m.d).length;
  return (
    <div className="orbit-app">
      <style>{CSS}</style>
      {/* top bar */}
      <header className="topbar">
        <div className="brand">ORBIT</div>
        <button className="ghost-help" onClick={() => setHelpOpen(true)}>
          <LifeBuoy size={16} /> Help
        </button>
      </header>
      <main className="screen">
        {tab === "home" && (
          <>
            <section className="hero">
              <OrbitRing days={days} />
              <div className="hero-actions">
                <button className="primary-cta" disabled={checkedToday} onClick={logCheckIn}>
                  <CheckCircle2 size={18} />
                  {checkedToday ? "Checked in for today" : "Log today's check-in"}
                </button>
                <button className="reset-link" onClick={() => setResetOpen(true)}>
                  <RotateCcw size={14} /> I had a setback
                </button>
              </div>
            </section>
            <section className="card mood-card">
              <h3>How are you, really?</h3>
              <div className="mood-row">
                {MOODS.map((m) => (
                  <button key={m.key}
                    className={"mood-chip" + (mood === m.key ? " on" : "")}
                    onClick={() => { setMood(m.key); flash("Logged — only you can see this."); }}>
                    <span>{m.emoji}</span>{m.label}
                  </button>
                ))}
              </div>
            </section>
            <section className="card prompt-card">
              <div className="prompt-eyebrow"><Sparkles size={14} /> Today's reflection</div>
              <p>{prompt}</p>
            </section>
            <section className="composer card">
              <textarea value={draft} maxLength={500}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Share where you're at. No pressure to be okay." />
              <div className="composer-foot">
                <select value={draftCircle} onChange={(e) => setDraftCircle(e.target.value)}>
                  {CIRCLES.map((c) => <option key={c.name}>{c.name}</option>)}
                </select>
                <button className="post-btn" onClick={publish}><Send size={15} /> Post</button>
              </div>
            </section>
            <div className="feed-head"><h2>Your feed</h2><span>{posts.length} shared</span></div>
            {posts.map((p) => (
              <Post key={p.id} post={p} onReact={react} onReport={() => {}} />
            ))}
          </>
        )}
        {tab === "circles" && (
          <>
            <div className="screen-title"><h2>Support circles</h2><p>Small rooms of people who get it.</p></div>
            {CIRCLES.map((c) => {
              const isIn = joined.includes(c.name);
              return (
                <section key={c.name} className="card list-row">
                  <div>
                    <strong>{c.name}</strong>
                    <p>{c.blurb}</p>
                    <span className="meta-mini"><Users size={13} /> {c.members.toLocaleString()} members</span>
                  </div>
                  <button className={isIn ? "pill on" : "pill"}
                    onClick={() => {
                      setJoined((j) => isIn ? j.filter((x) => x !== c.name) : [...j, c.name]);
                      flash(isIn ? "Left circle" : `Joined ${c.name}`);
                    }}>
                    {isIn ? "Joined" : "Join"}
                  </button>
                </section>
              );
            })}
          </>
        )}
        {tab === "rooms" && (
          <>
            <div className="screen-title"><h2>Accountability rooms</h2><p>3–6 people, a shared goal, gentle check-ins.</p></div>
            {ROOMS.map((r) => {
              const isIn = inRoom.includes(r.id);
              return (
                <section key={r.id} className="card room-card">
                  <div className="room-top">
                    <strong>{r.title}</strong>
                    <span className="meta-mini"><Lock size={12} /> {r.members}/{r.cap}</span>
                  </div>
                  <p className="room-obj">{r.objective}</p>
                  <div className="progress"><div style={{ width: `${r.progress}%` }} /></div>
                  <div className="room-foot">
                    <span>{r.days}-day room · {r.progress}% through</span>
                    <button className={isIn ? "pill on" : "pill"}
                      onClick={() => {
                        setInRoom((a) => isIn ? a.filter((x) => x !== r.id) : [...a, r.id]);
                        flash(isIn ? "Left room" : "Joined — say hi when you're ready.");
                      }}>
                      {isIn ? "Check in" : "Join"}
                    </button>
                  </div>
                </section>
              );
            })}
          </>
        )}
        {tab === "profile" && (
          <>
            <section className="card profile-head">
              <div className="avatar big">YOU</div>
              <strong>Your profile</strong>
              <span className="meta-mini">Recovery focus · staying present</span>
            </section>
            <section className="card">
              <div className="prompt-eyebrow"><Award size={14} /> Milestones</div>
              <div className="milestone-grid">
                {MILESTONES.map((m) => (
                  <div key={m.d} className={"ms-chip" + (days >= m.d ? " on" : "")}>
                    <span>{m.d >= 365 ? "1y" : m.d + "d"}</span>{m.label}
                  </div>
                ))}
              </div>
              <p className="ms-count">{reachedCount} of {MILESTONES.length} reached</p>
            </section>
            <section className="card">
              <div className="prompt-eyebrow"><Shield size={14} /> Your data, your call</div>
              <button className="data-row" onClick={() => flash("Export started — you'll get a link.")}>
                <Download size={16} /> Export my data <ChevronRight size={16} />
              </button>
              <button className="data-row" onClick={() => flash("You can post anonymously anytime.")}>
                <Eye size={16} /> Anonymous posting <ChevronRight size={16} />
              </button>
              <button className="data-row danger" onClick={() => flash("We'd guide you through this carefully.")}>
                <Trash2 size={16} /> Delete my account <ChevronRight size={16} />
              </button>
              <p className="help-note">You set the pace here. No streak guilt, no dark patterns, no selling your data.</p>
            </section>
          </>
        )}
      </main>
      {/* floating help */}
      <button className="float-help" onClick={() => setHelpOpen(true)} aria-label="Get help now">
        <LifeBuoy size={20} /> <span>Help</span>
      </button>
      {/* bottom nav */}
      <nav className="tabbar">
        {[
          { k: "home", icon: Home, label: "Home" },
          { k: "circles", icon: Users, label: "Circles" },
          { k: "rooms", icon: Target, label: "Rooms" },
          { k: "profile", icon: User, label: "You" },
        ].map(({ k, icon: Icon, label }) => (
          <button key={k} className={"tab" + (tab === k ? " on" : "")} onClick={() => setTab(k)}>
            <Icon size={20} /><span>{label}</span>
          </button>
        ))}
      </nav>
      <HelpSheet open={helpOpen} onClose={() => setHelpOpen(false)} />
      {celebrate && (
        <div className="sheet-scrim" onClick={() => setCelebrate(null)}>
          <div className="celebrate" onClick={(e) => e.stopPropagation()}>
            <Sparkles size={32} />
            <h3>{celebrate.label}</h3>
            <p>{days} days. You stayed in orbit. Take a breath and feel this one.</p>
            <button className="primary-cta" onClick={() => setCelebrate(null)}>Keep going</button>
          </div>
        </div>
      )}
      {resetOpen && (
        <div className="sheet-scrim" onClick={() => setResetOpen(false)}>
          <div className="celebrate soft" onClick={(e) => e.stopPropagation()}>
            <RotateCcw size={28} />
            <h3>A setback isn't the end</h3>
            <p>Resetting your count doesn't erase what you learned. Want to set today as a fresh start?</p>
            <button className="primary-cta" onClick={doReset}>Start fresh today</button>
            <button className="reset-link center" onClick={() => setResetOpen(false)}>Not now</button>
          </div>
        </div>
      )}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
/* ------------------------------- styles ---------------------------- */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600&family=Hanken+Grotesk:wght@400;500;600;700&display=swap');
* { box-sizing: border-box; margin: 0; }
.orbit-app{
  --mist:#F3F4F8; --space:#1B2138; --space2:#252C49; --horizon:#6B7FD7;
  --sage:#6FAF95; --dawn:#E0954B; --ink:#262B40; --muted:#7A819B; --line:#E7E9F2;
  font-family:'Hanken Grotesk',system-ui,sans-serif; color:var(--ink);
  background:var(--mist); max-width:460px; margin:0 auto; min-height:100vh;
  position:relative; padding-bottom:78px; -webkit-font-smoothing:antialiased;
}
.topbar{ position:sticky; top:0; z-index:20; display:flex; align-items:center;
  justify-content:space-between; padding:14px 18px; background:rgba(243,244,248,.85);
  backdrop-filter:blur(10px); border-bottom:1px solid var(--line); }
.brand{ font-family:'Fraunces',serif; font-weight:600; letter-spacing:.18em; font-size:17px; }
.ghost-help{ display:flex; align-items:center; gap:5px; font-size:13px; font-weight:600;
  color:var(--horizon); background:none; border:none; cursor:pointer; }
.screen{ padding:16px; display:flex; flex-direction:column; gap:14px; }
/* hero */
.hero{ background:linear-gradient(160deg,#1B2138 0%,#2A3258 70%,#3a3f63 100%);
  border-radius:24px; padding:26px 20px 22px; color:#fff; text-align:center; }
.orbit-wrap{ position:relative; width:230px; height:230px; margin:0 auto; }
.orbit-svg{ width:100%; height:100%; }
.orbit-core{ animation:pulse 4s ease-in-out infinite; transform-origin:110px 110px; }
.orbit-traveler{ animation:spin 26s linear infinite; }
.orbit-center{ position:absolute; inset:0; display:flex; flex-direction:column;
  align-items:center; justify-content:center; pointer-events:none; }
.orbit-num{ font-family:'Fraunces',serif; font-size:56px; font-weight:600; line-height:1;
  background:linear-gradient(180deg,#fff,#E0954B); -webkit-background-clip:text;
  -webkit-text-fill-color:transparent; }
.orbit-label{ font-size:12px; letter-spacing:.12em; text-transform:uppercase; color:#A9B2D6; margin-top:4px; }
.orbit-next{ font-size:12.5px; color:#C3CAE8; margin-top:6px; }
.hero-actions{ margin-top:18px; display:flex; flex-direction:column; align-items:center; gap:10px; }
.primary-cta{ display:flex; align-items:center; justify-content:center; gap:8px; width:100%;
  max-width:300px; padding:14px; border-radius:14px; border:none; cursor:pointer;
  background:var(--dawn); color:#241303; font-weight:700; font-size:15px; }
.primary-cta:disabled{ background:#5a6488; color:#cfd5ee; cursor:default; }
.reset-link{ display:flex; align-items:center; gap:6px; background:none; border:none;
  color:#A9B2D6; font-size:13px; cursor:pointer; }
.reset-link.center{ justify-content:center; width:100%; color:var(--muted); margin-top:4px; }
/* cards */
.card{ background:#fff; border:1px solid var(--line); border-radius:18px; padding:16px; }
.card h3{ font-size:15px; margin-bottom:12px; }
.mood-row{ display:flex; gap:8px; flex-wrap:wrap; }
.mood-chip{ display:flex; flex-direction:column; align-items:center; gap:3px; flex:1;
  min-width:58px; padding:10px 4px; border-radius:13px; border:1px solid var(--line);
  background:#fafbfe; font-size:11.5px; font-weight:600; color:var(--muted); cursor:pointer; }
.mood-chip span{ font-size:19px; }
.mood-chip.on{ border-color:var(--horizon); background:#eef1fc; color:var(--ink); }
.prompt-eyebrow{ display:flex; align-items:center; gap:6px; font-size:12px; font-weight:700;
  letter-spacing:.04em; color:var(--sage); text-transform:uppercase; margin-bottom:8px; }
.prompt-card p{ font-family:'Fraunces',serif; font-size:18px; line-height:1.4; }
/* composer */
.composer textarea{ width:100%; border:none; resize:none; min-height:64px; font:inherit;
  font-size:14.5px; color:var(--ink); outline:none; }
.composer textarea::placeholder{ color:var(--muted); }
.composer-foot{ display:flex; align-items:center; gap:8px; margin-top:8px;
  border-top:1px solid var(--line); padding-top:10px; }
.composer-foot select{ flex:1; border:1px solid var(--line); border-radius:10px;
  padding:8px; font:inherit; font-size:13px; color:var(--ink); background:#fafbfe; }
.post-btn{ display:flex; align-items:center; gap:6px; background:var(--horizon); color:#fff;
  border:none; border-radius:10px; padding:9px 16px; font-weight:700; font-size:13.5px; cursor:pointer; }
/* feed */
.feed-head,.screen-title{ display:flex; align-items:baseline; justify-content:space-between; padding:6px 2px 0; }
.feed-head h2{ font-size:16px; } .feed-head span{ font-size:12px; color:var(--muted); }
.screen-title{ flex-direction:column; gap:2px; align-items:flex-start; padding:4px 2px 6px; }
.screen-title h2{ font-family:'Fraunces',serif; font-size:24px; }
.screen-title p{ font-size:13.5px; color:var(--muted); }
.post{ background:#fff; border:1px solid var(--line); border-radius:18px; padding:15px; }
.post-head{ display:flex; align-items:center; gap:10px; margin-bottom:10px; }
.avatar{ width:38px; height:38px; border-radius:50%; background:linear-gradient(135deg,#6B7FD7,#6FAF95);
  color:#fff; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:13px; }
.avatar.big{ width:60px; height:60px; font-size:17px; margin:0 auto 8px; }
.post-meta{ flex:1; display:flex; flex-direction:column; }
.post-meta strong{ font-size:14px; } .post-meta span{ font-size:12px; color:var(--muted); }
.report-btn{ background:none; border:none; color:#C2C7D6; cursor:pointer; padding:4px; }
.post-body{ font-size:14.5px; line-height:1.5; margin-bottom:12px; }
.sensitive-veil{ width:100%; text-align:left; display:flex; align-items:center; gap:8px;
  background:#f5f3ef; border:1px dashed #d8cdba; color:#8a7a5c; border-radius:12px;
  padding:14px; font-size:13.5px; margin-bottom:12px; cursor:pointer; }
.react-row{ display:flex; align-items:center; gap:6px; }
.react-row button{ display:flex; align-items:center; gap:5px; background:#fafbfe; border:1px solid var(--line);
  border-radius:20px; padding:6px 11px; font-size:12.5px; font-weight:600; color:var(--muted); cursor:pointer; }
.react-row button:active{ background:#eef1fc; color:var(--horizon); }
.comment-count{ display:flex; align-items:center; gap:5px; font-size:12.5px; color:var(--muted); margin-left:auto; }
.reported-note{ margin-top:10px; font-size:12.5px; color:var(--sage); }
/* lists / rooms */
.list-row{ display:flex; align-items:center; gap:12px; }
.list-row strong{ font-size:14.5px; } .list-row p{ font-size:13px; color:var(--muted); margin:2px 0 5px; }
.meta-mini{ display:inline-flex; align-items:center; gap:5px; font-size:12px; color:var(--muted); }
.pill{ border:1px solid var(--horizon); color:var(--horizon); background:#fff; border-radius:20px;
  padding:8px 16px; font-weight:700; font-size:13px; cursor:pointer; white-space:nowrap; }
.pill.on{ background:var(--horizon); color:#fff; }
.room-top{ display:flex; justify-content:space-between; align-items:center; }
.room-obj{ font-size:13.5px; color:var(--muted); margin:6px 0 10px; }
.progress{ height:7px; background:var(--line); border-radius:9px; overflow:hidden; }
.progress div{ height:100%; background:linear-gradient(90deg,var(--sage),var(--horizon)); }
.room-foot{ display:flex; align-items:center; justify-content:space-between; margin-top:10px; }
.room-foot span{ font-size:12px; color:var(--muted); }
/* profile */
.profile-head{ text-align:center; }
.profile-head strong{ display:block; font-size:16px; }
.milestone-grid{ display:grid; grid-template-columns:repeat(3,1fr); gap:8px; }
.ms-chip{ display:flex; flex-direction:column; gap:2px; padding:11px 8px; border-radius:13px;
  border:1px solid var(--line); background:#fafbfe; font-size:11px; color:var(--muted); }
.ms-chip span{ font-family:'Fraunces',serif; font-size:18px; color:#c2c7d6; }
.ms-chip.on{ border-color:var(--sage); background:#eef6f1; color:var(--ink); }
.ms-chip.on span{ color:var(--sage); }
.ms-count{ font-size:12.5px; color:var(--muted); margin-top:10px; text-align:center; }
.data-row{ width:100%; display:flex; align-items:center; gap:10px; padding:13px 4px;
  background:none; border:none; border-bottom:1px solid var(--line); font:inherit;
  font-size:14px; color:var(--ink); cursor:pointer; }
.data-row svg:last-child{ margin-left:auto; color:#c2c7d6; }
.data-row.danger{ color:#C05B4A; border-bottom:none; }
.help-note{ font-size:12px; color:var(--muted); line-height:1.5; margin-top:10px; }
/* float help + nav */
.float-help{ position:fixed; right:16px; bottom:92px; z-index:30; display:flex; align-items:center;
  gap:7px; background:var(--dawn); color:#241303; border:none; border-radius:30px;
  padding:12px 18px; font-weight:700; font-size:14px; cursor:pointer;
  box-shadow:0 8px 24px rgba(224,149,75,.4); }
.tabbar{ position:fixed; bottom:0; left:50%; transform:translateX(-50%); width:100%; max-width:460px;
  z-index:25; display:flex; background:#fff; border-top:1px solid var(--line); padding:8px 0 12px; }
.tab{ flex:1; display:flex; flex-direction:column; align-items:center; gap:3px; background:none;
  border:none; color:var(--muted); font-size:11px; font-weight:600; cursor:pointer; }
.tab.on{ color:var(--horizon); }
/* overlays */
.sheet-scrim{ position:fixed; inset:0; z-index:40; background:rgba(27,33,56,.55);
  display:flex; align-items:flex-end; justify-content:center; }
.sheet{ width:100%; max-width:460px; background:#fff; border-radius:22px 22px 0 0; padding:20px;
  max-height:86vh; overflow:auto; animation:rise .25s ease; }
.sheet-head{ display:flex; align-items:center; justify-content:space-between; }
.sheet-title{ display:flex; align-items:center; gap:8px; font-weight:700; font-size:16px; color:var(--dawn); }
.icon-btn{ background:none; border:none; color:var(--muted); cursor:pointer; }
.sheet-sub{ font-size:13.5px; color:var(--muted); line-height:1.5; margin:8px 0 14px; }
.help-line{ display:flex; align-items:center; gap:12px; text-decoration:none; color:var(--ink);
  border:1px solid var(--line); border-radius:14px; padding:14px; margin-bottom:10px; }
.help-line svg:first-child{ color:var(--dawn); flex-shrink:0; }
.help-line div{ flex:1; display:flex; flex-direction:column; }
.help-line strong{ font-size:14.5px; } .help-line span{ font-size:12.5px; color:var(--muted); }
.help-line svg:last-child{ color:#c2c7d6; }
.breathe-btn{ width:100%; display:flex; align-items:center; justify-content:center; gap:8px;
  background:#eef6f1; color:var(--sage); border:none; border-radius:13px; padding:13px;
  font-weight:700; font-size:14px; cursor:pointer; margin-top:4px; }
.breathe-box{ text-align:center; padding:18px 8px 4px; }
.breathe-ball{ width:60px; height:60px; border-radius:50%; margin:0 auto 12px;
  background:radial-gradient(circle,#7FB59B,#6B7FD7); animation:breathe 8s ease-in-out infinite; }
.breathe-box p{ font-size:13px; color:var(--muted); line-height:1.5; }
.celebrate{ width:100%; max-width:380px; background:#fff; border-radius:22px; padding:30px 24px;
  text-align:center; margin:auto; animation:rise .25s ease; }
.celebrate svg{ color:var(--dawn); margin-bottom:8px; }
.celebrate.soft svg{ color:var(--horizon); }
.celebrate h3{ font-family:'Fraunces',serif; font-size:23px; margin-bottom:8px; }
.celebrate p{ font-size:14px; color:var(--muted); line-height:1.5; margin-bottom:18px; }
.toast{ position:fixed; bottom:160px; left:50%; transform:translateX(-50%); z-index:50;
  background:var(--space); color:#fff; padding:11px 18px; border-radius:30px; font-size:13px;
  max-width:90%; text-align:center; box-shadow:0 8px 24px rgba(27,33,56,.3); animation:rise .2s ease; }
@keyframes spin{ to{ transform:rotate(360deg); } }
@keyframes pulse{ 0%,100%{ opacity:.7; } 50%{ opacity:1; } }
@keyframes breathe{ 0%,100%{ transform:scale(.7); } 50%{ transform:scale(1.25); } }
@keyframes rise{ from{ transform:translateY(16px); opacity:0; } to{ transform:translateY(0); opacity:1; } }
@media (prefers-reduced-motion: reduce){
  .orbit-traveler,.orbit-core,.breathe-ball{ animation:none; }
  .sheet,.celebrate,.toast{ animation:none; }
}
.tab:focus-visible,.primary-cta:focus-visible,.pill:focus-visible,.post-btn:focus-visible,
.float-help:focus-visible,.react-row button:focus-visible{ outline:3px solid #9DB0F0; outline-offset:2px; }
`;
