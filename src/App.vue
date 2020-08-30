<template>
  <v-app>
    <v-app-bar
      app
      elevation="0"
      color="white"
      v-if="loggedRoutes.some(name => name == $route.name)"
    >
      <v-spacer></v-spacer>
      <v-btn icon @click="$router.replace('/').catch(() => {})">
          <v-icon>mdi-home</v-icon>
      </v-btn>
      <v-btn icon @click="$router.replace('/stats').catch(() => {})">
          <v-icon>mdi-finance</v-icon>
      </v-btn>
      <v-btn icon @click="$router.replace('/settings').catch(() => {})">
          <v-icon>mdi-cog</v-icon>
      </v-btn>
    </v-app-bar>

    <v-main>
      <v-slide-x-transition mode="out-in" :hide-on-leave=true>
        <router-view></router-view>
      </v-slide-x-transition>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { ref } from '@vue/composition-api'
import Vue from 'vue';
import Home from './views/Home.vue'

export default Vue.extend({
  name: 'App',

  components: {
    Home,
  },

  setup() {
    if(!window.location.href.includes('www')) window.location.href = 'https://www.habbit-beta.ml/'
    const loggedRoutes = ref(['Home', 'Statistics', 'Settings'])
    return { loggedRoutes }
  }
});
</script>
