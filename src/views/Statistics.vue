<template>
      <view-loading v-if="loading"></view-loading>
      <v-container v-else>
        <v-tabs
          v-model="tab"
          center-active
          grow
        >
          <v-tab>
            {{ recent }}
            <v-icon class="ml-2">mdi-clock</v-icon>
          </v-tab>
          <v-tab>
            {{ goal }}
            <v-icon class="ml-2">mdi-arm-flex</v-icon>
          </v-tab>
          <v-tab>
            {{ distribution }}
            <v-icon class="ml-2">mdi-chart-donut</v-icon>
          </v-tab>
        </v-tabs>
        <v-tabs-items v-model="tab">
          <v-tab-item>
            <time-graph></time-graph>
          </v-tab-item>
          <v-tab-item>
            <goal-stats :currDate="currDate"></goal-stats>
          </v-tab-item>
          <v-tab-item>
            <distribution-stats :currDate="currDate"></distribution-stats>
          </v-tab-item>
        </v-tabs-items>
      </v-container>
</template>

<script lang="ts">
import { defineComponent, ref, Ref, reactive, onMounted, computed, toRefs, onUnmounted } from '@vue/composition-api'
import { useDisruptions } from '@/store/disruptions'
import { graphColors } from '@/store/constants'
import { Tag } from '@/model/disruption'
import { getMinutesFromDisruption } from '@/model/disruption'
import ViewLoading from '@/components/ViewLoading.vue'
import DistributionStats from '@/components/stats/DistributionStats.vue'
import GoalStats from '@/components/stats/GoalStats.vue'
import TimeGraph from '@/components/stats/TimeGraph.vue'
import moment from 'moment'
import colors from 'vuetify/es5/util/colors'
import fetchAPI from '@/network/request'
//syncrhonized step charts Disruption Time vs Inverted (Work Time)
export default defineComponent({
  name: 'Statistics',
  components: {
    ViewLoading,
    DistributionStats,
    GoalStats,
    TimeGraph
  },
  setup() {
    const { disruptions, tags, loadDisruptions, loadTags, loadThreshold } = useDisruptions()
    const loading = ref(true)
    const tab = ref(0)
    const deviceWidth = ref(window.screen.width)
    const computedSubs = reactive({
      recent: computed(() => deviceWidth.value <= 480 ? '' : 'Recent'),
      goal: computed(() => deviceWidth.value <= 480 ? '' : 'Status'),
      distribution: computed(() => deviceWidth.value <= 480 ? '' : 'Distribution')
    })

    const currDate = new Date()
    let debouncer : any

    function resizeHandler(e: Event) {
      if(debouncer) clearTimeout(debouncer)
      debouncer = setTimeout(() => deviceWidth.value = window.screen.width, 200)
    }

    onMounted(async () => {
      await Promise.all([loadDisruptions(), loadTags(), loadThreshold()])
      loading.value = false
      window.addEventListener('resize', resizeHandler)
    })

    onUnmounted(() => {
      window.removeEventListener('resize', resizeHandler)
      clearTimeout(debouncer)
    })

    return {  loading, status, currDate, tab, ...toRefs(computedSubs) }
  }
})
</script>