export interface DrawResult {
  number: number;
  message?: string;
}

export interface WheelItem {
  label: string;
  value: number;
  color: string;
}

export type AnimationType = 'roulette' | 'slot-machine';
export type VisualTheme = 'classic' | 'neon' | 'gold';

export interface RaffleConfig {
  min: number;
  max: number;
  quantity: number;
  drawAllAtOnce: boolean;
  // Novas configurações visuais
  animationType: AnimationType;
  theme: VisualTheme;
  spinDuration: number; // segundos
}

export interface RaffleState {
  drawnNumbers: number[]; // Histórico de todos os números sorteados nesta sessão
  currentDraw: number[];  // Números do sorteio atual (pode ser 1 ou vários)
  isFinished: boolean;    // Se já sorteou a quantidade desejada
}