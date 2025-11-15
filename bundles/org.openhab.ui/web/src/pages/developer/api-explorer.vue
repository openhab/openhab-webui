<template>
  <f7-page name="apiexplorer" @page:afterin="onPageAfterIn">
    <f7-navbar>
      <oh-nav-content title="API Explorer"
                      back-link="Developer Tools"
                      back-link-url="/developer/"
                      :f7router />
    </f7-navbar>
    <f7-block>
      <f7-col>
        <f7-card id="swaggerUi" />
      </f7-col>
    </f7-block>
  </f7-page>
</template>

<style lang="stylus">
#swaggerUi
  min-height 350px
  padding-bottom 5px
  color var(--f7-text-color) !important
  .wrapper
    padding 0
    max-width inherit
  .information-container, .scheme-container, .authorization__btn
    display none
  .operation-filter-input
    border 0
    font-size var(--f7-searchbar-input-font-size)
    height var(--f7-searchbar-height)
    background-color var(--f7-searchbar-input-bg-color)
    color var(--f7-searchbar-input-text-color)
    max-width 100% !important
  .expand-operation
    margin-right 15px
    width 0
  .opblock-tag-section
    line-height var(--f7-line-height) !important
  .opblock-tag
    padding 0
    margin-bottom 0
    a
      font-size var(--f7-list-font-size) !important
      font-family var(--f7-font-family) !important
      color var(--f7-text-color) !important
  .opblock
    margin 3px 5px !important
  .opblock-description-wrapper p, .opblock-external-docs-wrapper p, .opblock-title_normal p
    color var(--f7-text-color) !important
    font-family var(--f7-font-family) !important
  .opblock-section-header
    background-color var(--f7-list-item-divider-bg-color)
    color var(--f7-list-item-divider-text-color)
    & > label
      color var(--f7-list-item-divider-text-color)
    .btn:not(.try-out)
      color var(--f7-text-color)
  .opblock-summary
    padding 2px 5px
  .opblock-summary-method
    min-width 75px !important
    font-size var(--f7-list-font-size) !important
    font-family var(--f7-font-family) !important
    padding 2px 0
  .opblock-summary-path a
    color var(--f7-text-color) !important
    font-size var(--f7-list-font-size) !important
    font-family var(--f7-font-family) !important
    font-weight 500
  .opblock-summary-description
    text-align right
    color var(--f7-list-item-after-text-color) !important
    font-size var(--f7-list-item-footer-font-size) !important
    font-family var(--f7-font-family) !important
  .opblock-control-arrow
    width: 50px           // fix for width
  .parameter__name
    font-weight bold
    white-space nowrap
  .parameter__name, .parameter__type, .response-col_status, .response-col_description
    color var(--f7-text-color) !important
    padding 0
    font-size var(--f7-list-font-size) !important
  tbody .response-col_status
    padding-top 0.9rem !important
  .parameters input
    background-color #fff
    color #000
    padding 3px
  h3, h4, h5
    color var(--f7-text-color) !important
  table
    thead
      tr
        td, th
          color var(--f7-text-color) !important
    tbody
      tr
        td
          padding-top 0
          color var(--f7-text-color) !important
  .model-container
    margin 0 5px
    background inherit
  .model-box
    padding 3px
  .model
    color var(--f7-color-gray) !important
  .model-title
    color var(--f7-text-color) !important
    font-size var(--f7-list-font-size) !important
.dark #swaggerUi
  .loading, .model-toggle, svg
    filter invert(1) opacity(0.5)
.swagger-ui .download-contents
  width auto
</style>

<script>
import auth from '@/components/auth-mixin.js'

export default {
  mixins: [auth],
  methods: {
    onPageAfterIn () {
      const swaggerCss = import(/* webpackChunkName: "swagger-css" */ 'swagger-ui-dist/swagger-ui.css')
      const swaggerModule = import(/* webpackChunkName: "swagger" */ 'swagger-ui-dist')
      const refreshToken = this.refreshAccessToken()

      Promise.all([swaggerModule, swaggerCss, refreshToken]).then((results) => {
        const SwaggerUI = results[0].SwaggerUIBundle
        const tokenResponse = results[2]
        SwaggerUI({
          url: '/rest/spec',
          dom_id: '#swaggerUi',
          deepLinking: false,
          defaultModelsExpandDepth: 0,
          tagsSorter: 'alpha',
          operationsSorter: 'alpha',
          filter: true,
          docExpansion: 'none',
          syntaxHighlight: false,
          requestInterceptor: (req) => {
            if (document.cookie.indexOf('X-OPENHAB-AUTH-HEADER') >= 0) {
              req.headers['X-OPENHAB-TOKEN'] = tokenResponse.access_token
            } else {
              req.headers['Authorization'] = 'Bearer ' + tokenResponse.access_token
            }
            return req
          }
        })
      })
    }
  }
}
</script>
