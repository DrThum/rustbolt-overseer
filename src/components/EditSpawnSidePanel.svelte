<script lang="ts">
  import { fetchTemplate } from "../services/map.service";
  import { editSpawnCreatureId } from "../stores/creatures.store";
  import type { CreatureTemplate } from "../types/common.types";
  import LootTable from "./LootTable.svelte";

  let showPanel = false;
  let template: CreatureTemplate | undefined;

  editSpawnCreatureId.subscribe(async (value) => {
    showPanel = value !== undefined;

    if (value !== undefined) {
      template = await fetchTemplate(value);
    }
  });

  function closePanel() {
    editSpawnCreatureId.set(undefined);
  }
</script>

{#if showPanel}
  <div id="panel">
    <h1>
      {template?.name} ({$editSpawnCreatureId})
      <span on:click={closePanel}>X</span>
    </h1>

    {#if template}
      <LootTable
        templateEntry={template.entry}
        lootTable={template.loot_table}
      />
    {/if}
  </div>
{/if}

<style>
  #panel {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    width: 50%;
    z-index: 1000;
    background-color: white;
    color: black;
    padding: 20px;
  }

  h1 {
    font-size: 2rem;
    position: relative;
    display: flex;
    justify-content: space-between;
  }

  h1 > span {
    cursor: pointer;
  }
</style>
