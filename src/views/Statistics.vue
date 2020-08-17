<template>
      <view-loading v-if="loading"></view-loading>
      <v-container v-else>
        <v-row>
          <v-card height="700" width="900">
            <v-card-title>Disruption Data</v-card-title>
            <v-card-text v-if="!data || data.length < 1">There have been no disruptions for the selected range</v-card-text>
            <apexchart height="500" width="800" type="rangeBar" :options="mainChartOptions" :series="mainSeries" v-else></apexchart>
          </v-card>
        </v-row>
      </v-container>
</template>

<script lang="ts">
import { defineComponent, ref, Ref, onMounted } from '@vue/composition-api'
import { useDisruptions } from '@/store/disruptions'
import { graphColors } from '@/store/constants'
import { Tag } from '@/model/disruption'
import { getMinutesFromDisruption } from '@/model/disruption'
import ViewLoading from '@/components/ViewLoading.vue'
import moment from 'moment'
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

    const currDate = new Date()
    const minDate = new Date(currDate)
    minDate.setHours(minDate.getHours() - 3)
    
    function genData() {
      data.value = disruptions.value
        .filter((disruption) => disruption.endTime >= minDate.getTime())
        .filter((disruption) => getMinutesFromDisruption(disruption) > 1)
        .map((disruption) => { 
          const currTag = getTagById(disruption.tagID)
          if(currTag == null) return null
          return {x: currTag.name, y: [disruption.startTime, disruption.endTime], fillColor: graphColors[currTag.color]}
        })
    }

    const mainChartOptions = {
            chart: {
              height: 500,
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
                colors: ['#f3f4f5', '#fff'],
                opacity: 1
              }
            },
            tooltip: {
              x: {
                format: 'h:mm TT dd MMM'
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

    
    function getTagById(id: string) : Tag | undefined {
      return tags.value.find((tag) => tag.id == id)
    }

    onMounted(async () => {
      await loadDisruptions()
      await loadTags()
      genData()
      mainSeries.value = [{ data: data.value }]
      loading.value = false
    })

    return { mainChartOptions, mainSeries, loading, data }
  }
})
</script>