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
        <v-btn icon="mdi-download" @click="downloadFile"></v-btn>
        <v-btn icon="mdi-delete" @click="deleteFile"></v-btn>
        <v-btn icon="mdi-rename" @click="showRenameDialog = true"></v-btn>
      </v-card-actions>
      <v-card-subtitle>{{formatBytes(file.filesize)}}</v-card-subtitle>
      <v-dialog v-model="showRenameDialog" max-width="500px">
        <v-card>
          <v-card-title class="headline">Rename File</v-card-title>
          <v-card-text>
            <v-text-field v-model="newFileName" label="New File Name"></v-text-field>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" @click="showRenameDialog = false">Cancel</v-btn>
            <v-btn color="blue darken-1" @click="applyRename">Set</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-card>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import type { remoteFile } from '@/types';
import {DataProvider} from "@/dataProvider";

export default defineComponent({
  props: {
    file: {
      type: Object as () => remoteFile,
      required: true,
    },
    refreshEverything: {
      type: Function,
      required: true
    },
    storyPointId: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      showRenameDialog: false,
      newFileName: this.file.filename,
    };
  },
  methods: {
    async applyRename() {
      if (this.newFileName) {
        await this.renameFile(this.newFileName);
        this.showRenameDialog = false;
        this.newFileName = '';
      }
    },
    getThumbnail(file: remoteFile) {
      return 'https://via.placeholder.com/150';
    },
    formatBytes(bytes: number, decimals: number = 2) {
      if (bytes === 0) return '0 Bytes';

      const k = 1024;
      const dm = decimals < 0 ? 0 : decimals;
      const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

      const i = Math.floor(Math.log(bytes) / Math.log(k));

      return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    },
    async downloadFile() {
      console.log(this.storyPointId, this.file._id, this.file.filename)
      await DataProvider.getInstance().downloadStoryFile(this.storyPointId, this.file._id, this.file.filename);
    },
    async deleteFile() {
      await DataProvider.getInstance().deleteStoryFile(this.storyPointId, this.file._id);
      setTimeout(this.refreshEverything, 400);
    },
    async renameFile(newFileName: string) {
      await DataProvider.getInstance().renameStoryFile(this.storyPointId, this.file._id, newFileName);
      setTimeout(this.refreshEverything, 400);
    }
  },
});
</script>

<style scoped>
.file-card {
  margin-left: 14px;
  margin-bottom: 16px;
  margin-right: 2px;
  width: 270px;
  height: 250px;
}
</style>