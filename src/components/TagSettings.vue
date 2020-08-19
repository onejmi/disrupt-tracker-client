<template>
    <view-loading v-if="loading"></view-loading>
    <v-container v-else>
        <v-list>
            <v-subheader>Tags</v-subheader>
            <v-list-item-group
            v-model="tagItem">
                <v-list-item
                v-for="tag in tags"
                :key="tag.id"
                >
                    <v-list-item-content>
                        <v-list-item-title>{{ tag.name }}</v-list-item-title>
                    </v-list-item-content>
                    <v-list-item-action class="mr-4">
                        <v-btn icon>
                            <v-icon>
                                mdi-pencil-outline
                            </v-icon>
                        </v-btn>
                    </v-list-item-action>
                    <v-list-item-action>
                        <v-btn icon @click="chooseColor = true">
                            <v-icon :color="`${colors[tag.color]} lighten-3`">
                                mdi-format-color-fill
                            </v-icon>
                        </v-btn>
                    </v-list-item-action>
                    <v-list-item-action>
                        <v-btn icon>
                            <v-icon>
                                mdi-close
                            </v-icon>
                        </v-btn>
                    </v-list-item-action>
                </v-list-item>
            </v-list-item-group>
        </v-list>
        <v-dialog v-model="chooseColor" max-width="300">
            <v-card>
                <v-card-title>Choose color</v-card-title>
                <v-card-text>
                    <v-btn icon 
                    v-for="(color, i) in colors"
                    :key="color"
                    @click="setCurrentColor(i)">
                        <v-icon :color="color">
                            mdi-square-rounded
                        </v-icon>
                    </v-btn>
                </v-card-text>
            </v-card>
        </v-dialog>
    </v-container>
</template>
<script lang="ts">
import { defineComponent, onMounted, ref, Ref } from '@vue/composition-api'
import { useDisruptions } from '@/store/disruptions'
import ViewLoading from '@/components/ViewLoading.vue'
import { colors } from '@/store/constants'
import fetchAPI from '@/network/request'
export default defineComponent({
  name: 'TagSettings',
  components: {
      ViewLoading
  },
  setup() {
    const { tags, loadTags } = useDisruptions()
    const loading = ref(true)
    const chooseColor = ref(false)
    const tagItem : Ref<any> = ref(null)

    function setCurrentColor(tagColor: number) {
        fetchAPI('/user/tags', {
            method: 'PATCH',
            body: JSON.stringify({
                tagId: tags.value[tagItem.value].id,
                color: tagColor
            })
        })
        tags.value[tagItem.value].color = tagColor
        chooseColor.value = false
    }

    onMounted(async () => {
        await loadTags()
        loading.value = false
    })

    return { loading, tags, colors, chooseColor, setCurrentColor, tagItem }
  }
})
</script>