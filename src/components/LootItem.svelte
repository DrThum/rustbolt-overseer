<script lang="ts">
  import type { LootItem } from "../types/common.types";

  export let item: LootItem;
</script>

<div class="loot-item-wrapper">
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
  .metadata {
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 12px;
  }
</style>
