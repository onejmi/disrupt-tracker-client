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
                    <tag-selector @select="submitTag" @discard="discard" :open="showTagMenu"></tag-selector>
                </v-dialog>
                <v-snackbar
                    v-if="snackbar"
                    v-model="snackbar"
                    timeout="3000"
                    >
                    {{ errorMessage }}

                    <template v-slot:action="{ attrs }">
                        <v-btn
                        color="blue"
                        text
                        v-bind="attrs"
                        @click="snackbar = false"
                        >
                        Close
                        </v-btn>
                    </template>
            </v-snackbar>
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
import { useDisruptions } from '@/store/disruptions'

export default defineComponent({
    name: 'Home',
    components: {
        TimeElapsed,
        TagSelector
    },
    setup(props, context) {
      const loading = ref(false)
      const showTagMenu = ref(false)
      const { disruptions, loadDisruptions, disrupted, lastStartTime, loadNonce } = useDisruptions()
      const buttonStyle = reactive({
          content: disrupted.value ? 'Back to work!' : 'Disrupt',
          color: disrupted.value ? 'success' : 'error'
      })
      const errorMessage = ref('')
      const snackbar = ref(false)

      const submitTag = async (tag: any) => {
            const disruption = {
                tagID: tag.id,
                startTime: lastStartTime.value,
                endTime: Date.now()
            }
            disruptions.value.push(disruption)
            buttonStyle.content = 'Disrupt'
            buttonStyle.color = 'error'
            disrupted.value = false
            showTagMenu.value = false
            fetchAPI('/user/disruptions', { method: 'post', body: JSON.stringify(disruption) }, true, true).then((response) => {
                if(!response.ok) {
                    errorMessage.value = "There's a time conflict!"
                    snackbar.value = true
                }
            })
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

      const discard = () => {
          buttonStyle.content = 'Disrupt'
          buttonStyle.color = 'error'
          disrupted.value = false
          showTagMenu.value = false
      }

      onMounted(async () => {
          loadDisruptions()
          loadNonce()
      })

      return { loading, disrupted, lastStartTime, showTagMenu, toggle, submitTag, errorMessage, snackbar, 
      discard, ...toRefs(buttonStyle) }
    }
})

</script>