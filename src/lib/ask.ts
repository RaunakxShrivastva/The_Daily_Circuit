import type { Story } from "../data/types";

export interface Answer {
  question: string;
  body: string;
  citations: string[];
}

const OPENERS: Record<string, string[]> = {
  what: [
    "In short: the story is about a shift in how the work is actually done, not a change in the technology itself. The mechanism is described in the reporting, and the numbers in the standfirst are the ones to hold on to.",
    "The honest answer is that the shift is smaller than the headlines suggest and more consequential than they suggest. The reporting below is the evidence.",
  ],
  who: [
    "The people in the piece are the ones who did the work, and they are described by their roles rather than their titles, because the roles are what changed.",
    "You will find the people named in the byline and the source panel. Every interview is on the record unless the story says otherwise.",
  ],
  how: [
    "The mechanism is the interesting part of this story, and the reporting walks through it step by step. What follows is the short version; the full account is in the body of the piece.",
    "It works because of a change in what became cheap, not because of a change in what became possible. That distinction is the whole story.",
  ],
  why: [
    "The reason it happened is mostly a matter of incentives and timing, and the story traces both. The 'why now' is the sharpest part.",
    "Because the cost curve moved and nobody reorganised around it in time. That is the argument the reporting supports.",
  ],
  number: [
    "The headline figure is a design target for this prototype edition rather than a claim about live performance, and the story says so where it matters.",
    "The numbers in the piece are the ones to use. Where a figure is illustrative, the source panel marks it.",
  ],
  source: [
    "The source panel below is the full provenance for this story: papers, filings, datasets and interviews, with dates. A source list tells you what a claim rests on, not that it is true.",
    "Every claim in the piece maps to something in the Evidence Desk, including the interviews, which were recorded and read back.",
  ],
  evidence: [
    "The Evidence Desk lists everything behind this story, and it distinguishes what was recorded from what was written down afterwards. The provenance note is worth reading before the sources.",
  ],
  when: [
    "The timeline in the Evidence Desk carries the dates, and the story is explicit about which parts of the chronology are documented and which are inferred.",
  ],
};

const FALLBACK = [
  "That falls outside what this edition can answer. The reporter for this story worked from a specific set of documents and interviews, listed in the Evidence Desk, and a question outside that record should be put to them directly rather than inferred from the piece.",
  "I can only answer from the reporting in this edition. The story, the source panel and the timeline below cover what was established; anything beyond that is not something the desk has published.",
];

export function answerQuestion(story: Story, question: string): Answer {
  const q = question.toLowerCase();
  const key = Object.keys(OPENERS).find((k) => q.includes(k));
  const body = (key && OPENERS[key]) || FALLBACK;
  const citations = story.sources.slice(0, 2).map((s) => s.title);
  return { question, body: body[0], citations };
}

export const SUGGESTIONS = [
  "What is the main claim?",
  "How does it actually work?",
  "Why now?",
  "What is the evidence behind it?",
  "When did this happen?",
  "Who are the sources?",
];
