<script setup lang="ts">
import type { storyPoint } from '@/types'

const props = defineProps<{
  onPress: Function
  selectedStoryPoint: storyPoint
}>()
</script>

<template>
  <v-list-item
    @click="
      (_) => {
        props.onPress(props.selectedStoryPoint)
      }
    "
  >
    <v-list-item-title>{{ selectedStoryPoint.title }}</v-list-item-title>
    <v-list-item-subtitle class="clamp-description">{{
      selectedStoryPoint.description ?? selectedStoryPoint.coords
    }}</v-list-item-subtitle>
  </v-list-item>
</template>

<style scoped>
v-sheet {
  background-color: rgba(255, 255, 3, 0.95);
}
v-list-item-subtitle {
  padding-bottom: 4px;
}
.clamp-description {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
