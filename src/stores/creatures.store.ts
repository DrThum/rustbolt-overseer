import { writable, type Writable } from "svelte/store";

export const editSpawnCreatureId: Writable<number | undefined> =
  writable(undefined);
