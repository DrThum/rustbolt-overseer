<script lang="ts">
  /*
    This is based on an example of using Svelte features with Leaflet.
    Original blog post here: https://imfeld.dev/writing/leaflet_with_svelte
	*/

  import L, {
    GridLayer,
    LayerGroup,
    type Coords,
    type GridLayerOptions,
    type TileLayerOptions,
  } from "leaflet";

  import MapToolbar from "./MapToolbar.svelte";
  import MarkerPopup from "../lib/MarkerPopup.svelte";

  import { type MapSpawn } from "../types/common.types";
  import { fetchMapMetadata, fetchSpawns } from "../services/map.service";
  import { UIEvent } from "../lib/constants";

  let map: L.Map | null;
  let mapMetadata;
  let spawns = [];

  let gridLayer: GridLayer;

  // @ts-expect-error property 'WoWMinimap' does not exist of type 'typeof TileLayer'
  L.TileLayer.WoWMinimap = L.TileLayer.extend({
    getTileUrl: function (coords: L.Coords) {
      coords.x += 32;
      coords.y += 32;
      return L.TileLayer.prototype.getTileUrl.call(this, coords);
    },
  });

  // @ts-expect-error Property 'wowMinimap' does not exist on type 'typeof tileLayer'
  L.tileLayer.wowMinimap = function (
    templateUrl: String,
    options: TileLayerOptions,
  ) {
    // @ts-expect-error property 'WoWMinimap' does not exist of type 'typeof TileLayer'
    return new L.TileLayer.WoWMinimap(templateUrl, options);
  };

  // @ts-expect-error parameter 'container' implicitly has 'any' type
  function createMap(container) {
    let m = L.map(container, { preferCanvas: true, crs: L.CRS.Simple }).setView(
      [0, 0],
      0,
    );

    L.tileLayer
      // @ts-expect-error property 'WoWMinimap' does not exist of type 'typeof TileLayer'
      .wowMinimap("/maps/Azeroth/Azeroth_{x}_{y}.png", {
        minZoom: -1,
        maxZoom: 3,
        minNativeZoom: 0,
        maxNativeZoom: 0,
      })
      .addTo(m);

    /// DEBUG
    // @ts-expect-error property 'GridDebug' does not exist of type 'typeof GridLayer'
    L.GridLayer.GridDebug = L.GridLayer.extend({
      createTile: function (coords: Coords) {
        const tile = document.createElement("div");
        tile.style.outline = "1px solid green";
        tile.style.fontWeight = "bold";
        tile.style.fontSize = "14pt";
        tile.innerHTML = [coords.x, coords.y].join(",");
        return tile;
      },
    });

    // @ts-expect-error
    L.gridLayer.gridDebug = function (opts: GridLayerOptions) {
      // @ts-expect-error property 'GridDebug' does not exist of type 'typeof GridLayer'
      return new L.GridLayer.GridDebug(opts);
    };

    // @ts-expect-error
    gridLayer = L.gridLayer.gridDebug();
    // END DEBUG

    return m;
  }

  // Create a popup with a Svelte component inside it and handle removal when the popup is torn down.
  // `createFn` will be called whenever the popup is being created, and should create and return the component.
  function bindPopup(
    marker: L.Marker,
    createFn: (el: HTMLElement) => MarkerPopup,
  ) {
    let popupComponent: MarkerPopup | null;
    marker.bindPopup(() => {
      let container = L.DomUtil.create("div");
      popupComponent = createFn(container);
      return container;
    });

    marker.on("popupclose", () => {
      if (popupComponent) {
        let old = popupComponent;
        popupComponent = null;
        // Wait to destroy until after the fadeout completes.
        setTimeout(() => {
          old.$destroy();
        }, 500);
      }
    });
  }

  function createMarker(spawn: MapSpawn) {
    let marker = L.marker(spawn.loc);
    bindPopup(marker, (el: HTMLElement) => {
      let c = new MarkerPopup({
        target: el,
        props: {
          name: spawn.name,
        },
      });

      return c;
    });

    return marker;
  }

  let markerLayers: LayerGroup;
  async function mapAction(container: HTMLElement) {
    mapMetadata = await fetchMapMetadata();
    spawns = await fetchSpawns();

    map = createMap(container);
    toolbar.addTo(map);

    markerLayers = L.layerGroup();
    for (const spawn of spawns) {
      const marker = createMarker(spawn);
      markerLayers.addLayer(marker);
    }

    markerLayers.addTo(map);

    return {
      destroy: () => {
        toolbar.remove();
        map?.remove();
        map = null;
      },
    };
  }

  let toolbar = new L.Control({ position: "topright" });
  let toolbarComponent: MapToolbar | null;
  toolbar.onAdd = (map: L.Map) => {
    let div = L.DomUtil.create("div");
    toolbarComponent = new MapToolbar({
      target: div,
      props: {},
    });

    toolbarComponent.$on(UIEvent.toggleGrid, ({ detail }) => {
      if (detail) {
        map.addLayer(gridLayer);
      } else {
        map.removeLayer(gridLayer);
      }
    });

    return div;
  };

  toolbar.onRemove = () => {
    if (toolbarComponent) {
      toolbarComponent.$destroy();
      toolbarComponent = null;
    }
  };

  function resizeMap() {
    if (map) {
      map.invalidateSize();
    }
  }
</script>

<svelte:window on:resize={resizeMap} />

<link
  rel="stylesheet"
  href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
  integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
  crossorigin=""
/>
<div class="map" style="height:100%;width:100%" use:mapAction />

<style>
  .map :global(.marker-text) {
    width: 100%;
    text-align: center;
    font-weight: 600;
    background-color: #444;
    color: #eee;
    border-radius: 0.5rem;
  }

  .map :global(.map-marker) {
    width: 30px;
    transform: translateX(-50%) translateY(-25%);
  }
</style>
