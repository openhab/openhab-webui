<template>
  <f7-page @page:afterin="onPageAfterIn" @page:afterout="stopEventSource">
    <f7-navbar title="Rules" back-link="Settings" back-link-url="/settings/" back-link-force>
      <f7-nav-right>
        <f7-link icon-md="material:done_all" @click="toggleCheck()"
        :text="(!$theme.md) ? ((showCheckboxes) ? 'Done' : 'Select') : ''"></f7-link>
      </f7-nav-right>
      <f7-subnavbar :inner="false" v-show="initSearchbar">
        <f7-searchbar
          v-if="initSearchbar"
          class="searchbar-rules"
          :init="initSearchbar"
          search-container=".rules-list"
          search-item=".rulelist-item"
          search-in=".item-title, .item-subtitle, .item-header, .item-footer"
          remove-diacritics
          :disable-button="!$theme.aurora"
        ></f7-searchbar>
      </f7-subnavbar>
    </f7-navbar>
    <f7-toolbar class="contextual-toolbar" :class="{ 'navbar': $theme.md }" v-if="showCheckboxes" bottom-ios bottom-aurora>
      <f7-link color="red" v-show="selectedItems.length" v-if="!$theme.md" class="delete" icon-ios="f7:trash" icon-aurora="f7:trash" @click="removeSelected">Remove {{selectedItems.length}}</f7-link>
      <f7-link v-if="$theme.md" icon-md="material:close" icon-color="white" @click="showCheckboxes = false"></f7-link>
      <div class="title" v-if="$theme.md">
        {{selectedItems.length}} selected
      </div>
      <div class="right" v-if="$theme.md">
        <f7-link icon-md="material:delete" icon-color="white" @click="removeSelected"></f7-link>
      </div>
    </f7-toolbar>

    <f7-list-index
      ref="listIndex"
      list-el=".rules-list"
      :scroll-list="true"
      :label="true"
    ></f7-list-index>

    <f7-list class="searchbar-not-found">
      <f7-list-item title="Nothing found"></f7-list-item>
    </f7-list>

    <empty-state-placeholder v-if="noRuleEngine" icon="exclamationmark_triangle" title="rules.missingengine.title" text="rules.missingengine.text" />

    <!-- skeleton for not ready -->
    <f7-block class="block-narrow" v-show="!noRuleEngine">
      <f7-col v-if="!ready">
        <f7-block-title>&nbsp;Loading...</f7-block-title>
        <f7-list contacts-list class="col rules-list">
          <f7-list-group>
            <f7-list-item
              media-item
              v-for="n in 20"
              :key="n"
              :class="`skeleton-text skeleton-effect-blink`"
              title="Title of the rule"
              subtitle="Tags, Schedule, Scene..."
              after="status badge"
              footer="Description of the rule"
            >
            </f7-list-item>
          </f7-list-group>
        </f7-list>
      </f7-col>
      <f7-col v-else>
        <f7-block-title class="searchbar-hide-on-search">{{rules.length}} rules</f7-block-title>
        <f7-list
          v-show="rules.length > 0"
          class="searchbar-found col rules-list"
          ref="rulesList"
          media-list contacts-list>
          <f7-list-group v-for="(rulesWithInitial, initial) in indexedRules" :key="initial">
            <f7-list-item v-if="rulesWithInitial.length" :title="initial" group-title></f7-list-item>
            <f7-list-item
              v-for="rule in rulesWithInitial"
              :key="rule.uid"
              media-item
              class="rulelist-item"
              :checkbox="showCheckboxes"
              :checked="isChecked(rule.uid)"
              @change="(e) => toggleItemCheck(e, rule.uid)"
              :link="showCheckboxes ? null : rule.uid"
              :title="rule.name"
              :text="rule.uid"
              :footer="rule.description"
              :badge="rule.status.status"
              :badge-color="(rule.status.status === 'RUNNING') ? 'orange' : (rule.status.status != 'IDLE') ? 'red' : ''"
            >
              <div slot="footer">
                <f7-chip v-for="tag in rule.tags" :key="tag" :text="tag" media-bg-color="blue" style="margin-right: 6px">
                  <f7-icon slot="media" ios="f7:tag_fill" md="material:label" aurora="f7:tag_fill" ></f7-icon>
                </f7-chip>
              </div>
              <!-- <span slot="media" class="item-initial">{{initial}}</span> -->
              <f7-icon v-if="rule.editable === false" slot="after-title" f7="lock_fill" size="1rem" color="gray"></f7-icon>
            </f7-list-item>
          </f7-list-group>
        </f7-list>
      </f7-col>
    </f7-block>
    <f7-block v-if="ready && !noRuleEngine && !rules.length" class="service-config block-narrow">
      <empty-state-placeholder icon="wand_rays" title="rules.title" text="rules.text" />
    </f7-block>
    <f7-fab v-show="ready && !showCheckboxes" position="right-bottom" slot="fixed" color="blue" href="add">
      <f7-icon ios="f7:plus" md="material:add" aurora="f7:plus"></f7-icon>
      <f7-icon ios="f7:close" md="material:close" aurora="f7:close"></f7-icon>
    </f7-fab>
  </f7-page>
</template>

<script>
export default {
  data () {
    return {
      ready: false,
      loading: false,
      noRuleEngine: false,
      rules: [],
      initSearchbar: false,
      selectedItems: [],
      showCheckboxes: false,
      eventSource: null
    }
  },
  computed: {
    indexedRules () {
      return this.rules.reduce((prev, rule, i, rules)=> {
        const initial = rule.name.substring(0, 1).toUpperCase()
        if (!prev[initial]) {
          prev[initial] = []
        }
        prev[initial].push(rule)

        return prev
      }, {})
    }
  },
  methods: {
    onPageAfterIn () {
      this.load()
    },
    load () {
      if (this.loading) return
      this.loading = true
      this.$set(this, 'selectedItems', [])
      this.showCheckboxes = false
      this.$oh.api.get('/rest/rules').then(data => {
        this.rules = data.sort((a, b) => {
          return a.name.localeCompare(b.name)
        })

        this.loading = false
        this.ready = true
        setTimeout(() => { this.initSearchbar = true; this.$refs.listIndex.update() })

        if (!this.eventSource) this.startEventSource()
      }).catch((err, status) => {
        if (err === 'Not Found' || status === 404) {
          this.noRuleEngine = true
        }
      })
    },
    startEventSource () {
      this.eventSource = this.$oh.sse.connect('/rest/events?topics=smarthome/rules/*/*', null, (event) => {
        console.log(event)
        const topicParts = event.topic.split('/')
        switch (topicParts[3]) {
          case 'added':
          case 'removed':
          case 'updated':
            this.load()
            break
          case 'state':
            const rule = this.rules.find((r) => r.uid === topicParts[2])
            if (!rule) break
            this.$set(rule, 'status', JSON.parse(event.payload))
        }
      })
    },
    stopEventSource () {
      this.$oh.sse.close(this.eventSource)
      this.eventSource = null
    },
    toggleCheck () {
      this.showCheckboxes = !this.showCheckboxes
    },
    isChecked (item) {
      return this.selectedItems.indexOf(item) >= 0
    },
    toggleItemCheck (event, item) {
      console.log('toggle check')
      if (this.isChecked(item)) {
        this.selectedItems.splice(this.selectedItems.indexOf(item), 1)
      } else {
        this.selectedItems.push(item)
      }
    },
    removeSelected () {
      const vm = this

      this.$f7.dialog.confirm(
        `Remove ${this.selectedItems.length} selected rules?`,
        'Remove Rules',
        () => {
          vm.doRemoveSelected()
        }
      )
    },
    doRemoveSelected () {
      if (this.selectedItems.some((i) => this.rules.find((rule) => rule.uid === i).editable === false)) {
        this.$f7.dialog.alert('Some of the selected rules are not modifiable because they have been provisioned by files')
        return
      }

      let dialog = this.$f7.dialog.progress('Deleting Rules...')

      const promises = this.selectedItems.map((i) => this.$oh.api.delete('/rest/rules/' + i))
      Promise.all(promises).then((data) => {
        this.$f7.toast.create({
          text: 'Rules removed',
          destroyOnClose: true,
          closeTimeout: 2000
        }).open()
        this.selectedItems = []
        dialog.close()
        this.load()
      }).catch((err) => {
        dialog.close()
        this.load()
        console.error(err)
        this.$f7.dialog.alert('An error occurred while deleting: ' + err)
      })
    }
  }
}
</script>
