<template>
    <v-card class="pl-3 pr-3" min-height="400">
      <v-card-title>Last 12 hours</v-card-title>
      <v-card-text v-if="!data || data.length < 1">There have been no disruptions in the past 12 hours</v-card-text>
      <apexchart type="rangeBar" :options="mainChartOptions" :series="mainSeries" v-else></apexchart>
    </v-card>
</template>

<script lang="ts">
import { defineComponent, ref, Ref, onMounted } from '@vue/composition-api'
import { useDisruptions } from '@/store/disruptions'
import { Tag, getMinutesFromDisruption } from '@/model/disruption'
import { graphColors } from '@/store/constants'
export default defineComponent({
  name: 'TimeGraph',
  setup() {  
    const { disruptions, tags } = useDisruptions()
    const data : Ref<any> = ref(null)

    const currDate = new Date()
    const minDate = new Date(currDate)

    minDate.setHours(minDate.getHours() - 12)

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

    function genData() {
      data.value = disruptions.value
        .filter((disruption) => disruption.endTime >= minDate.getTime())
        .filter((disruption) => getMinutesFromDisruption(disruption) >= 1)
        .map((disruption) => { 
          const currTag = getTagById(disruption.tagID)
          if(currTag == null) return null
          return {x: currTag.name, y: [disruption.startTime, disruption.endTime], fillColor: graphColors[currTag.color]}
        })
    }

    function getTagById(id: string) : Tag | undefined {
      return tags.value.find((tag) => tag.id == id)
    }

    onMounted(() => {
      genData()
      mainSeries.value = [{ data: data.value }]
    })
    
    return { data, mainChartOptions, mainSeries }

  }
})
</script>