<template>
  <f7-page class="user-profile-page" @page:beforein="onPageBeforeIn">
    <f7-navbar no-shadow no-hairline class="user-profile-navbar">
      <oh-nav-content :title="t('profile.title')" :f7router />
      <f7-subnavbar sliding class="profile-header">
        <div class="profile-icon">
          <f7-icon size="60"
                   ios="f7:person_alt_circle_fill"
                   aurora="f7:person_alt_circle_fill"
                   md="f7:person_alt_circle_fill"
                   color="gray" />
        </div>
        <h2>{{ userStore.user.name }}</h2>
        <h5>
          <small>{{ userStore.user.roles.join(', ') }}</small>
        </h5>
      </f7-subnavbar>
    </f7-navbar>
    <f7-block class="block-narrow after-profile-header">
      <f7-row>
        <f7-col>
          <f7-list>
            <f7-list-button color="blue" :external="true" href="/changePassword">
              {{ t('profile.changePassword') }}
            </f7-list-button>
          </f7-list>
        </f7-col>
      </f7-row>
    </f7-block>
    <f7-block class="block-narrow">
      <f7-row>
        <f7-col>
          <f7-block-title>{{ t('profile.sessions') }}</f7-block-title>
          <f7-block-footer class="padding-horizontal">
            {{ t('profile.sessions.header') }}
          </f7-block-footer>
          <f7-card>
            <f7-list media-list swipeout>
              <f7-list-item
                media-item
                swipeout
                v-for="session in filteredSessions"
                :key="session.sessionId"
                :title="session.clientId"
                :subtitle="t('profile.sessions.created') + new Date(session.createdTime).toLocaleString(runtimeStore.locale)"
                :text="t('profile.sessions.lastRefreshed') + new Date(session.lastRefreshTime).toLocaleString(runtimeStore.locale)">
                <template #media>
                  <f7-link
                    icon-color="red"
                    icon-aurora="f7:minus_circle_filled"
                    icon-ios="f7:minus_circle_filled"
                    icon-md="material:remove_circle_outline"
                    @click="showSwipeout" />
                </template>
                <f7-swipeout-actions right>
                  <f7-swipeout-button @click="(ev) => deleteSession(ev, session)" style="background-color: var(--f7-swipeout-delete-button-bg-color)">
                    {{ t('dialogs.delete') }}
                  </f7-swipeout-button>
                </f7-swipeout-actions>
              </f7-list-item>
              <f7-list-button v-if="!expandedTypes.sessions && sessions.length > 10" color="blue" @click="expandedTypes.sessions = true">
                {{ t('dialogs.showAll') }}
              </f7-list-button>
              <f7-list-button color="red" @click="logout()">
                {{ t('profile.sessions.signOut') }}
              </f7-list-button>
            </f7-list>
          </f7-card>
        </f7-col>
      </f7-row>
    </f7-block>
    <f7-block class="block-narrow margin-bottom padding-bottom">
      <f7-row>
        <f7-col>
          <f7-block-title>{{ t('profile.apiTokens') }}</f7-block-title>
          <f7-block-footer class="padding-horizontal">
            {{ t('profile.apiTokens.header') }}
          </f7-block-footer>
          <f7-card>
            <f7-list media-list swipeout>
              <f7-list-item
                media-item
                swipeout
                v-for="apiToken in apiTokens"
                :key="apiToken.name"
                :title="apiToken.name"
                :subtitle="t('profile.apiTokens.created') + new Date(apiToken.createdTime).toLocaleString(runtimeStore.locale | 'default')"
                :text="t('profile.apiTokens.validForScope') + (apiToken.scope || 'N/A')">
                <template #media>
                  <f7-link icon-color="red"
                           icon-aurora="f7:minus_circle_filled"
                           icon-ios="f7:minus_circle_filled"
                           icon-md="material:remove_circle_outline"
                           @click="showSwipeout" />
                </template>
                <f7-swipeout-actions right>
                  <f7-swipeout-button @click="(ev) => deleteApiToken(ev, apiToken)" style="background-color: var(--f7-swipeout-delete-button-bg-color)">
                    {{ t('dialogs.delete') }}
                  </f7-swipeout-button>
                </f7-swipeout-actions>
              </f7-list-item>
              <f7-list-button color="blue" :external="true" href="/createApiToken">
                {{ t('profile.apiTokens.create') }}
              </f7-list-button>
            </f7-list>
          </f7-card>
        </f7-col>
      </f7-row>
    </f7-block>
  </f7-page>
</template>

<style lang="stylus">
.profile-header.subnavbar
  height auto !important
  .subnavbar-inner
    flex-direction column !important
    .profile-icon
      height 60px
      width 60px
      padding 10px
      border-radius 40px
      background white
      img
        height 60px
        width 60px
      span
        width 100%
        display block
        text-align center
        color #c0c0c0
        font-size 40px
        font-weight thin
    h2
      white-space nowrap
      text-overflow ellipsis
      overflow-x hidden
      width 95%
      font-weight normal
      text-align center
      margin 0
    h4
      font-weight normal
      text-align center
      margin 0
    h5
      font-weight normal
      text-align center
      margin-top 0
.after-profile-header
  margin-top 10rem !important
</style>

<script>
import { f7, theme } from 'framework7-vue'
import { mapStores } from 'pinia'

import auth from '@/components/auth-mixin.js'
import { useI18n } from 'vue-i18n'
import { loadLocaleMessages } from '@/js/i18n'
import { useUserStore } from '@/js/stores/useUserStore'
import { useRuntimeStore } from '@/js/stores/useRuntimeStore'


export default {
  mixins: [auth],
  props: {
    f7router: Object
  },
  setup () {
    const { t, mergeLocaleMessage } = useI18n({ useScope: 'local' })
    loadLocaleMessages('profile', mergeLocaleMessage)
    return {
      t, theme
    }
  },
  data () {
    return {
      sessions: [],
      apiTokens: [],

      expandedTypes: {
        sessions: false
      }
    }
  },
  computed: {
    filteredSessions () {
      return (this.expandedTypes.sessions) ? this.sessions : (this.sessions ? this.sessions.slice(this.sessions.length - 10, this.sessions.length) : [])
    },
    ...mapStores(useRuntimeStore, useUserStore)
  },
  methods: {
    onPageBeforeIn () {
      Promise.all([
        this.$oh.api.get('/rest/auth/sessions'),
        this.$oh.api.get('/rest/auth/apitokens')
      ]).then((data) => {
        this.sessions = data[0]
        this.apiTokens = data[1]
      })
    },
    showSwipeout (ev) {
      let swipeoutElement = ev.target
      ev.cancelBubble = true
      while (!swipeoutElement.classList.contains('swipeout')) {
        swipeoutElement = swipeoutElement.parentElement
      }

      if (swipeoutElement) {
        f7.swipeout.open(swipeoutElement)
      }
    },
    deleteSession (ev, session) {
      let swipeoutElement = ev.target
      ev.cancelBubble = true
      while (!swipeoutElement.classList.contains('swipeout')) {
        swipeoutElement = swipeoutElement.parentElement
      }
      const payload = f7.utils.serializeObject({
        id: session.sessionId
      })
      this.$oh.api.postPlain('/rest/auth/logout', payload, 'application/json', 'application/x-www-form-urlencoded').then((data) => {
        f7.swipeout.delete(swipeoutElement, () => {
        })
        f7.toast.create({
          text: this.t('profile.sessions.delete.success'),
          destroyOnClose: true,
          closeTimeout: 2000
        }).open()
      }).catch((err) => {
        f7.dialog.alert(this.t('profile.sessions.delete.error') + err)
      })
    },
    deleteApiToken (ev, apiToken) {
      let swipeoutElement = ev.target
      ev.cancelBubble = true
      while (!swipeoutElement.classList.contains('swipeout')) {
        swipeoutElement = swipeoutElement.parentElement
      }
      this.$oh.api.delete('/rest/auth/apitokens/' + apiToken.name).then((data) => {
        f7.swipeout.delete(swipeoutElement, () => {
        })
        f7.toast.create({
          text: this.t('profile.apiTokens.delete.success'),
          destroyOnClose: true,
          closeTimeout: 2000
        }).open()
      }).catch((err) => {
        f7.dialog.alert(this.t('profile.apiTokens.delete.error') + err)
      })
    },
    logout () {
      f7.preloader.show()
      this.cleanSession().then(() => {
        this.loggedIn = false

        f7.views.main.router.navigate('/', { animate: false, clearPreviousHistory: true })
        window.location = window.location.origin
      }).catch((err) => {
        f7.preloader.hide()
        f7.dialog.alert(this.t('profile.sessions.signOut.error') + err)
      })
    }
  }
}
</script>
