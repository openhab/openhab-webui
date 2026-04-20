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
    </f7-block>

    <f7-block>
      <f7-link @click="f7router.back()">Go back</f7-link>
    </f7-block>
  </f7-page>
</template>

<script>
export default {
  props: {
    uid: String,
    f7router: Object,
    f7route: Object
  },
  data() {
    return {
      page: null
    }
  },
  methods: {
    onPageAfterIn() {
      const uid = this.uid || this.f7route?.params?.uid
      if (!uid) return
      this.$oh.api
        .get('/rest/ui/components/ui:page/' + uid)
        .then((data) => {
          this.page = data
        })
        .catch(() => {
          this.page = null
        })
    }
  }
}
</script>

<style scoped></style>
