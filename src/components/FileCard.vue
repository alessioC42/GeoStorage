<template>
    <v-card class="file-card">
      <v-img
          :src="getThumbnail(file)"
          aspect-ratio="1.8"
          class="grey lighten-2"
      >
        <v-card-title>{{ file.filename }}</v-card-title>
      </v-img>

      <v-card-actions>
        <v-btn icon="mdi-download"></v-btn>
        <v-btn icon="mdi-delete"></v-btn>
        <v-btn icon="mdi-rename"></v-btn>
      </v-card-actions>
    </v-card>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import type { remoteFile } from '@/types';

export default defineComponent({
  props: {
    file: {
      type: Object as () => remoteFile,
      required: true,
    },
    refreshEverything: {
      type: Function,
      required: true
    }
  },
  methods: {
    getThumbnail(file: remoteFile) {
      return 'https://via.placeholder.com/150';
    },
  },
});
</script>

<style scoped>
.file-card {
  margin-left: 14px;
  margin-bottom: 16px;
  margin-right: 2px;
  max-width: 350px;
  max-height: 250px;
}
</style>