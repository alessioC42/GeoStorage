<script lang="ts">
import {defineComponent, ref} from 'vue'
import {MdEditor} from "md-editor-v3";
import 'md-editor-v3/lib/style.css';
import {DataProvider} from "@/dataProvider";
import type {historyItem, unixTimestamp} from "@/types";

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
      history: ref([] as historyItem[]),
      newMessage: "",
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
    resetValues() {
      this.title = "";
      this.description = "";
      this.history = [];
      this.newMessage = "";
      this.dialog = false;

    },
    async initStoryPointEditor() {
      if (this.storyPointID === "") return;
      let storyPoint = await DataProvider.getInstance().getEntireStoryPoint(this.storyPointID);
      this.title = storyPoint?.title ?? "Error fetching title";
      this.description = storyPoint?.description ?? "Error fetching description";
      this.history = storyPoint?.history ?? []
    },
    async saveAndExit() {
      if (this.newMessage.trim() !== "") {
        this.history.push({
          user_fullname: DataProvider.getInstance().userData.fullname.value,
          created_at: Math.floor(Date.now() / 1000),
          text: this.newMessage,
          user_id: DataProvider.getInstance().userData.fullname.value,
          edited: false
        })
      }

      await DataProvider.getInstance().updateStoryPoint(this.storyPointID, {
        title: this.title,
        description: this.description,
        history: this.history
      });
      this.resetValues();

      this.closeEditor();
    },
    async deleteStoryPoint() {
      //todo
      this.closeEditor();
    },
    unixTimeToDate(unixTime: unixTimestamp) {
      return new Date(unixTime * 1000).toLocaleString();
    },
    deleteHistoryItem(item: historyItem) {
      this.history = this.history.filter((historyItem) => historyItem !== item);
    },
    editHistoryContend(item: historyItem) {
      //todo
    }
  }
})
</script>

<template>
  <v-card id="card">
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
      <v-tab value="two">history</v-tab>
      <v-tab value="three">Images</v-tab>
      <v-tab value="four">Documents</v-tab>
    </v-tabs>

    <v-card-text>
      <v-window v-model="tab">
        <v-window-item value="one">
          <MdEditor style="height: 75vh" v-model="description" language="en-US" preview-theme="vuepress"/>
        </v-window-item>
        <v-window-item style="height: 75vh" value="two">
          <div class="scrollable-list">
            <v-list>
              <v-list-item class="list-item" v-for="historyPoint in history" :key="historyPoint.created_at">
                <v-row>
                  <v-col>
                    <v-list-item-title>{{ historyPoint.user_fullname }} <small>{{unixTimeToDate(historyPoint.created_at)}}</small></v-list-item-title>
                    <v-list-item-media class="list-item-media">{{ historyPoint.text }} <small><i>{{historyPoint.edited? "edited":""}}</i></small></v-list-item-media>
                  </v-col>
                  <v-col>
                    <v-list-item-action class="items-end">
                      <v-btn @click="editHistoryContend(historyPoint)" size="40" icon="mdi-pen" />
                      <v-btn @click="deleteHistoryItem(historyPoint)" size="40" icon="mdi-delete" />
                    </v-list-item-action>
                  </v-col>
                </v-row>

              </v-list-item>
            </v-list>
            <v-textarea
                v-model="newMessage"
                label="Add new message (Upload with save button)"
                auto-grow
            />
          </div>
          <v-btn color="primary">Send</v-btn>
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

.list-item {
  background-color: antiquewhite;
  border-radius: 5px;
  margin: 10px 5px 5px;
}

.list-item-media {
  font-size: larger;
}

.scrollable-list {
  display: flex;
  flex-direction: column-reverse;
  overflow-y: auto;
  height: 75vh;
}

#card {
  background-color: rgba(255, 255, 255, 0.5);
}
</style>