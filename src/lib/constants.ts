import type { WoWMap } from "../types/common.types";

// Block width ingame, in yards
export const BLOCK_IN_YARDS = 533.33333;
// Block width on the map, in pixels
export const BLOCK_IN_PIXELS = 256;

export enum UIEvent {
  toggleGrid = "toggle-grid",
}

export const wowMaps: Record<string, WoWMap> = {
  Azeroth: {
    id: 0,
    name: "Azeroth",
    entryPoint: {
      x: -4184.5,
      y: -336.5,
    },
  },
  Kalimdor: {
    id: 1,
    name: "Kalimdor",
    entryPoint: {
      x: 738.5,
      y: 2113.5,
    },
  },
  Expansion01: {
    id: 530,
    name: "Outland",
    entryPoint: {
      x: -894.56,
      y: -2606.41,
    },
  },
};
