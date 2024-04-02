<script lang="ts">
import {defineComponent, ref, type Ref} from 'vue'
import {MdEditor} from "md-editor-v3";
import 'md-editor-v3/lib/style.css';
import {DataProvider} from "@/dataProvider";

export default defineComponent({
  name: "StoryPointEditor",
  components: {MdEditor},
  title: 'Story Point Editor',
  props: {
    storyPointID: {
      type: String,
      required: true,
    },
    closeEditor: {
      type: Function,
      required: true,
    }
  },
  data() {
    return {
      tab: 'one',
      title: "Story Point Editor",
      description: ref(""),
      dialog: false,
    }
  },
  watch: {
    storyPointID: {
      immediate: true,
      handler(newVal: string) {
        this.initStoryPointEditor();
      }
    },
  },
  methods: {
    async initStoryPointEditor() {
      if (this.storyPointID === "") return;
      let storyPoint = await DataProvider.getInstance().getEntireStoryPoint(this.storyPointID);
      this.title = storyPoint?.title ?? "Error fetching title";
      this.description = storyPoint?.description ?? "Error fetching description";
    },
    async saveAndExit() {
      //todo
      this.closeEditor();
    },
    async deleteStoryPoint() {
      //todo
      this.closeEditor();
    }
  }
})
</script>

<template>
  <v-card>
    <v-row>
      <v-col>
        <v-card-title style="cursor: pointer" @click="dialog = true">
          {{ title }}
          <v-icon>mdi-tag-edit</v-icon>
          <v-dialog v-model="dialog" max-width="340" @close="dialog = false">
            <v-card>
              <v-card-title>
                <span class="text-h5">Edit title</span>
              </v-card-title>
              <v-card-text>
                <v-text-field v-model="title" label="Edit title" single-line autofocus></v-text-field>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" @click="dialog = false">Save</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-card-title>
      </v-col>
      <v-col class="items-end">
        <v-btn @click="deleteStoryPoint" color="red darken-1">delete</v-btn>
        <v-btn @click="closeEditor" color="primary">close</v-btn>
        <v-btn @click="saveAndExit" color="primary">save</v-btn>
      </v-col>
    </v-row>
    <v-tabs
        v-model="tab"
        bg-color="primary"
    >
      <v-tab value="one">Description</v-tab>
      <v-tab value="two">Logs</v-tab>
      <v-tab value="three">Images</v-tab>
      <v-tab value="four">Documents</v-tab>
    </v-tabs>

    <v-card-text>
      <v-window v-model="tab">
        <v-window-item value="one">
          <MdEditor style="height: 75vh" v-model="description" language="en-US" preview-theme="vuepress"/>
        </v-window-item>
        <v-window-item value="two">
          Two
        </v-window-item>

        <v-window-item value="three">
          Three
        </v-window-item>
        <v-window-item value="four">
          Three
        </v-window-item>
      </v-window>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.items-end {
  display: flex;
  justify-content: flex-end;

}
.items-end * {
  margin: 8px 8px 8px 0;
}
</style>