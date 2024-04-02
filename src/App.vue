<template>
  <v-app>
    <Map
        style="height: 100%; width: 100%;z-index: 0;"
        :markers="markers"
        :onMapClick="onMapClick"
        :onMarkerClick="(mouseEvent: LeafletMouseEvent, storyPoint: storyPoint) => {}"
        :search-marker-location="searchMarkerLocation as LatLng | null"
    ></Map>
    <div class="map-overlay">
      <Search
          :search-query="searchQuery"
          :osm-location-selected="updateSearchMarkerLocation"
      />
    </div>
    <div class="map-overlay">
      <PlaceDescription id="placeDesc" :lat-lng-tuple="searchMarkerLocation" :on-open-place="()=> {}" />
    </div>
    <div v-if="!DataProvider.getInstance().loggedIn.value" class="login-map-overlay">
      <LoginScreen id="loginScreen" />
    </div>
  </v-app>
</template>

<script setup lang="ts">
import {ref, watch} from 'vue';
import Map from '@/components/Map.vue'
import {type OsmSearchResult, type storyPoint} from "@/types";
import type {LatLng, LeafletMouseEvent} from "leaflet";
import Search from "@/components/Search.vue";
import PlaceDescription from "@/components/PlaceDescription.vue";
import LoginScreen from "@/components/LoginScreen.vue";
import {DataProvider} from "@/dataProvider";


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

let markers: storyPoint[] = [];
markers.push({
  coords: [50.10743, 8.66447],
  title: "Gar nichts",
  description: "Something",
  images: [],
  history: [],
  files: [],
  company_id: "1",
  created_by: "1",
});

markers.push({
  coords: [49.999770422688, 8.42557489871979],
  title: "Max-Planck-Schule Rüsselsheim",
  description: "My School in Rüsselsheim",
  images: [],
  history: [],
  files: [],
  company_id: "1",
  created_by: "1",
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

.login-map-overlay {
  position: absolute;
  padding: 10px;
  width: 100%;
  height: 100%;
  z-index: 2;
  background-color: rgba(255, 255, 255, 0.8);
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
  max-width: 70%;
  max-height: 20%;
  min-width: 35%;
  border-color: rgba(0, 0, 0, 0.5);
  border-width: 2px;
}

</style>