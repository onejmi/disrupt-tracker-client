import VueCompositionApi from '@vue/composition-api'
import { reactive } from '@vue/composition-api'
import Vue from 'vue'
import fetchAPI from '@/network/request'

Vue.use(VueCompositionApi)

let settings = reactive({
    dark: false,
    tickSound: true
})


export function useSettings() {
    async function loadSettings() {
        settings = reactive(await fetchAPI('/user/settings'))
    }

    return { settings, loadSettings }
}
