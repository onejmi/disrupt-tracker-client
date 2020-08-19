<template>
    <v-container>
        <h3 class="mb-5 font-weight-medium">Logout of your account</h3>
        <v-btn color="error" @click="logout">Logout</v-btn>
    </v-container>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import { fetchAuth } from '@/network/request'
export default defineComponent({
  name: 'AccountSettings',
  setup(props, context) {
    async function logout() {
        await fetchAuth('/logout', {
            method: 'POST'
        })
        context.root.$router.replace('/login')
    }

    return { logout }
  }
})
</script>