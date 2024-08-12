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
    key: "Azeroth",
    entryPoint: {
      x: -4184.5,
      y: -336.5,
    },
  },
  Kalimdor: {
    id: 1,
    name: "Kalimdor",
    key: "Kalimdor",
    entryPoint: {
      x: 738.5,
      y: 2113.5,
    },
  },
  Expansion01: {
    id: 530,
    name: "Outland",
    key: "Expansion01",
    entryPoint: {
      x: -894.56,
      y: -2606.41,
    },
  },
};

// Local storage keys
export const LS_LAST_MAP_NAME = 'LS_LAST_MAP_NAME'; // string
export const LS_LAST_COORDS = 'LS_LAST_COORDS'; // { x: number; y: number }
export const LS_LAST_ZOOM_LEVEL = 'LS_LAST_ZOOM_LEVEL';
