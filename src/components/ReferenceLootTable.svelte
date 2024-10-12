<script lang="ts">
  import { fetchReferenceLootTable } from "../services/loot.service";
  import { EntityType, type ReferenceLootTable } from "../types/common.types";

  export let entityId: number;
  let referenceLootTable: Promise<ReferenceLootTable | undefined>;

  async function handleDragStart(e: DragEvent) {
    if (!e.currentTarget) {
      return;
    }

    const itemId = parseInt(
      (<HTMLElement>e.currentTarget).getAttribute("item-id") as string,
    );
    const item = (await referenceLootTable)!.items.find(
      (item) => item.id === itemId,
    );

    if (item) {
      e.dataTransfer?.setData("itemId", item.id.toString());
      e.dataTransfer?.setData(
        "lootPercentChance",
        item.loot_percent_chance.toString(),
      );
      if (item.min_count) {
        e.dataTransfer?.setData("minCount", item.min_count?.toString() ?? "1");
      }
      if (item.max_count) {
        e.dataTransfer?.setData("maxCount", item.max_count?.toString() ?? "1");
      }
    }
  }

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
            <td class="item-icon">
              <div
                class="item-icon-container"
                draggable="true"
                on:dragstart={handleDragStart}
                item-id={item.id}
              >
                <img class="item-icon" alt="item icon" src={item.icon_url} />
                {#if item.min_count}
                  <span class="item-counts"
                    >{item.min_count}-{item.max_count}</span
                  >
                {/if}
              </div>
            </td>
            <td>
              <a
                href="https://www.wowhead.com/tbc/item={item.id}"
                target="_blank"
              >
                {item.name}
              </a>
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

  div.item-icon-container {
    position: relative;
  }

  div.item-icon-container * {
    cursor: grab;
  }

  span.item-counts {
    position: absolute;
    right: 2px;
    bottom: 4px;
    color: var(--light);
    font-size: 18px;
    font-weight: bold;
    text-shadow:
      1px 1px 0 #000,
      0 1px 0 #000,
      -1px 1px 0 #000,
      -1px 0 0 #000,
      -2px 0 #000,
      -1px 0 #000,
      0px 0 #000,
      1px 0 0 #000;
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
