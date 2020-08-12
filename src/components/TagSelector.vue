<template>
    <v-card class="pa-3">
        <v-card-title class="heading">Tag the disruption</v-card-title>
        <v-row class="text-center justify-center">
            <v-col v-if="loading">
                <v-progress-circular indeterminate color="grey"></v-progress-circular>
            </v-col>
            <v-container v-else>
                <v-form
                ref="form">
                    <v-card-text>
                        <v-autocomplete
                            v-model="tag"
                            :items="tags"
                            :loading="loading"
                            :rules="[v => !!v || 'Required']"
                            hide-no-data
                            hide-selected
                            item-text="name"
                            label="Choose a tag"
                            placeholder="Type to search a tag"
                            prepend-icon="mdi-tag"
                            return-object
                        ></v-autocomplete>
                    </v-card-text>
                    <v-card-actions>    
                        <v-btn @click="select" :disabled="disabled">Select</v-btn>
                        <v-btn @click="openTagCreator">New Tag</v-btn>
                    </v-card-actions>    
                </v-form>
            </v-container>
            <v-dialog
            max-height="100"
            max-width="220"
            v-model="displayTagCreator"
            >
                <new-tag-creator @tag:new="closeTagCreator" :open="displayTagCreator"></new-tag-creator>
            </v-dialog>
        </v-row>
    </v-card>
</template>

<script lang="ts">
import { defineComponent, ref, Ref, onMounted, watch } from '@vue/composition-api'
import { Tag } from '@/model/disruption'
import NewTagCreator from '@/components/NewTagCreator.vue'
import fetchAPI from '@/network/request'
export default defineComponent({
  name: 'TagSelector',
  props: {
      open: {
          type: Boolean,
          required: true
      }
  },
  components: {
      NewTagCreator
  },
  setup(props, context) {
    const tag : Ref<any> = ref(null)
    const loading = ref(true)
    const disabled = ref(false)
    const tags : Ref<any[]> = ref([])
    const form : Ref<any> = ref(null)

    const displayTagCreator = ref(false)

    let userTags: Tag[]

    onMounted(refresh)

    async function refresh() {
        loading.value = true
        userTags = await fetchAPI('/user/tags') 
        if(userTags == null || userTags.length < 1) {
            disabled.value = true
        } else disabled.value = false
        tags.value = userTags.map((disruptionTag: Tag) => {
            return {
                value: disruptionTag,
                name: disruptionTag.name
            }
        })
        loading.value = false
    }

    const select = () => {
        if(form.value.validate()) { 
            context.emit('select', tag.value?.value)
        }
    }

    const openTagCreator = () => {
        displayTagCreator.value = true
    }

    const closeTagCreator = async (tagName: string) => {
        displayTagCreator.value = false
        await refresh()
        console.log(tagName)
        tag.value = userTags.find((disruptionTag) => disruptionTag.name == tagName)
        console.log(tag.value)
    }

    watch(() => props.open, (curr, prev) => {
        if(!props.open) {
            form.value.reset()
            loading.value = false
        } else {
            if(!loading.value) refresh()
        }
    })

    watch(tag, (curr, prev) => console.log(curr?.name + " " + prev?.name))

    return { tag, loading, tags, select, openTagCreator, displayTagCreator, closeTagCreator, disabled, form }
  }
})
</script>