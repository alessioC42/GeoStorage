<template>
  <v-app>
    <Map
        style="height: 100%; width: 100%;z-index: 0;"
        :markers="markers"
        :onMapClick="onMapClick"
        :onMarkerClick="(mouseEvent: LeafletMouseEvent, storyPoint: StoryPoint) => {}"
        :search-marker-location="searchMarkerLocation as LatLng | null"
    ></Map>
    <div class="map-overlay">
      <Search
          :search-query="searchQuery"
          :osm-location-selected="updateSearchMarkerLocation"
      />
    </div>
    <div class="map-overlay">
      <PlaceDescription id="placeDesc" :lat-lng-tuple="searchMarkerLocation ? searchMarkerLocation : { lng: 0, lat: 0 }" :on-open-place="()=> {}" />
    </div>
  </v-app>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Map from '@/components/Map.vue'
import {type OsmSearchResult, type StoryPoint, StoryPointType} from "@/types";
import type {LatLng, LeafletMouseEvent} from "leaflet";
import Search from "@/components/Search.vue";
import PlaceDescription from "@/components/PlaceDescription.vue";

let searchMarkerLocation = ref<[number, number] | null>(null);
let searchQuery = ref<string>('');
function updateSearchMarkerLocation(result: OsmSearchResult | null) {
  if (result === null) searchMarkerLocation.value = null;
  else searchMarkerLocation.value =  [ parseFloat(result.lat), parseFloat(result.lon) ];
}

function onMapClick(mouseEvent: LeafletMouseEvent) {
  searchMarkerLocation.value = [mouseEvent.latlng.lat, mouseEvent.latlng.lng ];
  searchQuery.value = '';
}

let markers: StoryPoint[] = [];
markers.push({
  "latLngTuple": [50.10743, 8.66447],
  "title": "Gar nichts",
  "description": "Something",
  "story": {
    "history": [{
      "type": StoryPointType.url,
      "title": "Garnichts1",
      "date": new Date(),
      "description": "BeschreibungNr1",
    }],
    "documents": [],
  }
});

markers.push({
  "latLngTuple": [49.999770422688, 8.42557489871979],
  "title": "Max-Planck-Schule Rüsselsheim",
  "description": "My School in Rüsselsheim",
  "story": {
    "history": [{
      "type": StoryPointType.url,
      "title": "Garnichts1",
      "date": new Date(),
      "description": "BeschreibungNr1",
    }],
    "documents": [],
  }
});
</script>

<style scoped>
.map-overlay {
  position: absolute;
  padding: 10px;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.map-overlay * {
  pointer-events: auto;
  background-color: rgba(255, 255, 255, 0.8);
}

#placeDesc {
  margin: 10px;
  position: fixed;
  bottom: 0;
  left: 0;
  z-index: 1;
  padding: 5px;
  border-radius: 5px;
  max-width: 75%;
  max-height: 20%;
  min-width: 35%;
  border-color: rgba(0, 0, 0, 0.5);
  border-width: 2px;
}
</style>