<template>
  <v-container>
    <v-row>
      <v-col md="4" sm="12">
        <v-list>
          <v-subheader>Settings</v-subheader>
          <v-list-item-group v-model="currSetting" color="primary">
            <v-list-item>
              <v-list-item-title>Preferences</v-list-item-title>
              <v-list-item-icon>
                <v-icon>mdi-brush</v-icon>
              </v-list-item-icon>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>Tags</v-list-item-title>
              <v-list-item-icon>
                <v-icon>mdi-tag-outline</v-icon>
              </v-list-item-icon>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>Account</v-list-item-title>
              <v-list-item-icon>
                <v-icon>mdi-account-circle</v-icon>
              </v-list-item-icon>
            </v-list-item>
          </v-list-item-group>
        </v-list>
      </v-col>
      <v-col md="8" sm="12">
        <component :is="pages[currSetting]"></component>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from '@vue/composition-api'
import TagSettings from '@/components/TagSettings.vue'
import Preferences from '@/components/Preferences.vue'
import AccountSettings from '@/components/AccountSettings.vue'
export default defineComponent({
  name: 'Settings',
  components: {
    TagSettings,
    Preferences,
    AccountSettings
  },
  setup() {
    const currSetting = ref(0)

    watch(currSetting, (curr, prev) => {
      if(curr == null) currSetting.value = prev
    })

    const pages = [
      'Preferences',
      'TagSettings',
      'AccountSettings'
    ]

    return { currSetting, pages }
  }
})
</script>