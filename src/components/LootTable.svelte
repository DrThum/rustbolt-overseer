<script lang="ts">
  import type { LootTable, ValueRange } from "../types/common.types";

  export let lootTable: LootTable;

  function rangeToString(range: ValueRange) {
    if (range.min === range.max) {
      return `${range.min}`;
    } else {
      return `${range.min} - ${range.max}`;
    }
  }
</script>

<div>
  <h2>Loot Table</h2>

  {#each lootTable.groups as { chance, num_rolls, items }}
    <table>
      <tr>
        <td colspan="3"
          >Rolled {rangeToString(num_rolls)} time{num_rolls.max > 1
            ? "s"
            : ""}</td
        >
      </tr>
      <tr>
        <td colspan="3">{chance}% chance of being selected</td>
      </tr>
      {#if items.length > 0}
        <tr>
          <td>Item ID</td>
          <td>Chance of being selected</td>
          <td>Count</td>
        </tr>
      {/if}
      {#each items as { item_id, chance, count }}
        <tr>
          <td>{item_id}</td>
          <td>{chance}%</td>
          <td>{rangeToString(count)}</td>
        </tr>
      {/each}
    </table>
  {/each}
</div>

<style>
  table {
    width: 100%;
    border: solid 1px grey;
    margin-bottom: 4px;
  }
</style>
