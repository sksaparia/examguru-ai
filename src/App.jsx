import { useState, useEffect } from "react";

const EXAMS = [
  { id: "upsc", label: "UPSC CSE", icon: "🏛️", color: "#FF6B00" },
  { id: "jee",  label: "JEE",      icon: "⚛️",  color: "#00B4D8" },
  { id: "neet", label: "NEET",     icon: "🩺",  color: "#06D6A0" },
  { id: "ssc",  label: "SSC CGL",  icon: "📋",  color: "#FFD166" },
  { id: "bank", label: "Bank PO",  icon: "🏦",  color: "#A78BFA" },
];

const MODES = [
  { id: "quiz",    icon: "⚡", label: "Smart Quiz",       desc: "AI makes custom MCQs for you" },
  { id: "doubt",   icon: "🤔", label: "Doubt Solver",     desc: "Ask anything in Hindi or English" },
  { id: "pyq",     icon: "📜", label: "PYQ Analyzer",     desc: "Pattern finder from past papers" },
  { id: "current", icon: "🌏", label: "Current Affairs",  desc: "Today's news → exam angle" },
  { id: "answer",  icon: "✍️", label: "Answer Evaluator", desc: "Write answer, get score + feedback" },
  { id: "roadmap", icon: "🗺️", label: "Study Roadmap",    desc: "Personalized plan from today" },
];

// ── Claude API call ────────────────────────────────────────────────────────
async function callClaude(messages, systemPrompt) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      system: systemPrompt,
      messages,
    }),
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const data = await res.json();
  return data.content?.map(b => b.text || "").join("") || "No response received.";
}

// ── Styles ─────────────────────────────────────────────────────────────────
const S = {
  app: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0A0E1A 0%, #0D1527 60%, #0A1628 100%)",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    color: "#E8EAED",
    margin: 0,
  },
  nav: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "16px 28px",
    borderBottom: "1px solid rgba(255,107,0,0.15)",
    position: "sticky", top: 0, zIndex: 100,
    background: "rgba(10,14,26,0.95)",
    backdropFilter: "blur(12px)",
  },
  logo: {
    fontSize: 22, fontWeight: 800,
    background: "linear-gradient(90deg, #FF6B00, #FFB347)",
    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
  },
  badge: {
    fontSize: 10, background: "rgba(255,107,0,0.18)", color: "#FF6B00",
    border: "1px solid rgba(255,107,0,0.4)", borderRadius: 20,
    padding: "2px 10px", fontWeight: 700, letterSpacing: 1, marginLeft: 10,
  },
  streak: {
    fontSize: 13, color: "#FFD166", fontWeight: 700,
  },
  hero: {
    textAlign: "center", padding: "52px 24px 32px",
    maxWidth: 720, margin: "0 auto",
  },
  heroTag: {
    display: "inline-block", fontSize: 11, letterSpacing: 2, fontWeight: 700,
    color: "#FF6B00", textTransform: "uppercase", marginBottom: 16,
    padding: "4px 14px", border: "1px solid rgba(255,107,0,0.3)", borderRadius: 20,
  },
  heroTitle: {
    fontSize: "clamp(28px,5vw,52px)", fontWeight: 900, lineHeight: 1.1,
    margin: "0 0 16px",
    background: "linear-gradient(180deg, #FFFFFF 40%, #A8B4C8 100%)",
    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
  },
  heroSub: {
    fontSize: 16, color: "#8B95A8", lineHeight: 1.7, margin: "0 0 32px",
  },
  examRow: {
    display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center", marginBottom: 36,
  },
  examChip: (active, color) => ({
    padding: "8px 18px", borderRadius: 24, cursor: "pointer",
    fontSize: 14, fontWeight: 600,
    border: `1.5px solid ${active ? color : "rgba(255,255,255,0.1)"}`,
    background: active ? `${color}22` : "rgba(255,255,255,0.04)",
    color: active ? color : "#8B95A8",
    transition: "all 0.18s", outline: "none",
  }),
  modeGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(155px, 1fr))",
    gap: 12, maxWidth: 860, margin: "0 auto 40px", padding: "0 20px",
  },
  modeCard: (active) => ({
    padding: "18px 14px", borderRadius: 14, cursor: "pointer", textAlign: "center",
    border: `1.5px solid ${active ? "#FF6B00" : "rgba(255,255,255,0.07)"}`,
    background: active ? "rgba(255,107,0,0.1)" : "rgba(255,255,255,0.03)",
    transition: "all 0.18s",
  }),
  modeIcon: { fontSize: 26, marginBottom: 8 },
  modeLabel: { fontSize: 13, fontWeight: 700, color: "#E8EAED", marginBottom: 4 },
  modeDesc: { fontSize: 11, color: "#6B7585", lineHeight: 1.4 },
  workspace: { maxWidth: 820, margin: "0 auto", padding: "0 20px 60px" },
  card: {
    background: "rgba(255,255,255,0.04)", borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.08)", padding: 24, marginBottom: 16,
  },
  label: {
    fontSize: 12, fontWeight: 700, color: "#FF6B00", textTransform: "uppercase",
    letterSpacing: 1, marginBottom: 12, display: "block",
  },
  input: {
    width: "100%", background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10,
    color: "#E8EAED", fontSize: 15, padding: "12px 14px",
    outline: "none", fontFamily: "inherit", boxSizing: "border-box",
  },
  textarea: {
    width: "100%", background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10,
    color: "#E8EAED", fontSize: 15, padding: "12px 14px",
    resize: "vertical", minHeight: 90, outline: "none",
    fontFamily: "inherit", boxSizing: "border-box",
  },
  select: {
    background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 8, color: "#E8EAED", fontSize: 13, padding: "9px 12px",
    outline: "none", cursor: "pointer",
  },
  btn: {
    background: "linear-gradient(90deg, #FF6B00, #FF8C38)",
    color: "#fff", border: "none", borderRadius: 10,
    padding: "11px 28px", fontSize: 14, fontWeight: 700, cursor: "pointer",
    letterSpacing: 0.3,
  },
  result: {
    background: "rgba(255,107,0,0.05)", borderRadius: 12,
    border: "1px solid rgba(255,107,0,0.15)", padding: "18px 20px", marginTop: 16,
    lineHeight: 1.8, fontSize: 15, whiteSpace: "pre-wrap", color: "#D1D9E6",
  },
  mcqOpt: (sel, correct) => ({
    padding: "11px 16px", borderRadius: 10, marginBottom: 8, cursor: "pointer",
    border: `1.5px solid ${
      sel === null ? "rgba(255,255,255,0.1)"
      : sel ? (correct ? "#06D6A0" : "#EF4444")
      : correct ? "#06D6A0" : "rgba(255,255,255,0.1)"}`,
    background: `${
      sel === null ? "rgba(255,255,255,0.03)"
      : sel ? (correct ? "rgba(6,214,160,0.1)" : "rgba(239,68,68,0.1)")
      : correct ? "rgba(6,214,160,0.07)" : "rgba(255,255,255,0.03)"}`,
    fontSize: 14, color: "#E8EAED", transition: "all 0.15s", textAlign: "left",
    width: "100%",
  }),
  loading: {
    display: "flex", alignItems: "center", gap: 10,
    color: "#8B95A8", fontSize: 14, padding: "16px 0",
  },
  scoreNum: {
    fontSize: 42, fontWeight: 900,
    background: "linear-gradient(90deg,#06D6A0,#00B4D8)",
    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
  },
  explain: {
    background: "rgba(6,214,160,0.07)", borderRadius: 10,
    padding: "12px 16px", marginTop: 12, fontSize: 13, color: "#A8B4C8",
    border: "1px solid rgba(6,214,160,0.2)", lineHeight: 1.6,
  },
  row: { display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end", marginBottom: 14 },
  historyQ: { fontSize: 13, color: "#FF6B00", fontWeight: 600, marginBottom: 4 },
  historyA: {
    background: "rgba(255,255,255,0.04)", borderRadius: 10,
    padding: "12px 16px", fontSize: 14, lineHeight: 1.7,
    color: "#C5CDD9", marginBottom: 14, whiteSpace: "pre-wrap",
  },
  footer: {
    textAlign: "center", color: "#2D3545", fontSize: 12, paddingTop: 20,
  },
};

// ── Quiz Mode ──────────────────────────────────────────────────────────────
function QuizMode({ exam }) {
  const [topic, setTopic] = useState("");
  const [diff, setDiff] = useState("medium");
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [explanation, setExplanation] = useState("");
  const [error, setError] = useState("");

  const fetchQuiz = async () => {
    if (!topic.trim()) return;
    setLoading(true); setQuestions([]); setCurrent(0);
    setScore(0); setDone(false); setSelected(null); setError("");
    const sys = `You are ExamGuru AI, India's best free exam coach for ${exam?.label}.
Generate exactly 5 MCQs. Return ONLY a valid JSON array, no markdown, no extra text.
Format: [{"q":"question text","options":["A) option","B) option","C) option","D) option"],"correct":0,"explain":"short explanation"}]
'correct' is 0-indexed integer. Make questions exam-standard and educational.`;
    try {
      const reply = await callClaude(
        [{ role: "user", content: `Topic: ${topic}. Difficulty: ${diff}. Make it exam-relevant for ${exam?.label}.` }],
        sys
      );
      const clean = reply.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setQuestions(parsed);
    } catch (e) {
      setError("Quiz generate nahi hua. Dobara try karo.");
    }
    setLoading(false);
  };

  const pick = (idx) => {
    if (selected !== null) return;
    setSelected(idx);
    setExplanation(questions[current]?.explain || "");
    if (idx === questions[current]?.correct) setScore(s => s + 1);
  };

  const next = () => {
    if (current + 1 >= questions.length) { setDone(true); return; }
    setCurrent(c => c + 1); setSelected(null); setExplanation("");
  };

  const reset = () => { setQuestions([]); setDone(false); setTopic(""); setError(""); };

  const q = questions[current];

  return (
    <div style={S.card}>
      <span style={S.label}>⚡ Smart Quiz Generator</span>
      {!questions.length && !done && (
        <div style={S.row}>
          <input value={topic} onChange={e => setTopic(e.target.value)}
            placeholder={`Topic type karo... e.g. "Polity", "Organic Chemistry", "Banking Awareness"`}
            style={{ ...S.input, flex: 1 }}
            onKeyDown={e => e.key === "Enter" && fetchQuiz()} />
          <select value={diff} onChange={e => setDiff(e.target.value)} style={S.select}>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
          <button onClick={fetchQuiz} style={S.btn}>Generate →</button>
        </div>
      )}

      {error && <div style={{ color: "#EF4444", fontSize: 13, marginBottom: 10 }}>⚠️ {error}</div>}
      {loading && <div style={S.loading}><span>🧠</span> AI is crafting 5 questions for you...</div>}

      {!loading && questions.length > 0 && !done && q && (
        <div>
          <div style={{ fontSize: 12, color: "#6B7585", marginBottom: 14 }}>
            Question {current + 1} of {questions.length} &nbsp;·&nbsp;
            Score: <strong style={{ color: "#06D6A0" }}>{score}/{current}</strong>
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 18, lineHeight: 1.5, color: "#E8EAED" }}>
            {q.q}
          </div>
          {q.options?.map((opt, i) => (
            <button key={i} onClick={() => pick(i)} style={S.mcqOpt(selected === i, i === q.correct)}>
              {selected !== null && i === q.correct && "✅ "}
              {selected === i && i !== q.correct && "❌ "}
              {opt}
            </button>
          ))}
          {explanation && (
            <div style={S.explain}>
              💡 <strong style={{ color: "#06D6A0" }}>Explanation:</strong> {explanation}
            </div>
          )}
          {selected !== null && (
            <button onClick={next} style={{ ...S.btn, marginTop: 14 }}>
              {current + 1 < questions.length ? "Next Question →" : "See Result →"}
            </button>
          )}
        </div>
      )}

      {done && (
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <div style={S.scoreNum}>{score} / {questions.length}</div>
          <div style={{ color: "#8B95A8", marginTop: 10, fontSize: 16 }}>
            {score === questions.length ? "🔥 Perfect Score! Ekdum zabardast!" :
             score >= 3 ? "👍 Accha kiya! Keep it up!" : "📚 Topic ek baar aur revise karo."}
          </div>
          <button onClick={reset} style={{ ...S.btn, marginTop: 20 }}>New Topic Try Karo</button>
        </div>
      )}
    </div>
  );
}

// ── Doubt Solver ───────────────────────────────────────────────────────────
function DoubtMode({ exam }) {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  const ask = async () => {
    if (!q.trim() || loading) return;
    const question = q.trim();
    setQ(""); setLoading(true);
    const sys = `You are ExamGuru AI — India's best FREE doubt solver for ${exam?.label}.
Answer in simple Hinglish (mix Hindi + English). Be conversational and clear.
Structure your answer: 1. Simple explanation 2. Exam relevance 3. Memory trick if possible.
Keep under 200 words. Use Indian examples.`;
    try {
      const msgs = [
        ...history.flatMap(h => ([{ role: "user", content: h.q }, { role: "assistant", content: h.a }])),
        { role: "user", content: question }
      ];
      const reply = await callClaude(msgs, sys);
      setHistory(h => [...h, { q: question, a: reply }]);
    } catch {
      setHistory(h => [...h, { q: question, a: "⚠️ Error aaya. Dobara try karo." }]);
    }
    setLoading(false);
  };

  return (
    <div style={S.card}>
      <span style={S.label}>🤔 Doubt Solver — Hindi ya English, dono chalega</span>
      <div style={{ maxHeight: 340, overflowY: "auto", marginBottom: 12 }}>
        {history.map((h, i) => (
          <div key={i}>
            <div style={S.historyQ}>You: {h.q}</div>
            <div style={S.historyA}>{h.a}</div>
          </div>
        ))}
        {loading && <div style={S.loading}>🧠 Soch raha hun...</div>}
        {history.length === 0 && !loading && (
          <div style={{ color: "#3B4251", fontSize: 14, padding: "8px 0" }}>
            Koi bhi doubt poocho... जैसे "Article 370 kya tha?" ya "What is Hardy-Weinberg?"
          </div>
        )}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <textarea value={q} onChange={e => setQ(e.target.value)}
          placeholder="Apna doubt yahan likho..."
          style={{ ...S.textarea, minHeight: 56, flex: 1 }}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); ask(); } }} />
        <button onClick={ask} style={{ ...S.btn, alignSelf: "flex-end", padding: "12px 20px" }}>Ask →</button>
      </div>
      <div style={{ fontSize: 11, color: "#3B4251", marginTop: 5 }}>Enter to send · Shift+Enter for new line</div>
    </div>
  );
}

// ── PYQ Analyzer ──────────────────────────────────────────────────────────
function PYQMode({ exam }) {
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [year, setYear] = useState("5");

  const analyze = async () => {
    setLoading(true); setResult("");
    const sys = `You are ExamGuru AI, expert analyst for ${exam?.label} question paper trends. Be specific, practical, data-driven.`;
    try {
      const reply = await callClaude([{
        role: "user",
        content: `Analyze ${exam?.label} question paper trends for last ${year} years. Give me:
🔥 HIGH PRIORITY topics (appeared most frequently)
📈 RISING topics (trending in recent years)
🎯 SURE-SHOT topics for upcoming exam
⚠️ LOW PRIORITY topics (rarely asked)
📋 3-LINE STRATEGY for a serious aspirant

Be specific with topic names. Make it actionable.`
      }], sys);
      setResult(reply);
    } catch { setResult("⚠️ Error aaya. Dobara try karo."); }
    setLoading(false);
  };

  return (
    <div style={S.card}>
      <span style={S.label}>📜 PYQ Pattern Analyzer — {exam?.label}</span>
      <div style={{ ...S.row, marginBottom: 16 }}>
        <span style={{ fontSize: 14, color: "#8B95A8" }}>Last</span>
        <select value={year} onChange={e => setYear(e.target.value)} style={S.select}>
          <option value="3">3 years</option>
          <option value="5">5 years</option>
          <option value="10">10 years</option>
        </select>
        <span style={{ fontSize: 14, color: "#8B95A8" }}>ke papers analyze karo</span>
        <button onClick={analyze} style={S.btn}>Analyze Now</button>
      </div>
      {loading && <div style={S.loading}>📊 {year} saal ke papers analyze ho rahe hain...</div>}
      {result && <div style={S.result}>{result}</div>}
    </div>
  );
}

// ── Current Affairs ────────────────────────────────────────────────────────
function CurrentMode({ exam }) {
  const [topic, setTopic] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const convert = async () => {
    setLoading(true); setResult("");
    const sys = `You are ExamGuru AI — current affairs expert for Indian competitive exams. Convert news into exam-ready notes.`;
    try {
      const reply = await callClaude([{
        role: "user",
        content: `Convert to exam notes for ${exam?.label}: "${topic || "most important current affairs of recent months"}"

Format:
📰 WHAT HAPPENED: (2-3 lines)
🎯 EXAM RELEVANCE for ${exam?.label}: (which topics it connects to)
❓ LIKELY QUESTION: (1 MCQ with answer)
🔑 KEY FACTS TO MEMORIZE: (bullet points)
🔗 CONNECTED TOPICS: (what else to revise)`
      }], sys);
      setResult(reply);
    } catch { setResult("⚠️ Error aaya. Dobara try karo."); }
    setLoading(false);
  };

  return (
    <div style={S.card}>
      <span style={S.label}>🌏 Current Affairs → Exam Notes</span>
      <div style={S.row}>
        <input value={topic} onChange={e => setTopic(e.target.value)}
          placeholder='Topic ya event: "RBI rate cut", "India-China LAC" ya blank chhodo for important topics'
          style={{ ...S.input, flex: 1 }}
          onKeyDown={e => e.key === "Enter" && convert()} />
        <button onClick={convert} style={S.btn}>Convert →</button>
      </div>
      {loading && <div style={S.loading}>🌐 Exam notes bana raha hun...</div>}
      {result && <div style={S.result}>{result}</div>}
    </div>
  );
}

// ── Answer Evaluator ───────────────────────────────────────────────────────
function AnswerMode({ exam }) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const evaluate = async () => {
    if (!answer.trim()) return;
    setLoading(true); setResult("");
    const sys = `You are a senior ${exam?.label} examiner. Evaluate answers strictly but encouragingly. Give honest, specific feedback.`;
    try {
      const reply = await callClaude([{
        role: "user",
        content: `Exam: ${exam?.label}
Question: ${question || "(general answer writing practice)"}
Student Answer: ${answer}

Evaluate and give:
⭐ SCORE: X/10
✅ STRENGTHS: what's good
❌ MISSING POINTS: what should have been included
💡 MODEL ANSWER OUTLINE: key points to cover
🔧 HOW TO IMPROVE: specific actionable advice`
      }], sys);
      setResult(reply);
    } catch { setResult("⚠️ Error aaya. Dobara try karo."); }
    setLoading(false);
  };

  return (
    <div style={S.card}>
      <span style={S.label}>✍️ Answer Evaluator — Apna jawab score karo</span>
      <input value={question} onChange={e => setQuestion(e.target.value)}
        placeholder='Question (optional): "Discuss role of RBI in Indian economy..."'
        style={{ ...S.input, marginBottom: 10 }} />
      <textarea value={answer} onChange={e => setAnswer(e.target.value)}
        placeholder="Apna answer yahan paste karo ya likho... AI score karega aur feedback dega."
        style={{ ...S.textarea, minHeight: 150, marginBottom: 12 }} />
      <button onClick={evaluate} style={S.btn}>Evaluate My Answer →</button>
      {loading && <div style={S.loading}>📝 Answer evaluate ho raha hai...</div>}
      {result && <div style={S.result}>{result}</div>}
    </div>
  );
}

// ── Study Roadmap ──────────────────────────────────────────────────────────
function RoadmapMode({ exam }) {
  const [months, setMonths] = useState("6");
  const [hours, setHours] = useState("4");
  const [weak, setWeak] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true); setResult("");
    const sys = `You are ExamGuru AI — India's best exam strategist. Create realistic, actionable, month-wise study plans.`;
    try {
      const reply = await callClaude([{
        role: "user",
        content: `Create a ${months}-month study roadmap for ${exam?.label}.
Daily study time: ${hours} hours/day.
Weak areas: ${weak || "not specified"}.

Give:
📅 MONTH-WISE PLAN: what to cover each month
📚 DAILY SCHEDULE: sample day (morning/evening split)
📖 BEST FREE RESOURCES: books + websites
⚡ WEEKLY REVISION STRATEGY
🎯 MOCK TEST SCHEDULE
🔥 TOP 3 TIPS specific to ${exam?.label}

Be realistic, specific, motivating. Indian context only.`
      }], sys);
      setResult(reply);
    } catch { setResult("⚠️ Error aaya. Dobara try karo."); }
    setLoading(false);
  };

  return (
    <div style={S.card}>
      <span style={S.label}>🗺️ Personalized Study Roadmap</span>
      <div style={S.row}>
        <div>
          <div style={{ fontSize: 12, color: "#6B7585", marginBottom: 6 }}>Months left</div>
          <select value={months} onChange={e => setMonths(e.target.value)} style={S.select}>
            {["1","2","3","4","6","9","12"].map(m => <option key={m} value={m}>{m} months</option>)}
          </select>
        </div>
        <div>
          <div style={{ fontSize: 12, color: "#6B7585", marginBottom: 6 }}>Hours/day</div>
          <select value={hours} onChange={e => setHours(e.target.value)} style={S.select}>
            {["2","3","4","5","6","8"].map(h => <option key={h} value={h}>{h} hrs</option>)}
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, color: "#6B7585", marginBottom: 6 }}>Weak areas</div>
          <input value={weak} onChange={e => setWeak(e.target.value)}
            placeholder="e.g. Maths, Economy, Current Affairs..."
            style={S.input} />
        </div>
      </div>
      <button onClick={generate} style={S.btn}>Generate My Roadmap →</button>
      {loading && <div style={S.loading}>🗺️ Tera personalized plan ban raha hai...</div>}
      {result && <div style={S.result}>{result}</div>}
    </div>
  );
}

// ── Main App ───────────────────────────────────────────────────────────────
export default function App() {
  const [examIdx, setExamIdx] = useState(0);
  const [mode, setMode] = useState("quiz");
  const [streak, setStreak] = useState(1);
  const exam = EXAMS[examIdx];

  useEffect(() => {
    try {
      const today = new Date().toDateString();
      const last = localStorage.getItem("eg_last");
      const s = Number(localStorage.getItem("eg_streak") || 1);
      if (last !== today) {
        const newStreak = last === new Date(Date.now() - 86400000).toDateString() ? s + 1 : 1;
        localStorage.setItem("eg_streak", newStreak);
        localStorage.setItem("eg_last", today);
        setStreak(newStreak);
      } else setStreak(s);
    } catch {}
  }, []);

  const renderMode = () => {
    switch (mode) {
      case "quiz":    return <QuizMode exam={exam} />;
      case "doubt":   return <DoubtMode exam={exam} />;
      case "pyq":     return <PYQMode exam={exam} />;
      case "current": return <CurrentMode exam={exam} />;
      case "answer":  return <AnswerMode exam={exam} />;
      case "roadmap": return <RoadmapMode exam={exam} />;
      default:        return <QuizMode exam={exam} />;
    }
  };

  return (
    <div style={S.app}>
      {/* NAV */}
      <nav style={S.nav}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <span style={S.logo}>🧠 ExamGuru AI</span>
          <span style={S.badge}>100% FREE</span>
        </div>
        <span style={S.streak}>🔥 {streak} day streak</span>
      </nav>

      {/* HERO */}
      <div style={S.hero}>
        <span style={S.heroTag}>Powered by AI · Made for India 🇮🇳</span>
        <h1 style={S.heroTitle}>Crack any exam.<br />Zero fees. Zero limits.</h1>
        <p style={S.heroSub}>
          AI quiz, doubt solver, PYQ analysis, current affairs — sab ek jagah.<br />
          Coaching afford nahi hoti? ExamGuru hai na. 💪
        </p>
        <div style={S.examRow}>
          {EXAMS.map((e, i) => (
            <button key={e.id} onClick={() => setExamIdx(i)} style={S.examChip(examIdx === i, e.color)}>
              {e.icon} {e.label}
            </button>
          ))}
        </div>
      </div>

      {/* MODE SELECTOR */}
      <div style={S.modeGrid}>
        {MODES.map(m => (
          <div key={m.id} onClick={() => setMode(m.id)} style={S.modeCard(mode === m.id)}>
            <div style={S.modeIcon}>{m.icon}</div>
            <div style={S.modeLabel}>{m.label}</div>
            <div style={S.modeDesc}>{m.desc}</div>
          </div>
        ))}
      </div>

      {/* WORKSPACE */}
      <div style={S.workspace}>
        <div style={{ ...S.card, padding: "12px 20px", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 14 }}>
            <span style={{ color: exam.color, fontWeight: 700 }}>{exam.icon} {exam.label}</span>
            <span style={{ color: "#6B7585", marginLeft: 8 }}>· {MODES.find(m => m.id === mode)?.label}</span>
          </span>
          <span style={{ fontSize: 11, color: "#3B4251" }}>Exam change karo ↑</span>
        </div>
        {renderMode()}
        <div style={S.footer}>
          ExamGuru AI — Free forever · 2 crore+ Indian aspirants ke liye · No login needed
        </div>
      </div>
    </div>
  );
}
