export type EvidenceSource =
  | "Session"
  | "Q&A"
  | "Sponsor Booth"
  | "Hallway Conversation"
  | "Reflection";

export type Monster = {
  id: string;
  name: string;
  tagline: string;
  hp: number;
  weakness: string;
  color: string;
};

export type Evidence = {
  id: string;
  monsterId: string;
  source: EvidenceSource;
  evidenceType?: string;
  claim: string;
  proof: string;
  practicalUse: string;
  createdAt: string;
};

export type Loot = {
  id: string;
  monsterId: string;
  name: string;
  type: string;
  source: EvidenceSource;
  value: string;
  damage: number;
  createdAt: string;
};

export type BossResult = {
  insight: string;
  nextAction: string;
  shareSummary: string;
  createdAt: string;
};

export type GameState = {
  selectedMonsterId: string | null;
  evidence: Evidence[];
  loot: Loot[];
  bossResult: BossResult | null;
};
