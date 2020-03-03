<template>
  <f7-block>
    <f7-block-title class="padding-left">Theme</f7-block-title>
    <f7-segmented>
      <f7-button round color="blue" raised :fill="theme === 'auto'" @click="switchTheme('auto')">Auto</f7-button>
      <f7-button round color="blue" raised :fill="theme === 'md'" @click="switchTheme('md')">MD</f7-button>
      <f7-button round color="blue" raised :fill="theme === 'ios'" @click="switchTheme('ios')">iOS</f7-button>
      <f7-button round color="blue" raised :fill="theme === 'aurora'" @click="switchTheme('aurora')">Aurora</f7-button>
    </f7-segmented>
    <f7-block-title>Dark mode</f7-block-title>
    <f7-row>
      <f7-col width="50" class="bg-color-white demo-theme-picker" @click="setThemeDark('light')">
        <f7-checkbox checked disabled v-if="darkMode === 'light'" />
      </f7-col>
      <f7-col width="50" class="bg-color-black demo-theme-picker" @click="setThemeDark('dark')">
        <f7-checkbox checked disabled v-if="darkMode === 'dark'" />
      </f7-col>
    </f7-row>
    <f7-block-title>Navigation bars style</f7-block-title>
    <f7-row>
      <f7-col width="50" class="demo-bars-picker demo-bars-picker-fill" @click="setBarsStyle('filled')">
        <div class="demo-navbar"></div>
        <f7-checkbox checked disabled v-if="barsStyle === 'filled'" />
      </f7-col>
      <f7-col width="50" class="demo-bars-picker demo-bars-picker-empty" @click="setBarsStyle('light')">
        <div class="demo-navbar"></div>
        <f7-checkbox checked disabled v-if="barsStyle === 'light'" />
      </f7-col>
    </f7-row>

    <f7-row>
      <f7-col>
        <f7-block-title>Miscellaneous</f7-block-title>
        <f7-list>
          <f7-list-item>
            <span>Simple navigation bar on home page</span>
            <f7-toggle :checked="homePageNavbarStyle === 'simple'" @toggle:change="setHomePageNavbarStyle"></f7-toggle>
          </f7-list-item>
          <f7-list-item>
            <span>Disable card expansion animations</span>
            <f7-toggle :checked="expandableCardsAnimation === 'disabled'" @toggle:change="setExpandableCardAnimation"></f7-toggle>
          </f7-list-item>
          <f7-list-item>
            <span>Disable page transition animations</span>
            <f7-toggle :checked="pageTransitionAnimation === 'disabled'" @toggle:change="setPageTransitionAnimation"></f7-toggle>
          </f7-list-item>
        </f7-list>
      </f7-col>
    </f7-row>
  </f7-block>
</template>
<script>
export default {
  methods: {
    switchTheme (theme) {
      localStorage.setItem('openhab.ui:theme', theme)
      location.reload()
      // document.location = document.location.origin + document.location.pathname + '?theme=' + theme
    },
    setThemeDark (value) {
      localStorage.setItem('openhab.ui:theme.dark', value)
      localStorage.setItem('openhab.ui:theme.bars', 'light') // dark theme with filled bars is ugly, switch to light bars too
      location.reload()
    },
    setBarsStyle (value) {
      localStorage.setItem('openhab.ui:theme.bars', value)
      location.reload()
    },
    setHomePageNavbarStyle (value) {
      localStorage.setItem('openhab.ui:theme.home.navbar', (value) ? 'simple' : 'default')
      location.reload()
    },
    setExpandableCardAnimation (value) {
      localStorage.setItem('openhab.ui:theme.home.cardanimation', (value) ? 'disabled' : 'default')
      location.reload()
    },
    setPageTransitionAnimation (value) {
      localStorage.setItem('openhab.ui:theme.home.pagetransition', (value) ? 'disabled' : 'default')
      location.reload()
    }
  },
  computed: {
    theme () {
      return localStorage.getItem('openhab.ui:theme') || 'auto'
    },
    darkMode () {
      return localStorage.getItem('openhab.ui:theme.dark') || 'light'
    },
    barsStyle () {
      return localStorage.getItem('openhab.ui:theme.bars') || ((!this.$theme.ios) ? 'filled' : 'light')
    },
    homePageNavbarStyle () {
      return localStorage.getItem('openhab.ui:theme.home.navbar') || 'default'
    },
    expandableCardsAnimation () {
      return localStorage.getItem('openhab.ui:theme.home.cardanimation') || 'default'
    },
    pageTransitionAnimation () {
      return localStorage.getItem('openhab.ui:theme.home.pagetransition') || 'default'
    }
  }
}
</script>
<style>
.demo-theme-picker {
  cursor: pointer;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0px 5px 20px rgba(0,0,0,0.1);
  border: 1px solid rgba(255,255,255,0.2);
  box-sizing: border-box;
  position: relative;
}
.demo-theme-picker .checkbox {
  position: absolute;
  left: 10px;
  bottom: 10px;
}
.demo-color-picker-button {
  margin-bottom: 1em;
  text-transform: capitalize;
}
.demo-bars-picker {
  height: 200px;
  border-radius: 10px;
  box-shadow: 0px 5px 20px rgba(0,0,0,0.1);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  background: var(--f7-page-bg-color);
  border: 1px solid rgba(255,255,255,0.2);
}
.demo-bars-picker .checkbox {
  position: absolute;
  left: 10px;
  bottom: 10px;
}

.demo-bars-picker .demo-navbar {
  position: absolute;
  left: 0;
  width: 100%;
  height: 30px;
  top: 0;
  border-bottom: 1px solid transparent;
}
.demo-bars-picker .demo-navbar:before {
  content: '';
  position: absolute;
  left: 10px;
  width: 20px;
  height: 10px;
  top: 50%;
  margin-top: -5px;
}
.demo-bars-picker .demo-navbar:after {
  content: '';
  position: absolute;
  right: 10px;
  width: 20px;
  height: 10px;
  top: 50%;
  margin-top: -5px;
}
.demo-bars-picker-empty .demo-navbar {
  background: #f7f7f8;
  border-color: rgba(0,0,0,0.1);
}
.theme-dark .demo-bars-picker-empty .demo-navbar {
  background: #1b1b1b;
  border-color: #282829;
}
.demo-bars-picker-empty .demo-navbar:before,
.demo-bars-picker-empty .demo-navbar:after {
  background: var(--f7-theme-color);
}
.demo-bars-picker-fill .demo-navbar {
  background: var(--f7-theme-color);
}
.demo-bars-picker-fill .demo-navbar:before,
.demo-bars-picker-fill .demo-navbar:after {
  background: #fff;
}
</style>
