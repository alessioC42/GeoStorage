<script lang="ts">
import {defineComponent, ref, type Ref} from 'vue'

let storyPointID: Ref<string> = ref('')

function initStoryPointEditor() {

}

export default defineComponent({
  name: "StoryPointEditor",
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
  watch: {
    storyPointID: {
      immediate: true,
      handler(newVal: string) {
        storyPointID.value = newVal;
        initStoryPointEditor();
      }
    }
  },
  methods: {
  }
})
</script>
<template>
  <v-btn @click="closeEditor">close</v-btn>
</template>