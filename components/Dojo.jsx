"use client";
import React, { useState, useRef, useEffect } from "react";
import {
  ArrowLeft, Send, Eye, EyeOff, RotateCcw, Gauge, Sparkles, Lock,
  Stethoscope, Inbox, BarChart3, Dumbbell, Wind, Target, CheckCircle2, LogOut,
} from "lucide-react";

const C = {
  ink: "#15120F", panel: "#1E1A16", raised: "#272220", line: "#3A332E",
  paper: "#2C2723", you: "#E0894F", youInk: "#241405",
  text: "#E9E1D6", soft: "#B3A89B", faint: "#7E7468",
  good: "#7FB069", warn: "#E0894F", bad: "#C45D4A",
};
const DISPLAY = "'Iowan Old Style', 'Palatino Linotype', Palatino, Georgia, serif";
const BODY = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const AXES = ["warmth", "curiosity", "humor", "calibration"];
const MOODS = ["Random", "Open", "Guarded", "Distracted", "Taken"];
const MOOD_DESC = {
  Open: "You're in a warm, receptive mood today and easy to talk to.",
  Guarded: "You're cautious and slow to warm up; trust is earned, not given.",
  Distracted: "You're busy and preoccupied; your attention is mostly elsewhere unless something genuinely catches it.",
  Taken: "You're friendly but you're seeing someone, so romantic interest is off the table — you can still be pleasant and the person should be able to handle a graceful no.",
};
const MISSIONS = [
  "Ask one stranger for a recommendation today — coffee, a book, a direction you don't actually need.",
  "Give one genuine, specific compliment to someone. Not about their looks.",
  "Hold one conversation a single exchange longer than is comfortable, then leave first.",
  "Make eye contact and say hello to three people you pass.",
  "Ask a cashier or barista one real question beyond the transaction.",
  "Start one conversation with someone in a queue or a lift.",
  "Say one thing out loud in a room or group chat that you'd normally keep to yourself.",
  "Approach one person and open with something you observe. No goal past the opener.",
];

function hashStr(s) { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; }
function slug(s) { return s.replace(/[^a-zA-Z0-9]/g, "").toLowerCase() || "x"; }
function Avatar({ name, size = 44 }) {
  const h = hashStr(name || "?");
  const hue1 = h % 360, hue2 = (h * 7) % 360;
  const id = "av-" + slug(name) + (h % 1000);
  const initials = (name || "?").split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ borderRadius: "50%", flexShrink: 0, display: "block" }} aria-hidden="true">
      <defs><linearGradient id={id} x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor={`hsl(${hue1} 52% 46%)`} /><stop offset="100%" stopColor={`hsl(${hue2} 48% 28%)`} /></linearGradient></defs>
      <rect width="100" height="100" fill={`url(#${id})`} /><circle cx="50" cy="38" r="38" fill="#ffffff" opacity="0.06" />
      <text x="50" y="52" dominantBaseline="central" textAnchor="middle" fontSize="38" fontFamily={DISPLAY} fill="#fff" opacity="0.95">{initials}</text>
    </svg>
  );
}

const CAST = [
  { id: "maya", name: "Maya", role: "Barista", scene: "A specialty coffee bar, mid-morning rush", level: "Warm-up", tag: "Social", blurb: "Friendly, a little sarcastic, and busy. Generic lines bounce off her.", persona: "You are Maya, a 26-year-old barista at a busy specialty coffee bar in Dubai. Warm, quick, mildly sarcastic, into coffee. Customers are waiting, so replies are short. You warm up fast to specific curiosity and people who are relaxed and a bit funny. You go flat with generic openers, looks-based compliments, or anyone who makes it weird." },
  { id: "layla", name: "Layla", role: "Graphic designer", scene: "A co-working space lounge, both waiting on coffee", level: "Standard", tag: "Social", blurb: "Dry humor, guarded, allergic to try-hard. Rewards wit and ease.", persona: "You are Layla, a 28-year-old graphic designer at a co-working space. Dry, observant, quick-witted, slightly guarded. You respect people at ease who can volley a joke without forcing it. You disengage from try-hard energy, interview-style questioning, and performed confidence. Short, sharp lines." },
  { id: "reem", name: "Reem", role: "Flight attendant", scene: "A hotel café during a layover", level: "Standard", tag: "Social", blurb: "Worldly, hard to impress. Rewards a good story told briefly.", persona: "You are Reem, a 30-year-old flight attendant on a layover. You have met every kind of person, hard to impress and hard to fluster. You value brevity, a genuinely good story, and people who don't try to extract your attention. You shut down bragging, neediness, and obvious lines instantly but reward someone genuinely interesting and self-contained. Short replies." },
  { id: "sana", name: "Sana", role: "Bookshop clerk", scene: "A quiet independent bookshop, late afternoon", level: "Warm-up", tag: "Social", blurb: "Introverted herself. Opens up over a real, specific shared interest.", persona: "You are Sana, a 25-year-old at a quiet independent bookshop. Introverted, a little shy. You stay polite-but-closed with small talk and generic charm, but light up over a genuine, specific shared interest. You mirror calm energy and get uncomfortable with intensity. Short, soft replies." },
  { id: "noor", name: "Noor", role: "Yoga instructor", scene: "After a class, packing up mats", level: "Harder", tag: "Social", blurb: "Friendly but hit on constantly. Reads intent fast. Wants to be treated normally.", persona: "You are Noor, a 29-year-old yoga instructor. Warm by default, but you get hit on constantly at work, so you read intent within a couple of messages. You reward being treated like a normal person and instantly cool toward anyone whose only goal is to flirt or get your number. Not rude, just efficient at disengaging. Short replies." },
  { id: "hana", name: "Hana", role: "Marketing lead", scene: "A startup networking mixer", level: "Harder", tag: "Social", blurb: "Professional context. Tests whether you can read the room.", persona: "You are Hana, a 31-year-old marketing lead at a tech networking mixer. The context is professional, not a bar. You engage with people who are interesting, relevant, and read the setting right. You get put off if someone treats a work event like a dating venue too early. You respect charisma that stays appropriate. Concise replies." },
  { id: "omar", name: "Omar", role: "Buyer at an open house", scene: "An open house — his fifth viewing this weekend", level: "Standard", tag: "Real estate", blurb: "Skeptical, time-poor, sick of being pitched. Warms to an agent who listens first.", persona: "You are Omar, 38, a prospective home buyer at an open house in Dubai. You've seen many properties and are tired of agents who pitch before understanding you. You stay guarded with hard-selling, vague hype, or pressure. You open up to an agent who asks what you actually need, listens, and answers straight — including naming a downside honestly. The human is practicing being the agent. Short, businesslike replies." },
  { id: "dana", name: "Dana", role: "First-time buyer", scene: "A first call about getting onto the property ladder", level: "Warm-up", tag: "Real estate", blurb: "Nervous, full of questions. Rewards patience and plain language.", persona: "You are Dana, 29, a first-time buyer, anxious and overwhelmed. You respond well to patience, plain answers, and being told it's okay not to know things. You withdraw under jargon, rushing, or being upsold past your budget. The human is practicing being the agent. Short, slightly uncertain replies." },
  { id: "khalid", name: "Khalid", role: "Property investor", scene: "A real estate investment expo, between sessions", level: "Harder", tag: "Real estate", blurb: "Numbers-first, allergic to hype. Rewards specifics and being challenged intelligently.", persona: "You are Khalid, 45, a seasoned property investor at an expo. Direct, numbers-driven, instantly dismissive of hype and people who can't back claims with specifics. You respect brevity, real figures, candor about risk, and someone confident enough to disagree with you intelligently. You disengage from flattery and waffle. Terse replies." },
  { id: "yara", name: "Yara", role: "Fellow agent", scene: "An industry networking evening", level: "Standard", tag: "Real estate", blurb: "Well-connected peer. Referrals flow to people she trusts, not people who mine her for leads.", persona: "You are Yara, 33, a real estate agent at a networking event, a potential referral partner. You warm to genuine peer rapport, shared war stories, and people who give before they ask. You cool quickly toward anyone obviously mining you for leads on first meeting. Collegial, not romantic. Relaxed, conversational replies." },
  { id: "haddad", name: "Mr. Haddad", role: "Seller choosing an agent", scene: "His home — interviewing agents to list with", level: "Harder", tag: "Real estate", blurb: "Cautious, attached to the property. Lists with the agent who makes him feel understood.", persona: "You are Mr. Haddad, 58, interviewing agents to sell the home he's lived in for 20 years. Cautious and emotionally attached. You choose the agent who acknowledges what the home means before commission and tactics, who is honest about price rather than flattering with an inflated number, and who feels trustworthy. You distrust slick pitches and lowballing alike. Measured, deliberate replies." },
  { id: "li_faisal", name: "Faisal", role: "Data science lead", scene: "LinkedIn — a cold message in a stranger's inbox", level: "Standard", tag: "Networking", channel: "app", blurb: "Cold professional outreach. Copy-paste notes and instant asks get ignored; specificity and a clear, small ask get a reply.", persona: "You are Faisal, a data science lead on LinkedIn. The human has sent you a cold message. You get many generic, copy-pasted outreach notes and immediate asks — jobs, referrals, 'can I pick your brain' with no context — and you leave those unanswered. You reply to a message that is specific to you, shows the person actually read your profile or work, stays concise, and makes a small clear ask or none at all. Professional and a little time-poor; no romance. Keep replies brief and businesslike. If the message is generic or entitled, your interest is low and your reply is curt or absent." },
  { id: "tinder_lina", name: "Lina", role: "Matched on Tinder", scene: "Tinder — you just matched", level: "Standard", tag: "Dating apps", channel: "app", blurb: "Fast and banter-led. 'hey' dies on seen; a light, specific, playful opener with momentum wins.", persona: "You are Lina, 26, matched with the human on Tinder. You get a flood of low-effort openers — 'hey', 'how are you', 'how's your day' — and you leave those on seen. You reply to an opener that is light, specific, and a little playful, ideally tied to something real about your profile. You cool toward interview-style questioning, paragraphs, over-eagerness, and trying too hard. Texting register: short, casual, the odd emoji. You warm to easy back-and-forth and someone who can move toward an actual plan without rushing or getting heavy." },
  { id: "hinge_sara", name: "Sara", role: "Matched on Hinge", scene: "Hinge — replying to your comment on her prompt", level: "Standard", tag: "Dating apps", channel: "app", blurb: "Prompt-based and intentional. Read the prompt, react specifically, ask something real. Generic openers die.", persona: "You are Sara, 28, on Hinge, which you use with real intention. Your profile is built from prompts. Treat the human's first message as a comment on one of your prompts or photos. You leave generic 'hey' or 'how's your weekend' on seen. You reply warmly when someone clearly read a prompt, reacted to something specific, and asked a real question. You like a little substance and someone who can hold a thread rather than volley one-liners. Warmer and slightly more earnest than fast app banter; still concise, still texting register." },
  { id: "muzz_mariam", name: "Mariam", role: "Marriage intentions", scene: "Muzz — an introduction with marriage in mind", level: "Harder", tag: "Dating apps", channel: "app", blurb: "Marriage-intent and respectful. Sincerity and clear, honourable intention land; casual flirting gets left on seen.", persona: "You are Mariam, 27, on Muzz (formerly Muzmatch), a marriage-intentions app for Muslims. You are here to find a spouse, not to chat casually. You expect respect, sincerity, and clarity of intention early. You respond well to someone polite and genuine who is clear that their intention is marriage and who shows interest in character, values, deen, and family without being intrusive or overfamiliar. You disengage from flirtation, casualness, or anyone treating this like an ordinary dating app, and you may note that your family or wali will be involved at the appropriate stage. Replies are measured, respectful, and sincere." },
];

function extractJSON(text) { const s = text.indexOf("{"); const e = text.lastIndexOf("}"); if (s === -1 || e === -1) return null; try { return JSON.parse(text.slice(s, e + 1)); } catch { return null; } }
async function callClaude(system, messages) {
  const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 1000, system, messages }) });
  const data = await res.json();
  return (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n");
}
async function callJSON(system, userContent) { const raw = await callClaude(system, [{ role: "user", content: userContent }]); return extractJSON(raw); }
function dayStr(d = new Date()) { return d.toISOString().slice(0, 10); }
function daysBetween(a, b) { return Math.round((new Date(b + "T00:00:00") - new Date(a + "T00:00:00")) / 86400000); }
function weakestAxis(store) {
  const rows = (store.log || []).filter((e) => e.scores).slice(-12);
  if (rows.length < 2) return null;
  const avg = {}; AXES.forEach((a) => { avg[a] = rows.reduce((s, r) => s + (r.scores[a] || 0), 0) / rows.length; });
  return AXES.reduce((m, a) => (avg[a] < avg[m] ? a : m), AXES[0]);
}
function Meter({ value }) { const col = value >= 60 ? C.good : value >= 30 ? C.warn : C.bad; return <div style={{ flex: 1, height: 6, background: C.raised, borderRadius: 999, overflow: "hidden" }}><div style={{ width: `${value}%`, height: "100%", background: col, transition: "width 400ms ease, background 400ms ease" }} /></div>; }
function Pill({ children }) { return <span style={{ fontSize: 10.5, letterSpacing: "0.1em", textTransform: "uppercase", color: C.faint, border: `1px solid ${C.line}`, borderRadius: 999, padding: "3px 9px", whiteSpace: "nowrap" }}>{children}</span>; }

const DEFAULT_STORE = { log: [], streak: 0, lastActiveDay: null };

export default function Dojo({ initialStore, persist, email, onSignOut }) {
  const [mode, setMode] = useState("hub");
  const [store, setStore] = useState(initialStore || DEFAULT_STORE);
  const [seed, setSeed] = useState(null);

  function logActivity(entry) {
    setStore((prev) => {
      const base = prev || DEFAULT_STORE; const today = dayStr();
      let { log = [], streak = 0, lastActiveDay = null } = base;
      if (lastActiveDay !== today) { const diff = lastActiveDay ? daysBetween(lastActiveDay, today) : null; streak = diff === 1 ? streak + 1 : 1; lastActiveDay = today; }
      const next = { log: [...log, { ...entry, ts: Date.now() }].slice(-200), streak, lastActiveDay };
      if (persist) persist(next);
      return next;
    });
  }
  const shell = { background: C.ink, color: C.text, fontFamily: BODY, minHeight: "100vh" };
  if (mode === "hub") return <Hub store={store} go={setMode} logActivity={logActivity} shell={shell} email={email} onSignOut={onSignOut} />;
  if (mode === "practice") return <Practice store={store} logActivity={logActivity} back={() => setMode("hub")} shell={shell} seed={seed} consumeSeed={() => setSeed(null)} />;
  if (mode === "autopsy") return <Autopsy logActivity={logActivity} back={() => setMode("hub")} shell={shell} onReplay={(p) => { setSeed(p); setMode("practice"); }} />;
  if (mode === "inbox") return <InboxMode logActivity={logActivity} back={() => setMode("hub")} shell={shell} />;
  if (mode === "stats") return <Stats store={store} back={() => setMode("hub")} shell={shell} />;
  return null;
}

function Hub({ store, go, logActivity, shell, email, onSignOut }) {
  const sessions = (store.log || []).filter((e) => e.mode === "practice").length;
  const weak = weakestAxis(store);
  const today = dayStr();
  const missionDone = (store.log || []).some((e) => e.mode === "mission" && dayStr(new Date(e.ts)) === today);
  const [mission, setMission] = useState(() => MISSIONS[Math.floor(Math.random() * MISSIONS.length)]);
  const modes = [
    { id: "practice", icon: Dumbbell, name: "Practice", desc: "Approach a real-reacting person cold. Pick their mood, run a recovery drill, or go blind and train your own read." },
    { id: "autopsy", icon: Stethoscope, name: "Autopsy", desc: "Paste a real chat that died. Find the exact line it dropped, rewrite from there, play it forward." },
    { id: "inbox", icon: Inbox, name: "Inbox", desc: "Flip sides. Judge incoming openers, decide reply or leave on seen, then see if you were right." },
    { id: "stats", icon: BarChart3, name: "Progress", desc: "Streak, scores over time, your recurring weakness. The practiced adversary baits it on purpose." },
  ];
  return (
    <div style={shell}>
      <div className="mx-auto w-full" style={{ maxWidth: 720, padding: "40px 18px 64px" }}>
        <div className="flex items-center justify-between" style={{ gap: 10 }}>
          <div style={{ color: C.faint, letterSpacing: "0.22em", fontSize: 11, textTransform: "uppercase" }}>Charisma gym</div>
          <button onClick={onSignOut} className="flex items-center" style={{ color: C.faint, background: "none", border: "none", cursor: "pointer", gap: 5, fontSize: 12 }}><LogOut size={13} /> {email}</button>
        </div>
        <h1 style={{ fontFamily: DISPLAY, fontSize: "clamp(32px, 9vw, 42px)", lineHeight: 1.02, margin: "10px 0 14px", fontWeight: 600 }}>The Read</h1>
        <p style={{ color: C.soft, fontSize: 15, lineHeight: 1.6 }}>One skill — make it about them, calibrate to the moment, answer straight. Romantic, professional, and platonic are difficulty settings of the same thing. The goal is to stop needing this.</p>
        <div className="flex items-center" style={{ gap: 18, marginTop: 22, flexWrap: "wrap" }}>
          <Stat label="Streak" value={`${store.streak || 0}d`} /><Stat label="Sessions" value={sessions} /><Stat label="Weakest" value={weak || "—"} />
        </div>
        <div style={{ marginTop: 24, border: `1px solid ${missionDone ? C.good : C.you}`, borderRadius: 14, background: C.panel, padding: "16px 18px" }}>
          <div className="flex items-center" style={{ gap: 8, marginBottom: 8 }}><Target size={16} style={{ color: missionDone ? C.good : C.you }} /><span style={{ color: missionDone ? C.good : C.you, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase" }}>{missionDone ? "Mission complete today" : "Today's field mission"}</span></div>
          <div style={{ color: C.text, fontSize: 14.5, lineHeight: 1.55 }}>{mission}</div>
          <div className="flex items-center" style={{ gap: 8, marginTop: 12, flexWrap: "wrap" }}>
            <button onClick={() => logActivity({ mode: "mission" })} disabled={missionDone} className="flex items-center" style={{ background: missionDone ? C.raised : C.you, color: missionDone ? C.faint : C.youInk, border: "none", borderRadius: 999, padding: "7px 14px", cursor: missionDone ? "default" : "pointer", fontSize: 13, gap: 6, fontWeight: 600 }}><CheckCircle2 size={14} /> {missionDone ? "Done" : "I did it"}</button>
            <button onClick={() => setMission(MISSIONS[Math.floor(Math.random() * MISSIONS.length)])} style={{ background: "transparent", color: C.soft, border: `1px solid ${C.line}`, borderRadius: 999, padding: "7px 14px", cursor: "pointer", fontSize: 13 }}>Swap</button>
          </div>
          <div style={{ color: C.faint, fontSize: 12, lineHeight: 1.5, marginTop: 10 }}>The reps that count happen off this screen. Simulators plateau; people don't.</div>
        </div>
        <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
          {modes.map((m) => { const Icon = m.icon; return (
            <button key={m.id} onClick={() => go(m.id)} className="w-full text-left flex" style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 14, padding: "16px 18px", cursor: "pointer", gap: 14, alignItems: "flex-start" }}>
              <div style={{ background: C.raised, borderRadius: 10, padding: 9, flexShrink: 0 }}><Icon size={18} style={{ color: C.you }} /></div>
              <div><div style={{ fontFamily: DISPLAY, fontSize: 19, fontWeight: 600 }}>{m.name}</div><div style={{ color: C.soft, fontSize: 13.5, lineHeight: 1.5, marginTop: 3 }}>{m.desc}</div></div>
            </button>); })}
        </div>
        <p style={{ color: C.faint, fontSize: 12, lineHeight: 1.6, marginTop: 22 }}>Signed in as {email}. Progress syncs to your account across devices.</p>
      </div>
    </div>
  );
}
function Stat({ label, value }) { return <div><div style={{ fontFamily: DISPLAY, fontSize: 24, fontWeight: 600, color: C.you, textTransform: "capitalize" }}>{value}</div><div style={{ color: C.faint, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase" }}>{label}</div></div>; }

function Practice({ store, logActivity, back, shell, seed, consumeSeed }) {
  const [stage, setStage] = useState("lobby");
  const [char, setChar] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [interest, setInterest] = useState(50);
  const [showAsides, setShowAsides] = useState(true);
  const [ended, setEnded] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [fbLoading, setFbLoading] = useState(false);
  const [filter, setFilter] = useState("All");
  const [calibration, setCalibration] = useState(false);
  const [recovery, setRecovery] = useState(false);
  const [mood, setMood] = useState("Random");
  const [guessVal, setGuessVal] = useState(50);
  const [calibLog, setCalibLog] = useState([]);
  const [genLoading, setGenLoading] = useState(false);
  const [logged, setLogged] = useState(false);
  const [briefChar, setBriefChar] = useState(null);
  const [brief, setBrief] = useState(null);
  const [briefLoading, setBriefLoading] = useState(false);
  const scrollRef = useRef(null);
  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages, loading, feedback]);
  useEffect(() => { if (seed && seed.char) { start(seed.char, seed.messages); if (consumeSeed) consumeSeed(); } /* eslint-disable-next-line */ }, []);
  function start(c, seeded) { setChar(c); setMessages(seeded || []); setInterest(50); setEnded(false); setFeedback(null); setInput(""); setCalibLog([]); setGuessVal(50); setLogged(false); setStage("chat"); }
  async function openBrief(c) {
    setBriefChar(c); setBrief(null); setBriefLoading(true); setStage("brief");
    const isApp = c.channel === "app";
    const sys = "Given a person and the exact setting, produce a pre-approach brief for someone about to open a conversation cold.\n- observable: 3-4 concrete things " + (isApp ? "visible on their profile (bio lines, prompts, photos, role, headline)" : "a stranger could genuinely notice in this moment") + " and use to open. Short phrases.\n- interests: 3-5 real things that are NOT shown and would only surface through conversation.\n- approach: one sentence on the kind of opener that fits this specific person.\nRespond ONLY with JSON: {\"observable\":[],\"interests\":[],\"approach\":\"\"}";
    try { const j = await callJSON(sys, `Person: ${c.persona}\nSetting: ${c.scene}`); if (j) setBrief(j); } catch {}
    setBriefLoading(false);
  }
  async function surprise() {
    setGenLoading(true);
    const weak = weakestAxis(store);
    const sys = "Invent one realistic, specific person for a conversation-practice app: any setting. Distinct personality, clear things that win or lose their interest." + (weak ? ` This person should specifically test the user's weakness in ${weak}: they only warm up if the user demonstrates strong ${weak}, and are visibly unimpressed by weak ${weak}.` : "") + "\nRespond ONLY with JSON: {\"name\":\"\",\"role\":\"\",\"scene\":\"\",\"blurb\":\"\",\"persona\":\"<2-3 sentences, 'You are...'>\"}";
    try { const j = await callJSON(sys, "Generate one."); if (j && j.persona) openBrief({ ...j, id: "gen", level: "Generated", tag: "Generated" }); } catch {}
    setGenLoading(false);
  }
  const hasPending = calibration && messages.some((m) => m.role === "assistant" && !m.revealed);
  async function send() {
    const t = input.trim();
    if (!t || loading || ended || hasPending) return;
    setInput("");
    const next = [...messages, { role: "user", text: t, revealed: true }];
    setMessages(next); setLoading(true);
    const moodLine = mood !== "Random" ? `\nYour mood/state right now: ${MOOD_DESC[mood]}` : "\nPick your own believable mood for today; it may or may not be receptive.";
    const recoveryLine = recovery ? "\nYou begin flat and disengaged — distracted, low-effort, short replies — and only warm up if the person genuinely revives your interest. Start cold and let your interest reflect that." : "";
    const isApp = char.channel === "app";
    const openFrame = isApp
      ? "This is private practice; the human is rehearsing first messages on a dating or networking app. You have not spoken before; their first message is the opener that arrives in your chat. React exactly like the real person you are: on an app a generic or low-effort opener gets a flat reply or gets left on seen, while a specific, well-judged one earns a real response. Reply in texting register — short, natural, lowercase is fine."
      : "This is private conversation practice; the human is rehearsing how to approach people. They are opening cold — you have not spoken before; their first message is an unprompted approach in the setting described. React exactly like the real person you are: a cold approach can land well or badly depending entirely on how it's done. Reply the way you'd actually respond: short, natural.";
    const system = char.persona + moodLine + recoveryLine + "\n\n" + openFrame + " Never break character, never coach, never explain yourself. Move at a realistic pace; do not hand out warmth, your number, a date, a meeting, or your contact details unless it has genuinely been earned. If the opener is generic, needy, intense, or creepy, react accordingly and let interest fall. If interest gets very low you may end the conversation.\n\nRespond ONLY with JSON: {\"reply\":\"<what you say>\",\"interest\":<integer 0-100>,\"aside\":\"<your honest unspoken thought, first person, one short sentence>\"}";
    const apiMsgs = next.map((m) => ({ role: m.role, content: m.text }));
    try {
      const raw = await callClaude(system, apiMsgs);
      const j = extractJSON(raw) || { reply: raw || "...", interest, aside: null };
      const ni = typeof j.interest === "number" ? Math.max(0, Math.min(100, j.interest)) : interest;
      if (!calibration) setInterest(ni);
      setMessages((m) => [...m, { role: "assistant", text: j.reply || "...", interest: ni, aside: j.aside || null, revealed: !calibration }]);
      if (ni < 12 && !calibration) setEnded(true);
    } catch { setMessages((m) => [...m, { role: "assistant", text: "(connection dropped — try again)", interest, aside: null, revealed: true }]); }
    setLoading(false);
  }
  function submitGuess(idx) { setMessages((m) => m.map((msg, i) => (i === idx ? { ...msg, revealed: true, guess: guessVal } : msg))); const actual = messages[idx].interest; setCalibLog((l) => [...l, Math.abs(guessVal - actual)]); setInterest(actual); if (actual < 12) setEnded(true); setGuessVal(50); }
  async function getFeedback() {
    if (fbLoading || messages.length < 2) return;
    setFbLoading(true);
    const transcript = messages.map((m) => `${m.role === "user" ? "YOU" : char.name}: ${m.text}`).join("\n");
    const system = "You are a blunt communication coach reviewing a practice conversation. The human is YOU in the transcript. Be honest and specific. No flattery. Score each axis 0-100. Also judge the close: did they move toward a real next step appropriately, push too early, fumble a clear opening, or never try.\nRespond ONLY with JSON: {\"warmth\":<0-100>,\"curiosity\":<0-100>,\"humor\":<0-100>,\"calibration\":<0-100>,\"close\":\"landed|too_soon|fumbled|never_tried\",\"closeNote\":\"\",\"creepFlag\":<bool>,\"creepNote\":\"\",\"oneFix\":\"\",\"summary\":\"\"}";
    try {
      const j = await callJSON(system, `Context: ${char.scene}. Partner: ${char.name}, ${char.role}.\n\nTranscript:\n${transcript}`);
      if (j) { setFeedback(j); if (!logged) { const calibErr = calibLog.length ? Math.round(calibLog.reduce((a, b) => a + b, 0) / calibLog.length) : null; logActivity({ mode: "practice", character: char.name, scores: { warmth: j.warmth, curiosity: j.curiosity, humor: j.humor, calibration: j.calibration }, close: j.close, calibErr, calibration, recovery, mood }); setLogged(true); } }
    } catch {}
    setFbLoading(false);
  }

  if (stage === "lobby") {
    const list = CAST.filter((c) => filter === "All" || (c.tag || "Social") === filter);
    return (
      <div style={shell}><div className="mx-auto w-full" style={{ maxWidth: 720, padding: "18px 18px 64px" }}>
        <button onClick={back} className="flex items-center" style={{ color: C.soft, background: "none", border: "none", cursor: "pointer", gap: 6, fontSize: 13, marginBottom: 16 }}><ArrowLeft size={16} /> Hub</button>
        <div className="flex items-center" style={{ gap: 10, flexWrap: "wrap" }}>
          <button onClick={surprise} disabled={genLoading} className="flex items-center" style={{ background: C.you, color: C.youInk, border: "none", borderRadius: 12, padding: "11px 16px", cursor: genLoading ? "default" : "pointer", gap: 8, fontSize: 14, fontWeight: 600 }}><Sparkles size={16} /> {genLoading ? "Inventing…" : "Surprise me"}</button>
          <button onClick={() => setCalibration((v) => !v)} className="flex items-center" style={{ background: calibration ? C.raised : "transparent", color: calibration ? C.you : C.soft, border: `1px solid ${calibration ? C.you : C.line}`, borderRadius: 12, padding: "10px 14px", cursor: "pointer", gap: 7, fontSize: 13 }}>{calibration ? <Lock size={14} /> : <Eye size={14} />} Blind</button>
          <button onClick={() => setRecovery((v) => !v)} className="flex items-center" style={{ background: recovery ? C.raised : "transparent", color: recovery ? C.you : C.soft, border: `1px solid ${recovery ? C.you : C.line}`, borderRadius: 12, padding: "10px 14px", cursor: "pointer", gap: 7, fontSize: 13 }}><Wind size={14} /> Recovery</button>
        </div>
        <div style={{ marginTop: 14 }}>
          <div style={{ color: C.faint, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 7 }}>Their mood</div>
          <div className="flex" style={{ gap: 7, flexWrap: "wrap" }}>{MOODS.map((mo) => { const a = mood === mo; return <button key={mo} onClick={() => setMood(mo)} style={{ fontSize: 12.5, color: a ? C.youInk : C.soft, background: a ? C.you : "transparent", border: `1px solid ${a ? C.you : C.line}`, borderRadius: 999, padding: "5px 12px", cursor: "pointer" }}>{mo}</button>; })}</div>
        </div>
        <p style={{ color: C.faint, fontSize: 12.5, lineHeight: 1.5, marginTop: 12 }}>{recovery ? "Recovery: they start flat. Revive a dead conversation." : calibration ? "Blind: the meter is hidden; you guess their interest each turn." : mood === "Taken" ? "Taken: romance is off the table. Practice a graceful read and a clean exit." : "Surprise me builds a fresh person and targets your weakest axis."}</p>
        <div className="flex" style={{ gap: 8, marginTop: 18, flexWrap: "wrap" }}>{["All", "Social", "Dating apps", "Networking", "Real estate"].map((t) => { const a = filter === t; return <button key={t} onClick={() => setFilter(t)} style={{ fontSize: 12.5, color: a ? C.youInk : C.soft, background: a ? C.you : "transparent", border: `1px solid ${a ? C.you : C.line}`, borderRadius: 999, padding: "6px 14px", cursor: "pointer" }}>{t}</button>; })}</div>
        <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
          {list.map((c) => (
            <button key={c.id} onClick={() => openBrief(c)} className="w-full text-left flex" style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 14, padding: "14px 16px", cursor: "pointer", gap: 13, alignItems: "flex-start" }}>
              <Avatar name={c.name} size={46} />
              <div style={{ minWidth: 0, flex: 1 }}>
                <div className="flex items-center justify-between" style={{ gap: 8 }}><div style={{ fontFamily: DISPLAY, fontSize: 19, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}<span style={{ color: C.faint, fontFamily: BODY, fontWeight: 400, fontSize: 13.5 }}>{"  ·  "}{c.role}</span></div><Pill>{c.level}</Pill></div>
                <div style={{ color: C.faint, fontSize: 12.5, fontStyle: "italic", marginTop: 3 }}>{c.scene}</div>
                <div style={{ color: C.soft, fontSize: 13.5, lineHeight: 1.5, marginTop: 7 }}>{c.blurb}</div>
              </div>
            </button>
          ))}
        </div>
      </div></div>
    );
  }
  if (stage === "brief") {
    return (
      <div style={shell}><div className="mx-auto w-full" style={{ maxWidth: 720, padding: "18px 18px 64px" }}>
        <button onClick={() => setStage("lobby")} className="flex items-center" style={{ color: C.soft, background: "none", border: "none", cursor: "pointer", gap: 6, fontSize: 13, marginBottom: 18 }}><ArrowLeft size={16} /> Cast</button>
        <div className="flex items-center" style={{ gap: 14 }}><Avatar name={briefChar?.name} size={56} /><div style={{ minWidth: 0 }}><div style={{ fontFamily: DISPLAY, fontSize: 24, fontWeight: 600 }}>{briefChar?.name}<span style={{ color: C.faint, fontFamily: BODY, fontWeight: 400, fontSize: 14 }}>{briefChar?.role ? `  ·  ${briefChar.role}` : ""}</span></div><div style={{ color: C.faint, fontSize: 13, fontStyle: "italic", marginTop: 2 }}>{briefChar?.scene}</div></div></div>
        {briefLoading && <div style={{ color: C.faint, fontSize: 14, marginTop: 24 }}>Reading the room…</div>}
        {brief && (
          <div style={{ marginTop: 22, display: "grid", gap: 14 }}>
            <div style={{ border: `1px solid ${C.you}`, borderRadius: 12, background: C.panel, overflow: "hidden" }}><div style={{ padding: "9px 14px", borderBottom: `1px solid ${C.line}`, color: C.you, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase" }}>On sight — open on this</div><div style={{ padding: "12px 14px", display: "grid", gap: 8 }}>{(brief.observable || []).map((o, i) => <div key={i} className="flex" style={{ gap: 9, alignItems: "flex-start" }}><span style={{ color: C.you }}>—</span><span style={{ color: C.text, fontSize: 14, lineHeight: 1.5 }}>{o}</span></div>)}</div></div>
            <div style={{ border: `1px solid ${C.line}`, borderRadius: 12, background: C.panel, overflow: "hidden" }}><div style={{ padding: "9px 14px", borderBottom: `1px solid ${C.line}`, color: C.faint, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase" }}>Under the surface — uncover, don't lead with</div><div style={{ padding: "12px 14px" }}><div className="flex" style={{ gap: 8, flexWrap: "wrap" }}>{(brief.interests || []).map((it, i) => <span key={i} style={{ color: C.soft, fontSize: 13, border: `1px solid ${C.line}`, borderRadius: 999, padding: "4px 11px" }}>{it}</span>)}</div><div style={{ color: C.faint, fontSize: 12.5, lineHeight: 1.5, marginTop: 10 }}>You can't see these on a cold approach. Leading with them reads like you've been watching her. They're the reward for a conversation that gets there.</div></div></div>
            {brief.approach && <div style={{ color: C.soft, fontSize: 13.5, lineHeight: 1.55 }}><span style={{ color: C.faint }}>Fit: </span>{brief.approach}</div>}
            <div style={{ color: C.faint, fontSize: 12.5, lineHeight: 1.55, fontStyle: "italic" }}>{briefChar?.channel === "app" ? "Before you send: lead with something specific from their profile. You don't need a perfect line — you need a real one." : "Before you walk over: one slow breath. Lead with the observable. You don't need a perfect line — you need a real one."}</div>
          </div>
        )}
        <button onClick={() => start(briefChar)} disabled={briefLoading} style={{ marginTop: 22, width: "100%", background: briefLoading ? C.raised : C.you, color: briefLoading ? C.faint : C.youInk, border: "none", borderRadius: 12, padding: "14px", cursor: briefLoading ? "default" : "pointer", fontSize: 15, fontWeight: 600 }}>{briefChar?.channel === "app" ? "Send the opener" : "Walk over and open"}</button>
      </div></div>
    );
  }
  const meterColor = interest >= 60 ? C.good : interest >= 30 ? C.warn : C.bad;
  const hasContact = messages.some((m) => m.role === "assistant");
  const calibAvg = calibLog.length ? Math.round(100 - calibLog.reduce((a, b) => a + b, 0) / calibLog.length) : null;
  const closeMap = { landed: ["Landed a next step", C.good], too_soon: ["Pushed for the close too early", C.warn], fumbled: ["Had the opening, fumbled the close", C.warn], never_tried: ["Never moved toward a next step", C.faint] };
  return (
    <div style={{ ...shell, height: "100dvh", minHeight: 0, display: "flex", flexDirection: "column" }}>
      <div style={{ borderBottom: `1px solid ${C.line}`, background: C.panel }}>
        <div className="mx-auto w-full flex items-center justify-between" style={{ maxWidth: 720, padding: "10px 14px", gap: 10 }}>
          <button onClick={() => setStage("lobby")} className="flex items-center" style={{ color: C.soft, background: "none", border: "none", cursor: "pointer", gap: 6, fontSize: 13, flexShrink: 0 }}><ArrowLeft size={16} /> Cast</button>
          <div className="flex items-center" style={{ gap: 9, minWidth: 0 }}><Avatar name={char.name} size={32} /><div style={{ lineHeight: 1.12, minWidth: 0 }}><div style={{ fontFamily: DISPLAY, fontSize: 16, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{char.name}</div><div style={{ color: C.faint, fontSize: 11, fontStyle: "italic", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{char.scene}</div></div></div>
          {calibration ? <span style={{ color: C.you, fontSize: 12, flexShrink: 0 }}>{calibAvg != null ? `read ${calibAvg}%` : "blind"}</span> : <button onClick={() => setShowAsides((s) => !s)} className="flex items-center" style={{ color: showAsides ? C.you : C.faint, background: "none", border: "none", cursor: "pointer", gap: 5, fontSize: 12, flexShrink: 0 }}>{showAsides ? <Eye size={15} /> : <EyeOff size={15} />} Read</button>}
        </div>
        {!calibration && hasContact && <div className="mx-auto w-full flex items-center" style={{ maxWidth: 720, padding: "0 14px 10px", gap: 10 }}><Gauge size={14} style={{ color: meterColor }} /><Meter value={interest} /><span style={{ color: meterColor, fontSize: 11, width: 56, textAlign: "right" }}>{interest >= 60 ? "engaged" : interest >= 30 ? "neutral" : "fading"}</span></div>}
      </div>
      <div ref={scrollRef} className="w-full" style={{ flex: 1, overflowY: "auto", minHeight: 0, WebkitOverflowScrolling: "touch" }}>
        <div className="mx-auto w-full" style={{ maxWidth: 720, padding: "18px 14px" }}>
          {messages.length === 0 && <div style={{ textAlign: "center", marginTop: 32 }}><Avatar name={char.name} size={64} /><div style={{ fontFamily: DISPLAY, fontSize: 18, color: C.soft, marginTop: 12 }}>{char.scene}</div><div style={{ color: C.faint, fontSize: 13.5, lineHeight: 1.6, marginTop: 6, maxWidth: 360, marginLeft: "auto", marginRight: "auto" }}>{char.channel === "app" ? `${char.name} is one message away. Your move — open it.` : `${char.name} is right there and hasn't noticed you. Your move — open it.`}</div></div>}
          {messages.map((m, i) => (
            <div key={i} style={{ marginBottom: 14 }}>
              <div className="flex" style={{ justifyContent: m.role === "user" ? "flex-end" : "flex-start", gap: 8, alignItems: "flex-end" }}>{m.role === "assistant" && <Avatar name={char.name} size={26} />}<div style={{ maxWidth: "80%", padding: "10px 14px", borderRadius: 16, fontSize: 14.5, lineHeight: 1.45, background: m.role === "user" ? C.you : C.paper, color: m.role === "user" ? C.youInk : C.text, borderBottomRightRadius: m.role === "user" ? 4 : 16, borderBottomLeftRadius: m.role === "user" ? 16 : 4, overflowWrap: "anywhere", wordBreak: "break-word" }}>{m.text}</div></div>
              {m.role === "assistant" && !m.revealed && calibration && <div style={{ marginTop: 8, marginLeft: 34, padding: "10px 12px", border: `1px solid ${C.line}`, borderRadius: 12, background: C.panel }}><div style={{ color: C.soft, fontSize: 12.5, marginBottom: 8 }}>Your read of their interest right now?</div><div className="flex items-center" style={{ gap: 10 }}><input type="range" min={0} max={100} value={guessVal} onChange={(e) => setGuessVal(Number(e.target.value))} style={{ flex: 1 }} /><span style={{ width: 34, textAlign: "right", color: C.you, fontSize: 13 }}>{guessVal}</span><button onClick={() => submitGuess(i)} style={{ background: C.you, color: C.youInk, border: "none", borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 13 }}>Lock</button></div></div>}
              {m.role === "assistant" && m.revealed && calibration && m.guess != null && <div style={{ marginTop: 6, marginLeft: 34, color: C.faint, fontSize: 12.5 }}>actual {m.interest} · you said {m.guess} · off by {Math.abs(m.interest - m.guess)}{m.aside ? ` — (${m.aside})` : ""}</div>}
              {m.role === "assistant" && m.revealed && !calibration && showAsides && m.aside && <div className="flex" style={{ justifyContent: "flex-start", marginTop: 5 }}><div style={{ maxWidth: "80%", color: C.faint, fontSize: 12.5, fontStyle: "italic", paddingLeft: 34 }}>({m.aside})</div></div>}
            </div>
          ))}
          {loading && <div style={{ color: C.faint, fontSize: 13, fontStyle: "italic", paddingLeft: 34 }}>{char.name} is typing…</div>}
          {ended && <div style={{ marginTop: 16, padding: "12px 14px", border: `1px solid ${C.line}`, borderRadius: 12, color: C.soft, fontSize: 13.5, background: C.panel }}>{char.name} has checked out. Review below, then run it back.</div>}
          {feedback && (
            <div style={{ marginTop: 18, border: `1px solid ${C.line}`, borderRadius: 14, background: C.panel, overflow: "hidden" }}>
              <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.line}`, fontFamily: DISPLAY, fontSize: 16, fontWeight: 600 }}>Assessment</div>
              <div style={{ padding: "14px 16px" }}>
                <div style={{ color: C.text, fontSize: 14, marginBottom: 14 }}>{feedback.summary}</div>
                {[["Warmth", feedback.warmth], ["Curiosity", feedback.curiosity], ["Humor", feedback.humor], ["Calibration", feedback.calibration]].map(([label, val]) => { const v = Math.max(0, Math.min(100, Number(val) || 0)); const col = v >= 60 ? C.good : v >= 35 ? C.warn : C.bad; return <div key={label} className="flex items-center" style={{ gap: 10, marginBottom: 8 }}><span style={{ width: 86, fontSize: 12.5, color: C.soft }}>{label}</span><Meter value={v} /><span style={{ width: 30, textAlign: "right", fontSize: 12, color: col }}>{v}</span></div>; })}
                {feedback.close && closeMap[feedback.close] && <div style={{ marginTop: 12, padding: "10px 12px", borderRadius: 10, border: `1px solid ${C.line}` }}><span style={{ color: closeMap[feedback.close][1], fontSize: 13, fontWeight: 600 }}>The close — {closeMap[feedback.close][0]}.</span>{feedback.closeNote && <span style={{ color: C.soft, fontSize: 13 }}> {feedback.closeNote}</span>}</div>}
                {calibAvg != null && <div style={{ marginTop: 10, color: C.soft, fontSize: 13 }}>Read accuracy this session: <span style={{ color: C.you }}>{calibAvg}%</span></div>}
                {feedback.creepFlag && <div style={{ marginTop: 12, padding: "10px 12px", borderRadius: 10, border: `1px solid ${C.bad}`, color: C.bad, fontSize: 13 }}>Boundary flag: {feedback.creepNote}</div>}
                <div style={{ marginTop: 14 }}><div style={{ color: C.faint, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 5 }}>Fix this first</div><div style={{ color: C.text, fontSize: 14, lineHeight: 1.5 }}>{feedback.oneFix}</div></div>
              </div>
            </div>
          )}
        </div>
      </div>
      <div style={{ borderTop: `1px solid ${C.line}`, background: C.panel }}>
        <div className="mx-auto w-full" style={{ maxWidth: 720, padding: "10px 14px" }}>
          <div className="flex items-center" style={{ gap: 8, marginBottom: 8, flexWrap: "wrap" }}><button onClick={getFeedback} disabled={fbLoading || messages.length < 2} style={{ fontSize: 12.5, color: messages.length < 2 ? C.faint : C.you, background: "none", border: `1px solid ${C.line}`, borderRadius: 999, padding: "5px 12px", cursor: messages.length < 2 ? "default" : "pointer" }}>{fbLoading ? "Reviewing…" : "Assess"}</button><button onClick={() => start(char)} className="flex items-center" style={{ fontSize: 12.5, color: C.soft, background: "none", border: `1px solid ${C.line}`, borderRadius: 999, padding: "5px 12px", cursor: "pointer", gap: 5 }}><RotateCcw size={13} /> Run it back</button></div>
          <div className="flex items-end" style={{ gap: 8 }}>
            <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} rows={1} placeholder={ended ? "They've left — run it back" : hasPending ? "Lock your read first" : messages.length === 0 ? "Make your approach…" : "Say something…"} disabled={ended || hasPending} style={{ flex: 1, resize: "none", background: C.raised, color: C.text, border: `1px solid ${C.line}`, borderRadius: 12, padding: "11px 13px", fontSize: 16, fontFamily: BODY, outline: "none", maxHeight: 120 }} />
            <button onClick={send} disabled={loading || ended || hasPending || !input.trim()} className="flex items-center justify-center" style={{ background: !input.trim() || ended || hasPending ? C.raised : C.you, color: !input.trim() || ended || hasPending ? C.faint : C.youInk, border: "none", borderRadius: 12, width: 46, height: 46, cursor: loading || ended || hasPending || !input.trim() ? "default" : "pointer", flexShrink: 0 }}><Send size={18} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Autopsy({ logActivity, back, shell, onReplay }) {
  const [raw, setRaw] = useState("");
  const [loading, setLoading] = useState(false);
  const [res, setRes] = useState(null);
  const [logged, setLogged] = useState(false);
  async function analyze() {
    if (!raw.trim() || loading) return;
    setLoading(true); setRes(null); setLogged(false);
    const sys = "A user pastes a real chat that fizzled. Infer who is who; the user seeks help. Find the single message where the other person's interest dropped, name the mechanism plainly, write one stronger replacement for the user's message there. Reconstruct the thread up to and including your rewrite, and infer a persona.\nRespond ONLY with JSON: {\"deathLine\":\"\",\"mechanism\":\"\",\"rewrite\":\"\",\"lesson\":\"\",\"persona\":\"<'You are...'>\",\"replay\":[{\"role\":\"assistant|user\",\"text\":\"\"}]}";
    try { const j = await callJSON(sys, raw.trim()); if (j) { setRes(j); if (!logged) { logActivity({ mode: "autopsy" }); setLogged(true); } } } catch {}
    setLoading(false);
  }
  return (
    <div style={shell}><div className="mx-auto w-full" style={{ maxWidth: 720, padding: "18px 18px 64px" }}>
      <button onClick={back} className="flex items-center" style={{ color: C.soft, background: "none", border: "none", cursor: "pointer", gap: 6, fontSize: 13, marginBottom: 16 }}><ArrowLeft size={16} /> Hub</button>
      <h2 style={{ fontFamily: DISPLAY, fontSize: 26, fontWeight: 600 }}>Autopsy</h2>
      <p style={{ color: C.soft, fontSize: 14, lineHeight: 1.6, marginTop: 6 }}>Paste a real conversation that died. One message per line. Prefix with "Me:" and "Them:" if you can.</p>
      <textarea value={raw} onChange={(e) => setRaw(e.target.value)} rows={8} placeholder={"Me: hey hows it going\nThem: good you?\nMe: nm just chilling wbu\nThem: same"} style={{ width: "100%", marginTop: 14, resize: "vertical", background: C.raised, color: C.text, border: `1px solid ${C.line}`, borderRadius: 12, padding: "12px 14px", fontSize: 15, fontFamily: BODY, outline: "none", lineHeight: 1.5 }} />
      <button onClick={analyze} disabled={loading || !raw.trim()} style={{ marginTop: 12, background: raw.trim() ? C.you : C.raised, color: raw.trim() ? C.youInk : C.faint, border: "none", borderRadius: 12, padding: "12px 18px", cursor: loading || !raw.trim() ? "default" : "pointer", fontSize: 14, fontWeight: 600 }}>{loading ? "Reading the body…" : "Find where it died"}</button>
      {res && (
        <div style={{ marginTop: 22, display: "grid", gap: 14 }}>
          <Block label="Time of death" body={res.deathLine} accent /><Block label="Cause" body={res.mechanism} /><Block label="Rewrite" body={res.rewrite} mono /><Block label="The rule" body={res.lesson} />
          {res.persona && res.replay && <button onClick={() => onReplay({ char: { name: "Them", role: "", scene: "Continuing your real conversation", level: "Replay", tag: "Generated", persona: res.persona }, messages: res.replay.map((m) => ({ role: m.role === "user" ? "user" : "assistant", text: m.text, interest: 50, revealed: true })) })} style={{ background: "transparent", color: C.you, border: `1px solid ${C.you}`, borderRadius: 12, padding: "12px 16px", cursor: "pointer", fontSize: 14, fontWeight: 600 }}>Play it forward from the rewrite →</button>}
        </div>
      )}
    </div></div>
  );
}
function Block({ label, body, accent, mono }) { return <div style={{ border: `1px solid ${accent ? C.bad : C.line}`, borderRadius: 12, background: C.panel, overflow: "hidden" }}><div style={{ padding: "9px 14px", borderBottom: `1px solid ${C.line}`, color: accent ? C.bad : C.faint, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase" }}>{label}</div><div style={{ padding: "12px 14px", color: C.text, fontSize: 14, lineHeight: 1.55, fontFamily: mono ? "ui-monospace, Menlo, monospace" : BODY, overflowWrap: "anywhere" }}>{body}</div></div>; }

function InboxMode({ logActivity, back, shell }) {
  const [items, setItems] = useState(null);
  const [loading, setLoading] = useState(false);
  const [decisions, setDecisions] = useState({});
  const [revealed, setRevealed] = useState(false);
  const [logged, setLogged] = useState(false);
  async function load() {
    setLoading(true); setItems(null); setDecisions({}); setRevealed(false); setLogged(false);
    const sys = "Generate 6 realistic opening messages a person might receive from strangers (dating apps, DMs, networking). Vary quality widely: some worth replying to, some not. Judge honestly whether a reasonable person would reply.\nRespond ONLY with JSON: {\"openers\":[{\"id\":1,\"sender\":\"\",\"text\":\"\",\"worthReply\":<bool>,\"why\":\"\"}]}";
    try { const j = await callJSON(sys, "Generate the batch."); if (j && j.openers) setItems(j.openers.slice(0, 6)); } catch {}
    setLoading(false);
  }
  useEffect(() => { load(); }, []);
  function decide(id, val) { if (!revealed) setDecisions((d) => ({ ...d, [id]: val })); }
  function reveal() { setRevealed(true); if (!logged && items) { const done = items.filter((it) => decisions[it.id] != null); const correct = done.filter((it) => (decisions[it.id] === "reply") === !!it.worthReply).length; logActivity({ mode: "inbox", judgment: done.length ? Math.round((correct / done.length) * 100) : null }); setLogged(true); } }
  const decided = items ? items.filter((it) => decisions[it.id] != null).length : 0;
  const correct = items && revealed ? items.filter((it) => decisions[it.id] != null && (decisions[it.id] === "reply") === !!it.worthReply).length : 0;
  return (
    <div style={shell}><div className="mx-auto w-full" style={{ maxWidth: 720, padding: "18px 18px 64px" }}>
      <button onClick={back} className="flex items-center" style={{ color: C.soft, background: "none", border: "none", cursor: "pointer", gap: 6, fontSize: 13, marginBottom: 16 }}><ArrowLeft size={16} /> Hub</button>
      <h2 style={{ fontFamily: DISPLAY, fontSize: 26, fontWeight: 600 }}>Inbox</h2>
      <p style={{ color: C.soft, fontSize: 14, lineHeight: 1.6, marginTop: 6 }}>You are on the receiving end. Decide reply or leave on seen, then see which were worth answering. This is how you learn what your own messages feel like to read.</p>
      {loading && <div style={{ color: C.faint, fontSize: 14, marginTop: 20 }}>Filling your inbox…</div>}
      {items && (
        <div style={{ marginTop: 18, display: "grid", gap: 12 }}>
          {items.map((it) => { const d = decisions[it.id]; const right = revealed && d != null && (d === "reply") === !!it.worthReply; const wrong = revealed && d != null && !right; return (
            <div key={it.id} style={{ border: `1px solid ${wrong ? C.bad : right ? C.good : C.line}`, borderRadius: 12, background: C.panel, padding: "14px 16px" }}>
              <div style={{ color: C.faint, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>{it.sender}</div>
              <div style={{ color: C.text, fontSize: 14.5, lineHeight: 1.5, overflowWrap: "anywhere" }}>{it.text}</div>
              <div className="flex items-center" style={{ gap: 8, marginTop: 12 }}><button onClick={() => decide(it.id, "reply")} style={{ flex: 1, background: d === "reply" ? C.you : "transparent", color: d === "reply" ? C.youInk : C.soft, border: `1px solid ${d === "reply" ? C.you : C.line}`, borderRadius: 9, padding: "9px", cursor: revealed ? "default" : "pointer", fontSize: 13 }}>Reply</button><button onClick={() => decide(it.id, "pass")} style={{ flex: 1, background: d === "pass" ? C.raised : "transparent", color: d === "pass" ? C.text : C.soft, border: `1px solid ${d === "pass" ? C.soft : C.line}`, borderRadius: 9, padding: "9px", cursor: revealed ? "default" : "pointer", fontSize: 13 }}>Leave on seen</button></div>
              {revealed && <div style={{ marginTop: 10, color: it.worthReply ? C.good : C.bad, fontSize: 13, lineHeight: 1.5 }}>{it.worthReply ? "Worth a reply" : "Fine to ignore"} — {it.why}</div>}
            </div>
          ); })}
          {!revealed ? <button onClick={reveal} disabled={decided === 0} style={{ background: decided ? C.you : C.raised, color: decided ? C.youInk : C.faint, border: "none", borderRadius: 12, padding: "13px", cursor: decided ? "pointer" : "default", fontSize: 14, fontWeight: 600 }}>Score my judgment</button> : <div style={{ display: "grid", gap: 10 }}><div style={{ color: C.text, fontSize: 15, textAlign: "center" }}>{correct}/{decided} calls right</div><button onClick={load} className="flex items-center justify-center" style={{ background: "transparent", color: C.you, border: `1px solid ${C.you}`, borderRadius: 12, padding: "11px", cursor: "pointer", fontSize: 14, gap: 6 }}><RotateCcw size={14} /> New batch</button></div>}
        </div>
      )}
    </div></div>
  );
}

function Stats({ store, back, shell }) {
  const log = store.log || [];
  const practice = log.filter((e) => e.mode === "practice");
  const recent = practice.filter((e) => e.scores).slice(-12);
  const avg = {}; AXES.forEach((a) => { avg[a] = recent.length ? Math.round(recent.reduce((s, r) => s + (r.scores[a] || 0), 0) / recent.length) : null; });
  const weak = weakestAxis(store);
  const calibRows = practice.filter((e) => e.calibErr != null);
  const calibAcc = calibRows.length ? Math.round(100 - calibRows.reduce((s, r) => s + r.calibErr, 0) / calibRows.length) : null;
  const inbox = log.filter((e) => e.mode === "inbox" && e.judgment != null);
  const judgeAvg = inbox.length ? Math.round(inbox.reduce((s, r) => s + r.judgment, 0) / inbox.length) : null;
  const missions = log.filter((e) => e.mode === "mission").length;
  return (
    <div style={shell}><div className="mx-auto w-full" style={{ maxWidth: 720, padding: "18px 18px 64px" }}>
      <button onClick={back} className="flex items-center" style={{ color: C.soft, background: "none", border: "none", cursor: "pointer", gap: 6, fontSize: 13, marginBottom: 16 }}><ArrowLeft size={16} /> Hub</button>
      <h2 style={{ fontFamily: DISPLAY, fontSize: 26, fontWeight: 600 }}>Progress</h2>
      <div className="flex items-center" style={{ gap: 22, marginTop: 16, flexWrap: "wrap" }}><Stat label="Streak" value={`${store.streak || 0}d`} /><Stat label="Practice runs" value={practice.length} /><Stat label="Field missions" value={missions} /><Stat label="Read accuracy" value={calibAcc != null ? `${calibAcc}%` : "—"} /><Stat label="Inbox judgment" value={judgeAvg != null ? `${judgeAvg}%` : "—"} /></div>
      {recent.length === 0 ? <p style={{ color: C.faint, fontSize: 14, marginTop: 28, lineHeight: 1.6 }}>No assessed sessions yet. Run a practice conversation and hit Assess; scores land here and the weakest axis starts driving Surprise me.</p> : <div style={{ marginTop: 26 }}><div style={{ color: C.faint, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 10 }}>Average, last {recent.length} assessed</div>{AXES.map((a) => { const v = avg[a] || 0; const col = v >= 60 ? C.good : v >= 35 ? C.warn : C.bad; return <div key={a} className="flex items-center" style={{ gap: 10, marginBottom: 10 }}><span style={{ width: 92, fontSize: 13, color: C.soft, textTransform: "capitalize" }}>{a}{a === weak ? " *" : ""}</span><Meter value={v} /><span style={{ width: 30, textAlign: "right", fontSize: 12.5, color: col }}>{v}</span></div>; })}{weak && <p style={{ color: C.soft, fontSize: 13.5, lineHeight: 1.6, marginTop: 16 }}>Recurring weakness: <span style={{ color: C.you, textTransform: "capitalize" }}>{weak}</span>. Surprise me spawns people engineered to bait it until it stops working on you.</p>}</div>}
    </div></div>
  );
}

