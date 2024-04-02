<script setup lang="ts">
import { watchEffect, ref } from 'vue';
import type {OsmSearchResult} from "@/types";

let title = 'Place Description';
let subtitle = 'A description of a place';
let isLoading = ref(false);

async function loadPlace() {
  if (props.latLngTuple === null) return;
  isLoading.value = true;
  const result = await fetch(`https://nominatim.openstreetmap.org/reverse.php?lat=${props.latLngTuple[0]}&lon=${props.latLngTuple[1]}&format=jsonv2`);
  const osmResult: OsmSearchResult = await result.json();
  title =(osmResult.address?.house_number || '') + ' ' + (osmResult.address?.road || '') + ' ' + (osmResult.address?.city || '') + `(${props.latLngTuple[0].toFixed(8)}/${props.latLngTuple[1].toFixed(8)})`;
  subtitle = osmResult.display_name || `Coordinates: ${props.latLngTuple[0]}, ${props.latLngTuple[1]}`;
  isLoading.value = false;
}

const props = defineProps<{
  latLngTuple: [number, number] | null
  onOpenPlace: Function
}>();

watchEffect(() => {
  if (props.latLngTuple) {
    loadPlace();
  }
});

</script>

<template>
  <v-sheet id="sheet" :hidden="latLngTuple === null || isLoading">
    <v-card-title>{{ title }}</v-card-title>
    <v-card-subtitle>{{ subtitle }}</v-card-subtitle>
    <v-card-text> </v-card-text>
    <v-card-actions id="actions">
      <v-btn v-if="props.latLngTuple != null" :href="`https://www.google.com/maps/search/?api=1&query=${props.latLngTuple[0]},${props.latLngTuple[1]}`" target="_blank">GOOGLE MAPS</v-btn>
      <v-btn @click="onOpenPlace">Open</v-btn>
    </v-card-actions>
    <v-progress-circular v-if="isLoading" indeterminate></v-progress-circular>
  </v-sheet>
</template>

<style scoped>
#actions {
  display: flex;
  justify-content: flex-end;
}
</style>