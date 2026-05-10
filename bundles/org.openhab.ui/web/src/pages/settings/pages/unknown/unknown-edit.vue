<template>
  <f7-page @page:afterin="onPageAfterIn">
    <f7-navbar>
      <oh-nav-content title="Unknown Page Type" :f7router />
    </f7-navbar>

    <f7-block strong>
      <p>Unknown page type. Check the <code>component</code> of your page definition.</p>
      <p v-if="page">
        <b>Page ID:</b> {{ uid || f7route.params.uid }}<br />
        <b>Component:</b> <code class="text-color-red">{{ page.component }}</code>
      </p>
      <div v-if="suggestions.length">
        <b>Did you mean:</b>
        <ul>
          <li v-for="s in suggestions" :key="s">{{ s }}</li>
        </ul>
      </div>
    </f7-block>

    <f7-block strong>
      <f7-link @click="f7router.back()"> Go back </f7-link>
    </f7-block>
    <f7-button href="/"> Go home </f7-button>
  </f7-page>
</template>

<script>
import { getPageComponentTypes } from '@/pages/page-type'
import { mapStores } from 'pinia'
import { useComponentsStore } from '@/js/stores/useComponentsStore.ts'

export default {
  props: {
    uid: String,
    f7router: Object,
    f7route: Object
  },
  data() {
    return {
      page: null,
      suggestions: []
    }
  },
  computed: {
    ...mapStores(useComponentsStore)
  },
  watch: {
    'componentsStore.ready'(newVal) {
      if (newVal) this.load()
    }
  },
  methods: {
    onPageAfterIn() {
      this.load()
    },
    load() {
      const uid = this.uid || this.f7route?.params?.uid
      if (!uid) return
      this.page = this.componentsStore.page(uid)
      if (this.page) {
        this.computeSuggestions()
      } else {
        this.suggestions = []
      }
    },
    computeSuggestions() {
      if (!this.page || !this.page.component) {
        this.suggestions = []
        return
      }
      const target = String(this.page.component).toLowerCase()
      const candidates = getPageComponentTypes()
      const scored = candidates.map((c) => ({
        name: c,
        dist: this.levenshtein(c.toLowerCase(), target)
      }))
      scored.sort((a, b) => a.dist - b.dist)
      // pick top 3 suggestions with reasonable distance
      const threshold = Math.max(3, Math.floor(target.length / 3))
      this.suggestions = scored
        .filter((s) => s.dist <= threshold)
        .slice(0, 3)
        .map((s) => s.name)
    },
    levenshtein(a, b) {
      const al = a.length
      const bl = b.length
      if (al === 0) return bl
      if (bl === 0) return al
      const prev = new Array(bl + 1)
      for (let j = 0; j <= bl; j++) prev[j] = j
      for (let i = 1; i <= al; i++) {
        let cur = new Array(bl + 1)
        cur[0] = i
        for (let j = 1; j <= bl; j++) {
          const cost = a[i - 1] === b[j - 1] ? 0 : 1
          cur[j] = Math.min(
            prev[j] + 1, // deletion
            cur[j - 1] + 1, // insertion
            prev[j - 1] + cost // substitution
          )
        }
        for (let j = 0; j <= bl; j++) prev[j] = cur[j]
      }
      return prev[bl]
    }
  }
}
</script>
