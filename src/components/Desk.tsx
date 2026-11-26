import { useEffect, useRef, useState } from "react";
import type { Story } from "../data/types";
import { answerQuestion, SUGGESTIONS, type Answer } from "../lib/ask";
import { askGroq } from "../lib/groq";

/* ------------------------------------------------------------------
   Evidence Desk
   ------------------------------------------------------------------ */

export function EvidenceDesk({ story }: { story: Story }) {
  return (
    <div>
      <div className="kicker" style={{ marginBottom: 4 }}>
        Evidence Desk
      </div>
      <p className="deck" style={{ marginBottom: 22 }}>
        What this story rests on. A source list tells you what a claim rests on, not that the claim is true.
      </p>
      <div className="evidence">
        {story.sources.map((s, i) => (
          <div className="evidence__row" key={i}>
            <span className="evidence__n">{String(i + 1).padStart(2, "0")}</span>
            <div>
              <div className="evidence__t">
                <span className="evidence__kind">{s.kind}</span>
                {s.title}
              </div>
              <div className="evidence__d">{s.detail}</div>
            </div>
            <div className="evidence__when">{s.date}</div>
          </div>
        ))}
      </div>
      <p className="caption" style={{ marginTop: 18 }}>
        This is a prototype edition. The source panels are real in form and illustrative in substance —
        no claim in this edition is a report of a real event.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------
   Timeline
   ------------------------------------------------------------------ */

export function Timeline({ story }: { story: Story }) {
  return (
    <div>
      <div className="kicker" style={{ marginBottom: 4 }}>
        How the story developed
      </div>
      <p className="deck" style={{ marginBottom: 22 }}>
        The chronology behind the reporting, from the first question to the present edition.
      </p>
      <div className="timeline">
        {story.timeline.map((e, i) => (
          <div className="tl" key={i}>
            <div className="tl__when">{e.when}</div>
            <div className="tl__t">{e.title}</div>
            <div className="tl__b">{e.body}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------
   Ask This Story — Live AI QA with Ultra-Fast Groq LPU
   ------------------------------------------------------------------ */

export function AskThisStory({ story }: { story: Story }) {
  const [log, setLog] = useState<Answer[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);

  const ask = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    setLoading(true);

    try {
      const prompt = `You are the investigative research assistant for the newspaper story titled "${story.headline}".
Context from the story:
Summary: ${story.standfirst}
Full Details: ${story.body.join(" ")}
Sources: ${story.sources.map(s => s.title + " (" + s.detail + ")").join(", ")}

User question: ${trimmed}

Provide a direct, factual, and concise answer (2-3 sentences max) based strictly on the reporting context above.`;

      const answerText = await askGroq(prompt);
      setLog(l => [...l, {
        question: trimmed,
        body: answerText,
        citations: ["Groq LPU Acceleration", ...story.sources.slice(0, 1).map(s => s.title)]
      }]);
      setQ("");
      setLoading(false);
      return;
    } catch (err) {
      console.warn("Groq call failed, falling back to local heuristic", err);
    }

    // Heuristic Fallback
    setTimeout(() => {
      setLog(l => [...l, answerQuestion(story, trimmed)]);
      setQ("");
      setLoading(false);
    }, 400);
  };

  return (
    <div className="ask">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div className="kicker">Ask this story · AI Assistant</div>
        <span style={{ fontFamily: "var(--mono)", fontSize: 9.5, color: "#10b981", letterSpacing: "0.08em" }}>
          ⚡ Groq LPU Active
        </span>
      </div>

      <div className="ask__note">
        Powered by Groq ultra-fast AI engine · Ask any analytical or contextual question about this story for instant answers.
      </div>

      {log.length > 0 && (
        <div className="ask__log">
          {log.map((a, i) => (
            <div key={i}>
              <div className="ask__q">{a.question}</div>
              <div className="ask__a">
                {a.body}
                {a.citations.length > 0 && (
                  <div className="ask__cite">Sources: {a.citations.join(" · ")}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {log.length === 0 && (
        <div>
          <div style={{ fontSize: 14.5, color: "var(--ink-2)", marginBottom: 10 }}>
            Ask about the reporting, the mechanism, the chronology or the evidence.
          </div>
          <div className="suggest">
            {SUGGESTIONS.map((s) => (
              <button key={s} onClick={() => ask(s)}>
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="ask__input">
        <input
          value={q}
          placeholder={loading ? "Synthesizing answer…" : "Ask a question about this story…"}
          disabled={loading}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") ask(q); }}
          aria-label="Ask a question about this story"
        />
        <button onClick={() => ask(q)} disabled={loading}>
          {loading ? "..." : "Ask"}
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------
   Narration — the browser's own speech engine, no key required
   ------------------------------------------------------------------ */

export function Narration({ story }: { story: Story }) {
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);
  const [progress, setProgress] = useState(0);
  const utter = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    setSupported(typeof window !== "undefined" && "speechSynthesis" in window);
    return () => { window.speechSynthesis?.cancel(); };
  }, []);

  const toggle = () => {
    const synth = window.speechSynthesis;
    if (!synth) return;
    if (speaking) {
      synth.cancel();
      setSpeaking(false);
      return;
    }
    const text = `${story.headline}. ${story.standfirst} ${story.body.slice(0, 2).join(" ")}`;
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.97;
    u.pitch = 0.98;
    u.onend = () => { setSpeaking(false); setProgress(0); };
    u.onstart = () => setSpeaking(true);
    utter.current = u;
    synth.cancel();
    synth.speak(u);
  };

  return (
    <div>
      <div className="kicker" style={{ marginBottom: 4 }}>
        Listen
      </div>
      <p className="deck" style={{ marginBottom: 22 }}>
        Audio narration for selected stories. The prototype uses the browser's own speech engine, so there is
        no service to connect — quality and voice availability depend on the device.
      </p>
      <div className="narrate">
        <button className="narrate__play" onClick={toggle} disabled={!supported}
          aria-label={speaking ? "Stop narration" : "Play narration"}>
          {speaking ? "■" : "▶"}
        </button>
        <div className="narrate__text">
          <div className="narrate__t">{story.headline}</div>
          <div className="narrate__s">
            {supported
              ? `Narrated by the browser · ${story.readTime} read`
              : "Speech synthesis is unavailable in this browser"}
          </div>
        </div>
      </div>
    </div>
  );
}
