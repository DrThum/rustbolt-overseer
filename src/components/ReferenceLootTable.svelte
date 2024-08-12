<script lang="ts">
  import { fetchReferenceLootTable } from "../services/loot.service";
  import { EntityType, type ReferenceLootTable } from "../types/common.types";

  export let entityId: number;
  let referenceLootTable: Promise<ReferenceLootTable | undefined>;

  $: if (entityId)
    referenceLootTable = fetchReferenceLootTable(EntityType.Creature, entityId);
</script>

<div id="reference-loot-table">
  {#await referenceLootTable}
    <h3>Loading the reference loot table...</h3>
  {:then lootTable}
    {#if lootTable}
      {#each lootTable.items as item}
        <p>
          <img alt="item icon" src={item.icon_url} />{item.name}
          ({item.loot_percent_chance} %)
        </p>
      {/each}
    {:else}
      <p>No loot</p>
    {/if}
  {:catch error}
    <p style="color: red">{error.message}</p>
  {/await}
</div>
