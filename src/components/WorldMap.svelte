<script lang="ts">
  /*
    This is based on an example of using Svelte features with Leaflet.
    Original blog post here: https://imfeld.dev/writing/leaflet_with_svelte
	*/

  import L, {
    GridLayer,
    type ControlOptions,
    type Coords,
    type GridLayerOptions,
    type TileLayerOptions,
  } from "leaflet";
  // @ts-expect-error no type declaration
  import MarkerClusterGroup from "leaflet.markercluster";

  import MapToolbar from "./MapToolbar.svelte";
  import MarkerPopup from "../lib/MarkerPopup.svelte";

  import { type MapSpawn } from "../types/common.types";
  import { fetchMapMetadata, fetchSpawns } from "../services/map.service";
  import { BLOCK_IN_PIXELS, BLOCK_IN_YARDS, UIEvent } from "../lib/constants";

  import * as mapList from "../assets/maps.json";

  let map: L.Map | null;
  let currentWowMap = { id: 0, name: "Azeroth" };
  let mapMetadata;
  let spawns: MapSpawn[] = [];

  let gridLayer: GridLayer;
  // @ts-expect-error
  let mapLayer: typeof L.TileLayer.WoWMinimap;

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

  // @ts-expect-error
  L.Control.MapSelector = L.Control.extend({
    onAdd: function (map: L.Map) {
      const select = L.DomUtil.create("select") as HTMLSelectElement;

      // @ts-expect-error
      for (const [mapName, { id: mapId }] of Object.entries(mapList)) {
        const option = new Option(mapName, mapId);
        L.DomEvent.on(option, "click", (_ev) => {
          map.removeLayer(mapLayer);
          mapLayer = L.tileLayer
            // @ts-expect-error property 'WoWMinimap' does not exist of type 'typeof TileLayer'
            .wowMinimap(`/maps/${mapName}/${mapName}_{x}_{y}.png`, {
              minZoom: -1,
              maxZoom: 3,
              minNativeZoom: 0,
              maxNativeZoom: 0,
            })
            .addTo(map);

          const wowMap = mapList[mapName];
          map.panTo(new L.LatLng(wowMap.entryPoint.x, wowMap.entryPoint.y));
          currentWowMap = { id: mapId, name: mapName };
        });
        select.add(option);
      }

      return select;
    },
  });

  // @ts-expect-error
  L.control.mapSelector = function (options: ControlOptions) {
    // @ts-expect-error
    return new L.Control.MapSelector(options);
  };

  // @ts-expect-error parameter 'container' implicitly has 'any' type
  function createMap(container) {
    let m = L.map(container, { preferCanvas: true, crs: L.CRS.Simple }).setView(
      [0, 0],
      0,
    );

    mapLayer = L.tileLayer
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
    gridLayer = L.gridLayer.gridDebug({ minNativeZoom: 0, maxNativeZoom: 0 });
    // END DEBUG

    m.on("moveend", async function () {
      const bounds = m.getBounds();
      spawns = await fetchSpawns(
        currentWowMap.id,
        {
          x: (bounds.getSouthWest().lat / BLOCK_IN_PIXELS) * BLOCK_IN_YARDS,
          y: (-bounds.getSouthWest().lng / BLOCK_IN_PIXELS) * BLOCK_IN_YARDS,
        },
        {
          x: (bounds.getNorthEast().lat / BLOCK_IN_PIXELS) * BLOCK_IN_YARDS,
          y: (-bounds.getNorthEast().lng / BLOCK_IN_PIXELS) * BLOCK_IN_YARDS,
        },
      );
    });

    // @ts-expect-error
    L.control.mapSelector({ position: "topleft" }).addTo(m);

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
      return new MarkerPopup({
        target: el,
        props: {
          name: spawn.name,
        },
      });
    });

    return marker;
  }

  let markerLayers: MarkerClusterGroup;
  async function mapAction(container: HTMLElement) {
    map = createMap(container);
    toolbar.addTo(map);

    // @ts-expect-error
    markerLayers = L.markerClusterGroup({
      disableClusteringAtZoom: 2,
    });
    markerLayers.addTo(map);

    const bounds = map.getBounds();
    mapMetadata = await fetchMapMetadata(currentWowMap.name);
    spawns = await fetchSpawns(
      currentWowMap.id,
      {
        x: (bounds.getSouthWest().lat / BLOCK_IN_PIXELS) * BLOCK_IN_YARDS,
        y: (-bounds.getSouthWest().lng / BLOCK_IN_PIXELS) * BLOCK_IN_YARDS,
      },
      {
        x: (bounds.getNorthEast().lat / BLOCK_IN_PIXELS) * BLOCK_IN_YARDS,
        y: (-bounds.getNorthEast().lng / BLOCK_IN_PIXELS) * BLOCK_IN_YARDS,
      },
    );

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

  $: if (map && markerLayers && spawns && currentWowMap) {
    // Clear existing spawns
    // @ts-expect-error
    markerLayers.eachLayer((layer) => {
      markerLayers.removeLayer(layer);
    });

    // Don't show spawns at zoom level -1, it lags and isn't that relevant
    if (map.getZoom() >= 0) {
      // Add new spawns
      for (const spawn of spawns) {
        const marker = createMarker(spawn);
        markerLayers.addLayer(marker);
      }
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
<link
  rel="stylesheet"
  href="https://unpkg.com/leaflet.markercluster@1.4.1/dist/MarkerCluster.css"
  crossorigin=""
/>
<link
  rel="stylesheet"
  href="https://unpkg.com/leaflet.markercluster@1.4.1/dist/MarkerCluster.Default.css"
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
