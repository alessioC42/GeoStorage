<script lang="ts">

import {defineComponent, ref} from "vue";
import IconStoryPoint from "@/components/icons/IconStoryPoint.vue";
import IconMainAppIcon from "@/components/icons/IconMainAppIcon.vue";
import {DataProvider} from "@/dataProvider";

export default defineComponent({
  name: 'LoginScreen',
  components: {IconMainAppIcon, IconStoryPoint},
  props: {
    id: String,
  },
  setup() {
    DataProvider.getInstance().firstAuthCheck();
    return {
      username: ref(''),
      password: ref(''),
      loginStatusText: ref(''),
      loginSuccessful: false,
      dialog: ref(false)
    }
  },
  methods: {
    async authenticate() {
      const [loginStatusText, loginSuccessful] = await DataProvider.getInstance().authenticate(this.username, this.password);
      this.loginSuccessful = loginSuccessful;
      this.loginStatusText = loginStatusText;

      if (!this.loginSuccessful) {
        this.dialog = true;
      }
      await DataProvider.getInstance().isAuthenticated();
    }
  }
});

</script>

<template>
  <div class="appicon">
    GeoStorage
  </div>
  <v-sheet id="sheet">
    <v-card-title>Login</v-card-title>
    <v-card-text class="grey">Use the credentials provided by your company to authenticate on GeoStorage. Contact your organisation Administrator if you have lost your credentials.</v-card-text>
    <v-text-field v-model="username" label="Email" type="email"></v-text-field>
    <v-text-field v-model="password" label="Password" type="password"></v-text-field>
    <v-btn @click="authenticate">Login</v-btn>
  </v-sheet>
  <v-dialog v-model="dialog" max-width="300px">
    <v-card>
      <v-card-title>Login Status</v-card-title>
      <v-card-text>{{ loginStatusText }}</v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="green darken-1" @click="dialog = false">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
#sheet {
  max-width: 90%;
  width: 500px;
  padding: 10px;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: auto;
  border-width: 5px;
  border-radius: 5px;
}
.appicon {
  position: fixed;
  top: 5px;
  left: 50%;
  transform: translate(-50%, 0);
  align-content: center;
  z-index: 1;
  font-size: 5em;
}
.grey {
  color: grey;
}
</style>