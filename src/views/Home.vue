<template>
  <v-container fluid fill-height>
        <v-row class="text-center justify-center">
            <v-col>
                <v-progress-circular indeterminate color="grey" v-if="loading"></v-progress-circular>
                <v-btn @click="toggle" :color="color" v-else>
                    {{ content }}
                    <v-icon class="ml-2">mdi-timer</v-icon>
                </v-btn>
                <time-elapsed :start-time="lastStartTime" v-if="disrupted"/>
                <v-dialog
                v-model="showTagMenu"
                max-width="360"
                >
                    <tag-selector @select="submitTag" :open="showTagMenu"></tag-selector>
                </v-dialog>
            </v-col>
        </v-row>
  </v-container>
</template>

<script lang="ts">

import {defineComponent, reactive, ref, Ref, toRefs, onMounted, watch} from '@vue/composition-api'
import TimeElapsed from '@/components/TimeElapsed.vue'
import TagSelector from '@/components/TagSelector.vue'
import { Disruption, Tag } from '@/model/disruption'
import fetchAPI from '@/network/request'

export default defineComponent({
    name: 'Home',
    components: {
        TimeElapsed,
        TagSelector
    },
    setup(props, context) {
      const loading = ref(true)
      const disrupted = ref(false)
      const lastStartTime = ref(-1)
      const showTagMenu = ref(false)
      const disruptions : Ref<Disruption[]> = ref([])
      const buttonStyle = reactive({
          content: 'Disrupt',
          color: 'error'
      })

      const submitTag = (tag: any) => {
            const disruption = {
                tagID: tag.id,
                startTime: lastStartTime.value,
                endTime: Date.now()
            }
            disruptions.value.push(disruption)
            fetchAPI('/user/disruptions', { method: 'post', body: JSON.stringify(disruption) })
            buttonStyle.content = 'Disrupt'
            buttonStyle.color = 'error'
            disrupted.value = false
            showTagMenu.value = false
            //reset menu state
      }
      //lastTimeSync -> mongodb hook
      //remove seemingly useless 'disruptons' reactive variable
      const toggle = () => {
          if (disrupted.value) {
              showTagMenu.value = true
          } else {
              lastStartTime.value = Date.now()
              buttonStyle.content = 'Back to work!'
              buttonStyle.color = 'success'
              disrupted.value = true
          }
      }

      onMounted(async () => {
          disruptions.value = await fetchAPI('/user/disruptions') 
          loading.value = false
      })

      return { loading, disrupted, lastStartTime, showTagMenu, toggle, submitTag, ...toRefs(buttonStyle) }
    }
})

</script>
