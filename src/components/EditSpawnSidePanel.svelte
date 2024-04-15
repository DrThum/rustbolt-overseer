<script lang="ts">
  import { editSpawnCreatureId } from "../stores/creatures.store";

  let showPanel = false;

  editSpawnCreatureId.subscribe((value) => {
    showPanel = value !== undefined;
  });

  function closePanel() {
    editSpawnCreatureId.set(undefined);
  }
</script>

{#if showPanel}
  <div id="panel">
    <h1>
      Creature template #{$editSpawnCreatureId}
      <span on:click={closePanel}>X</span>
    </h1>
  </div>
{/if}

<style>
  #panel {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    width: 600px;
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
