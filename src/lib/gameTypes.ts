export interface PlayerState {
  cash: number;
  inventoryFactory: number;
  inventoryB: number;
  inventoryC: number;
  oor: number;
  doi: number;
  sanity: number;
  position: number;
  name: string;
  round: number;
  stuckTurns: number;
  totalSpent: number;
  totalRolls: number;
  achievements: string[];
  completed: boolean;
  hiddenRoute: boolean;
}

export interface TileOption {
  label: string;
  effect: Partial<PlayerState>;
  effectDescription: string;
  subEvent?: SubEvent;
  stuckTurns?: number;
  triggerHidden?: boolean;
  isWin?: boolean;
}

export interface TileEvent {
  title: string;
  description: string;
  autoPass?: boolean;
  autoEffect?: Partial<PlayerState>;
  optionA?: TileOption;
  optionB?: TileOption;
  optionC?: TileOption;
  isWin?: boolean;
}

export interface SubEvent {
  title: string;
  description: string;
  optionA: {
    label: string;
    effect: Partial<PlayerState>;
    effectDescription: string;
  };
  optionB: {
    label: string;
    effect: Partial<PlayerState>;
    effectDescription: string;
  };
}

export interface Tile {
  id: number;
  name: string;
  emoji: string;
  description: string;
  category: 'start' | 'process' | 'event' | 'choice' | 'win' | 'hidden';
}

export const INITIAL_PLAYER_STATE: PlayerState = {
  cash: 200000,
  inventoryFactory: 1000,
  inventoryB: 0,
  inventoryC: 0,
  oor: 0,
  doi: 30,
  sanity: 100,
  position: -1,
  name: '供应链总监',
  round: 1,
  stuckTurns: 0,
  totalSpent: 0,
  totalRolls: 0,
  achievements: [],
  completed: false,
  hiddenRoute: false,
};
