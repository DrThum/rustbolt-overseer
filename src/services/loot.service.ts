import type { LootTable } from "../types/common.types";

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

  return await response.json();
}
