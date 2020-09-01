<template>
    <v-container class="mb-6 text-center">
      <span style="font-size: 20vh;">{{ status.emoji }}</span>
      <h2>Goal Status</h2>
      <v-row>
        <v-spacer></v-spacer>
        <v-col>
          <v-row>
            <v-spacer></v-spacer>
            <v-col>
              <v-slider
              light
              style="width: 175px;"
              max="1000"
              :min="Math.ceil(status.value / 10) * 10"
              step="10"
              v-model="threshold"
              @change="writeThresholdChange"
              thumb-label></v-slider>
            </v-col>
            <v-spacer></v-spacer>
          </v-row>
          <v-row>
            <v-spacer></v-spacer>
            <v-col>
              <v-progress-linear
                :value="100 - status.percentage"
                :color="status.color"
                height="25"
                style="width: 325px"
              >
              <h4>{{ threshold - Math.floor(status.value) + "/" + threshold}} (minutes)</h4>
              </v-progress-linear>
            </v-col>
            <v-spacer></v-spacer>
          </v-row>
        </v-col>
        <v-spacer></v-spacer>
      </v-row>
    </v-container>
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
    const { disruptions, threshold } = useDisruptions()
    const minPieDate = new Date(props.currDate)
    minPieDate.setDate(minPieDate.getDate() - 7)
    let statusProgress : number = 0
    const status : any = reactive({
      value: 0,
      percentage: computed(() => 100 * (status.value / threshold.value)),
      emoji: computed(() => 
        status.percentage < 20 ? "💐" : status.percentage < 55 ? "🌷" : status.percentage < 85 ? "🌹" : "🥀"),
      color: computed(() => 
      status.percentage < 20 ? "green" : status.percentage < 55 ? "blue" : status.percentage < 85 ? "yellow" : "red")
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

    onMounted(() => {
      genDistribution()
    })

    return { status, threshold, writeThresholdChange }
  }
})
</script>

<style scoped>
  >>>.v-slider__thumb {
    height: 13px;
    width: 13px;
  }

  >>>.v-slider--horizontal .v-slider__track-container {
    height: 7px;
  }
</style>