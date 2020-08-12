<template>
    <v-card class="pa-1">
        <v-card-title class="heading">Create a new tag</v-card-title>
        <v-form
        ref="form">
            <v-text-field 
            v-model="tagName"
            outlined 
            prepend-inner-icon="mdi-tag-plus-outline" 
            class="pa-3 text-center"
            label="Tag"
            placeholder="Enter tag name"
            :rules="[v => !!v || 'Required', v => (v && v.length <= 70) || 'Max 70 characters']"
            counter>
            </v-text-field>
            <v-card-actions>
                <v-btn color="primary" @click="submit">
                    <v-progress-circular indeterminate color="indigo lighten-5" v-if="loading">
                    </v-progress-circular>
                    <span v-else>Create</span>
                </v-btn>
                <v-spacer></v-spacer>
                <v-btn color="error">Cancel</v-btn>
            </v-card-actions>
        </v-form>
    </v-card>
</template>

<script lang="ts">
import { defineComponent, ref, Ref, onMounted, watch } from '@vue/composition-api'
import fetchAPI from '@/network/request'
export default defineComponent({
  name: 'TagSelector',
  props: {
      open: {
          type: Boolean,
          required: true
      }
  },
  setup(props, context) {
    const form : Ref<any> = ref(null)
    const tagName = ref('')
    const loading = ref(false)

    async function submit() {
        if(loading.value) return
        if(form.value.validate()) {
            //create a new tag, close, reset fields if they dont auto reset
            loading.value = true
            await fetchAPI('/user/tags', { 
                method: 'POST',
                body: JSON.stringify({
                    name: tagName.value
                })
            })
            loading.value = false
            context.emit('tag:new', tagName.value)
        }
    }

    watch(() => props.open, (curr, prev) => {
        if(!props.open) {
            form.value.reset()
            loading.value = false
        }
    })

    return { form, submit, tagName, loading }
  }
})
</script>