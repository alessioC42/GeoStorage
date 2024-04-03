<script setup lang="ts">
const props = defineProps({
  onPress: Function,
  title: String,
  subtitle: String,
});
</script>

<template>
  <v-list-item
      @click="props.onPress"
  >
    <v-list-item-title>{{ props.title }}</v-list-item-title>
    <v-list-item-subtitle>{{ props.subtitle}}</v-list-item-subtitle>
  </v-list-item>
</template>

<style scoped>

</style>