export type ServerSpawn = {
  guid: number;
  entry: number;
  map: number;
  position_x: number;
  position_y: number;
  position_z: number;
  orientation: number;
  name: string;
};

export type MapSpawn = {
  loc: [number, number]; // [x,y]
  name: string;
  entry: number; // template entry
};

export type Point = {
  x: number;
  y: number;
};

export type WoWMap = {
  id: number;
  name: string;
  key: string; // Technical name in DBC
  entryPoint: {
    x: number;
    y: number;
  };
};

export type CreatureTemplate = {
  entry: number;
  name: string;
  loot_table?: LootTable;
};

export type LootTable = {
  id?: number;
  groups: LootGroup[];
};

export type LootGroup = {
  id?: number;
  chance: number;
  condition_id: null;
  num_rolls: ValueRange;
  items: LootItem[];
};

export type LootItem = {
  item_id: number;
  chance: number;
  condition_id: null;
  count: ValueRange;
};

export type ValueRange = {
  min: number;
  max: number;
};

export enum EntityType {
  Creature = "creature",
  GameObject = "gameobject",
}

export type ReferenceLootTable = {
  items: ReferenceLootItem[];
}

export type ReferenceLootItem = {
  id: number;
  icon_url: string;
  name: string;
  loot_percent_chance: number;
  min_count?: number;
  max_count?: number;
}
