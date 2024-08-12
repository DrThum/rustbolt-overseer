import type { EntityType, LootTable, ReferenceLootTable } from "../types/common.types";

export async function updateLootTable(
  entry: number,
  lootTable: LootTable,
): Promise<LootTable | undefined> {
  const response = await fetch(
    `http://localhost:8080/spawn/${entry}/lootTable`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(lootTable),
    },
  );

  return response.json();
}

export async function fetchReferenceLootTable(entity_type: EntityType, entry: number): Promise<ReferenceLootTable | undefined> {
  return fetch(`http://localhost:8080/${entity_type}/${entry}/referenceLootTable`).then((response) => response.json()).catch((e) => {
    console.error(e);
    return undefined
  });
}
