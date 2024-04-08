<script setup lang="ts">
import { watch } from 'vue'
import type { LatLng, LatLngBounds, LatLngTuple, LeafletMouseEvent } from 'leaflet'
import type { ViewChangedEvent } from 'vue-use-leaflet'
import type { storyPoint } from '@/types'
import {
  VMap,
  VMapAttributionControl,
  VMapGoogleTileLayer,
  VMapLayersControl,
  VMapMarker,
  VMapOsmTileLayer,
  VMapPinIcon,
  VMapScaleControl
} from 'vue-map-ui'
import { ref, onMounted } from 'vue'
import { DataProvider } from '@/dataProvider'

const props = defineProps<{
  onMapClick: Function
  onMarkerClick: Function
  searchMarkerLocation: LatLng | null
}>()

const center = ref<LatLngTuple | LatLng>(
  JSON.parse(localStorage.getItem('center') || 'null') || {
    lat: 50.10857952906727,
    lng: 8.67198944091797
  }
)
const zoom = ref(Number(localStorage.getItem('zoom')) || 12)
const bounds = ref<LatLngBounds | null>(
  JSON.parse(localStorage.getItem('bounds') || 'null') || {
    _southWest: { lat: 49.99891228081068, lng: 8.440589904785158 },
    _northEast: { lat: 50.21799622626333, lng: 8.903388977050783 }
  }
)

watch(
  () => props.searchMarkerLocation,
  (newLocation) => {
    if (newLocation) {
      center.value = newLocation
    }
  },
  { immediate: true }
)

function onViewChanged(e: ViewChangedEvent) {
  center.value = e.center
  zoom.value = e.zoom
  bounds.value = e.bounds

  localStorage.setItem('center', JSON.stringify(e.center))
  localStorage.setItem('zoom', JSON.stringify(e.zoom))
  localStorage.setItem('bounds', JSON.stringify(e.bounds))
}

function onMapClicked(e: LeafletMouseEvent) {
  props.onMapClick(e)
}

function onMarkerClicked(e: LeafletMouseEvent, marker: storyPoint) {
  props.onMarkerClick(e, marker)
}

onMounted(() => {
  const storedCenter = localStorage.getItem('center')
  const storedZoom = localStorage.getItem('zoom')
  const storedBounds = localStorage.getItem('bounds')

  if (storedCenter) center.value = JSON.parse(storedCenter)
  if (storedZoom) zoom.value = Number(storedZoom)
  if (storedBounds) bounds.value = JSON.parse(storedBounds)
})

function onMouseDown() {
  document.getElementById('map')?.style.setProperty('cursor', 'grabbing')
}

function onMouseUp() {
  document.getElementById('map')?.style.setProperty('cursor', 'auto')
}
</script>

<template>
  <VMap
    id="map"
    :center="center"
    :zoom="zoom"
    @view-changed="onViewChanged"
    @click="onMapClicked"
    @mousedown="onMouseDown"
    @mouseup="onMouseUp"
  >
    <VMapLayersControl>
      <VMapOsmTileLayer title="OpenStreetMap" />
      <VMapGoogleTileLayer title="G Streets" />
      <VMapGoogleTileLayer title="G Hybrid" type="hybrid" />
      <VMapGoogleTileLayer title="G Terrain" type="terrain" />
      <VMapGoogleTileLayer title="G Satellite" type="satellite" />
    </VMapLayersControl>
    <VMapScaleControl />

    <VMapAttributionControl />
    <VMapMarker
      v-for="(marker, index) in DataProvider.getInstance().stories.value"
      :key="index"
      :latlng="marker.coords"
      @click="onMarkerClicked($event, marker)"
    >
      <VMapPinIcon>
        <v-icon>mdi-format-list-bulleted-type</v-icon>
      </VMapPinIcon>
    </VMapMarker>

    <!--search Marker-->
    <VMapMarker v-if="searchMarkerLocation" :latlng="searchMarkerLocation">
      <VMapPinIcon background-color="red">
        <v-icon>mdi-cursor-default-click</v-icon>
      </VMapPinIcon>
    </VMapMarker>
  </VMap>
</template>

<style scoped>
#map {
}
</style>
