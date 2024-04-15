import { BLOCK_IN_PIXELS, BLOCK_IN_YARDS } from "../lib/constants";
import type { MapSpawn, ServerSpawn } from "../types/common.types";

// lat = x
// lon = -y
export function serverSpawnToMapSpawn(serverSpawn: ServerSpawn): MapSpawn {
  return {
    loc: [
      (serverSpawn.position_x / BLOCK_IN_YARDS) * BLOCK_IN_PIXELS,
      (-serverSpawn.position_y / BLOCK_IN_YARDS) * BLOCK_IN_PIXELS,
    ],
    name: serverSpawn.name,
    entry: serverSpawn.entry,
  };
}
