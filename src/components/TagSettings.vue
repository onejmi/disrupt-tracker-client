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
                        <v-list-item-title v-if="editing.id != tag.id">{{ tag.name }}</v-list-item-title>
                        <v-text-field
                            v-else
                            v-model="editing.text"
                            :rules="[v => !!v || 'Can\'t be empty!', v => v && v.length <= nameLimit || 'Too long']"
                            autofocus
                            flat
                            background-color="transparent"
                            hide-details="auto"
                            solo
                            @keyup.enter="edit"
                            ></v-text-field>
                    </v-list-item-content>
                    <v-list-item-action class="mr-4">
                        <v-btn icon @click="edit(tag.id)">
                            <v-icon>
                                {{ editing.id == tag.id ? "mdi-check" : "mdi-pencil-outline" }}
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
                        <v-btn icon @click="deleteTag = true">
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
        <v-dialog v-model="deleteTag" max-width="300">
            <v-card class="pa-3">
                <v-card-title>Delete Tag</v-card-title>
                <v-card-text class="pt-1" style="color: #505050;">
                    Are you sure you want to delete the tag 
                    <strong>"{{ tagName }}"</strong> <br><br>
                    <strong>Note:</strong> This will delete all disruption data associated with this tag as well.
                </v-card-text>
                <v-card-actions>
                    <v-btn @click="deleteCurrentTag" color="error">
                        Delete
                    </v-btn>
                    <v-spacer></v-spacer>
                    <v-btn @click="deleteTag = false" color="warning">
                        Cancel
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-container>
</template>
<script lang="ts">
import { defineComponent, onMounted, ref, Ref, watch, computed, reactive } from '@vue/composition-api'
import { useDisruptions } from '@/store/disruptions'
import ViewLoading from '@/components/ViewLoading.vue'
import { colors, nameLimit } from '@/store/constants'
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
    const deleteTag = ref(false)
    const tagItem : Ref<any> = ref(null)
    const tagName = computed(() => tags.value[tagItem.value]?.name)

    const editing : any = reactive({
        id: null,
        text: null
    })

    watch(tagItem, (curr, prev) => { 
        if(curr == null) tagItem.value = prev
    })

    function edit(tagId: string) {
        if (!editing.id) {
          editing.id = tagId
        } else {
          const currTag = tags.value.find((tag) => tag.id == tagId)
          const name = currTag?.name
          if(editing.text.length > nameLimit) return
          if(editing.text.length < 1 || (editing.text != name
             && tags.value.some(e => e.name == editing.text))) return
          fetchAPI('/user/tags', {
              method: 'PATCH',
              body: JSON.stringify({
                  tagId: tagId,
                  name: editing.text
              })
          })
          if(currTag != null) {     
            const index = tags.value.indexOf(currTag)
            tags.value[index].name = editing.text
            editing.id = null
            editing.text = ''
          }
        }
    }

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

    function deleteCurrentTag() {
        const targetId = tags.value[tagItem.value].id
        fetchAPI('/user/tags', {
            method: 'DELETE',
            body: JSON.stringify({
                tagId: targetId
            })
        })
        deleteTag.value = false
        tags.value = tags.value.filter((tag) => tag.id != targetId )
    }

    onMounted(async () => {
        await loadTags()
        loading.value = false
    })

    return { loading, tags, colors, chooseColor, setCurrentColor, 
    tagItem, deleteTag, deleteCurrentTag, tagName, editing, edit, nameLimit }
  }
})
</script>