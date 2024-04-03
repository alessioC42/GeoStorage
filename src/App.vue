<template>
  <v-app>
    <Map
        style="height: 100%; width: 100%;z-index: 0;"
        :onMapClick="onMapClick"
        :onMarkerClick="(_mouseEvent: LeafletMouseEvent, sp: storyPoint) => onStorySelected(sp)"
        :search-marker-location="searchMarkerLocation as LatLng | null"
    ></Map>
    <div class="map-overlay">
      <Search
          :search-query="searchQuery"
          :osm-location-selected="updateSearchMarkerLocation"
          :open-story-point="onStorySelected"/>
    </div>
    <div class="map-overlay">
      <PlaceDescription id="placeDesc" :lat-lng-tuple="searchMarkerLocation" :on-open-place="()=> {}" />
    </div>
    <div :hidden="editorHidden" class="filled-map-overlay">
      <StoryPointEditor
          :story-point-i-d="selectedStoryPointID"
          :close-editor="() => {editorHidden = true; selectedStoryPointID = '';}"
      />

    </div>
    <div v-if="!DataProvider.getInstance().loggedIn.value" class="filled-map-overlay">
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
import StoryPointEditor from "@/components/StoryPointEditor.vue";

let editorHidden = ref<boolean>(true);
let selectedStoryPointID = ref<string>("");
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

function onStorySelected(storyPoint: storyPoint) {
  const storyPointID = storyPoint.id;
  console.log('Story point selected: ' + storyPointID)
  editorHidden.value = false;
  selectedStoryPointID.value = storyPointID;
}

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

.filled-map-overlay {
  position: absolute;
  padding: 10px;
  width: 100%;
  height: 100%;
  z-index: 2;
  background-color: rgba(255, 255, 255, 0.7);
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