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
                        <v-combobox
                        v-model="tag"
                        :loading="loading"
                        :search-input.sync="search"
                        :items="tags"
                        hide-selected
                        label="Search for an option"
                        small-chips
                        solo
                        >
                        <template v-slot:no-data>
                            <v-list-item
                            @click.stop="create(search)"
                            v-if="tags.length < tagLimit">
                            <span class="subheading" style="margin-right: 7px;">Create</span>
                            <v-chip
                                :color="`${colors[nonce]} lighten-3`"
                                label
                                small
                            >
                                {{ search }}
                            </v-chip>
                            </v-list-item>
                            <v-list-item v-else>
                                <span class="subheading" style="margin-right: 7px; color: red;">Tag limit reached ({{ tagLimit }})</span>
                            </v-list-item>
                        </template>
                        <template v-slot:selection="{ attrs, item, selected }">
                            <v-chip
                            v-if="item === Object(item)"
                            v-bind="attrs"
                            :color="`${colors[item.value.color]} lighten-3`"
                            :input-value="selected"
                            label
                            small
                            >
                            <span class="pr-2">
                                {{ item.text }}
                            </span>
                            <v-icon
                                small
                                @click="resetSelection"
                            >mdi-close</v-icon>
                            </v-chip>
                        </template>
                        <template v-slot:item="{ index, item }">
                            <v-text-field
                            v-if="editing === item"
                            v-model="editing.text"
                            autofocus
                            flat
                            background-color="transparent"
                            hide-details
                            solo
                            @keyup.enter="edit(index, item)"
                            ></v-text-field>
                            <v-chip
                            v-else
                            :color="`${colors[item.value.color]} lighten-3`"
                            dark
                            label
                            small
                            >
                            {{ item.value.name }}
                            </v-chip>
                            <v-spacer></v-spacer>
                            <v-list-item-action @click.stop>
                            <v-btn
                                icon
                                @click.stop.prevent="edit(index, item)"
                            >
                                <v-progress-circular indeterminate v-if="editLoading.includes(item.value.id)"></v-progress-circular>
                                <v-icon v-else>{{ editing !== item ? 'mdi-pencil' : 'mdi-check' }}</v-icon>
                            </v-btn>
                            </v-list-item-action>
                        </template>
                        </v-combobox>
                    </v-card-text>
                    <v-card-actions>    
                        <v-btn @click="select" :disabled="disabled">Select</v-btn>
                        <v-btn>New Tag</v-btn>
                    </v-card-actions>    
                </v-form>
            </v-container>
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

    const editing : Ref<any> = ref(null)
    const search : Ref<any> = ref(null)
    const itemIndex : Ref<number> = ref(-1)
    const nonce = ref(0)
    const editLoading : Ref<string[]> = ref([])

    let userTags: Tag[]
    const colors = ['green', 'purple', 'indigo', 'cyan', 'teal', 'orange']

    const tagLimit = 50

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
                text: disruptionTag.name
            }
        })
        loading.value = false
    }

    const select = () => {
        if(form.value.validate()) { 
            context.emit('select', tag.value?.value)
        }
    }

    async function edit (index: number, item: any) {
        if (!editing.value) {
          editing.value = item
        } else {
          if(editing.value.text != item.value.name && userTags.some(e => e.name == editing.value.text)) return
          editLoading.value.push(item.value.id)
          await fetchAPI('/user/tags', {
              method: 'PATCH',
              body: JSON.stringify({
                  tagId: item.value.id,
                  name: editing.value.text
              })
          })
          editLoading.value = editLoading.value.filter(e => e !== item.value.id)
          item.value.name = editing.value.text
          editing.value = null
        }
    }

    function resetSelection() {
        tag.value = null
    }

    async function create(tagName: string) {
        if(loading.value) return
        if(userTags.some(e => e.name == tagName)) return
        loading.value = true
        await fetchAPI('/user/tags', { 
            method: 'POST',
            body: JSON.stringify({
                name: tagName,
                color: nonce.value
            })
        })
        await refresh()
        nonce.value++
        if(nonce.value >= colors.length) nonce.value = 0
        loading.value = false
        tag.value = tags.value.find(e => e.text == tagName)
    }

    watch(() => props.open, (curr, prev) => {
        if(!props.open) {
            form.value.reset()
            loading.value = false
        } else {
            if(!loading.value) refresh()
        }
    })

    watch(tag, (curr, prev) => {
        if(!editing.value && curr && typeof curr === 'string' && curr.length > 0 && userTags.length < tagLimit) {
            create(curr)
        }
    })

    return { tag, loading, tags, select, disabled, form, colors, edit, editing, search, nonce, create, resetSelection, tagLimit, editLoading }
  }
})
</script>