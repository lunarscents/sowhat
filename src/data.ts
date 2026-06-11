import type { EvidenceSource, Monster } from "./types";

export const monsters: Monster[] = [
  {
    id: "ai-hype-hydra",
    name: "AI Hype Hydra",
    tagline: "Turns every agent promise into three new governance questions.",
    hp: 100,
    weakness: "Trust loops, guardrails, and explicit human review",
    color: "#9333ea"
  },
  {
    id: "ai-everywhere",
    name: "AI Everywhere",
    tagline: "Promises magic in every workflow.",
    hp: 100,
    weakness: "Specific use cases with measurable constraints",
    color: "#7c3aed"
  },
  {
    id: "platform-cloud",
    name: "Platform Cloud",
    tagline: "Says every team needs one more control plane.",
    hp: 100,
    weakness: "Ownership boundaries and migration costs",
    color: "#0891b2"
  },
  {
    id: "agent-swarm",
    name: "Agent Swarm",
    tagline: "Automates everything except accountability.",
    hp: 100,
    weakness: "Human review points and failure modes",
    color: "#dc2626"
  },
  {
    id: "zero-trust",
    name: "Zero Trust Hydra",
    tagline: "Grows another head for every policy.",
    hp: 100,
    weakness: "Identity, scope, and operational friction",
    color: "#15803d"
  }
];

export const evidenceSources: EvidenceSource[] = [
  "Session",
  "Q&A",
  "Sponsor Booth",
  "Hallway Conversation",
  "Reflection"
];

export const lootTypes = [
  "Decision filter",
  "Pilot idea",
  "Risk flag",
  "Budget question",
  "Implementation clue"
];
