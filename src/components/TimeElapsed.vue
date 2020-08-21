<template>
    <h1>{{ formattedTime }}</h1>
</template>

<script lang="ts">
    import {computed, defineComponent, onMounted, onUnmounted, ref} from "@vue/composition-api";
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
            const formattedTime = computed(() => {
                const date = new Date(timeElapsed.value)
                return date.getMinutes().toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping: false})
                + ":" 
                + date.getSeconds().toLocaleString('en-US', {minimumIntegerDigits: 2})
            })
            let interval : number
            const tick = new Audio(require('@/assets/audio/default-tick.mp3'))
            onMounted(() => {
                tick.play()
                interval = setInterval(() => {
                timeElapsed.value = Date.now() - props.startTime 
                tick.play()
                }, 1000)
            }
            )
            onUnmounted(() => clearInterval(interval))
            return { formattedTime }
        }
    })
</script>

<style scoped>
</style>