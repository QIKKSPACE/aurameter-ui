// GameState.ts
export interface Tube {
  id: number;
  balls: string[]; // top = last element
}

export interface GameState {
  tubes: Tube[];
  moves: number;
  level: number;
}
