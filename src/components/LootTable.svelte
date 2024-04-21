<script lang="ts">
  import type { LootTable, ValueRange } from "../types/common.types";
  import { updateLootTable } from "../services/loot.service";

  export let templateEntry: number;
  export let lootTable: LootTable | undefined;
  let canSave = false;

  let editingGroupIndex: number | undefined;
  let newItemId: number | undefined;
  let newItemChance: number | undefined;
  let newItemMinCount: number | undefined;
  let newItemMaxCount: number | undefined;

  function rangeToString(range: ValueRange) {
    if (range.min === range.max) {
      return `${range.min}`;
    } else {
      return `${range.min} - ${range.max}`;
    }
  }

  function resetNewItem() {
    newItemId = undefined;
    newItemChance = undefined;
    newItemMinCount = undefined;
    newItemMaxCount = undefined;
  }

  function addNewItemToGroup() {
    if (editingGroupIndex === undefined || lootTable === undefined) {
      return;
    }

    if (newItemId && newItemChance && newItemMinCount) {
      lootTable.groups[editingGroupIndex].items = lootTable.groups[
        editingGroupIndex
      ].items.concat([
        {
          item_id: newItemId,
          chance: newItemChance,
          count: {
            min: newItemMinCount,
            max: newItemMaxCount ?? newItemMinCount,
          },
          condition_id: null,
        },
      ]);

      resetNewItem();
    }
  }

  function removeItemFromGroup(itemId: number) {
    if (editingGroupIndex === undefined || lootTable === undefined) {
      return;
    }

    lootTable.groups[editingGroupIndex].items = lootTable.groups[
      editingGroupIndex
    ].items.filter(({ item_id }) => item_id !== itemId);
  }

  function addGroup() {
    if (lootTable === undefined) {
      return;
    }

    lootTable.groups.push({
      chance: 100,
      condition_id: null,
      num_rolls: { min: 1, max: 1 },
      items: [],
    });

    lootTable.groups = lootTable.groups;
  }

  function createLootTable() {
    lootTable = { id: templateEntry, groups: [] };
  }

  async function saveTable() {
    if (!lootTable) {
      return;
    }

    lootTable = await updateLootTable(templateEntry, lootTable);
  }

  function removeGroupFromTable(groupIndex: number) {
    if (lootTable === undefined) {
      return;
    }

    lootTable.groups.splice(groupIndex, 1);
    lootTable.groups = lootTable.groups;
  }

  function isTableValid(lootTable: LootTable) {
    if (!lootTable) {
      return false;
    }

    if (lootTable.groups.length === 0) {
      return false;
    }

    return lootTable.groups.every((group) => group.items.length > 0);
  }

  $: if (lootTable) canSave = isTableValid(lootTable);
</script>

<div>
  <h2>Loot Table</h2>

  {#if lootTable}
    {#each lootTable.groups as { chance, num_rolls, items }, groupIndex}
      <table>
        <tr>
          <td class="group-header" colspan="3">
            {#if editingGroupIndex !== groupIndex}
              <span>
                Rolled {rangeToString(num_rolls)} time{num_rolls.max > 1
                  ? "s"
                  : ""}
              </span>
            {:else}
              <input
                type="number"
                bind:value={lootTable.groups[editingGroupIndex].num_rolls.min}
              />
              -
              <input
                type="number"
                bind:value={lootTable.groups[editingGroupIndex].num_rolls.max}
              />
            {/if}
            <button
              on:click={() => {
                removeGroupFromTable(groupIndex);
              }}
            >
              Delete
            </button>
            {#if editingGroupIndex !== groupIndex}
              <button
                on:click={() => {
                  editingGroupIndex = groupIndex;
                  resetNewItem();
                }}>Edit</button
              >
            {:else}
              <button
                on:click={() => {
                  editingGroupIndex = undefined;
                }}>Done</button
              >
            {/if}
          </td>
        </tr>
        <tr>
          {#if editingGroupIndex === groupIndex}
            <td colspan="3"
              ><input type="number" min="0" max="100" bind:value={chance} /></td
            >
          {:else}
            <td colspan="3">{chance}% chance of being selected</td>
          {/if}
        </tr>
        {#if items.length > 0}
          <tr>
            <td>Item ID</td>
            <td>Chance of being selected</td>
            <td colspan="2">Count</td>
          </tr>
        {/if}
        {#each items as { item_id, chance, count }}
          <tr>
            {#if editingGroupIndex === groupIndex}
              <td><input type="number" bind:value={item_id} /></td>
              <td
                ><input
                  type="number"
                  min="0"
                  max="100"
                  bind:value={chance}
                /></td
              >
              <td
                ><input type="number" bind:value={count.min} /> -
                <input type="number" bind:value={count.max} /></td
              >
              <td
                ><button
                  on:click={() => {
                    removeItemFromGroup(item_id);
                  }}>-</button
                ></td
              >
            {:else}
              <td>{item_id}</td>
              <td>{chance}%</td>
              <td colspan="2">{rangeToString(count)}</td>
            {/if}
          </tr>
        {/each}
        {#if editingGroupIndex === groupIndex}
          <tr>
            <td><input type="number" bind:value={newItemId} /></td>
            <td><input type="number" bind:value={newItemChance} /></td>
            <td
              ><input type="number" bind:value={newItemMinCount} /> -
              <input type="number" bind:value={newItemMaxCount} /></td
            >
            <td><button on:click={addNewItemToGroup}>+</button></td>
          </tr>
        {/if}
      </table>
    {/each}
    <button on:click={addGroup}>New Group</button>
    {#if canSave}
      <button on:click={saveTable}>Save</button>
    {/if}
  {:else}
    <button on:click={createLootTable}>Create</button>
  {/if}
</div>

<style>
  table {
    width: 100%;
    border: solid 1px grey;
    margin-bottom: 4px;
  }

  td.group-header {
    width: 100%;
    display: flex;
    justify-content: space-between;
  }
</style>
