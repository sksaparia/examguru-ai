import { useState, useEffect, useRef } from "react";

// ── GROQ API ────────────────────────────────────────────────────────────────
const GROQ_KEY = import.meta.env?.VITE_GROQ_API_KEY || "";
async function askAI(messages, system) {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${GROQ_KEY}` },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile", max_tokens: 1024,
      messages: [{ role: "system", content: system }, ...messages],
    }),
  });
  if (!res.ok) throw new Error(`Groq error ${res.status}`);
  const d = await res.json();
  return d.choices?.[0]?.message?.content || "";
}

// ── DATA ────────────────────────────────────────────────────────────────────
const EXAMS = [
  { id: "upsc", label: "UPSC CSE", icon: "🏛️", color: "#FF6B00", sub: "Civil Services" },
  { id: "jee",  label: "JEE",      icon: "⚛️",  color: "#38BDF8", sub: "Mains + Advanced" },
  { id: "neet", label: "NEET",     icon: "🩺",  color: "#34D399", sub: "UG Medical" },
  { id: "ssc",  label: "SSC CGL",  icon: "📋",  color: "#FBBF24", sub: "Combined Graduate" },
  { id: "bank", label: "Bank PO",  icon: "🏦",  color: "#A78BFA", sub: "IBPS / SBI" },
  { id: "gate", label: "GATE",     icon: "⚙️",  color: "#F472B6", sub: "Engineering" },
];

const TABS = [
  { id: "quiz",     icon: "⚡", label: "Quiz" },
  { id: "doubt",    icon: "🤔", label: "Doubts" },
  { id: "pyq",      icon: "📜", label: "PYQ" },
  { id: "news",     icon: "🌏", label: "Current Affairs" },
  { id: "answer",   icon: "✍️", label: "Evaluate" },
  { id: "roadmap",  icon: "🗺️", label: "Roadmap" },
  { id: "notes",    icon: "📁", label: "Notes & PDFs" },
  { id: "forum",    icon: "💬", label: "Forum" },
  { id: "chat",     icon: "🟢", label: "Live Chat" },
];

// ── SEED DATA ────────────────────────────────────────────────────────────────
const SEED_POSTS = [
  { id: 1, user: "Priya_UPSC", avatar: "P", exam: "UPSC CSE", time: "2 hr ago", title: "Polity notes share kar raha hun — Laxmikanth chapter 5-12", body: "Ye notes maine khud banaye hain. Download karo, helpful hai guaranteed.", likes: 34, replies: 12, tag: "Notes", pinned: true },
  { id: 2, user: "RajeshJEE",  avatar: "R", exam: "JEE",      time: "5 hr ago", title: "Integral calculus shortcut tricks — must read!", body: "Ye tricks use karo mock mein, 3 questions solve kiye 4 min mein.", likes: 28, replies: 8,  tag: "Tricks", pinned: false },
  { id: 3, user: "AyeshaNEET", avatar: "A", exam: "NEET",     time: "1 day ago", title: "Organic Chemistry reaction chart PDF — free download", body: "Saare reactions ek chart mein. Print karke wall pe lagao.", likes: 56, replies: 21, tag: "PDF", pinned: false },
  { id: 4, user: "SSC_Vikram", avatar: "V", exam: "SSC CGL",  time: "3 hr ago", title: "Maths ka fear khatam karo — 30 days plan", body: "Main bhi pehle maths se darta tha. Ye plan follow kiya, ab 45/50 aata hai.", likes: 19, replies: 6,  tag: "Strategy", pinned: false },
  { id: 5, user: "BankPO_Sara",avatar: "S", exam: "Bank PO",  time: "6 hr ago", title: "Reasoning puzzles PDF — 200 questions with solutions", body: "IBPS PO 2025 ke level ke questions hain. Practice karo daily.", likes: 41, replies: 15, tag: "PDF", pinned: false },
];

const SEED_CHAT = [
  { id: 1, user: "Priya_UPSC", avatar: "P", msg: "Koi hai jo UPSC 2026 ki tayari kar raha hai? Group banana chahta hun.", time: "10:32" },
  { id: 2, user: "RajeshJEE",  avatar: "R", msg: "JEE wale bhi yahan hain? Chemistry doubt hai mera.", time: "10:35" },
  { id: 3, user: "AyeshaNEET", avatar: "A", msg: "NEET 2026 — Biology notes share karo please koi!", time: "10:41" },
  { id: 4, user: "Moderator",  avatar: "M", msg: "🎯 Aaj ka Daily Challenge: Polity MCQ blast — 20 questions in 10 min. Try karo!", time: "11:00", mod: true },
  { id: 5, user: "SSC_Vikram", avatar: "V", msg: "Maths mock test diya aaj — 43/50 aaya! ExamGuru se hi tayari ki thi 💪", time: "11:15" },
];

const SEED_NOTES = [
  { id: 1, name: "Laxmikanth Polity — Ch 1-15 Notes.pdf", by: "Priya_UPSC", exam: "UPSC", size: "2.4 MB", type: "pdf", likes: 89, downloads: 234, time: "2 days ago" },
  { id: 2, name: "JEE Maths Formula Sheet 2026.pdf",        by: "RajeshJEE",  exam: "JEE",  size: "1.1 MB", type: "pdf", likes: 67, downloads: 189, time: "3 days ago" },
  { id: 3, name: "NEET Biology NCERT Handwritten Notes.pdf",by: "AyeshaNEET",exam: "NEET", size: "5.2 MB", type: "pdf", likes: 112, downloads: 341, time: "1 day ago" },
  { id: 4, name: "Current Affairs June 2026 Capsule.pdf",   by: "CA_Daily",   exam: "All",  size: "3.8 MB", type: "pdf", likes: 156, downloads: 502, time: "5 hr ago" },
  { id: 5, name: "SSC CGL Maths Shortcut Tricks.pdf",       by: "SSC_Vikram", exam: "SSC",  size: "0.9 MB", type: "pdf", likes: 43, downloads: 128, time: "4 days ago" },
  { id: 6, name: "English Grammar 300 Rules PDF",            by: "EnglishGuru",exam: "All",  size: "1.5 MB", type: "pdf", likes: 78, downloads: 267, time: "1 week ago" },
];

// ── GLOBAL STYLES ────────────────────────────────────────────────────────────
const G = {
  bg: "#080C18",
  card: "rgba(255,255,255,0.042)",
  border: "rgba(255,255,255,0.08)",
  accent: "#FF6B00",
  accentGlow: "rgba(255,107,0,0.25)",
  text: "#E8ECF4",
  muted: "#64748B",
  faint: "rgba(255,255,255,0.03)",
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@500;700&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  body{background:${G.bg};color:${G.text};font-family:'Inter',system-ui,sans-serif;-webkit-font-smoothing:antialiased;}
  ::-webkit-scrollbar{width:4px;height:4px}
  ::-webkit-scrollbar-track{background:transparent}
  ::-webkit-scrollbar-thumb{background:rgba(255,107,0,0.3);border-radius:4px}
  ::selection{background:rgba(255,107,0,0.3);}
  @keyframes pulse-ring{0%{box-shadow:0 0 0 0 rgba(255,107,0,0.5)}70%{box-shadow:0 0 0 12px rgba(255,107,0,0)}100%{box-shadow:0 0 0 0 rgba(255,107,0,0)}}
  @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
  @keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
  @keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
  @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
  @keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}
  .fade-in{animation:fadeIn 0.35s ease forwards;}
  .float-anim{animation:float 3s ease-in-out infinite;}
  input,textarea,select{font-family:'Inter',system-ui,sans-serif;}
  input::placeholder,textarea::placeholder{color:${G.muted};}
`;

// ── SMALL COMPONENTS ─────────────────────────────────────────────────────────
const Spinner = () => (
  <span style={{ display:"inline-block", width:16, height:16, border:"2px solid rgba(255,107,0,0.3)", borderTopColor:"#FF6B00", borderRadius:"50%", animation:"spin 0.7s linear infinite" }} />
);

const Tag = ({ children, color = G.accent }) => (
  <span style={{ fontSize:10, fontWeight:700, letterSpacing:1, textTransform:"uppercase", color, background:`${color}18`, border:`1px solid ${color}30`, borderRadius:20, padding:"2px 8px" }}>
    {children}
  </span>
);

const Avatar = ({ letter, color = G.accent, size = 34 }) => (
  <div style={{ width:size, height:size, borderRadius:"50%", background:`${color}22`, border:`1.5px solid ${color}44`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:size*0.4, fontWeight:800, color, flexShrink:0 }}>
    {letter}
  </div>
);

const Btn = ({ children, onClick, variant = "primary", style: sx = {}, disabled }) => {
  const base = { border:"none", borderRadius:10, cursor:disabled?"not-allowed":"pointer", fontWeight:700, fontSize:14, fontFamily:"inherit", transition:"all 0.18s", opacity:disabled?0.5:1 };
  const variants = {
    primary: { background:"linear-gradient(90deg,#FF6B00,#FF8C38)", color:"#fff", padding:"11px 24px", boxShadow:"0 4px 20px rgba(255,107,0,0.3)" },
    ghost:   { background:"rgba(255,255,255,0.06)", color:G.text, padding:"10px 18px", border:"1px solid rgba(255,255,255,0.12)" },
    danger:  { background:"rgba(239,68,68,0.15)", color:"#EF4444", padding:"8px 14px", border:"1px solid rgba(239,68,68,0.3)" },
    success: { background:"rgba(52,211,153,0.15)", color:"#34D399", padding:"8px 14px", border:"1px solid rgba(52,211,153,0.3)" },
  };
  return <button onClick={onClick} disabled={disabled} style={{ ...base, ...variants[variant], ...sx }}>{children}</button>;
};

const Card = ({ children, style: sx = {}, glow }) => (
  <div style={{ background:G.card, borderRadius:16, border:`1px solid ${glow ? "rgba(255,107,0,0.3)" : G.border}`, padding:20, boxShadow:glow?"0 0 30px rgba(255,107,0,0.08)":undefined, ...sx }}>
    {children}
  </div>
);

const SectionLabel = ({ children }) => (
  <div style={{ fontSize:11, fontWeight:700, letterSpacing:1.5, textTransform:"uppercase", color:G.accent, marginBottom:14 }}>
    {children}
  </div>
);

const ResultBox = ({ text }) => (
  <div className="fade-in" style={{ background:"rgba(255,107,0,0.05)", border:"1px solid rgba(255,107,0,0.18)", borderRadius:12, padding:"18px 20px", marginTop:14, lineHeight:1.8, fontSize:14.5, whiteSpace:"pre-wrap", color:"#C8D3E6" }}>
    {text}
  </div>
);

const Input = ({ value, onChange, placeholder, onKeyDown, style: sx = {} }) => (
  <input value={value} onChange={onChange} placeholder={placeholder} onKeyDown={onKeyDown}
    style={{ width:"100%", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, color:G.text, fontSize:14, padding:"11px 14px", outline:"none", ...sx }} />
);

const Textarea = ({ value, onChange, placeholder, rows = 4, style: sx = {} }) => (
  <textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows}
    style={{ width:"100%", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, color:G.text, fontSize:14, padding:"11px 14px", outline:"none", resize:"vertical", fontFamily:"inherit", lineHeight:1.6, ...sx }} />
);

const Select = ({ value, onChange, children, style: sx = {} }) => (
  <select value={value} onChange={onChange}
    style={{ background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, color:G.text, fontSize:13, padding:"10px 12px", outline:"none", cursor:"pointer", ...sx }}>
    {children}
  </select>
);

// ── QUIZ ─────────────────────────────────────────────────────────────────────
function QuizMode({ exam }) {
  const [topic, setTopic] = useState(""); const [diff, setDiff] = useState("medium");
  const [count, setCount] = useState("5"); const [qs, setQs] = useState([]);
  const [cur, setCur] = useState(0); const [sel, setSel] = useState(null);
  const [score, setScore] = useState(0); const [done, setDone] = useState(false);
  const [explain, setExplain] = useState(""); const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const generate = async () => {
    if (!topic.trim()) return;
    setLoading(true); setQs([]); setCur(0); setScore(0); setDone(false); setSel(null); setErr("");
    try {
      const reply = await askAI([{ role:"user", content:`Topic: ${topic}. Difficulty: ${diff}. Exam: ${exam?.label}. Count: ${count}` }],
        `You are ExamGuru AI for ${exam?.label}. Generate exactly ${count} MCQs. Return ONLY valid JSON array, no markdown:
[{"q":"question","options":["A) ...","B) ...","C) ...","D) ..."],"correct":0,"explain":"explanation in 2 lines"}]`);
      setQs(JSON.parse(reply.replace(/\`\`\`json|\`\`\`/g,"").trim()));
    } catch { setErr("Quiz generate nahi hua. Topic aur try karo."); }
    setLoading(false);
  };

  const pick = (i) => {
    if (sel !== null) return; setSel(i); setExplain(qs[cur]?.explain||"");
    if (i === qs[cur]?.correct) setScore(s=>s+1);
  };

  const next = () => {
    if (cur+1 >= qs.length) { setDone(true); return; }
    setCur(c=>c+1); setSel(null); setExplain("");
  };

  const q = qs[cur];
  const pct = qs.length ? Math.round((score/qs.length)*100) : 0;

  return (
    <Card>
      <SectionLabel>⚡ Smart MCQ Generator</SectionLabel>
      {!qs.length && !done && (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          <Input value={topic} onChange={e=>setTopic(e.target.value)} placeholder={`Topic likhoo — "Fundamental Rights", "Kinematics", "Heart anatomy"...`} onKeyDown={e=>e.key==="Enter"&&generate()} />
          <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
            <Select value={diff} onChange={e=>setDiff(e.target.value)}>
              <option value="easy">🟢 Easy</option><option value="medium">🟡 Medium</option><option value="hard">🔴 Hard</option>
            </Select>
            <Select value={count} onChange={e=>setCount(e.target.value)}>
              <option value="5">5 Questions</option><option value="10">10 Questions</option><option value="15">15 Questions</option>
            </Select>
            <Btn onClick={generate} disabled={loading||!topic.trim()}>{loading?<Spinner/>:"Generate Quiz →"}</Btn>
          </div>
        </div>
      )}
      {err && <div style={{ color:"#EF4444", fontSize:13, marginTop:8 }}>⚠️ {err}</div>}

      {qs.length > 0 && !done && q && (
        <div className="fade-in">
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:16, fontSize:13, color:G.muted }}>
            <span>Q {cur+1}/{qs.length}</span>
            <span style={{ color:"#34D399", fontWeight:700 }}>Score: {score}/{cur}</span>
          </div>
          {/* progress bar */}
          <div style={{ height:3, background:"rgba(255,255,255,0.06)", borderRadius:4, marginBottom:18 }}>
            <div style={{ height:"100%", width:`${((cur)/qs.length)*100}%`, background:"linear-gradient(90deg,#FF6B00,#FFB347)", borderRadius:4, transition:"width 0.4s" }} />
          </div>
          <div style={{ fontSize:16, fontWeight:600, lineHeight:1.6, marginBottom:18 }}>{q.q}</div>
          {q.options?.map((opt,i)=>{
            const isCorrect = i===q.correct, isSel = sel===i;
            return (
              <button key={i} onClick={()=>pick(i)} style={{ display:"block", width:"100%", textAlign:"left", padding:"12px 16px", borderRadius:10, marginBottom:8, border:`1.5px solid ${sel===null?"rgba(255,255,255,0.09)":isCorrect?"#34D399":isSel?"#EF4444":"rgba(255,255,255,0.06)"}`, background:sel===null?"rgba(255,255,255,0.03)":isCorrect?"rgba(52,211,153,0.1)":isSel?"rgba(239,68,68,0.1)":"rgba(255,255,255,0.02)", color:G.text, fontSize:14, cursor:sel===null?"pointer":"default", fontFamily:"inherit", transition:"all 0.15s" }}>
                {sel!==null&&isCorrect?"✅ ":sel!==null&&isSel?"❌ ":""}{opt}
              </button>
            );
          })}
          {explain && <div style={{ background:"rgba(52,211,153,0.07)", border:"1px solid rgba(52,211,153,0.2)", borderRadius:10, padding:"12px 16px", marginTop:10, fontSize:13, color:"#9DDFC9", lineHeight:1.6 }}>💡 {explain}</div>}
          {sel!==null && <Btn onClick={next} style={{ marginTop:14 }}>{cur+1<qs.length?"Next →":"See Result"}</Btn>}
        </div>
      )}

      {done && (
        <div className="fade-in" style={{ textAlign:"center", padding:"20px 0" }}>
          <div style={{ fontSize:60, marginBottom:8 }}>{pct>=80?"🏆":pct>=60?"👍":"📚"}</div>
          <div style={{ fontSize:48, fontWeight:900, background:"linear-gradient(90deg,#FF6B00,#FFD166)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>{score}/{qs.length}</div>
          <div style={{ color:G.muted, marginTop:8, fontSize:15 }}>
            {pct>=80?"Zabardast! Ekdum top performer!":pct>=60?"Accha kiya, keep going!":"Ek baar aur revise karo!"}
          </div>
          <div style={{ display:"flex", gap:10, justifyContent:"center", marginTop:20 }}>
            <Btn onClick={()=>{setQs([]);setDone(false);setTopic("");}}>New Topic</Btn>
            <Btn variant="ghost" onClick={()=>{setQs([]);setDone(false);setCur(0);setScore(0);setSel(null);}}>Retry Same</Btn>
          </div>
        </div>
      )}
    </Card>
  );
}

// ── DOUBT SOLVER ─────────────────────────────────────────────────────────────
function DoubtMode({ exam }) {
  const [q, setQ] = useState(""); const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]); const bottomRef = useRef(null);

  useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:"smooth"}); }, [history,loading]);

  const ask = async () => {
    if (!q.trim()||loading) return;
    const question = q.trim(); setQ(""); setLoading(true);
    try {
      const msgs = [...history.flatMap(h=>[{role:"user",content:h.q},{role:"assistant",content:h.a}]),{role:"user",content:question}];
      const reply = await askAI(msgs, `You are ExamGuru AI — best FREE doubt solver for ${exam?.label}. Answer in Hinglish (Hindi+English mix). Structure: 1. Simple answer 2. Exam angle 3. Memory trick. Max 180 words. Use Indian examples.`);
      setHistory(h=>[...h,{q:question,a:reply}]);
    } catch { setHistory(h=>[...h,{q:question,a:"⚠️ Error aaya. Dobara try karo."}]); }
    setLoading(false);
  };

  return (
    <Card>
      <SectionLabel>🤔 AI Doubt Solver — Hindi · English · Hinglish</SectionLabel>
      <div style={{ maxHeight:380, overflowY:"auto", marginBottom:14, display:"flex", flexDirection:"column", gap:12 }}>
        {history.length===0 && !loading && (
          <div style={{ color:"#2D3B52", fontSize:14, padding:"12px 0" }}>Koi bhi doubt poocho... जैसे "GST kya hai?", "What is Krebs cycle?", "Newton's 3rd law explain karo"</div>
        )}
        {history.map((h,i)=>(
          <div key={i} className="fade-in">
            <div style={{ display:"flex", gap:8, justifyContent:"flex-end", marginBottom:6 }}>
              <div style={{ background:"rgba(255,107,0,0.15)", border:"1px solid rgba(255,107,0,0.25)", borderRadius:"14px 14px 4px 14px", padding:"10px 14px", fontSize:14, maxWidth:"80%", color:"#FFB347" }}>{h.q}</div>
              <Avatar letter="U" color="#FF6B00" size={30} />
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <Avatar letter="G" color="#34D399" size={30} />
              <div style={{ background:"rgba(52,211,153,0.07)", border:"1px solid rgba(52,211,153,0.15)", borderRadius:"14px 14px 14px 4px", padding:"10px 14px", fontSize:14, maxWidth:"85%", lineHeight:1.7, color:"#C8D3E6", whiteSpace:"pre-wrap" }}>{h.a}</div>
            </div>
          </div>
        ))}
        {loading && <div style={{ display:"flex", gap:8, alignItems:"center" }}><Avatar letter="G" color="#34D399" size={30}/><div style={{ background:"rgba(52,211,153,0.07)", border:"1px solid rgba(52,211,153,0.15)", borderRadius:14, padding:"12px 16px", display:"flex", gap:6 }}>{[0,1,2].map(i=><span key={i} style={{ width:6,height:6,borderRadius:"50%",background:"#34D399",animation:`blink 1.2s ${i*0.2}s ease-in-out infinite` }}/>)}</div></div>}
        <div ref={bottomRef}/>
      </div>
      <div style={{ display:"flex", gap:8 }}>
        <Textarea value={q} onChange={e=>setQ(e.target.value)} placeholder="Doubt likho..." rows={2} style={{ flex:1, minHeight:44 }} />
        <Btn onClick={ask} disabled={loading||!q.trim()} style={{ alignSelf:"flex-end" }}>Send</Btn>
      </div>
      <div style={{ fontSize:11, color:"#2D3B52", marginTop:5 }}>Enter to send</div>
    </Card>
  );
}

// ── PYQ ──────────────────────────────────────────────────────────────────────
function PYQMode({ exam }) {
  const [years, setYears] = useState("5"); const [result, setResult] = useState(""); const [loading, setLoading] = useState(false);
  const go = async () => {
    setLoading(true); setResult("");
    try {
      const r = await askAI([{role:"user",content:`Analyze ${exam?.label} PYQ trends for last ${years} years. Give: 🔥 High Priority (3+ times), 📈 Rising Topics, 🎯 Sure-shot next exam, ⚠️ Low priority, 📋 3-line strategy. Be specific.`}],
        `You are ExamGuru AI — expert ${exam?.label} analyst. Give specific, actionable insights.`);
      setResult(r);
    } catch { setResult("Error. Try again."); }
    setLoading(false);
  };
  return (
    <Card>
      <SectionLabel>📜 PYQ Pattern Analyzer — {exam?.label}</SectionLabel>
      <div style={{ display:"flex", gap:10, alignItems:"center", marginBottom:16, flexWrap:"wrap" }}>
        <span style={{ color:G.muted, fontSize:14 }}>Last</span>
        <Select value={years} onChange={e=>setYears(e.target.value)}><option value="3">3 years</option><option value="5">5 years</option><option value="10">10 years</option></Select>
        <span style={{ color:G.muted, fontSize:14 }}>papers analyze karo</span>
        <Btn onClick={go} disabled={loading}>{loading?<><Spinner/> Analyzing...</>:"Analyze Now →"}</Btn>
      </div>
      {result && <ResultBox text={result}/>}
    </Card>
  );
}

// ── CURRENT AFFAIRS ──────────────────────────────────────────────────────────
function NewsMode({ exam }) {
  const [topic, setTopic] = useState(""); const [result, setResult] = useState(""); const [loading, setLoading] = useState(false);
  const go = async () => {
    setLoading(true); setResult("");
    try {
      const r = await askAI([{role:"user",content:`Exam-focused current affairs notes on: "${topic||"most important recent current affairs"}". Format: 📰 WHAT HAPPENED | 🎯 EXAM RELEVANCE for ${exam?.label} | ❓ SAMPLE MCQ (with answer) | 🔑 KEY FACTS | 🔗 CONNECTED TOPICS`}],
        `You are ExamGuru AI — current affairs expert for Indian competitive exams.`);
      setResult(r);
    } catch { setResult("Error. Try again."); }
    setLoading(false);
  };
  return (
    <Card>
      <SectionLabel>🌏 Current Affairs → Exam Notes</SectionLabel>
      <div style={{ display:"flex", gap:8, marginBottom:14 }}>
        <Input value={topic} onChange={e=>setTopic(e.target.value)} placeholder='Topic ya event: "RBI rate cut", "India-China summit", ya blank = important topics' onKeyDown={e=>e.key==="Enter"&&go()} style={{ flex:1 }}/>
        <Btn onClick={go} disabled={loading}>{loading?<Spinner/>:"Convert →"}</Btn>
      </div>
      {result && <ResultBox text={result}/>}
    </Card>
  );
}

// ── ANSWER EVALUATOR ─────────────────────────────────────────────────────────
function AnswerMode({ exam }) {
  const [question, setQuestion] = useState(""); const [answer, setAnswer] = useState(""); const [result, setResult] = useState(""); const [loading, setLoading] = useState(false);
  const go = async () => {
    if (!answer.trim()) return; setLoading(true); setResult("");
    try {
      const r = await askAI([{role:"user",content:`Exam: ${exam?.label}\nQuestion: ${question||"(general answer writing)"}\nStudent Answer: ${answer}\n\nEvaluate:\n⭐ SCORE: X/10\n✅ STRENGTHS\n❌ MISSING POINTS\n💡 MODEL ANSWER OUTLINE\n🔧 HOW TO IMPROVE`}],
        `You are a senior ${exam?.label} examiner. Evaluate answers strictly but encouragingly.`);
      setResult(r);
    } catch { setResult("Error. Try again."); }
    setLoading(false);
  };
  return (
    <Card>
      <SectionLabel>✍️ Answer Evaluator — Score Your Answer</SectionLabel>
      <Input value={question} onChange={e=>setQuestion(e.target.value)} placeholder='Question (optional): "Discuss the role of RBI..."' style={{ marginBottom:10 }}/>
      <Textarea value={answer} onChange={e=>setAnswer(e.target.value)} placeholder="Apna answer yahan paste karo ya likho. AI score + detailed feedback dega." rows={6} style={{ marginBottom:12 }}/>
      <Btn onClick={go} disabled={loading||!answer.trim()}>{loading?<><Spinner/> Evaluating...</>:"Evaluate My Answer →"}</Btn>
      {result && <ResultBox text={result}/>}
    </Card>
  );
}

// ── ROADMAP ──────────────────────────────────────────────────────────────────
function RoadmapMode({ exam }) {
  const [months, setMonths] = useState("6"); const [hours, setHours] = useState("4");
  const [weak, setWeak] = useState(""); const [result, setResult] = useState(""); const [loading, setLoading] = useState(false);
  const go = async () => {
    setLoading(true); setResult("");
    try {
      const r = await askAI([{role:"user",content:`${months}-month roadmap for ${exam?.label}. ${hours} hrs/day. Weak: ${weak||"not specified"}. Give: 📅 Month-wise plan | 📚 Daily schedule | 📖 Free resources | ⚡ Revision strategy | 🎯 Mock test plan | 🔥 Top 3 tips`}],
        `You are ExamGuru AI — best exam strategist for India. Create realistic, actionable plans.`);
      setResult(r);
    } catch { setResult("Error. Try again."); }
    setLoading(false);
  };
  return (
    <Card>
      <SectionLabel>🗺️ Personalized Study Roadmap</SectionLabel>
      <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:14 }}>
        <div><div style={{ fontSize:11, color:G.muted, marginBottom:6 }}>Months left</div>
          <Select value={months} onChange={e=>setMonths(e.target.value)}>{["1","2","3","4","6","9","12"].map(m=><option key={m} value={m}>{m} months</option>)}</Select></div>
        <div><div style={{ fontSize:11, color:G.muted, marginBottom:6 }}>Hours/day</div>
          <Select value={hours} onChange={e=>setHours(e.target.value)}>{["2","3","4","5","6","8"].map(h=><option key={h} value={h}>{h} hrs</option>)}</Select></div>
        <div style={{ flex:1, minWidth:160 }}><div style={{ fontSize:11, color:G.muted, marginBottom:6 }}>Weak areas</div>
          <Input value={weak} onChange={e=>setWeak(e.target.value)} placeholder="Maths, Economy, Current Affairs..."/></div>
      </div>
      <Btn onClick={go} disabled={loading}>{loading?<><Spinner/> Building plan...</>:"Generate My Roadmap →"}</Btn>
      {result && <ResultBox text={result}/>}
    </Card>
  );
}

// ── NOTES & PDFs ─────────────────────────────────────────────────────────────
function NotesMode({ exam }) {
  const [notes, setNotes] = useState(SEED_NOTES);
  const [filter, setFilter] = useState("All");
  const [uploading, setUploading] = useState(false);
  const [newName, setNewName] = useState("");
  const [likedIds, setLikedIds] = useState([]);
  const fileRef = useRef();

  const filtered = filter==="All" ? notes : notes.filter(n=>n.exam===filter||n.exam==="All");

  const handleUpload = () => {
    if (!newName.trim()) return;
    setUploading(true);
    setTimeout(()=>{
      setNotes(n=>[{id:Date.now(),name:newName.endsWith(".pdf")?newName:newName+".pdf",by:"You",exam:exam?.label||"All",size:"? MB",type:"pdf",likes:0,downloads:0,time:"Just now"},...n]);
      setNewName(""); setUploading(false);
    }, 1200);
  };

  const like = (id) => {
    if (likedIds.includes(id)) return;
    setLikedIds(l=>[...l,id]);
    setNotes(n=>n.map(x=>x.id===id?{...x,likes:x.likes+1}:x));
  };

  return (
    <div>
      {/* Upload section */}
      <Card style={{ marginBottom:16 }}>
        <SectionLabel>📤 Upload Notes / PDF</SectionLabel>
        <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
          <Input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="File naam likhoo ya drag-drop karo — e.g. 'Polity Notes Chapter 5.pdf'" style={{ flex:1 }} onKeyDown={e=>e.key==="Enter"&&handleUpload()}/>
          <Btn onClick={handleUpload} disabled={uploading||!newName.trim()}>{uploading?<><Spinner/> Uploading...</>:"📤 Share with Community"}</Btn>
        </div>
        <div style={{ fontSize:11, color:G.muted, marginTop:8 }}>✅ PDF, notes, handwritten scans sab share ho sakte hain. Community se connect karo!</div>
      </Card>

      {/* Filter */}
      <div style={{ display:"flex", gap:8, marginBottom:14, flexWrap:"wrap" }}>
        {["All","UPSC","JEE","NEET","SSC","Bank PO"].map(f=>(
          <button key={f} onClick={()=>setFilter(f)} style={{ padding:"6px 14px", borderRadius:20, border:`1px solid ${filter===f?"#FF6B00":"rgba(255,255,255,0.1)"}`, background:filter===f?"rgba(255,107,0,0.15)":"transparent", color:filter===f?"#FF6B00":G.muted, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>{f}</button>
        ))}
      </div>

      {/* Notes list */}
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {filtered.map(n=>(
          <Card key={n.id} style={{ padding:16 }}>
            <div style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
              <div style={{ width:40, height:48, background:"rgba(255,107,0,0.12)", border:"1px solid rgba(255,107,0,0.25)", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 }}>📄</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:14, fontWeight:600, marginBottom:4, color:G.text, wordBreak:"break-word" }}>{n.name}</div>
                <div style={{ fontSize:12, color:G.muted, display:"flex", gap:10, flexWrap:"wrap" }}>
                  <span>by <strong style={{ color:"#FFB347" }}>{n.by}</strong></span>
                  <span>{n.size}</span>
                  <span>{n.time}</span>
                  <Tag color={n.exam==="All"?"#A78BFA":"#FF6B00"}>{n.exam}</Tag>
                </div>
              </div>
              <div style={{ display:"flex", gap:6, flexShrink:0 }}>
                <button onClick={()=>like(n.id)} style={{ background:"transparent", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, color:likedIds.includes(n.id)?"#FF6B00":G.muted, padding:"6px 10px", cursor:"pointer", fontSize:12, fontFamily:"inherit" }}>❤️ {n.likes}</button>
                <Btn variant="ghost" style={{ fontSize:12, padding:"6px 12px" }}>⬇️ Download</Btn>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── FORUM ────────────────────────────────────────────────────────────────────
function ForumMode({ exam }) {
  const [posts, setPosts] = useState(SEED_POSTS);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState(""); const [newBody, setNewBody] = useState("");
  const [likedIds, setLikedIds] = useState([]); const [openId, setOpenId] = useState(null);
  const [replyText, setReplyText] = useState(""); const [filter, setFilter] = useState("All");

  const submit = () => {
    if (!newTitle.trim()) return;
    setPosts(p=>[{id:Date.now(),user:"You",avatar:"U",exam:exam?.label||"All",time:"Just now",title:newTitle,body:newBody,likes:0,replies:0,tag:"Question",pinned:false},...p]);
    setNewTitle(""); setNewBody(""); setCreating(false);
  };

  const like = (id) => {
    if(likedIds.includes(id)) return;
    setLikedIds(l=>[...l,id]);
    setPosts(p=>p.map(x=>x.id===id?{...x,likes:x.likes+1}:x));
  };

  const filtered = filter==="All"?posts:posts.filter(p=>p.tag===filter);

  return (
    <div>
      {/* New post */}
      {!creating ? (
        <Card style={{ marginBottom:16 }}>
          <div style={{ display:"flex", gap:12, alignItems:"center" }}>
            <Avatar letter="U" color="#FF6B00"/>
            <div onClick={()=>setCreating(true)} style={{ flex:1, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:10, padding:"11px 16px", fontSize:14, color:G.muted, cursor:"pointer" }}>
              Kuch share karo — notes, tips, questions, strategies...
            </div>
            <Btn onClick={()=>setCreating(true)}>+ Post</Btn>
          </div>
        </Card>
      ) : (
        <Card style={{ marginBottom:16 }} glow>
          <SectionLabel>✍️ Naya Post Banao</SectionLabel>
          <Input value={newTitle} onChange={e=>setNewTitle(e.target.value)} placeholder="Title — e.g. 'Polity notes share kar raha hun...'" style={{ marginBottom:10 }}/>
          <Textarea value={newBody} onChange={e=>setNewBody(e.target.value)} placeholder="Details likhoo — kya share karna hai, tips, resources..." rows={4} style={{ marginBottom:12 }}/>
          <div style={{ display:"flex", gap:10 }}>
            <Btn onClick={submit} disabled={!newTitle.trim()}>Post Karo 🚀</Btn>
            <Btn variant="ghost" onClick={()=>setCreating(false)}>Cancel</Btn>
          </div>
        </Card>
      )}

      {/* Filters */}
      <div style={{ display:"flex", gap:8, marginBottom:14, flexWrap:"wrap" }}>
        {["All","Notes","PDF","Tricks","Strategy","Question"].map(f=>(
          <button key={f} onClick={()=>setFilter(f)} style={{ padding:"5px 12px", borderRadius:20, border:`1px solid ${filter===f?"#FF6B00":"rgba(255,255,255,0.1)"}`, background:filter===f?"rgba(255,107,0,0.15)":"transparent", color:filter===f?"#FF6B00":G.muted, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>{f}</button>
        ))}
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {filtered.map(p=>(
          <Card key={p.id} style={{ padding:16 }}>
            {p.pinned && <div style={{ fontSize:11, color:"#FBBF24", marginBottom:8, fontWeight:600 }}>📌 PINNED</div>}
            <div style={{ display:"flex", gap:10, marginBottom:10 }}>
              <Avatar letter={p.avatar} color="#A78BFA"/>
              <div>
                <div style={{ fontSize:13, fontWeight:600, color:"#C4B5FD" }}>{p.user}</div>
                <div style={{ fontSize:11, color:G.muted }}>{p.exam} · {p.time}</div>
              </div>
              <Tag color="#FF6B00">{p.tag}</Tag>
            </div>
            <div style={{ fontSize:15, fontWeight:700, marginBottom:6 }}>{p.title}</div>
            <div style={{ fontSize:13, color:"#94A3B8", lineHeight:1.6, marginBottom:12 }}>{p.body}</div>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={()=>like(p.id)} style={{ background:"transparent", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, color:likedIds.includes(p.id)?"#FF6B00":G.muted, padding:"6px 12px", cursor:"pointer", fontSize:12, fontFamily:"inherit" }}>❤️ {p.likes}</button>
              <button onClick={()=>setOpenId(openId===p.id?null:p.id)} style={{ background:"transparent", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, color:G.muted, padding:"6px 12px", cursor:"pointer", fontSize:12, fontFamily:"inherit" }}>💬 {p.replies} Replies</button>
            </div>
            {openId===p.id && (
              <div className="fade-in" style={{ marginTop:14, paddingTop:14, borderTop:"1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ display:"flex", gap:8 }}>
                  <Input value={replyText} onChange={e=>setReplyText(e.target.value)} placeholder="Reply likhoo..." style={{ flex:1 }}/>
                  <Btn variant="ghost" onClick={()=>{setPosts(pp=>pp.map(x=>x.id===p.id?{...x,replies:x.replies+1}:x));setReplyText("");}}>Reply</Btn>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── LIVE CHAT ────────────────────────────────────────────────────────────────
function ChatMode({ exam }) {
  const [msgs, setMsgs] = useState(SEED_CHAT);
  const [text, setText] = useState("");
  const [username] = useState("Student_"+Math.floor(Math.random()*9999));
  const bottomRef = useRef();

  useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:"smooth"}); }, [msgs]);

  const send = () => {
    if (!text.trim()) return;
    setMsgs(m=>[...m,{id:Date.now(),user:username,avatar:"U",msg:text.trim(),time:new Date().toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"})}]);
    setText("");
  };

  const COLORS = { "Priya_UPSC":"#FF6B00","RajeshJEE":"#38BDF8","AyeshaNEET":"#34D399","Moderator":"#FBBF24","SSC_Vikram":"#A78BFA","BankPO_Sara":"#F472B6" };

  return (
    <Card style={{ padding:0, overflow:"hidden" }}>
      {/* Header */}
      <div style={{ padding:"14px 18px", borderBottom:`1px solid ${G.border}`, display:"flex", alignItems:"center", gap:10 }}>
        <div style={{ width:8, height:8, borderRadius:"50%", background:"#34D399", boxShadow:"0 0 8px #34D399", animation:"blink 2s ease-in-out infinite" }}/>
        <span style={{ fontSize:14, fontWeight:700 }}>Live Community Chat</span>
        <span style={{ fontSize:11, color:G.muted, marginLeft:"auto" }}>🟢 {Math.floor(Math.random()*80)+120} online</span>
      </div>

      {/* Messages */}
      <div style={{ height:360, overflowY:"auto", padding:16, display:"flex", flexDirection:"column", gap:10 }}>
        {msgs.map(m=>(
          <div key={m.id} className="fade-in" style={{ display:"flex", gap:8, alignItems:"flex-start" }}>
            <Avatar letter={m.avatar} color={COLORS[m.user]||"#64748B"} size={30}/>
            <div>
              <div style={{ fontSize:11, color:COLORS[m.user]||G.muted, fontWeight:700, marginBottom:3 }}>
                {m.user} {m.mod&&<Tag color="#FBBF24">MOD</Tag>} <span style={{ color:G.muted, fontWeight:400 }}>{m.time}</span>
              </div>
              <div style={{ background:m.mod?"rgba(251,191,36,0.08)":"rgba(255,255,255,0.04)", border:`1px solid ${m.mod?"rgba(251,191,36,0.2)":G.border}`, borderRadius:"4px 12px 12px 12px", padding:"8px 12px", fontSize:14, color:G.text, maxWidth:480, lineHeight:1.5 }}>
                {m.msg}
              </div>
            </div>
          </div>
        ))}
        <div ref={bottomRef}/>
      </div>

      {/* Input */}
      <div style={{ padding:"12px 16px", borderTop:`1px solid ${G.border}`, display:"flex", gap:8 }}>
        <Input value={text} onChange={e=>setText(e.target.value)} placeholder={`Message as ${username}...`} onKeyDown={e=>e.key==="Enter"&&send()} style={{ flex:1 }}/>
        <Btn onClick={send} disabled={!text.trim()}>Send</Btn>
      </div>
    </Card>
  );
}

// ── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [examIdx, setExamIdx] = useState(0);
  const [tab, setTab] = useState("quiz");
  const [streak, setStreak] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const exam = EXAMS[examIdx];

  useEffect(()=>{
    try {
      const today = new Date().toDateString();
      const last = localStorage.getItem("eg_last");
      const s = Number(localStorage.getItem("eg_streak")||1);
      if(last!==today){ const ns=last===new Date(Date.now()-86400000).toDateString()?s+1:1; localStorage.setItem("eg_streak",ns); localStorage.setItem("eg_last",today); setStreak(ns); } else setStreak(s);
    } catch {}
  },[]);

  const renderTab = () => {
    switch(tab){
      case "quiz":    return <QuizMode exam={exam}/>;
      case "doubt":   return <DoubtMode exam={exam}/>;
      case "pyq":     return <PYQMode exam={exam}/>;
      case "news":    return <NewsMode exam={exam}/>;
      case "answer":  return <AnswerMode exam={exam}/>;
      case "roadmap": return <RoadmapMode exam={exam}/>;
      case "notes":   return <NotesMode exam={exam}/>;
      case "forum":   return <ForumMode exam={exam}/>;
      case "chat":    return <ChatMode exam={exam}/>;
      default:        return <QuizMode exam={exam}/>;
    }
  };

  return (
    <>
      <style>{css}</style>
      <div style={{ minHeight:"100vh", background:G.bg }}>

        {/* ── NAV ── */}
        <nav style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 24px", borderBottom:`1px solid ${G.border}`, position:"sticky", top:0, zIndex:100, background:"rgba(8,12,24,0.95)", backdropFilter:"blur(16px)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ fontSize:24, animation:"float 3s ease-in-out infinite" }}>🧠</div>
            <div>
              <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:18, fontWeight:700, background:"linear-gradient(90deg,#FF6B00,#FFD166)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", lineHeight:1.1 }}>ExamGuru AI</div>
              <div style={{ fontSize:10, color:G.muted, letterSpacing:1 }}>FREE · AI POWERED</div>
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:16 }}>
            <div style={{ display:"flex", alignItems:"center", gap:6, background:"rgba(255,107,0,0.1)", border:"1px solid rgba(255,107,0,0.25)", borderRadius:20, padding:"5px 12px" }}>
              <span>🔥</span><span style={{ fontSize:13, fontWeight:700, color:"#FFD166" }}>{streak} day</span>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:6, background:"rgba(52,211,153,0.08)", border:"1px solid rgba(52,211,153,0.2)", borderRadius:20, padding:"5px 12px" }}>
              <span style={{ width:6, height:6, borderRadius:"50%", background:"#34D399", display:"inline-block", animation:"blink 2s ease-in-out infinite" }}/>
              <span style={{ fontSize:12, color:"#34D399", fontWeight:600 }}>Free Forever</span>
            </div>
          </div>
        </nav>

        {/* ── HERO ── */}
        <div style={{ maxWidth:900, margin:"0 auto", padding:"44px 24px 28px", textAlign:"center" }}>
          <div style={{ display:"inline-block", fontSize:11, letterSpacing:2, fontWeight:700, color:"#FF6B00", textTransform:"uppercase", padding:"4px 16px", border:"1px solid rgba(255,107,0,0.3)", borderRadius:20, marginBottom:18 }}>
            🇮🇳 India's #1 Free AI Exam Platform
          </div>
          <h1 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:"clamp(30px,5.5vw,58px)", fontWeight:700, lineHeight:1.08, marginBottom:14, background:"linear-gradient(175deg,#FFFFFF 30%,#64748B 100%)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
            Crack any exam.<br/>Zero fees. Zero limits.
          </h1>
          <p style={{ fontSize:16, color:"#64748B", lineHeight:1.7, maxWidth:520, margin:"0 auto 28px" }}>
            UPSC · JEE · NEET · SSC · Bank PO — AI quiz, doubts, PYQ analysis, community — sab free.
          </p>

          {/* Exam chips */}
          <div style={{ display:"flex", flexWrap:"wrap", gap:10, justifyContent:"center", marginBottom:12 }}>
            {EXAMS.map((e,i)=>(
              <button key={e.id} onClick={()=>setExamIdx(i)} style={{ padding:"9px 18px", borderRadius:24, cursor:"pointer", fontSize:13, fontWeight:600, border:`1.5px solid ${examIdx===i?e.color:"rgba(255,255,255,0.09)"}`, background:examIdx===i?`${e.color}1A`:"rgba(255,255,255,0.03)", color:examIdx===i?e.color:"#64748B", transition:"all 0.2s", fontFamily:"inherit", boxShadow:examIdx===i?`0 0 20px ${e.color}30`:undefined }}>
                {e.icon} {e.label} <span style={{ fontSize:10, opacity:0.7 }}>{e.sub}</span>
              </button>
            ))}
          </div>

          {/* Stats row */}
          <div style={{ display:"flex", gap:24, justifyContent:"center", flexWrap:"wrap", marginBottom:4 }}>
            {[["2Cr+","Students"],["100%","Free"],["6","AI Tools"],["24/7","Available"]].map(([n,l])=>(
              <div key={l} style={{ textAlign:"center" }}>
                <div style={{ fontSize:20, fontWeight:800, color:"#FF6B00" }}>{n}</div>
                <div style={{ fontSize:11, color:G.muted }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── TABS ── */}
        <div style={{ maxWidth:960, margin:"0 auto", padding:"0 16px" }}>
          <div style={{ display:"flex", gap:4, overflowX:"auto", paddingBottom:2, borderBottom:`1px solid ${G.border}`, marginBottom:20, scrollbarWidth:"none" }}>
            {TABS.map(t=>(
              <button key={t.id} onClick={()=>setTab(t.id)} style={{ padding:"10px 16px", borderRadius:"8px 8px 0 0", border:"none", borderBottom:`2px solid ${tab===t.id?"#FF6B00":"transparent"}`, background:tab===t.id?"rgba(255,107,0,0.08)":"transparent", color:tab===t.id?"#FF6B00":"#64748B", fontSize:13, fontWeight:600, cursor:"pointer", whiteSpace:"nowrap", fontFamily:"inherit", transition:"all 0.15s", display:"flex", alignItems:"center", gap:6 }}>
                {t.icon} {t.label}
                {t.id==="chat"&&<span style={{ width:6,height:6,borderRadius:"50%",background:"#34D399",animation:"blink 2s ease-in-out infinite" }}/>}
              </button>
            ))}
          </div>

          {/* Active exam banner */}
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16, padding:"10px 16px", background:"rgba(255,255,255,0.03)", borderRadius:10, border:`1px solid ${G.border}` }}>
            <span style={{ fontSize:16 }}>{exam.icon}</span>
            <span style={{ fontWeight:700, color:exam.color }}>{exam.label}</span>
            <span style={{ color:G.muted, fontSize:13 }}>· {exam.sub}</span>
            <span style={{ marginLeft:"auto", fontSize:11, color:"#2D3B52" }}>Exam change karo ↑</span>
          </div>

          {/* Content */}
          <div className="fade-in" key={tab}>
            {renderTab()}
          </div>

          <div style={{ textAlign:"center", color:"#1E2A3A", fontSize:12, padding:"28px 0 40px" }}>
            ExamGuru AI — Free forever · Made for 2 crore+ Indian aspirants · No login · No ads
          </div>
        </div>
      </div>
    </>
  );
}
