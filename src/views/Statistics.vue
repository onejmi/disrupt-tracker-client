<template>
      <view-loading v-if="loading"></view-loading>
      <v-container v-else>
        <v-row>
          <v-col cols="7" align-self="center">
            <time-graph></time-graph>
          </v-col>
          <v-col>
            <goal-stats :currDate="currDate"></goal-stats>
            <distribution-stats :currDate="currDate"></distribution-stats>
          </v-col>
        </v-row>
      </v-container>
</template>

<script lang="ts">
import { defineComponent, ref, Ref, reactive, onMounted, computed } from '@vue/composition-api'
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
    const { disruptions, tags, loadDisruptions, loadTags } = useDisruptions()
    const loading = ref(true)

    const currDate = new Date()

    onMounted(async () => {
      await loadDisruptions()
      await loadTags()
      loading.value = false
    })

    return {  loading, status, currDate }
  }
})
</script>