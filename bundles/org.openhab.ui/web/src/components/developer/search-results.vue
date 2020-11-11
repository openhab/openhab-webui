<template>
  <div class="after-big-title">
    <f7-block class="no-margin no-padding" v-if="searchResults.items.length">
      <f7-block-title class="padding-left"><f7-icon class="margin-right" f7="square_on_circle" />Items</f7-block-title>
      <f7-list media-list>
        <f7-list-item media-item v-for="item in searchResults.items.slice(0, 5)" :key="item.name"
          :title="item.label || item.name" :footer="(item.label) ? item.name : ''">
          <f7-link slot="after" v-if="isPinned('items', item, 'name')" @click="$emit('unpin', 'items', item, 'name')" color="red" icon-f7="pin_slash_fill" icon-size="18" tooltip="Unpin" />
          <f7-link slot="after" v-else @click="$emit('pin', 'items', item, 'name')" color="blue" icon-f7="unpin" icon-size="18" tooltip="Pin" />
        </f7-list-item>
      </f7-list>
    </f7-block>
    <f7-block class="no-margin no-padding" v-if="searchResults.things.length">
      <f7-block-title class="padding-left"><f7-icon class="margin-right" f7="lightbulb" />Things</f7-block-title>
      <f7-list media-list>
        <f7-list-item media-item v-for="thing in searchResults.things.slice(0, 5)" :key="thing.UID"
          :title="thing.label" :footer="thing.UID">
          <f7-link slot="after" v-if="isPinned('things', thing, 'UID')" @click="$emit('unpin', 'things', thing, 'UID')" color="red" icon-f7="pin_slash_fill" icon-size="18" tooltip="Unpin" />
          <f7-link slot="after" v-else @click="$emit('pin', 'things', thing, 'UID')" color="blue" icon-f7="unpin" icon-size="18" tooltip="Pin" />
        </f7-list-item>
      </f7-list>
    </f7-block>
    <f7-block class="no-margin no-padding" v-if="searchResults.rules.length">
      <f7-block-title class="padding-left"><f7-icon class="margin-right" f7="wand_stars" />Rules</f7-block-title>
      <f7-list media-list>
        <f7-list-item media-item v-for="rule in searchResults.rules.slice(0, 5)" :key="rule.uid"
          :title="rule.name" :footer="rule.uid">
          <f7-link slot="after" v-if="isPinned('rules', rule, 'uid')" @click="$emit('unpin', 'rules', rule, 'uid')" color="red" icon-f7="pin_slash_fill" icon-size="18" tooltip="Unpin" />
          <f7-link slot="after" v-else @click="$emit('pin', 'rules', rule, 'uid')" color="blue" icon-f7="unpin" icon-size="18" tooltip="Pin" />
        </f7-list-item>
      </f7-list>
    </f7-block>
    <f7-block class="no-margin no-padding" v-if="searchResults.pages.length">
      <f7-block-title class="padding-left"><f7-icon class="margin-right" f7="tv" />Pages</f7-block-title>
      <f7-list media-list>
        <f7-list-item media-item v-for="page in searchResults.pages.slice(0, 5)" :key="page.uid"
          :title="page.config.label" :footer="page.uid">
          <f7-link slot="after" v-if="isPinned('pages', page, 'uid')" @click="$emit('unpin', 'pages', page, 'uid')" color="red" icon-f7="pin_slash_fill" icon-size="18" tooltip="Unpin" />
          <f7-link slot="after" v-else @click="$emit('pin', 'pages', page, 'uid')" color="blue" icon-f7="unpin" icon-size="18" tooltip="Pin" />
        </f7-list-item>
      </f7-list>
    </f7-block>

  </div>
</template>

<script>
export default {
  props: ['searchResults', 'pinnedObjects'],
  components: {
  },
  methods: {
    isPinned (type, obj, keyName) {
      return this.pinnedObjects[type].findIndex((o) => o[keyName] === obj[keyName]) >= 0
    }
  }
}
</script>
