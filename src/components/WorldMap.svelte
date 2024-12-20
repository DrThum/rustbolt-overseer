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

  import { type MapSpawn } from "../types/common.types";
  import { fetchMapMetadata, fetchSpawns } from "../services/map.service";
  import {
    BLOCK_IN_PIXELS,
    BLOCK_IN_YARDS,
    UIEvent,
    wowMaps,
    LS_LAST_MAP_NAME,
    LS_LAST_COORDS,
    LS_LAST_ZOOM_LEVEL,
  } from "../lib/constants";
  import { editSpawnCreatureId } from "../stores/creatures.store";

  let map: L.Map | null;
  let currentWowMap =
    wowMaps[localStorage.getItem(LS_LAST_MAP_NAME) ?? "Azeroth"];
  let mapMetadata;
  let spawns: MapSpawn[] = [];
  let lastClickedMarker: L.Marker | undefined = undefined;

  let gridLayer: GridLayer;
  // @ts-expect-error
  let mapLayer: typeof L.TileLayer.WoWMinimap;

  // https://github.com/pointhi/leaflet-color-markers
  const markerIcons = {
    regular: new L.Icon({
      iconUrl:
        "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
      shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    }),
    highlight: new L.Icon({
      iconUrl:
        "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
      shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    }),
  };

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

      for (const [mapName, wowMap] of Object.entries(wowMaps)) {
        const optionSelected = currentWowMap.name === wowMap.name;
        const option = new Option(
          wowMap.name,
          wowMap.id.toString(),
          optionSelected,
          optionSelected,
        );
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

          map.panTo(new L.LatLng(wowMap.entryPoint.x, wowMap.entryPoint.y));
          currentWowMap = wowMap;
          localStorage.setItem(LS_LAST_MAP_NAME, mapName);
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
    let previousPositionRaw = localStorage.getItem(LS_LAST_COORDS);
    let previousPosition = previousPositionRaw
      ? JSON.parse(previousPositionRaw)
      : undefined;
    let m = L.map(container, { preferCanvas: true, crs: L.CRS.Simple }).setView(
      [
        previousPosition?.x ?? currentWowMap.entryPoint.x,
        previousPosition?.y ?? currentWowMap.entryPoint.y,
      ],
      localStorage.getItem(LS_LAST_ZOOM_LEVEL) ?? 0,
    );

    mapLayer = L.tileLayer
      // @ts-expect-error property 'WoWMinimap' does not exist of type 'typeof TileLayer'
      .wowMinimap(
        `/maps/${currentWowMap.key}/${currentWowMap.key}_{x}_{y}.png`,
        {
          minZoom: -1,
          maxZoom: 3,
          minNativeZoom: 0,
          maxNativeZoom: 0,
        },
      )
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

    m.on("dragend", async function () {
      const bounds = m.getBounds();
      localStorage.setItem(
        LS_LAST_COORDS,
        JSON.stringify({
          x: bounds.getCenter().lat,
          y: bounds.getCenter().lng,
        }),
      );
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

    m.on("zoomend", function () {
      localStorage.setItem(LS_LAST_ZOOM_LEVEL, m.getZoom());
    });

    // @ts-expect-error
    L.control.mapSelector({ position: "topleft" }).addTo(m);

    return m;
  }

  function createMarker(spawn: MapSpawn) {
    let marker = L.marker(spawn.loc, { icon: markerIcons.regular }).on(
      "click",
      (ev) => {
        editSpawnCreatureId.set(spawn.entry);

        if (lastClickedMarker) {
          lastClickedMarker.setIcon(markerIcons.regular);
        }

        ev.target.setIcon(markerIcons.highlight);
        lastClickedMarker = ev.target;
      },
    );

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

  $: if (map && currentWowMap) {
    const bounds = map.getBounds();
    localStorage.setItem(
      LS_LAST_COORDS,
      JSON.stringify({
        x: bounds.getCenter().lat,
        y: bounds.getCenter().lng,
      }),
    );
    fetchMapMetadata(currentWowMap.name).then((res) => (mapMetadata = res));
    fetchSpawns(
      currentWowMap.id,
      {
        x: (bounds.getSouthWest().lat / BLOCK_IN_PIXELS) * BLOCK_IN_YARDS,
        y: (-bounds.getSouthWest().lng / BLOCK_IN_PIXELS) * BLOCK_IN_YARDS,
      },
      {
        x: (bounds.getNorthEast().lat / BLOCK_IN_PIXELS) * BLOCK_IN_YARDS,
        y: (-bounds.getNorthEast().lng / BLOCK_IN_PIXELS) * BLOCK_IN_YARDS,
      },
    ).then((res) => (spawns = res));
  }

  $: if (map && markerLayers && spawns) {
    // Clear existing spawns
    // @ts-expect-error
    markerLayers.eachLayer((layer) => {
      markerLayers.removeLayer(layer);
    });

    // Don't show spawns at zoom level -1, it lags and isn't that relevant
    if (map.getZoom() >= 0) {
      // Add new spawns
      const markers = spawns.map((spawn) => createMarker(spawn));
      markerLayers.addLayers(markers);
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
