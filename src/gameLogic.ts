import { lootTypes, monsters } from "./data";
import type { BossResult, Evidence, GameState, Loot } from "./types";

export const emptyGameState: GameState = {
  selectedMonsterId: null,
  evidence: [],
  loot: [],
  bossResult: null
};

export const getMonsterHp = (state: GameState, monsterId: string) => {
  const monster = monsters.find((item) => item.id === monsterId);
  if (!monster) return 0;
  const damage = state.loot
    .filter((item) => item.monsterId === monsterId)
    .reduce((sum, item) => sum + item.damage, 0);
  return Math.max(monster.hp - damage, 0);
};

export const isBossUnlocked = (state: GameState) => {
  const selectedMonsterId = state.selectedMonsterId;
  return (
    state.loot.length >= 3 ||
    (selectedMonsterId ? getMonsterHp(state, selectedMonsterId) === 0 : false)
  );
};

export const convertEvidenceToLoot = (evidence: Evidence): Loot => {
  const words = `${evidence.claim} ${evidence.proof} ${evidence.practicalUse}`
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  const damage = Math.min(40, Math.max(18, Math.round(words / 2)));
  const type = pickLootType(evidence);

  return {
    id: crypto.randomUUID(),
    monsterId: evidence.monsterId,
    name: `${type}: ${summarize(evidence.practicalUse || evidence.claim, 42)}`,
    type,
    source: evidence.source,
    value: evidence.practicalUse,
    damage,
    createdAt: new Date().toISOString()
  };
};

export const generateBossResult = (state: GameState): BossResult => {
  const selectedMonster = monsters.find(
    (monster) => monster.id === state.selectedMonsterId
  );
  const selectedLoot = state.selectedMonsterId
    ? state.loot.filter((loot) => loot.monsterId === state.selectedMonsterId)
    : state.loot;
  const strongestLoot = [...selectedLoot].sort((a, b) => b.damage - a.damage)[0];
  const lootNames = selectedLoot.map((loot) => loot.name).slice(0, 3);
  const sourceMix = Array.from(new Set(state.loot.map((item) => item.source)));
  const practicalTheme =
    strongestLoot?.value || "turn conference claims into a small, observable pilot";
  const monsterName = selectedMonster?.name || "the hype";

  return {
    insight: `${monsterName} becomes useful when it is treated as an operating model question, not a magic tool claim. The collected loot points to one practical theme: ${practicalTheme.toLowerCase()}.`,
    nextAction: `Within one week, run a 30-minute team debrief: pick one owner, choose one measurable success signal, and scope a small experiment around "${summarize(practicalTheme, 72)}".`,
    shareSummary: `Conference takeaway: we converted ${selectedLoot.length || state.loot.length} signals from ${sourceMix.join(", ") || "the conference floor"} into a practical next step for ${monsterName}. Best loot: ${lootNames.join(", ") || summarize(practicalTheme, 80)}. Recommended action: run a small, owner-led experiment this week before making a larger bet.`,
    createdAt: new Date().toISOString()
  };
};

const pickLootType = (evidence: Evidence) => {
  const text = `${evidence.claim} ${evidence.proof} ${evidence.practicalUse}`.toLowerCase();
  if (text.includes("risk") || text.includes("security") || text.includes("fail")) {
    return "Risk flag";
  }
  if (text.includes("cost") || text.includes("budget") || text.includes("pricing")) {
    return "Budget question";
  }
  if (text.includes("pilot") || text.includes("try") || text.includes("experiment")) {
    return "Pilot idea";
  }
  if (text.includes("how") || text.includes("step") || text.includes("implement")) {
    return "Implementation clue";
  }
  return lootTypes[0];
};

const summarize = (value: string, maxLength: number) => {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 1).trim()}...`;
};
