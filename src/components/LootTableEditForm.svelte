<script lang="ts">
  import { createLootTable, updateLootTable } from "../services/loot.service";
  import type { LootTable } from "../types/common.types";
  import LootGroup from "./LootGroup.svelte";

  export let entry: number;
  export let lootTable: LootTable;

  function createEmptyGroup() {
    lootTable.groups.push({
      chance: 100,
      condition_id: null,
      num_rolls: { min: 1, max: 1 },
      items: [],
    });

    lootTable.groups = lootTable.groups;
  }

  async function save() {
    let updatedLootTable;

    if (lootTable.id) {
      updatedLootTable = await updateLootTable(entry, lootTable);
    } else {
      updatedLootTable = await createLootTable(entry, lootTable);
    }

    if (updatedLootTable) {
      lootTable = updatedLootTable;
    }
  }

  function removeGroup(event: CustomEvent<{ index: number }>) {
    lootTable.groups.splice(event.detail.index, 1);
    lootTable.groups = lootTable.groups;
  }
</script>

<div id="loot-table-edit-form">
  {#each lootTable.groups as group, index}
    <LootGroup {group} {index} on:removeGroup={removeGroup} />
  {/each}

  <div class="btn-container">
    <button on:click={createEmptyGroup}>Add a group</button>
    <button on:click={save}>Save</button>
  </div>
</div>

<style>
  .btn-container {
    width: 100%;
    display: flex;
    justify-content: space-between;
    margin-top: 10px;
  }
</style>
