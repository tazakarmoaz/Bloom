import type { Entry } from './types';

export const GARDEN_CAPACITY = 50;
const COLS = 6;
const ROWS = 9;

function getSlotOrder(): number[] {
  const order = Array.from({ length: COLS * ROWS }, (_, i) => i);
  for (let i = 0; i < order.length; i++) {
    const j = (i * 7 + 3) % order.length;
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

export function generateRosePosition(index: number): { pos_x: number; pos_y: number } {
  const slots = getSlotOrder();
  const slotIndex = slots[index % slots.length];
  const col = slotIndex % COLS;
  const row = Math.floor(slotIndex / COLS);
  const cellWidth = 100 / COLS;
  const cellHeight = 40 / ROWS; // bottom 40% of scene
  const baseX = col * cellWidth + cellWidth / 2;
  const baseY = 58 + row * cellHeight + cellHeight / 2; // grass starts at ~58%
  const jitterX = ((slotIndex * 13) % 17) / 100 * cellWidth - cellWidth / 2;
  const jitterY = ((slotIndex * 19) % 13) / 100 * cellHeight - cellHeight / 2;
  return {
    pos_x: Math.max(8, Math.min(92, baseX + jitterX)),
    pos_y: Math.max(60, Math.min(96, baseY + jitterY)),
  };
}

export function isGardenFull(entries: Entry[]): boolean {
  return entries.length >= GARDEN_CAPACITY;
}

export function getNextRoseIndex(entries: Entry[]): number {
  return entries.length;
}
