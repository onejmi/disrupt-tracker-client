<template>
    <v-card class="pa-3">
        <v-card-title class="heading">Tag the disruption</v-card-title>
        <v-row class="text-center justify-center">
            <v-container>
                <v-form
                ref="form">
                    <v-card-text>
                        <v-combobox
                        v-model="tag"
                        :loading="loading"
                        :search-input.sync="search"
                        :items="tags"
                        :rules="[v => !!v || 'Required', v => v && userTags.some(e => v.text == e.name) || 'Save your edit!']"
                        label="Search for an option"
                        small-chips
                        solo
                        >
                        <template v-slot:no-data>
                            <v-list-item v-if="search && search.length > nameLimit">
                                <span class="subheading" style="color: red;">Your tag is too long</span>
                            </v-list-item>
                            <v-list-item
                            @click.stop="create(search)"
                            v-else-if="tags.length < tagLimit">
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
                                <span class="subheading" style="color: red;">Tag limit reached ({{ tagLimit }})</span>
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
                            :rules="[v => v && v.length <= nameLimit || 'Too long']"
                            autofocus
                            flat
                            background-color="transparent"
                            hide-details="auto"
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
                        <v-btn @click="select" :disabled="disabled" color="primary">Select</v-btn>
                    </v-card-actions>    
                </v-form>
            </v-container>
        </v-row>
    </v-card>
</template>

<script lang="ts">
import { defineComponent, ref, Ref, onMounted, watch } from '@vue/composition-api'
import { Tag } from '@/model/disruption'
import fetchAPI from '@/network/request'
export default defineComponent({
  name: 'TagSelector',
  props: {
      open: {
          type: Boolean,
          required: true
      }
  },
  components: {},
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

    const userTags: Ref<Tag[]> = ref([])
    const colors = ['green', 'purple', 'indigo', 'cyan', 'teal', 'orange']

    const tagLimit = 50
    const nameLimit = 18

    onMounted(refresh)

    async function refresh() {
        loading.value = true
        userTags.value = await fetchAPI('/user/tags') 
        if(userTags == null || userTags.value.length < 1) {
            disabled.value = true
        } else disabled.value = false
        tags.value = userTags.value.map((disruptionTag: Tag) => {
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
          if(editing.value.text.length > nameLimit) return
          if(editing.value.text.length < 1 || (editing.value.text != item.value.name && userTags.value.some(e => e.name == editing.value.text))) return
          editLoading.value.push(item.value.id)
          await fetchAPI('/user/tags', {
              method: 'PATCH',
              body: JSON.stringify({
                  tagId: item.value.id,
                  name: editing.value.text
              })
          })
          const tagIndex = userTags.value.findIndex(e => e.name == item.value.name)
          userTags.value[tagIndex].name = editing.value.text
          editLoading.value = editLoading.value.filter(e => e !== item.value.id)
          item.value.name = editing.value.text
          editing.value = null
          form.value.validate() //todo test out validating on the go to cover edge case of "Save tag" error not removing from render when brought back to original name
        }
    }

    function resetSelection() {
        tag.value = null
    }

    async function create(tagName: string) {
        if(loading.value) return
        if(tagName.length > nameLimit) return
        if(userTags.value.some(e => e.name == tagName)) return
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
            editing.value = null
        } else {
            if(!loading.value) refresh()
        }
    })

    watch(tag, (curr, prev) => {
        if(!editing.value && curr && typeof curr === 'string' && curr.length > 0 && userTags.value.length < tagLimit) {
            create(curr)
        }
    })

    return { tag, loading, tags, select, disabled, form, colors, edit, editing, search, nonce, create, resetSelection, tagLimit, nameLimit, editLoading, userTags }
  }
})
</script>