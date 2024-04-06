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
};
