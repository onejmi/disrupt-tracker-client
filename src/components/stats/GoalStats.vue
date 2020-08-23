<template>
    <view-loading v-if="loadingThresh"></view-loading>
    <v-card class="mb-6" v-else>
      <v-card-title>Goal Status</v-card-title>
      <v-card-subtitle>{{ threshold - Math.floor(status.value) + "/" + threshold}} minutes</v-card-subtitle>
      <v-card-text>
        <v-slider
        max="1000"
        step="10"
        v-model="threshold"
        @change="writeThresholdChange"
        thumb-label></v-slider>
        <v-progress-linear
          :value="100 - status.percentage"
          :color="status.color"
          height="35"
        >
        <span style="font-size: 20px;">{{ status.emoji }}</span>
        </v-progress-linear>
      </v-card-text>
    </v-card>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, computed, onMounted, watchEffect, watch } from '@vue/composition-api'
import { getMinutesFromDisruption } from '@/model/disruption'
import { useDisruptions } from '@/store/disruptions'
import fetchAPI from '@/network/request'
import ViewLoading from '@/components/ViewLoading.vue'
export default defineComponent({
  name: 'GoalStats',
  components: {
    ViewLoading
  },
  props: {
    currDate: {
      type: Date,
      required: true
    }
  },
  setup(props, context) {
    const loadingThresh = ref(true)
    const { disruptions } = useDisruptions()
    const threshold = ref(0)
    const minPieDate = new Date(props.currDate)
    minPieDate.setDate(minPieDate.getDate() - 7)
    let statusProgress : number = 0
    const status : any = reactive({
      value: 0,
      percentage: computed(() => 100 * (status.value / threshold.value)),
      emoji: computed(() => 
        status.percentage < 40 ? "😀" : status.percentage < 75 ? "🙂" : status.percentage < 100 ? "😐" : "😕"),
      color: computed(() => 
      status.percentage < 40 ? "green" : status.percentage < 75 ? "blue" : status.percentage < 100 ? "yellow" : "red")
    })

    function genDistribution() {
        disruptions.value
        .filter((disruption) => disruption.endTime >= minPieDate.getTime() && getMinutesFromDisruption(disruption) >= 1)
        .forEach((disruption) => {
        status.value += getMinutesFromDisruption(disruption)
      })
    }

    function writeThresholdChange(value: number) {
      fetchAPI('/user/threshold', {
        method: 'PUT',
        body: JSON.stringify({
          threshold: value
        })
      })
    }

    onMounted(async () => {
      threshold.value = (await fetchAPI('/user/threshold')).threshold
      genDistribution()
      loadingThresh.value = false
      console.log(statusProgress)
    })

    return { status, threshold, writeThresholdChange, loadingThresh }
  }
})
</script>