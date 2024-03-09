<template>
  <f7-page class="user-profile-page" @page:beforein="onPageBeforeIn" @page:afterin="onPageAfterIn">
    <f7-navbar :title="$t('profile.title')" back-link="Back" no-shadow no-hairline class="user-profile-navbar">
      <!-- <f7-nav-right>
        <f7-link icon-md="material:edit" href="edit">{{ $theme.md ? '' : 'Edit' }}</f7-link>
      </f7-nav-right> -->
      <f7-subnavbar sliding class="profile-header">
        <div class="profile-icon">
          <f7-icon slot="media" size="60" ios="f7:person_alt_circle_fill" aurora="f7:person_alt_circle_fill" md="f7:person_alt_circle_fill" color="gray" />
        <!-- <span v-else>
          {{item.label ? item.label[0] : item.name[0]}}
        </span> -->
        </div>
        <h2>{{ user.name }}</h2>
        <!-- <h4 v-show="item.label">{{item.name}}</h4> -->
        <h5><small>{{ user.roles.join(', ') }}</small></h5>
      </f7-subnavbar>
    </f7-navbar>
    <f7-block class="block-narrow after-profile-header">
      <f7-row>
        <f7-col>
          <f7-list>
            <f7-list-button color="blue" :external="true" href="/changePassword">
              {{ $t('profile.changePassword') }}
            </f7-list-button>
          </f7-list>
        </f7-col>
      </f7-row>
    </f7-block>
    <f7-block class="block-narrow">
      <f7-row>
        <f7-col>
          <f7-block-title v-t="'profile.sessions'" />
          <f7-block-footer class="padding-horizontal" v-t="'profile.sessions.header'" />
          <f7-card>
            <f7-list media-list swipeout>
              <f7-list-item
                media-item swipeout
                v-for="session in filteredSessions"
                :key="session.sessionId"
                :title="session.clientId"
                :subtitle="$t('profile.sessions.created') + new Date(session.createdTime).toLocaleString($store.getters.locale)"
                :text="$t('profile.sessions.lastRefreshed') + new Date(session.lastRefreshTime).toLocaleString($store.getters.locale)">
                <f7-link slot="media" icon-color="red" icon-aurora="f7:minus_circle_filled" icon-ios="f7:minus_circle_filled" icon-md="material:remove_circle_outline" @click="showSwipeout" />
                <f7-swipeout-actions right>
                  <f7-swipeout-button @click="(ev) => deleteSession(ev, session)" style="background-color: var(--f7-swipeout-delete-button-bg-color)">
                    {{ $t('dialogs.delete') }}
                  </f7-swipeout-button>
                </f7-swipeout-actions>
              </f7-list-item>
              <f7-list-button v-if="!expandedTypes.sessions && sessions.length > 10" color="blue" @click="$set(expandedTypes, 'sessions', true)">
                {{ $t('dialogs.showAll') }}
              </f7-list-button>
              <f7-list-button color="red" @click="logout()">
                {{ $t('profile.sessions.signOut') }}
              </f7-list-button>
            </f7-list>
          </f7-card>
        </f7-col>
      </f7-row>
    </f7-block>
    <f7-block class="block-narrow margin-bottom padding-bottom">
      <f7-row>
        <f7-col>
          <f7-block-title v-t="'profile.apiTokens'" />
          <f7-block-footer class="padding-horizontal" v-t="'profile.apiTokens.header'" />
          <f7-card>
            <f7-list media-list swipeout>
              <f7-list-item
                media-item swipeout
                v-for="apiToken in apiTokens"
                :key="apiToken.name"
                :title="apiToken.name"
                :subtitle="$t('profile.apiTokens.created') + new Date(apiToken.createdTime).toLocaleString($store.getters.locale)"
                :text="$t('profile.apiTokens.validForScope') + (apiToken.scope || 'N/A')">
                <f7-link slot="media" icon-color="red" icon-aurora="f7:minus_circle_filled" icon-ios="f7:minus_circle_filled" icon-md="material:remove_circle_outline" @click="showSwipeout" />
                <f7-swipeout-actions right>
                  <f7-swipeout-button @click="(ev) => deleteApiToken(ev, apiToken)" style="background-color: var(--f7-swipeout-delete-button-bg-color)">
                    {{ $t('dialogs.delete') }}
                  </f7-swipeout-button>
                </f7-swipeout-actions>
              </f7-list-item>
              <f7-list-button color="blue" :external="true" href="/createApiToken">
                {{ $t('profile.apiTokens.create') }}
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
import auth from '@/components/auth-mixin.js'
import { loadLocaleMessages } from '@/js/i18n'

export default {
  mixins: [auth],
  data () {
    return {
      user: this.$store.getters.user,
      sessions: [],
      apiTokens: [],

      expandedTypes: {
        sessions: false
      }
    }
  },
  i18n: {
    messages: loadLocaleMessages(require.context('@/assets/i18n/profile'))
  },
  computed: {
    filteredSessions () {
      return (this.expandedTypes.sessions) ? this.sessions : (this.sessions ? this.sessions.slice(this.sessions.length - 10, this.sessions.length) : [])
    }
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
    onPageAfterIn () {
    },
    showSwipeout (ev) {
      let swipeoutElement = ev.target
      ev.cancelBubble = true
      while (!swipeoutElement.classList.contains('swipeout')) {
        swipeoutElement = swipeoutElement.parentElement
      }

      if (swipeoutElement) {
        this.$f7.swipeout.open(swipeoutElement)
      }
    },
    deleteSession (ev, session) {
      let swipeoutElement = ev.target
      ev.cancelBubble = true
      while (!swipeoutElement.classList.contains('swipeout')) {
        swipeoutElement = swipeoutElement.parentElement
      }
      const payload = this.$f7.utils.serializeObject({
        'id': session.sessionId
      })
      this.$oh.api.postPlain('/rest/auth/logout', payload, 'application/json', 'application/x-www-form-urlencoded').then((data) => {
        this.$f7.swipeout.delete(swipeoutElement, () => {
        })
        this.$f7.toast.create({
          text: this.$t('profile.sessions.delete.success'),
          destroyOnClose: true,
          closeTimeout: 2000
        }).open()
      }).catch((err) => {
        this.$f7.dialog.alert(this.$t('profile.sessions.delete.error') + err)
      })
    },
    deleteApiToken (ev, apiToken) {
      let swipeoutElement = ev.target
      ev.cancelBubble = true
      while (!swipeoutElement.classList.contains('swipeout')) {
        swipeoutElement = swipeoutElement.parentElement
      }
      this.$oh.api.delete('/rest/auth/apitokens/' + apiToken.name).then((data) => {
        this.$f7.swipeout.delete(swipeoutElement, () => {
        })
        this.$f7.toast.create({
          text: this.$t('profile.apiTokens.delete.success'),
          destroyOnClose: true,
          closeTimeout: 2000
        }).open()
      }).catch((err) => {
        this.$f7.dialog.alert(this.$t('profile.apiTokens.delete.error') + err)
      })
    },
    logout () {
      this.$f7.preloader.show()
      localStorage.removeItem('openhab.ui:serverUrl')
      localStorage.removeItem('openhab.ui:username')
      localStorage.removeItem('openhab.ui:password')
      this.cleanSession().then(() => {
        this.loggedIn = false
        this.$f7.views.main.router.navigate('/', { animate: false, clearPreviousHistory: true })
        window.location = window.location.origin
      }).catch((err) => {
        this.$f7.preloader.hide()
        this.$f7.dialog.alert(this.$t('profile.sessions.signOut.error') + err)
      })
    }
  }
}
</script>
