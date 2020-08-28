<template>
    <v-container>
        <h3 class="font-weight-medium">Dark mode</h3>
        <v-switch v-model="dark.state" :label="dark.label" @change="updateDarkMode"></v-switch>
        <h3 class="font-weight-medium">Tick</h3>
        <v-switch v-model="tickSound.state" :label="tickSound.label" @change="updateTickSound"></v-switch>
    </v-container>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, computed } from '@vue/composition-api'
import { useSettings } from '@/store/settings'
import fetchAPI from '@/network/request'
export default defineComponent({
  name: 'Preferences',
  setup() {
    const { settings } = useSettings()
    //for dark mode, utilize theming or 'dark' props. Figure something out that is easy to scale.
    const dark: any = reactive({
        state: settings.dark,
        label: computed(() => dark.state ? "Dark" : "Light")
    })
    const tickSound: any = reactive({
        state: settings.tickSound,
        label: computed(() => tickSound.state ? "On" : "Off")
    })

    const updateDarkMode = () => {
     updateRemote('dark', dark.state)
      settings.dark = dark.state
    }

    const updateTickSound = () => {
      updateRemote('tickSound', tickSound.state)
      settings.tickSound = tickSound.state
    }

    const updateRemote = (label: string, newValue: any) => {
      fetchAPI('/user/settings', {
        method: 'PATCH',
        body: JSON.stringify({
          [label]: newValue
        })
      })
    }

    return { dark, tickSound, updateDarkMode, updateTickSound }
  }
})
</script>