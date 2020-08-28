<template>
    <v-container fluid fill-height>
        <v-row>
            <v-spacer></v-spacer>
            <v-col md="3">
                <v-card class="pa-3" max-width="300">
                    <v-card-title class="justify-center">Sign In</v-card-title>
                    <v-card-text class="justify-center">
                        <v-row class="justify-center mb-4 mt-4">
                            <v-btn @click="login('google')">
                                <v-img class="mr-2" src="@/assets/g-logo.png" height="26" width="26"></v-img>
                                with Google 
                            </v-btn>
                        </v-row>
                        <v-row class="justify-center mb-4 mt-4">
                            <v-btn @click="login('github')">
                                <v-img class="mr-2" src="@/assets/github-32.png" height="26" width="26"></v-img>
                                with Github 
                            </v-btn>
                        </v-row>   
                    </v-card-text>
                </v-card>
            </v-col>
            <v-spacer></v-spacer>
        </v-row>
    </v-container>
</template>

<script lang="ts">
import { defineComponent, ref } from '@vue/composition-api'
import fetchAPI from '@/network/request'
import keys from '@/config/keys'

export default defineComponent({
  name: 'Login',
  setup(props, context) {
    function login(strategy: string) {
        const w = window.open(`${keys.apiURL}/auth/${strategy}`, '_self')
        console.log('oen')
        window.addEventListener('message', (e) => {
            console.log('ome')
            w?.close()
            if(e.data == 'success') context.root.$router.replace('/')
        })
    }
    return { login }
  }
})
</script>