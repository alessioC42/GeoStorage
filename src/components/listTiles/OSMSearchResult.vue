<script setup lang="ts">
import type { OsmSearchResult } from '@/types'

const props = defineProps<{
  onPress: Function
  osmSearchResult: OsmSearchResult
}>()
</script>

<template>
  <v-list-item
    @click="
      (_) => {
        props.onPress(props.osmSearchResult)
      }
    "
  >
    <v-list-item-title>{{ osmSearchResult.display_name }}</v-list-item-title>
    <v-list-item-subtitle
      >{{ osmSearchResult.category }} {{ osmSearchResult.type }}</v-list-item-subtitle
    >
  </v-list-item>
</template>

<style scoped>
v-sheet {
  background-color: rgba(255, 255, 3, 0.95);
}
v-list-item-subtitle {
  padding-bottom: 4px;
}
</style>
