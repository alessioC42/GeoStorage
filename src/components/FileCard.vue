<template>
    <v-card class="file-card">
      <v-img
          :src="thumbnail"
          aspect-ratio="1.8"
          class="grey lighten-2"
      >
        <v-tooltip location="bottom">
          <template v-slot:activator="{ props }">
            <v-card-title class="title" v-bind="props">{{ file.filename }}</v-card-title>
          </template>
          <span>{{ file.filename }}</span>
        </v-tooltip>
      </v-img>

      <v-card-actions>
        <v-btn icon="mdi-download" @click="downloadFile"></v-btn>
        <v-btn icon="mdi-delete" @click="confirmDelete"></v-btn>
        <v-btn icon="mdi-rename" @click="showRenameDialog = true"></v-btn>
      </v-card-actions>
      <v-card-subtitle>{{formatBytes(file.filesize)}} - {{ getTimeCreatedString() }}</v-card-subtitle>
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
      <v-dialog v-model="confirmDeleteDialog" max-width="500px">
        <v-card>
          <v-card-title class="headline">Confirm Deletion</v-card-title>
          <v-card-text>
            Are you sure you want to delete this file?
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" @click="confirmDeleteDialog = false">Cancel</v-btn>
            <v-btn color="red darken-1" @click="deleteFile">Delete</v-btn>
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
      thumbnail: '',
      confirmDeleteDialog: false,
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
    loadThumbnail() {
      let extension: string = this.file.filename.toLowerCase().split(".").pop() ?? "";

      if (["jpg","jpeg","png","gif","webp","svg","tiff"].includes(extension)) {
        DataProvider.getInstance().getThumnnailBase64Image(this.storyPointId, this.file._id)
            .then(base64Image => {
              this.thumbnail = base64Image;
            });
      } else if (["pdf"].includes(extension)) {
        this.thumbnail = window.location.origin+ '/pdf.png';
      } else {
        console.log(window.location.origin+'/file.png');
        this.thumbnail = window.location.origin+'/file.png';
      }
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
    confirmDelete() {
      this.confirmDeleteDialog = true;
    },
    async deleteFile() {
      await DataProvider.getInstance().deleteStoryFile(this.storyPointId, this.file._id);
      this.confirmDeleteDialog = false;
      setTimeout(this.refreshEverything, 400);
    },
    async renameFile(newFileName: string) {
      await DataProvider.getInstance().renameStoryFile(this.storyPointId, this.file._id, newFileName);
      setTimeout(this.refreshEverything, 400);
    },
    getTimeCreatedString() {
      let unixTime = this.file.created_at;
      return (new Date(unixTime))
    }
  },
  created() {
      this.loadThumbnail()
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

.title {
  background-color: rgba(255, 255, 255, 0.9);
}
</style>