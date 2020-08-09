<template>
  <v-container fluid fill-height>
        <v-row class="text-center justify-center">
            <v-col>
                <v-progress-circular indeterminate v-if="loading"></v-progress-circular>
                <v-btn @click="toggle" :color="color" v-else>
                    {{ content }}
                    <v-icon class="ml-2">mdi-timer</v-icon>
                </v-btn>
                <time-elapsed :start-time="lastStartTime" v-if="disrupted"/>
            </v-col>
        </v-row>
  </v-container>
</template>

<script lang="ts">

import {defineComponent, reactive, ref, Ref, toRefs} from '@vue/composition-api'
import TimeElapsed from '@/components/TimeElapsed.vue'
import { Disruption } from '@/model/disruption'

export default defineComponent({
    name: 'Home',
    components: {
        TimeElapsed
    },
    setup() {
      const loading = ref(false)
      const disrupted = ref(false)
      const disruptions : Ref<Disruption[]> = ref([])
      const lastStartTime = ref(-1)
      const buttonStyle = reactive({
          content: 'Disrupt',
          color: 'error'
      })
      const toggle = () => {
          if (disrupted.value) {
              //todo change this to add option for tagging, but just for now..
              disruptions.value.push({
                  tagID: 6263,
                  startTime: lastStartTime.value,
                  endTime: Date.now()
              })
              buttonStyle.content = 'Disrupt'
              buttonStyle.color = 'error'
          } else {
              lastStartTime.value = Date.now()
              buttonStyle.content = 'Back to work!'
              buttonStyle.color = 'success'
          }
          disrupted.value = !disrupted.value
      }
      return { loading, disrupted, lastStartTime, toggle, ...toRefs(buttonStyle) }
    }
})

</script>
