<template>
    <v-container>
        <v-btn @click="login('google')">
            Login with Google
        </v-btn>
        <v-btn @click="login('github')">
            Login with Github
        </v-btn>
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
        // const bc = new BroadcastChannel('auth_channel');
        // bc.onmessage = (ev) => {
        //     if(ev.data == 'success') { 
        //         bc.close()
        //         context.root.$router.replace('/')
        //     }
        // }
    }
    return { login }
  }
})
</script>