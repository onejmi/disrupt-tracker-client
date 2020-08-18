<template>
      <view-loading v-if="loading"></view-loading>
      <v-container v-else>
        <v-row>
          <v-col cols="8">
            <v-card class="pl-3 pr-3">
              <v-card-title>Last 12 hours</v-card-title>
              <v-card-text v-if="!data || data.length < 1">There have been no disruptions in the past 12 hours</v-card-text>
              <apexchart type="rangeBar" :options="mainChartOptions" :series="mainSeries" v-else></apexchart>
            </v-card>
          </v-col>
          <v-col>
            <v-card>
              <v-card-title>Weekly Distribution</v-card-title>
              <apexchart type="donut" :options="completePieOptions" :series="pieSeries"></apexchart>
            </v-card>
            <v-card class="mt-6">
              <v-card-title>Goal Status</v-card-title>
              <v-card-subtitle>{{ Math.floor(status.value) + "/" + threshold}} minutes</v-card-subtitle>
              <v-card-text>
                <v-slider
                max="1000"
                step="10"
                v-model="threshold"
                @change="writeThresholdChange"
                thumb-label></v-slider>
                <v-progress-linear
                  :value="status.percentage"
                  :color="status.color"
                  height="35"
                >
                <span style="font-size: 20px;">{{ status.emoji }}</span>
                </v-progress-linear>
              </v-card-text>
            </v-card>
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
import moment from 'moment'
import colors from 'vuetify/es5/util/colors'
import fetchAPI from '@/network/request'
//syncrhonized step charts Disruption Time vs Inverted (Work Time)
export default defineComponent({
  name: 'Statistics',
  components: {
    ViewLoading
  },
  setup() {
    //Note: Only disruptions longer than a minute are displayed
    const { disruptions, tags, loadDisruptions, loadTags } = useDisruptions()
    const loading = ref(true)
    const data : Ref<any> = ref(null)
    const distribution : Ref<Map<string, number>> = ref(new Map())
    const distributionColors : Ref<string[]> = ref([])
    const threshold = ref(0)
    const status : any = reactive({
      value: 0,
      percentage: computed(() => 100 * (status.value / threshold.value)),
      emoji: computed(() => 
        status.percentage < 40 ? "😀" : status.percentage < 75 ? "🙂" : status.percentage < 100 ? "😐" : "😕"),
      color: computed(() => 
      status.percentage < 40 ? "green" : status.percentage < 75 ? "blue" : status.percentage < 100 ? "yellow" : "red")
    })

    const currDate = new Date()
    const minDate = new Date(currDate)
    const minPieDate = new Date(currDate)
    minDate.setHours(minDate.getHours() - 12)
    minPieDate.setDate(minPieDate.getDate() - 7)
    
    function genData() {
      data.value = disruptions.value
        .filter((disruption) => disruption.endTime >= minDate.getTime())
        .filter((disruption) => getMinutesFromDisruption(disruption) >= 1)
        .map((disruption) => { 
          const currTag = getTagById(disruption.tagID)
          if(currTag == null) return null
          return {x: currTag.name, y: [disruption.startTime, disruption.endTime], fillColor: graphColors[currTag.color]}
        })
      disruptions.value
        .filter((disruption) => disruption.endTime >= minPieDate.getTime() && 
        getMinutesFromDisruption(disruption) >= 1)
        .forEach((disruption) => {
        status.value += getMinutesFromDisruption(disruption)
        const currTag = getTagById(disruption.tagID)
        if(currTag != null) {
          let lastValue = distribution.value.get(currTag.name)
          if(!lastValue) lastValue = 0
          distribution.value.set(currTag.name, lastValue + Math.floor(getMinutesFromDisruption(disruption)))
        }
      })
      distribution.value.forEach((v, k) => {
        const tag = tags.value.find((t) => t.name == k)
        if(tag != null) {
          const color = graphColors[tag.color]
          distributionColors.value.push(color)
        }
      })
    }

    function getTagById(id: string) : Tag | undefined {
      return tags.value.find((tag) => tag.id == id)
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

    function writeThresholdChange(value: number) {
      fetchAPI('/user/threshold', {
        method: 'PUT',
        body: JSON.stringify({
          threshold: value
        })
      })
    }

    const mainChartOptions = {
            chart: {
              type: 'rangeBar'
            },
            plotOptions: {
              bar: {
                horizontal: true,
                distributed: true,
                rangeBarOverlap: true,
                dataLabels: {
                  hideOverflowingLabels: true
                }
              }
            },
            dataLabels: {
              enabled: false,
              style: {
                colors: ['#f3f4f5', '#fff']
              }
            },
            xaxis: {
              type: 'datetime',
              min: minDate.getTime(),
              max: currDate.getTime(),
              labels: {
                datetimeUTC: false
              }
            },
            yaxis: {
              show: true
            },
            grid: {
              row: {
                colors: ['#f3f4f5'],
                opacity: 0.5
              }
            },
            tooltip: {
              x: {
                format: 'h:mm TT'
              },
              y: {
                title: {
                  formatter: function(value: any, { series, seriesIndex, dataPointIndex, w } : any) {
                    return ""
                  }
                }
              }
            }
          }
    const mainSeries = ref([{ data: [] }])

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
            }
    }

    const completePieOptions = ref({
      ...pieChartOptions,
      labels: ['Loading'],
      colors: ['#00000']
    })

    onMounted(async () => {
      await loadDisruptions()
      await loadTags()
      threshold.value = (await fetchAPI('/user/threshold')).threshold
      genData()
      mainSeries.value = [{ data: data.value }]

      const topPieEntries = getTopPieEntries()
      pieSeries.value = [...topPieEntries.values()]
      completePieOptions.value = {
        ...pieChartOptions,
        labels: [...topPieEntries.keys()],
        colors: distributionColors.value
      }
      loading.value = false
    })

    return { mainChartOptions, mainSeries, completePieOptions, 
    pieSeries, loading, data, status, threshold, writeThresholdChange }
  }
})
</script>