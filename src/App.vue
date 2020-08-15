<template>
  <v-app>
    <v-app-bar
      app
      elevation="0"
      color="white"
    >
      <v-spacer></v-spacer>
      <v-btn icon @click="$router.replace('/')">
          <v-icon>mdi-home</v-icon>
      </v-btn>
      <v-btn icon @click="$router.replace('/stats')">
          <v-icon>mdi-finance</v-icon>
      </v-btn>
      <v-btn icon @click="$router.replace('/settings')">
          <v-icon>mdi-cog</v-icon>
      </v-btn>
    </v-app-bar>

    <v-content>
      <router-view></router-view>
    </v-content>
  </v-app>
</template>

<script lang="ts">
import Vue from 'vue';
import Home from './views/Home.vue'

export default Vue.extend({
  name: 'App',

  components: {
    Home,
  },

  setup() {
    
  }
});
</script>
