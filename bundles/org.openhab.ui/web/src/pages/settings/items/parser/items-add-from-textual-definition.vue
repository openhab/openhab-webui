<template>
  <f7-page @page:afterin="onPageAfterIn">
    <f7-navbar>
      <oh-nav-content title="Add Items from Textual Definition" save-link="Add" @save="add()" :f7router />
    </f7-navbar>

    <f7-block class="items-add-from-textual-definition">
      <div v-if="ready" class="row items-parser resizable">
        <div class="col">
          <editor class="editor" :value="code" @input="(value: string) => code = value" :mode="mediaType" />
        </div>
        <span class="resize-handler" />
      </div>
      <div v-if="ready" class="row items-results resizable">
        <div class="col">
          <div v-if="!code || parseError" class="error">
            <div v-if="!code">
              <empty-state-placeholder icon="text_badge_plus" title="items.add.title" text="items.add.text" />
            </div>
            <pre v-else><code>{{ parseError }}</code></pre>
          </div>
          <div v-else class="items-table">
            <div class="card data-table data-table-init">
              <table>
                <thead>
                  <tr>
                    <th class="label-cell">Type</th>
                    <th class="label-cell">Name</th>
                    <th class="label-cell">Label</th>
                    <th class="label-cell">Icon</th>
                    <th class="label-cell">Groups</th>
                    <th class="label-cell">Tags</th>
                    <th class="numerical-cell">Link(s)</th>
                    <th class="numerical-cell">Metadata</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, idx) in parsedItems" :key="idx" class="background-yellow">
                    <td class="label-cell">
                      {{ item.type }}
                    </td>
                    <td class="label-cell">
                      {{ item.name }}
                      <f7-icon
                        v-if="item.existing && item.existing.editable"
                        f7="exclamationmark_octagon_fill"
                        color="yellow"
                        size="22"
                        tooltip="Item already exists" />
                      <f7-icon
                        v-if="item.existing && !item.existing.editable"
                        f7="multiply_circle_fill"
                        color="red"
                        size="22"
                        tooltip="Item already exists and is not editable" />
                    </td>
                    <td class="label-cell">
                      {{ item.label }}
                    </td>
                    <td class="label-cell">
                      <oh-icon v-if="item.category" :icon="item.category" :width="20" :height="20" />
                    </td>
                    <td class="label-cell">
                      {{ (item.groupNames) ? item.groupNames.join(', ') : '' }}
                    </td>
                    <td v-if="item.tags" class="label-cell">
                      <f7-chip v-for="tag in item.tags" class="margin-right" :key="tag" :text="tag" media-bg-color="blue">
                        <template #media>
                          <f7-icon ios="f7:tag_fill" md="material:label" aurora="f7:tag_fill" />
                        </template>
                      </f7-chip>
                    </td>
                    <td v-else class="label-cell" />
                    <!-- links -->
                    <td v-if="item.channelLinks" class="label-cell">
                      <div v-for="link in item.channelLinks" class="margin-right" :key="item.name + link.channelUID">
                        <div v-if="link.configuration">
                          <em>{{ link.channelUID }}</em
                          ><br />
                          <small>{{ Object.keys(link.configuration).map((key) => key + '=' + link.configuration![key]).join(', ') }}</small>
                        </div>
                        <em v-else>{{ link.channelUID }}</em>
                      </div>
                    </td>
                    <td v-else class="label-cell" />
                    <!-- metadata -->
                    <td v-if="item.metadata" class="label-cell">
                      <div
                        v-for="[namespace, value] in Object.entries(item.metadata)"
                        class="margin-right"
                        :key="item.name + '_' + namespace">
                        <div v-if="value.config">
                          {{ namespace }}="{{ value.value }}" [
                          <small>{{ Object.keys(value.config).map((key) => key + '=' + value.config![key]).join(', ') }}</small>
                          ]
                        </div>
                        <div v-else>{{ namespace }}="{{ value.value }}"</div>
                      </div>
                    </td>
                    <td v-else class="label-cell" />
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <span class="resize-handler" />
      </div>
    </f7-block>

    <f7-toolbar bottom>
      <f7-segmented>
        <f7-button
          v-for="type in Object.keys(SupportedMediaTypes.items)"
          outline
          small
          :key="type"
          :active="codeEditorType === type"
          @click="codeEditorType = (type as CodeEditorType)">
          {{ type }}
        </f7-button>
      </f7-segmented>
    </f7-toolbar>
  </f7-page>
</template>

<style lang="stylus">
.items-add-from-textual-definition
  margin-top 0 !important
  margin-bottom 0 !important
  padding 0
  z-index auto !important
  top 0
  height calc(100%)
  .items-parser
    height 50%
    width 100%
    .editor.v-codemirror
      position absolute
      height calc(100% - var(--f7-grid-gap))
  .items-results
    height 50%
    width 100%
    overflow-y auto
    .error
      pre
        padding 1rem
        font-size 12px
        overflow auto
</style>

<script setup lang="ts">
import { computed, defineAsyncComponent, ref, watch } from 'vue'
import { f7 } from 'framework7-vue'
import { type Router } from 'framework7'
import debounce from 'debounce'

import { useUIOptionsStore } from '@/js/stores/useUIOptionsStore.ts'
import EmptyStatePlaceholder from '@/components/empty-state-placeholder.vue'
import * as api from '@/api'
import { type CodeEditorType, MediaType, SupportedMediaTypes } from '@/assets/definitions/media-types.ts'
import { storeToRefs } from 'pinia'

const uiOptionsStore = useUIOptionsStore()

const editor = defineAsyncComponent(() => import(/* webpackChunkName: "script-editor" */ '@/components/config/controls/script-editor.vue'))

// props
const props = defineProps<{
  f7router: Router.Router
}>()

// data
interface ExtendedFileFormatItem extends api.FileFormatItem {
  existing?: api.EnrichedItem,
  existingLinks?: api.ItemChannelLink[]
}

const items = ref<api.EnrichedItem[]>([])
const things = ref<api.EnrichedThing[]>([])
const links = ref<api.ItemChannelLink[]>([])
const ready = ref(false)
const code = ref('')
const parsedItems = ref<ExtendedFileFormatItem[]>([])
const parseError = ref<string | null>(null)

const { codeEditorType } = storeToRefs(uiOptionsStore)

// computed
const mediaType = computed(() => SupportedMediaTypes.items[codeEditorType.value])

// watchers
watch(code, debounce(() => {
  parseItems()
}, 300))

watch(codeEditorType, () => {
  parseItems()
})

// methods
const onPageAfterIn = () => {
  load()
}

const load = async () => {
  const data = await Promise.all([
    api.getItems(),
    api.getThings(),
    api.getItemLinks()
  ])
    items.value = data[0]!
    things.value = data[1]!
    links.value = data[2]!
    ready.value = true
}

const parseItems = () => {
  api.parse({
    body: code.value
  }, {
    headers: {
      'Content-Type': mediaType.value,
      accept: 'application/json'
    }
  }).then((data) => {
    parseError.value = null
    parsedItems.value = data!.items.map((item) => {
      const extendedItem: ExtendedFileFormatItem = { ...item }

      extendedItem.existing = items.value.find((i) => i.name === item.name)
      if (extendedItem.existing) {
        extendedItem.existingLinks = links.value.filter((l) => l.itemName === item.name)
      }

      return extendedItem
    })
  }).catch(async (err) => {
    parseError.value = await err.response.text()
  })
}

const add = () => {
  if (parseError.value) return
  if (!parsedItems.value.length) return

  if (parsedItems.value.some((i) => i.existing && i.existing.editable === false)) {
    f7.dialog.alert('Some items are already existing are not editable. Look for red icons besides the names of affected items, remove them from your input and try again.')
    return
  }

  const itemsPayload = parsedItems.value.map((i) => {
    return {
      type: i.type,
      name: i.name,
      label: i.label,
      category: i.category,
      tags: i.tags,
      groupNames: i.groupNames,
      groupType: i.groupType,
      function: i.function
    }
  })

  let dialog = f7.dialog.progress('Creating/updating Items...')
  api.addOrUpdateItemsInRegistry({ body: itemsPayload }).then(() => {
    dialog.setText('Updating links and metadata...')
    dialog.setProgress(50)

    const linksAndMetadataPromises: Promise<any>[] = []
    parsedItems.value.forEach((item) => {
      if (item.existingLinks) {
        // Remove existing links unless they're about to be modified
        item.existingLinks.forEach((el) => {
          if (item.channelLinks && item.channelLinks.some((l) => l.channelUID === el.channelUID)) return
          linksAndMetadataPromises.push(api.unlinkItemFromChannel({ itemName: item.name, channelUID: el.channelUID }))
        })
      }

      if (item.channelLinks) {
        item.channelLinks.forEach((l) => {
          linksAndMetadataPromises.push(api.linkItemToChannel({
            itemName: item.name,
            channelUID: l.channelUID,
            itemChannelLink: { ...l, itemName: item.name } as api.ItemChannelLink
          }))
        })
      }

      if (item.metadata) {
         Object.keys(item.metadata).forEach((namespace) => {
           const m = item.metadata![namespace]!
          linksAndMetadataPromises.push(api.addMetadataToItem({ itemName: item.name, namespace: namespace, metadata: m }))
        })
      }
    })

    Promise.all(linksAndMetadataPromises).then(() => {
      dialog.setProgress(100)
      f7.toast.create({
        text: 'Items created and linked',
        destroyOnClose: true,
        closeTimeout: 2000
      }).open()
      dialog.close()
      props.f7router.back()
    }).catch((err) => {
      dialog.close()
      console.error(err)
      f7.dialog.alert('An error occurred while creating the links and metadata: ' + err.message)
    })
  }).catch((err) => {
    dialog.close()
    console.error(err)
    f7.dialog.alert('An error occurred while creating the items: ' + err.message)
  })
}
</script>
