<script lang="ts">

import {defineComponent} from "vue";
import type {remoteFile, storyPoint} from "@/types";
import FileCard from "@/components/FileCard.vue";
import {DataProvider} from "@/dataProvider";


export default defineComponent({
  name: 'DocumentViewer',
  components: {FileCard},
  data(vm) {
    return {
      storyPoint: null as storyPoint | null,
      remoteFiles: [] as remoteFile[],
    }
  },
  props: {
    storyPointID: {
      type: String,
      required: true
    }
  },
  watch: {
    storyPointID: {
      immediate: true,
      handler(newValue) {this.storyPoint = newValue;this.initState();}
    }
  },
  methods: {
    async initState() {
      this.remoteFiles = await DataProvider.getInstance().getAllFiles(this.storyPointID);
    },
    getThumbnail(file: remoteFile) {
      return 'https://via.placeholder.com/150';
    },
  }
});


</script>

<template>
  <v-app>
    <v-app-bar
      color="secondary"
      style="border-radius: 5px"
    >
      <v-toolbar-title style="font-size: large">Stored Documents for your StoryPoint</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon="mdi-plus" />
      <v-btn icon="mdi-download" />
    </v-app-bar>
    <v-sheet style="height: 100%;margin-top: 85px;overflow-y: scroll; overflow-x: hidden">
      <v-row style="padding-right: 10px">
        <FileCard
            v-for="(file, index) in remoteFiles"
            :key="index"
            :file="file"
            :refresh-everything="initState"
        />
      </v-row>
    </v-sheet>
  </v-app>
</template>

<style scoped>

</style>