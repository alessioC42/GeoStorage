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
      isLoading: true
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
        this.reloadFileList();
      }
    }
  },
  methods: {
    async uploadNewFile() {
      const res: [Blob, string] | null = await DataProvider.getInstance().getFileBlob();
      if (!res) return;
      console.log("start uploading...");
      await DataProvider.getInstance().uploadFile(res[0], res[1], latest);
      console.log("finished uploading!");
      await this.reloadFileList();
    },
    async reloadFileList() {
      this.isLoading = true;
      this.remoteFiles = [];
      setTimeout( async() => {
        this.remoteFiles = await DataProvider.getInstance().getAllFiles(this.storyID);
        this.isLoading = false;
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
      <v-btn icon="mdi-reload" @click="reloadFileList"></v-btn>
      <v-btn icon="mdi-plus" @click="uploadNewFile" />
      <v-btn icon="mdi-download" @click="DataProvider.getInstance().downloadStoryArchive(storyID)" />
    </v-app-bar>
    <v-sheet style="height: 100%;margin-top: 85px;overflow-y: scroll; overflow-x: hidden">
      <v-row style="padding-right: 10px">
        <v-progress-circular class="center-screen" indeterminate v-if="isLoading"></v-progress-circular>
        <FileCard
            v-for="(file, index) in remoteFiles"
            :key="index"
            :file="file"
            :story-point-id="storyID"
            :refresh-everything="reloadFileList"
            v-else
        />
        <div
            class="center-screen"
          v-if="remoteFiles.length === 0 && !isLoading"
        >
          <v-icon size="100">mdi-file-find-outline</v-icon>
          <h2>No files found</h2>
        </div>
      </v-row>
    </v-sheet>
  </v-app>
</template>

<style scoped>
.center-screen {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>