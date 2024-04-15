import { serverSpawnToMapSpawn } from "../models/spawn.model";
import type {
  CreatureTemplate,
  MapSpawn,
  Point,
  ServerSpawn,
} from "../types/common.types";

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
    `http://localhost:8080/spawns?map_id=${mapId}&south_west=${southWest.x},${southWest.y}&north_east=${northEast.x},${northEast.y}`,
  );
  const spawns: ServerSpawn[] = await spawnsResponse.json();
  return spawns.map(serverSpawnToMapSpawn);
}

export async function fetchTemplate(
  entry: number,
): Promise<CreatureTemplate | undefined> {
  const response = await fetch(`http://localhost:8080/spawn/${entry}`);
  return await response.json();
}
