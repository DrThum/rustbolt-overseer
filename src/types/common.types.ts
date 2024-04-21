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
  id: number;
  groups: LootGroup[];
};

export type LootGroup = {
  id: number | undefined;
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
