<script lang="ts">
  import { fetchTemplate } from "../services/map.service";
  import { editSpawnCreatureId } from "../stores/creatures.store";
  import type { CreatureTemplate } from "../types/common.types";
  import LootTableEditForm from "./LootTableEditForm.svelte";
  import ReferenceLootTable from "./ReferenceLootTable.svelte";

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

  function createEmptyLootTable() {
    if (!template) {
      return;
    }

    template.loot_table = {
      groups: [{
        chance: 100,
        condition_id: null,
        num_rolls: { min: 1, max: 1 },
        items: [],
      }],
    };
  }
</script>

{#if showPanel}
  <div id="panel">
    <h1>
      <a
        class="external"
        href="https://www.wowhead.com/tbc/npc={template?.entry}"
        target="_blank"
        >{template?.name}
        <span class="npc-entry">({$editSpawnCreatureId})</span></a
      >
      <button on:click={closePanel}>&#10006;</button>
    </h1>

    {#if template}
      {#if template.loot_table}
        <LootTableEditForm entry={template?.entry} lootTable={template.loot_table} />
      {:else}
        <button on:click={createEmptyLootTable}>Initialize a loot table</button>
      {/if}

      <ReferenceLootTable entityId={template.entry} />
    {/if}
  </div>
{/if}

<style>
  #panel {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    width: 500px;
    z-index: 1000;
    background-color: var(--light);
    color: black;
    padding: 20px;
    overflow-y: scroll;
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

  h1 button {
    font-size: 14px;
  }

  a.external::after {
    content: "";
    width: 0.7em;
    height: 0.7em;
    margin: 0 0.05em 0 0.1em;
    background: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNiAxNiIgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2Ij48cGF0aCBkPSJNOSAyTDkgMyAxMi4zIDMgNiA5LjMgNi43IDEwIDEzIDMuNyAxMyA3IDE0IDcgMTQgMlpNNCA0QzIuOSA0IDIgNC45IDIgNkwyIDEyQzIgMTMuMSAyLjkgMTQgNCAxNEwxMCAxNEMxMS4xIDE0IDEyIDEzLjEgMTIgMTJMMTIgNyAxMSA4IDExIDEyQzExIDEyLjYgMTAuNiAxMyAxMCAxM0w0IDEzQzMuNCAxMyAzIDEyLjYgMyAxMkwzIDZDMyA1LjQgMy40IDUgNCA1TDggNSA5IDRaIi8+PC9zdmc+)
      no-repeat;
    background-size: contain;
    display: inline-block;
    vertical-align: text-top;
  }

  span.npc-entry {
    font-size: 1rem;
    vertical-align: super;
  }
</style>
