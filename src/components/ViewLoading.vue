<template>
    <v-container fluid fill-height>
      <v-row class="text-center justify-center">
        <v-col>
          <v-progress-circular indeterminate color="grey"></v-progress-circular>
        </v-col>
      </v-row>
    </v-container>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api'
export default defineComponent({
  name: 'ViewLoading',
  setup() {}
})
</script>