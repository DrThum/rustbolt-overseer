<script>
  /*
	This is an example of using Svelte features with Leaflet. Original blog post here: https://imfeld.dev/writing/leaflet_with_svelte
	
	The toolbar and the marker popups are both implemented by embedding Svelte components inside Leaflet elements. The marker and lines are toggled by updating the map from reactive statements.
	
	Any questions? Ask me at dimfeld on Twitter!
	
	Thanks to heroicons.dev for all the icons used here.
	*/

  import L from "leaflet";
  import MapToolbar from "./lib/MapToolbar.svelte";
  import MarkerPopup from "./lib/MarkerPopup.svelte";
  import * as markerIcons from "./lib/markers.js";
  let map;
  let mapMetadata;

  const markerLocations = [
    [29.8283, -96.5795],
    [37.8283, -90.5795],
    [43.8283, -102.5795],
    [48.4, -122.5795],
    [43.6, -79.5795],
    [36.8283, -100.5795],
    [38.4, -122.5795],
  ];

  L.TileLayer.WoWMinimap = L.TileLayer.extend({
    getTileUrl: function (coords) {
      coords.x += 32;
      coords.y += 32;
      return L.TileLayer.prototype.getTileUrl.call(this, coords);
    },
  });

  L.tileLayer.wowMinimap = function (templateUrl, options) {
    return new L.TileLayer.WoWMinimap(templateUrl, options);
  };

  async function fetchMapMetadata() {
    const metadataResponse = await fetch("/maps/Azeroth/Azeroth.metadata.json");
    const metadata = await metadataResponse.json();
    return metadata;
  }

  function createMap(container) {
    let m = L.map(container, { preferCanvas: true, crs: L.CRS.Simple }).setView(
      [0, 0],
      0,
    );

    L.tileLayer
      .wowMinimap("/maps/Azeroth/Azeroth_{x}_{y}.png", {
        minZoom: -1,
        maxZoom: 3,
        minNativeZoom: 0,
        maxNativeZoom: 0,
      })
      .addTo(m);

    /// DEBUG
    L.GridLayer.GridDebug = L.GridLayer.extend({
      createTile: function (coords) {
        const tile = document.createElement("div");
        tile.style.outline = "1px solid green";
        tile.style.fontWeight = "bold";
        tile.style.fontSize = "14pt";
        tile.innerHTML = [coords.x, coords.y].join(",");
        return tile;
      },
    });

    L.gridLayer.gridDebug = function (opts) {
      return new L.GridLayer.GridDebug(opts);
    };

    m.addLayer(L.gridLayer.gridDebug());
    // END DEBUG

    return m;
  }

  let eye = true;
  let lines = true;

  let toolbar = L.control({ position: "topright" });
  let toolbarComponent;
  toolbar.onAdd = (map) => {
    let div = L.DomUtil.create("div");
    toolbarComponent = new MapToolbar({
      target: div,
      props: {},
    });

    toolbarComponent.$on("click-eye", ({ detail }) => (eye = detail));
    toolbarComponent.$on("click-lines", ({ detail }) => (lines = detail));
    toolbarComponent.$on("click-reset", () => {
      map.setView(initialView, 5, { animate: true });
    });

    return div;
  };

  toolbar.onRemove = () => {
    if (toolbarComponent) {
      toolbarComponent.$destroy();
      toolbarComponent = null;
    }
  };

  // Create a popup with a Svelte component inside it and handle removal when the popup is torn down.
  // `createFn` will be called whenever the popup is being created, and should create and return the component.
  function bindPopup(marker, createFn) {
    let popupComponent;
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

  let markers = new Map();

  function markerIcon(count) {
    let html = `<div class="map-marker"><div>${markerIcons.library}</div><div class="marker-text">${count}</div></div>`;
    return L.divIcon({
      html,
      className: "map-marker",
    });
  }

  function createMarker(loc) {
    let count = Math.ceil(Math.random() * 25);
    let icon = markerIcon(count);
    let marker = L.marker(loc, { icon });
    bindPopup(marker, (m) => {
      let c = new MarkerPopup({
        target: m,
        props: {
          count,
        },
      });

      c.$on("change", ({ detail }) => {
        count = detail;
        marker.setIcon(markerIcon(count));
      });

      return c;
    });

    return marker;
  }

  function createLines() {
    return L.polyline(markerLocations, { color: "#E4E", opacity: 0.5 });
  }

  let markerLayers;
  let lineLayers;
  async function mapAction(container) {
    mapMetadata = await fetchMapMetadata();

    map = createMap(container);
    toolbar.addTo(map);

    markerLayers = L.layerGroup();
    for (let location of markerLocations) {
      let m = createMarker(location);
      markerLayers.addLayer(m);
    }

    lineLayers = createLines();

    markerLayers.addTo(map);
    lineLayers.addTo(map);

    return {
      destroy: () => {
        toolbar.remove();
        map.remove();
        map = null;
      },
    };
  }

  // We could do these in the toolbar's click handler but this is an example
  // of modifying the map with reactive syntax.
  $: if (markerLayers && map) {
    if (eye) {
      markerLayers.addTo(map);
    } else {
      markerLayers.remove();
    }
  }

  $: if (lineLayers && map) {
    if (lines) {
      lineLayers.addTo(map);
    } else {
      lineLayers.remove();
    }
  }

  function resizeMap() {
    if (map) {
      map.invalidateSize();
    }
  }
</script>

<svelte:window on:resize={resizeMap} />

<link
  rel="stylesheet"
  href="https://unpkg.com/leaflet@1.6.0/dist/leaflet.css"
  integrity="sha512-xwE/Az9zrjBIphAcBb3F6JVqxf46+CDLwfLMHloNu6KEQCAWi6HcDUbeOfBIptF7tcCzusKFjFw2yuvEpDL9wQ=="
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
