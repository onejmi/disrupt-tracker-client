<template>
    <v-container>
        <h3 class="font-weight-medium">Enable dark mode</h3>
        <v-switch v-model="dark.state" :label="dark.label"></v-switch>
    </v-container>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, computed } from '@vue/composition-api'
export default defineComponent({
  name: 'Preferences',
  setup() {
    //for dark mode, utilize theming or 'dark' props. Figure something out that is easy to scale.
    const dark: any = reactive({
        state: false,
        label: computed(() => dark.state ? "Dark" : "Light")
    }) //should get this info from user preferences object in DB

    return { dark }
  }
})
</script>