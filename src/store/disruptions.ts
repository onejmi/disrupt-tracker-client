import { Disruption } from '@/model/disruption'
import Vue from 'vue'
import VueCompositionAPI from '@vue/composition-api'
import { ref, Ref } from '@vue/composition-api'

Vue.use(VueCompositionAPI)

//global state
const disruptions : Ref<Disruption[]> = ref([])

export function useDisruptions() {

    const loadDisruptions = async () => {
        const disruptions = await fetch('/api/disruptions')
    }

}