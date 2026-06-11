import { emptyGameState } from "./gameLogic";
import type { GameState } from "./types";

const storageKey = "so-what-game-state";

export const loadGameState = (): GameState => {
  try {
    const stored = localStorage.getItem(storageKey);
    return stored ? { ...emptyGameState, ...JSON.parse(stored) } : emptyGameState;
  } catch {
    return emptyGameState;
  }
};

export const saveGameState = (state: GameState) => {
  localStorage.setItem(storageKey, JSON.stringify(state));
};

export const clearGameState = () => {
  localStorage.removeItem(storageKey);
};
