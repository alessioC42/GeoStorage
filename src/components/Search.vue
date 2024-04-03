<script lang="ts">
import {defineComponent} from 'vue'
import type {OsmSearchResult, storyPoint} from "@/types";
import OSMSearchResult from './listTiles/OSMSearchResult.vue';
import {DataProvider} from "@/dataProvider";
import StoryPointSearchResult from "@/components/listTiles/StoryPointSearchResult.vue";
import {type LatLngTuple} from "leaflet";
import DistanceSearchResult from "@/components/listTiles/DistanceSearchResult.vue";

async function openStreetMapSearch(query: string) : Promise<OsmSearchResult[]> {
  const result = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=jsonv2&addressdetails=1&layer=address&limit=15`);
  return result.json();
}

async function storyPointSearch(query: string) : Promise<storyPoint[]> {
  return DataProvider.getInstance().searchStoryPointsRemote(query);
}

async function storyPointDistanceSearch(location: LatLngTuple | null): Promise<storyPoint[]> {
  if (location === null || location === undefined || location[0] === undefined || location[1] === null ) return [];
  return DataProvider.getInstance().searchStoryPointsByDistanceRemote(location);
}

let searchTimeout: number | null ;
export default defineComponent({
  name: "Search",
  components: {DistanceSearchResult, StoryPointSearchResult, OSMSearchResult},
  props: {
    searchQuery: {
      type: String,
      default: '',
    },
    mapMarkerLocation: {
      type: Object,
      default: () => ({ lat: 0, lng: 0 }),
    },
    hideMapMarker: {
      type: Function,
      default: () => {},
    },
    osmLocationSelected: {
      type: Function,
      default: (_result: OsmSearchResult | null) => {},
    },
    openStoryPoint: {
      type: Function,
      required: true
    },
    lastClickedMapLocation: {
      type: Object,
      default: () => ({ lat: 0, lng: 0 }),
    },
  },

  data() {
    return {
      tab: 'storyPoints',
      osmSearchResults: [] as OsmSearchResult[],
      nearByResults: [] as storyPoint[],
      storyPointRemoteResults: [] as storyPoint[],
      localSearchQuery: this.searchQuery,
    }
  },
  watch: {
    searchQuery(newVal) {
      this.localSearchQuery = newVal;
      this.osmSearchResults = [];
      this.nearByResults = [];
      this.storyPointRemoteResults = [];
    },
    async mapMarkerLocation(newVal) {
      this.localSearchQuery = '';
      if (newVal === null) return;
      let data = await storyPointDistanceSearch(newVal);
      if (!data) return;
      this.osmSearchResults = [];
      this.nearByResults = data;
    }
  },
  methods: {
    performSearch() {
      this.hideMapMarker();
      this.nearByResults = [];
      if (searchTimeout) clearTimeout(searchTimeout);
      searchTimeout = setTimeout(async () => {
        this.osmSearchResults = await openStreetMapSearch(this.localSearchQuery);
        this.storyPointRemoteResults = await storyPointSearch(this.localSearchQuery);
        console.log(this.storyPointRemoteResults)
      }, 400);
    },
  },
});
</script>

<template>
  <v-sheet id="sheet">
    <v-text-field append-inner-icon="mdi-map-search" v-model="localSearchQuery" label="Search..." color="primary" @input="performSearch()"></v-text-field>
    <v-card>
      <v-tabs
          v-model="tab"
          align-tabs="center"
          fixed-tabs
      >
        <v-tab value="storyPoints">Storypoints</v-tab>
        <v-tab value="openStreetMap">Places (OSM)</v-tab>
      </v-tabs>

      <v-card-text>
        <v-window v-model="tab">
          <v-window-item value="storyPoints">
            <div
                v-if="(storyPointRemoteResults.length+nearByResults.length) > 0"
                class="scroll-results"
            >
                <StoryPointSearchResult
                    v-for="item in storyPointRemoteResults"
                    :story-point="item"
                    :on-press="()=>{openStoryPoint(item)}"  />
                <distance-search-result
                    v-for="item in nearByResults"
                    :on-press="()=>{openStoryPoint(item)}"
                    :title="item.title"
                    :subtitle="item.distanceString"
                />
            </div>
            <div v-else>
              <v-alert v-if="localSearchQuery.trim() === ''">
                Start typing or click on the map to search for existing storypoints
              </v-alert>
              <v-alert v-else>
                No results found
              </v-alert>
            </div>
          </v-window-item>

          <v-window-item value="openStreetMap">

            <div
                class="scroll-results"
                v-if="osmSearchResults.length > 0"
            >
              <OSMSearchResult
                  v-for="item in osmSearchResults"
                  :osmSearchResult="item"
                  :onPress="() => {osmLocationSelected(item)}"
              ></OSMSearchResult>
            </div>
            <div v-else>
              <v-alert v-if="localSearchQuery.trim() === ''">
                Start typing to search <a href="https://openstreetmap.org" target="_blank">OpenStreetMap</a> for places
              </v-alert>
              <v-alert v-else>
                No results found
              </v-alert>
            </div>
          </v-window-item>
        </v-window>
      </v-card-text>
    </v-card>
  </v-sheet>
</template>

<style scoped>
.scroll-results {
  max-height: 45vh;
  overflow-y: scroll;
}

/* Width */
::-webkit-scrollbar {
  width: 5px;
}

/* Track */
::-webkit-scrollbar-track {
  background: transparent;
}

/* Handle */
::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 2px;
}

/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
  background: #555;
}

#sheet {
  padding: 5px;
  border-radius: 5px;
  max-width: 450px;
  max-height: 90%;
  min-width: 350px;
  width: 25%;
  border-color: rgba(0, 0, 0, 0.5);
  border-width: 2px;
}
</style>