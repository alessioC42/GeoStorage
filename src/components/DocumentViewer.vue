<script lang="ts">

import {defineComponent} from "vue";
import type {remoteFile, storyPoint} from "@/types";
import FileCard from "@/components/FileCard.vue";
import {DataProvider} from "@/dataProvider";

let latest = "";

export default defineComponent({
  name: 'DocumentViewer',
  computed: {
    DataProvider() {
      return DataProvider
    }
  },
  components: {FileCard},
  data(vm) {
    return {
      storyPoint: null as storyPoint | null,
      storyID: "",
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
      async handler(newValue) {
        if (newValue === "") return;
        this.storyID = newValue;
        latest = newValue;
        this.remoteFiles = await DataProvider.getInstance().getAllFiles(this.storyID);
      }
    }
  },
  methods: {
    getThumbnail(file: remoteFile) {
      return 'https://via.placeholder.com/150';
    },
    async uploadNewFile() {
      const res: [Blob, string] | null = await DataProvider.getInstance().getFileBlob();
      if (!res) return;
      console.log("start uploading...");
      await DataProvider.getInstance().uploadFile(res[0], res[1], latest);
      console.log("finished uploading!");
      setTimeout( async() => {
        this.remoteFiles = await DataProvider.getInstance().getAllFiles(this.storyID);
      }, 500);
    }
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
      <v-btn icon="mdi-plus" @click="uploadNewFile" />
      <v-btn icon="mdi-download" @click="DataProvider.getInstance().downloadStoryArchive(storyID)" />
    </v-app-bar>
    <v-sheet style="height: 100%;margin-top: 85px;overflow-y: scroll; overflow-x: hidden">
      <v-row style="padding-right: 10px">
        <FileCard
            v-for="(file, index) in remoteFiles"
            :key="index"
            :file="file"
            :story-point-id="storyID"
            :refresh-everything="async () => {remoteFiles = await DataProvider.getInstance().getAllFiles(storyID)}"
        />
      </v-row>
    </v-sheet>
  </v-app>
</template>

<style scoped>

</style>