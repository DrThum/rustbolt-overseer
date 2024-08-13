<script lang="ts">
  import { fetchReferenceLootTable } from "../services/loot.service";
  import { EntityType, type ReferenceLootTable } from "../types/common.types";

  export let entityId: number;
  let referenceLootTable: Promise<ReferenceLootTable | undefined>;

  $: if (entityId)
    referenceLootTable = fetchReferenceLootTable(
      EntityType.Creature,
      entityId,
    ).then((lootTable) => {
      if (lootTable) {
        return {
          ...lootTable,
          items: lootTable.items.sort((a, b) =>
            a.loot_percent_chance > b.loot_percent_chance ? -1 : 1,
          ),
        };
      }
    });
</script>

<div id="reference-loot-table">
  {#await referenceLootTable}
    <h3>Loading the reference loot table...</h3>
  {:then lootTable}
    {#if lootTable}
      <h3 class="hint">
        Reference loot table<span>Drag the icons to build a loot table!</span>
      </h3>

      <table class="drops">
        {#each lootTable.items as item}
          <tr>
            <td class="item-icon"
              ><img class="item-icon" alt="item icon" src={item.icon_url} /></td
            >
            <td>
              <a
                href="https://www.wowhead.com/tbc/item={item.id}"
                target="_blank">{item.name}</a
              >
            </td>
            <td class="loot-percent-chance">{item.loot_percent_chance} %</td>
          </tr>
        {/each}
      </table>
    {:else}
      <p>No loot</p>
    {/if}
  {:catch error}
    <p style="color: red">{error.message}</p>
  {/await}
</div>

<style>
  table.drops {
    width: 100%;
    border-collapse: collapse;
  }

  table.drops tr:nth-child(even) {
    background-image: linear-gradient(
      0deg,
      rgba(0, 0, 0, 0.08) 0%,
      rgba(0, 0, 0, 0.08) 100%
    );
  }

  td.item-icon {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  td.loot-percent-chance {
    text-align: right;
    padding-right: 15px;
  }

  img.item-icon {
    border: solid 2px var(--secondary);
    border-radius: 2px;
    margin: 2px 0;
    cursor: grab;
  }

  .hint {
    display: flex;
    width: 100%;
    justify-content: space-between;
    align-items: center;
  }

  .hint > span {
    font-size: 14px;
    border-radius: 3px;
    background-color: var(--secondary);
    color: var(--light);
    padding: 8px;
    margin-bottom: 5px;
    display: inline-block;
  }
</style>
