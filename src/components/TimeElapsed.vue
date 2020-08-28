<template>
    <h1>{{ formattedTime }}</h1>
</template>

<script lang="ts">
    import {computed, defineComponent, onMounted, onUnmounted, ref} from "@vue/composition-api";
import { useSettings } from '@/store/settings';
    export default defineComponent({
        name: "TimeElapsed",
        props: {
            startTime: {
                type: Number,
                required: true,
            }
        },
        setup (props) {
            const timeElapsed = ref(Date.now() - props.startTime)
            const { settings } = useSettings()
            const formattedTime = computed(() => {
                const date = new Date(timeElapsed.value)
                return date.getMinutes().toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping: false})
                + ":" 
                + date.getSeconds().toLocaleString('en-US', {minimumIntegerDigits: 2})
            })
            let interval : number
            const tick = new Audio(require('@/assets/audio/default-tick.mp3'))
            onMounted(() => {
                if(settings.tickSound) tick.play()
                interval = setInterval(() => {
                timeElapsed.value = Date.now() - props.startTime 
                if(settings.tickSound) tick.play()
                }, 1000)
            })
            onUnmounted(() => clearInterval(interval))
            return { formattedTime }
        }
    })
</script>

<style scoped>
</style>