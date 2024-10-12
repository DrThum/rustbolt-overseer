<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { LootItem } from "../types/common.types";

  const dispatch = createEventDispatcher();

  export let item: LootItem;

  function removeItem() {
    dispatch('removeItem', { itemId: item.item_id });
  }
</script>

<div class="loot-item-wrapper">
  <button class="btn-remove-group" on:click={removeItem}>&#10006;</button>
  <a href="https://www.wowhead.com/tbc/item={item.item_id}" target="_blank">
    Item #{ item.item_id }
  </a>
  <div class="metadata">
    <label>Chance </label>
    <input type="range" min="1" max="100" bind:value={item.chance} />
    <label>{item.chance} %</label>
  </div>
  <div class="metadata">
    <label>Rolled</label>
    <input type="number" bind:value={item.count.min} /> to <input type="number" bind:value={item.count.max} /> time(s)
  </div>
</div>

<style>
  .loot-item-wrapper {
    position: relative;
  }

  .metadata {
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .btn-remove-group {
    position: absolute;
    right: 10px;
  }
</style>
