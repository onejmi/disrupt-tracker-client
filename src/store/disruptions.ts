import { Disruption, Tag } from '@/model/disruption'
import Vue from 'vue'
import VueCompositionAPI from '@vue/composition-api'
import { ref, Ref } from '@vue/composition-api'
import fetchAPI from '@/network/request'

Vue.use(VueCompositionAPI)

//global state
const disruptions : Ref<Disruption[]> = ref([])
const tags : Ref<Tag[]> = ref([])
const disrupted = ref(false)
const lastStartTime = ref(-1)

export function useDisruptions() {

    const loadDisruptions = async () => {
        disruptions.value = await fetchAPI('/user/disruptions')
    }

    const loadTags = async () => {
        tags.value = await fetchAPI('/user/tags')
    }

    return { disruptions, loadDisruptions, tags, loadTags, disrupted, lastStartTime }

}