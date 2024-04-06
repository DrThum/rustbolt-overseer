import { serverSpawnToMapSpawn } from "../models/spawn.model";
import type { MapSpawn, ServerSpawn } from "../types/common.types";

export async function fetchMapMetadata() {
  const metadataResponse = await fetch("/maps/Azeroth/Azeroth.metadata.json");
  const metadata = await metadataResponse.json();
  return metadata;
}

export async function fetchSpawns(): Promise<MapSpawn[]> {
  const spawnsResponse = await fetch("http://localhost:8080/");
  const spawns: ServerSpawn[] = await spawnsResponse.json();
  return spawns.map(serverSpawnToMapSpawn);
}
