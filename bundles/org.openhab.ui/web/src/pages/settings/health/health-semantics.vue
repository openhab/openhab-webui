<template>
  <f7-page @page:afterin="onPageAfterIn" class="health-semantics-page">
    <f7-navbar>
      <f7-nav-left>
        <f7-link icon-f7="chevron_left" href="/settings/health/">
          Health Checks
        </f7-link>
      </f7-nav-left>
      <f7-nav-title>
        Semantic Model Configuration Conflicts
      </f7-nav-title>
      <f7-nav-right>
        <developer-dock-icon />
      </f7-nav-right>
    </f7-navbar>

    <f7-block class="block-narrow">
      <f7-col>
        <f7-block-footer class="padding-horizontal">
          Item semantics need to be configured without ambiguity:<br>
          A Point only belongs to one Equipment or Location. It can have a Property.<br>
          An Equipment only belongs to one Equipment or Location.<br>
          A Location only belongs to one Location.<br>
          <br>
          Note that only the semantics configuration of managed items can be changed through the UI,
          not file based configurations - these must be fixed manually in the corresponding file.
        </f7-block-footer>
      </f7-col>
    </f7-block>

    <f7-block class="block-narrow">
      <!-- skeleton for not ready -->
      <f7-col v-if="!ready">
        <f7-block-title>&nbsp;Loading...</f7-block-title>
        <f7-list contacts-list class="col">
          <f7-list-group>
            <f7-list-item v-for="n in 10"
                          media-item
                          :key="n"
                          :class="`skeleton-text skeleton-effect-blink`"
                          title="Type of problem"
                          subtitle="Semantics model"
                          footer="" />
          </f7-list-group>
        </f7-list>
      </f7-col>

      <f7-col v-else>
        <f7-block-title>
          {{ semanticsProblems.length }} semantic model configuration conflict{{ plural(semanticsProblems.length) }} found
        </f7-block-title>
        <f7-list class="col" contacts-list>
          <f7-list-item v-for="semanticsProblem in semanticsProblems"
                        :key="problemKey(semanticsProblem)"
                        media-item
                        class="health-problem-item"
                        :link="getLinkForProblem(semanticsProblem)"
                        :title="semanticsProblem.reason"
                        :subtitle="'Item: ' + semanticsProblem.item + (semanticsProblem.semanticType ? ' (' + semanticsProblem.semanticType + ')' : '')"
                        :footer="semanticsProblem.explanation">
            <template #after-title>
              <f7-icon v-if="!semanticsProblem.editable"
                       f7="lock_fill"
                       size="1rem"
                       color="gray" />
            </template>
          </f7-list-item>
        </f7-list>
      </f7-col>
    </f7-block>
  </f7-page>
</template>

<style lang="stylus">
.health-semantics-page
  .health-problem-item
    .item-title
    .item-footer
      text-wrap: auto
</style>

<script>
export default {
  data () {
    return {
      ready: false,
      loading: false,
      semanticsProblems: []
    }
  },
  methods: {
    onPageAfterIn () {
      this.load()
    },
    load () {
      this.loading = true
      this.$oh.api.get('/rest/items/semantics/health').then((data) => {
        this.semanticsProblems = data
        this.loading = false
        this.ready = true
      })
    },
    problemKey (semanticsProblem) {
      return semanticsProblem.item + '_' + semanticsProblem.reason
    },
    getLinkForProblem (semanticsProblem) {
      return '/settings/items/' + semanticsProblem.item
    },
    plural (count) {
      return count === 1 ? '' : 's'
    }
  }
}
</script>
