<template>
  <f7-page @page:afterin="onPageAfterIn">
    <f7-navbar title="Add Items from Textual Definition" back-link="Cancel">
      <f7-nav-right>
        <f7-link @click="add()" v-if="$theme.md" icon-md="material:save" icon-only></f7-link>
        <f7-link @click="add()" v-if="!$theme.md">Add</f7-link>
      </f7-nav-right>
    </f7-navbar>
    <div class="row" v-if="ready">
      <div class="col">
        <editor class="items-parser" :value="itemsDsl" @input="(value) => itemsDsl = value" />
        <div v-if="parsedItems.error" class="items-results error">
          <div v-if="!itemsDsl">
            <empty-state-placeholder icon="text_badge_plus" title="items.add.title" text="items.add.text" />
          </div>
          <pre v-else><code>{{parsedItems.error}}</code></pre>
        </div>
        <div v-else class="items-results">
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
                  <td class="label-cell">{{item.type}}</td>
                  <td class="label-cell">
                    {{item.name}}
                    <f7-icon v-if="item.existing && item.existing.editable" f7="exclamationmark_octagon_fill" color="yellow" size="22" tooltip="Item already exists" />
                    <f7-icon v-if="item.existing && !item.existing.editable" f7="multiply_circle_fill" color="red" size="22" tooltip="Item already exists and is not editable" />
                  </td>
                  <td class="label-cell">{{item.label}}</td>
                  <td class="label-cell"><oh-icon v-if="item.category" :icon="item.category" :width="20" :height="20" /></td>
                  <td class="label-cell">{{(item.groupNames) ? item.groupNames.join(', ') : ''}}</td>
                  <td class="label-cell" v-if="item.tags">
                    <f7-chip class="margin-right" v-for="tag in item.tags" :key="tag" :text="tag" media-bg-color="blue">
                      <f7-icon slot="media" ios="f7:tag_fill" md="material:label" aurora="f7:tag_fill" ></f7-icon>
                    </f7-chip>
                  </td>
                  <td class="label-cell" v-else></td>
                  <!-- links -->
                  <td class="label-cell" v-if="item.links">
                    <div class="margin-right" v-for="(link, lidx) in item.links" :key="lidx">
                      <div v-if="link.value">
                        <div><em>{{link.value}}</em></div>
                        <small>{{link.config.map((c) => c.key + '=' + c.value).join(', ')}}</small>
                      </div>
                      <em v-else>{{link}}</em>
                    </div>
                  </td>
                  <td class="label-cell" v-else></td>
                  <!-- metadata -->
                  <td class="label-cell" v-if="item.metadata">
                    <div class="margin-right" v-for="(metadata, lidx) in item.metadata" :key="lidx">
                      <div v-if="metadata.value.value">
                        <div>{{metadata.key}}="{{metadata.value.value}}"</div>
                        <small>{{metadata.value.config.map((c) => c.key + '=' + c.value).join(', ')}}</small>
                      </div>
                      <div v-else>{{metadata.key}}="{{metadata.value}}"</div>
                    </div>
                  </td>
                  <td class="label-cell" v-else></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </f7-page>
</template>

<style lang="stylus">
.items-parser.vue-codemirror
  display block
  top calc(var(--f7-navbar-height))
  height calc(50% - var(--f7-navbar-height))
  width 100%
.items-results
  position absolute
  top 50%
  height 50%
  overflow-y auto
  width 100%
  &.error
    pre
      padding 0 1rem
.parse-results
  position relative
  left 0
  width 100%
  pre
    font-size 12px
    height calc(100% - var(--f7-navbar-height) + var(--f7-toolbar-height) - 100px)
    overflow auto
</style>

<script>
import { Parser, Grammar } from 'nearley'
import grammar from '@/assets/items-lexer.nearley'

export default {
  components: {
    'editor': () => import('@/components/config/controls/script-editor.vue')
  },
  data () {
    return {
      itemsDsl: '',
      items: [],
      things: [],
      links: [],
      ready: false
    }
  },
  methods: {
    onPageAfterIn () {
      const promises = [
        this.$oh.api.get('/rest/items'),
        this.$oh.api.get('/rest/things'),
        this.$oh.api.get('/rest/links')
      ]
      Promise.all(promises).then((data) => {
        this.items = data[0]
        this.things = data[1]
        this.links = data[2]
        this.ready = true
      })
    },
    add () {
      if (this.parsedItems.error) return
      if (!this.parsedItems.length) return

      if (this.parsedItems.some((i) => i.existing && i.existing.editable === false)) {
        this.$f7.dialog.alert('Some items are already existing are not editable. Look for red icons besides the names of affected items, remove them from your input and try again.')
        return
      }

      const itemsPayload = this.parsedItems.map((i) => {
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

      let dialog = this.$f7.dialog.progress('Creating/updating Items...')
      this.$oh.api.put('/rest/items/', itemsPayload).then((data) => {
        dialog.setText('Updating links and metadata...')
        dialog.setProgress(50)

        let linksAndMetadataPromises = []
        this.parsedItems.forEach((item) => {
          if (item.existingLinks) {
            // remove existing links unless they're about to be recreated
            item.existingLinks.forEach((el) => {
              if (item.links && item.links.some((l) => l === el.channelUID || (l.value === el.channelUID))) return
              console.log(`DELETE /rest/links/${item.name}/${encodeURIComponent(el.channelUID)}`)
              linksAndMetadataPromises.push(this.$oh.api.delete(`/rest/links/${item.name}/${encodeURIComponent(el.channelUID)}`))
            })
          }

          if (item.links) {
            item.links.forEach((l) => {
              const channelUID = l.value || l
              let config = {}
              if (l.config) {
                l.config.forEach((c) => { config[c.key] = c.value })
              }
              const url = `/rest/links/${item.name}/${encodeURIComponent(channelUID)}`
              const linkPayload = {
                itemName: item.name,
                channelUID: channelUID,
                configuration: config
              }
              console.log(`PUT ${url}: ` + JSON.stringify(linkPayload))
              linksAndMetadataPromises.push(this.$oh.api.put(url, linkPayload))
            })
          }

          if (item.metadata) {
            item.metadata.forEach((m) => {
              const value = m.value.value || m.value
              let config = {}
              if (m.value.config) {
                m.value.config.forEach((c) => { config[c.key] = c.value })
              }
              const url = `/rest/items/${item.name}/metadata/${m.key}`
              const metadataPayload = {
                value: value,
                config: config
              }
              console.log(`PUT ${url}` + JSON.stringify(metadataPayload))
              linksAndMetadataPromises.push(this.$oh.api.put(url, metadataPayload))
            })
          }
        })

        Promise.all(linksAndMetadataPromises).then((data) => {
          dialog.setProgress(100)
          this.$f7.toast.create({
            text: 'Items created and linked',
            destroyOnClose: true,
            closeTimeout: 2000
          }).open()
          dialog.close()
          this.$f7router.back()
        }).catch((err) => {
          dialog.close()
          console.error(err)
          this.$f7.dialog.alert('An error occurred while creating the links and metadata: ' + err)
        })
      }).catch((err) => {
        dialog.close()
        console.error(err)
        this.$f7.dialog.alert('An error occurred while creating the items: ' + err)
      })
    }
  },
  computed: {
    parsedItems () {
      try {
        const parser = new Parser(Grammar.fromCompiled(grammar))
        parser.feed(this.itemsDsl.trim())
        if (!parser.results.length) return { error: 'Unable to parse, check your input' }
        // return parser.results[0].map((i) => i.name).join('\n')
        return parser.results[0]
          .filter((i) => i !== null)
          .map((item) => {
            if (item.metadata) {
              item.links = item.metadata.filter((m) => m.key === 'channel').map((l) => l.value)
              item.metadata = item.metadata.filter((m) => m.key !== 'channel')
            }
            item.existing = this.items.find((i) => i.name === item.name)
            if (item.existing) {
              item.existingLinks = this.links.filter((l) => l.itemName === item.name)
            }
            return item
          })
      } catch (e) {
        return { error: e }
      }
    }
  }
}
</script>
