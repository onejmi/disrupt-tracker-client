<template>
    <v-container>
        <v-row class="text-center">
          <v-spacer></v-spacer>
          <v-col>
            <h4 v-if="!distribution || distribution.size < 1">Nothing yet...</h4>
            <apexchart v-else width="500" type="donut" :options="completePieOptions" :series="pieSeries"></apexchart>
          </v-col>
          <v-spacer></v-spacer>
        </v-row>
    </v-container>
</template>

<script lang="ts">
import { defineComponent, Ref, ref, onMounted } from '@vue/composition-api'
import { useDisruptions } from '@/store/disruptions'
import { getMinutesFromDisruption } from '@/model/disruption'
import { graphColors } from '@/store/constants'
export default defineComponent({
  name: 'DistributionStats',
  props: {
      currDate: {
          type: Date,
          required: true
      }
  },
  setup(props, context) {
    
    const { disruptions, tags } = useDisruptions()
    
    const minPieDate = new Date(props.currDate)
    minPieDate.setDate(minPieDate.getDate() - 7)

    let topPieEntries : Map<string, number>
    const distribution : Ref<Map<string, number>> = ref(new Map())
    const distributionColors : Ref<string[]> = ref([])
    const pieSeries : Ref<number[]> = ref([])
    const pieChartOptions =  {
            plotOptions: {
              pie: {
                donut: {
                  labels: {
                    show: true,
                    value: {
                      //todo make formatting 1k, 1M etc because not enough space for 1000 minutes etc.
                      formatter:  (val: any) => val != 1 ? `${val} minutes` : `${val} minute`
                    }
                  }
                }
              }
            },
            chart: {
              width: 380,
              type: 'donut',
            },
            dataLabels: {
              enabled: false
            },
            responsive: [{
              breakpoint: 480,
              options: {
                chart: {
                  width: 200
                },
                legend: {
                  show: false
                }
              }
            }],
            legend: {
              position: 'right',
              offsetY: 0,
              height: 230,
            },
            title: {
              text: "Weekly Distribution"
            }
    }

    const completePieOptions = ref({
      ...pieChartOptions,
      labels: ['Loading'],
      colors: ['#00000']
    })

    function genDistribution() {
        const tempDistribution = new Map()
        disruptions.value
        .filter((disruption) => disruption.endTime >= minPieDate.getTime() && getMinutesFromDisruption(disruption) >= 1)
        .forEach((disruption) => {
        const currTag = tags.value.find((tag) => tag.id == disruption.tagID)
        if(currTag != null) {
          let lastValue = tempDistribution.get(currTag.name)
          if(!lastValue) lastValue = 0
          tempDistribution.set(currTag.name, lastValue + Math.floor(getMinutesFromDisruption(disruption)))
        }
      })
      distribution.value = tempDistribution

      topPieEntries = getTopPieEntries()
      topPieEntries.forEach((v, k) => {
        const tag = tags.value.find((t) => t.name == k)
        if(tag != null) {
          const color = graphColors[tag.color]
          distributionColors.value.push(color)
        }
      })
    }

    function getTopPieEntries() {
      const sortedKeys = [...distribution.value.keys()].sort()
      const topNKeys = sortedKeys.slice(0, sortedKeys.length > 5 ? 5 : sortedKeys.length)
      const topPieEntries = new Map()
      for(const key of topNKeys) {
        topPieEntries.set(key, distribution.value.get(key))
      }
      return topPieEntries
    }

    onMounted(() => {
        genDistribution()
        pieSeries.value = [...topPieEntries.values()]
        completePieOptions.value = {
        ...pieChartOptions,
        labels: [...topPieEntries.keys()],
        colors: distributionColors.value
      }
    })

    return { distribution, completePieOptions, pieSeries }
  }
})
</script>