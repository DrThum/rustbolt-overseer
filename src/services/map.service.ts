import { serverSpawnToMapSpawn } from "../models/spawn.model";
import type { MapSpawn, Point, ServerSpawn } from "../types/common.types";

export async function fetchMapMetadata(mapName: string) {
  const metadataResponse = await fetch(
    `/maps/${mapName}/${mapName}.metadata.json`,
  );
  const metadata = await metadataResponse.json();
  return metadata;
}

export async function fetchSpawns(
  mapId: number,
  southWest: Point,
  northEast: Point,
): Promise<MapSpawn[]> {
  const spawnsResponse = await fetch(
    `http://localhost:8080/?map_id=${mapId}&south_west=${southWest.x},${southWest.y}&north_east=${northEast.x},${northEast.y}`,
  );
  const spawns: ServerSpawn[] = await spawnsResponse.json();
  return spawns.map(serverSpawnToMapSpawn);
}
