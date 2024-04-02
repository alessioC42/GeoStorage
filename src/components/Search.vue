<script lang="ts">
import {defineComponent} from 'vue'
import type {OsmSearchResult, storyPoint} from "@/types";
import OSMSearchResult from './listTiles/OSMSearchResult.vue';
import {DataProvider} from "@/dataProvider";
import StoryPointSearchResult from "@/components/listTiles/StoryPointSearchResult.vue";

async function openStreetMapSearch(query: string) : Promise<OsmSearchResult[]> {
  const result = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=jsonv2&addressdetails=1&layer=address&limit=15`);
  return result.json();
}

async function storyPointSearch(query: string) : Promise<storyPoint[]> {
  return DataProvider.getInstance().searchStoryPointsRemote(query);
}

let searchTimeout: number | null ;
export default defineComponent({
  name: "Search",
  components: {StoryPointSearchResult, OSMSearchResult},
  props: {
    searchQuery: {
      type: String,
      default: '',
    },
    osmLocationSelected: {
      type: Function,
      default: (result: OsmSearchResult | null) => {},
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
      storyPointRemoteResults: [] as storyPoint[],
      localSearchQuery: this.searchQuery,
    }
  },
  watch: {
    searchQuery(newVal) {
      this.localSearchQuery = newVal;
    },
  },
  methods: {
    performSearch() {
      if (searchTimeout) clearTimeout(searchTimeout);
      searchTimeout = setTimeout(async () => {
        this.osmSearchResults = await openStreetMapSearch(this.localSearchQuery);
        this.storyPointRemoteResults = await storyPointSearch(this.localSearchQuery);
      }, 400);
    },
  }
});
</script>

<template>
  <v-sheet id="sheet">
    <v-text-field v-model="localSearchQuery" label="Search..." color="primary" @input="performSearch()"></v-text-field>
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
            <v-virtual-scroll
                :items="storyPointRemoteResults"
                :item-height="48"
                style="height: 45vh;"
            >
              <template v-slot="{ item }">
                <StoryPointSearchResult
                    :story-point="item"
                    :on-press="console.log"  />
              </template>
            </v-virtual-scroll>
          </v-window-item>

          <v-window-item value="openStreetMap">
            <v-virtual-scroll
                :items="osmSearchResults"
                :item-height="48"
                style="height: 45vh;"
            >
              <template v-slot="{ item }">
                <OSMSearchResult
                    :key="item.place_id"
                    :osmSearchResult="item"
                    :onPress="() => {osmLocationSelected(item)}"
                ></OSMSearchResult>
              </template>
            </v-virtual-scroll>
          </v-window-item>
        </v-window>
      </v-card-text>
    </v-card>
  </v-sheet>
</template>

<style scoped>
.virtual-scroll {
  height: 50vh;
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