<script lang="ts">
  import type { LootGroup } from "../types/common.types";
    import LootItem from "./LootItem.svelte";

  // TODO: Two display mode: compact (icon, count, percentage, side by side) and comfortable (icon, count, percentage, name, one per line)
  export let group: LootGroup | undefined;

  function defaultToOne(dataTransfer: DataTransfer, attribute: string): number {
    let maybeNumber = parseInt(dataTransfer.getData(attribute));
    return isNaN(maybeNumber) ? 1 : maybeNumber;
  }

  function handleDragDrop(e: DragEvent) {
    if (!e.dataTransfer) {
      return;
    }

    if (!group) {
      return;
    }

    let itemId = parseInt(e.dataTransfer.getData("itemId"));

    if (group.items.find((item) => item.item_id === itemId)) {
      return;
    }

    group.items.push({
      item_id: itemId,
      chance: parseInt(e.dataTransfer.getData("lootPercentChance")),
      condition_id: null,
      count: {
        min: defaultToOne(e.dataTransfer, "minCount"),
        max: defaultToOne(e.dataTransfer, "maxCount"),
      },
    });

    group.items = group.items;
  }
</script>

<div class="loot-group-wrapper">
  {#if group}
    <div class="metadata">
      <label>Chance </label>
      <input type="range" min="1" max="100" bind:value={group.chance} />
      <label>{group.chance} %</label>
    </div>
    <div class="metadata">
      <label>Rolled</label>
      <input type="number" bind:value={group.num_rolls.min} /> to <input type="number" bind:value={group.num_rolls.max} /> time(s)
    </div>

    <ul>
      {#each group.items as item}
        <li><LootItem item={item}/></li>
      {/each}
    </ul>
  {/if}

  <div
    class="loot-group-drop-zone"
    on:drop={handleDragDrop}
    ondragover="return false"
  >
    Drop an item here
  </div>
</div>

<style>
  .loot-group-wrapper {
    padding: 10px;
  }

  .loot-group-wrapper {
    border: solid 1px;
    border-radius: 4px;
    margin-bottom: 15px;
  }

  .loot-group-drop-zone {
    border: dashed 1px var(--secondary);
    border-radius: 4px;
    padding: 10px;
    text-align: center;
  }

  ul {
    list-style: none;
    margin: 10px;
    padding: 0;
    display: flex;
    flex-wrap: wrap;
  }

  li {
    border: solid 1px var(--secondary);
    border-radius: 4px;
    padding: 10px;
    margin-bottom: 5px;
    margin-right: 5px;
    width: 100%;
  }

  .metadata {
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 12px;
  }
</style>
