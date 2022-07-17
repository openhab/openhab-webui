import HomePage from '../pages/home.vue'
import NotFoundPage from '../pages/not-found.vue'
import PageViewPage from '../pages/page/page-view.vue'
import AnalyzerPopup from '../pages/analyzer/analyzer-popup.vue'

const AboutPage = () => import(/* webpackChunkName: "about-page" */ '../pages/about.vue')
const UserProfilePage = () => import(/* webpackChunkName: "profile-page" */ '../pages/profile.vue')

const SettingsMenuPage = () => import(/* webpackChunkName: "admin-base" */ '../pages/settings/settings-menu.vue')
const ServiceSettingsPage = () => import(/* webpackChunkName: "admin-base" */ '../pages/settings/services/service-settings.vue')
const AddonsListPage = () => import(/* webpackChunkName: "admin-base" */ '../pages/settings/addons/addons-list.vue')
const AddonsAddPage = () => import(/* webpackChunkName: "admin-base" */ '../pages/settings/addons/addons-add.vue')
const AddonsConfigureBindingPage = () => import(/* webpackChunkName: "admin-base" */ '../pages/settings/addons/addon-config.vue')
const AddonsStorePage = () => import(/* webpackChunkName: "admin-base" */ '../pages/settings/addons/addons-store.vue')
const AddonDetailsPage = () => import(/* webpackChunkName: "admin-base" */ '../pages/settings/addons/addon-details.vue')

const ItemsListPage = () => import(/* webpackChunkName: "admin-config" */ '../pages/settings/items/items-list-vlist.vue')
const ItemDetailsPage = () => import(/* webpackChunkName: "admin-config" */ '../pages/settings/items/item-details.vue')
const ItemEditPage = () => import(/* webpackChunkName: "admin-config" */ '../pages/settings/items/item-edit.vue')
const ItemMetadataEditPage = () => import(/* webpackChunkName: "admin-config" */ '../pages/settings/items/metadata/item-metadata-edit.vue')
const ItemsAddFromTextualDefinition = () => import(/* webpackChunkName: "admin-config" */ '../pages/settings/items/parser/items-add-from-textual-definition.vue')

const ThingsListPage = () => import(/* webpackChunkName: "admin-config" */ '../pages/settings/things/things-list.vue')
const ThingDetailsPage = () => import(/* webpackChunkName: "admin-config" */ '../pages/settings/things/thing-details.vue')
const AddThingChooseBindingPage = () => import(/* webpackChunkName: "admin-config" */ '../pages/settings/things/add/choose-binding.vue')
const AddThingChooseThingTypePage = () => import(/* webpackChunkName: "admin-config" */ '../pages/settings/things/add/choose-thing-type.vue')
const AddThingPage = () => import(/* webpackChunkName: "admin-config" */ '../pages/settings/things/add/thing-add.vue')

const InboxListPage = () => import(/* webpackChunkName: "admin-config" */ '../pages/settings/things/inbox/inbox-list.vue')

const SemanticModelPage = () => import(/* webpackChunkName: "admin-config" */ '../pages/settings/model/model.vue')

const PagesListPage = () => import(/* webpackChunkName: "admin-pages" */ '../pages/settings/pages/pages-list.vue')
const PageEditors = {
  home: () => import(/* webpackChunkName: "admin-pages" */ '../pages/settings/pages/home/home-edit.vue'),
  layout: () => import(/* webpackChunkName: "admin-pages" */ '../pages/settings/pages/layout/layout-edit.vue'),
  tabs: () => import(/* webpackChunkName: "admin-pages" */ '../pages/settings/pages/tabs/tabs-edit.vue'),
  map: () => import(/* webpackChunkName: "admin-pages-leaflet" */ '../pages/settings/pages/map/map-edit.vue'),
  plan: () => import(/* webpackChunkName: "admin-pages-leaflet" */ '../pages/settings/pages/plan/plan-edit.vue'),
  chart: () => import(/* webpackChunkName: "admin-pages-echarts" */ '../pages/settings/pages/chart/chart-edit.vue'),
  sitemap: () => import(/* webpackChunkName: "admin-pages" */ '../pages/settings/pages/sitemap/sitemap-edit.vue')
}

const RulesListPage = () => import(/* webpackChunkName: "admin-rules" */ '../pages/settings/rules/rules-list.vue')
const RuleEditPage = () => import(/* webpackChunkName: "admin-rules" */ '../pages/settings/rules/rule-edit.vue')
const ScriptEditPage = () => import(/* webpackChunkName: "admin-rules" */ '../pages/settings/rules/script/script-edit.vue')
const SchedulePage = () => import(/* webpackChunkName: "admin-schedule" */ '../pages/settings/schedule/schedule.vue')

const DeveloperToolsPage = () => import(/* webpackChunkName: "admin-devtools" */ '../pages/developer/developer-tools.vue')
const WidgetsListPage = () => import(/* webpackChunkName: "admin-devtools" */ '../pages/developer/widgets/widget-list.vue')
const WidgetEditPage = () => import(/* webpackChunkName: "admin-devtools" */ '../pages/developer/widgets/widget-edit.vue')
const BlocksListPage = () => import(/* webpackChunkName: "admin-devtools" */ '../pages/developer/blocks/blocks-list.vue')
const BlocksEditPage = () => import(/* webpackChunkName: "blockly-editor" */ '../pages/developer/blocks/blocks-edit.vue')
const ApiExplorerPage = () => import(/* webpackChunkName: "admin-devtools" */ '../pages/developer/api-explorer.vue')

const SetupWizardPage = () => import(/* webpackChunkName: "setup-wizard" */ '../pages/wizards/setup-wizard.vue')

const checkDirtyBeforeLeave = function (routeTo, routeFrom, resolve, reject) {
  if (this.currentPageEl && this.currentPageEl.__vue__ && this.currentPageEl.__vue__.$parent && this.currentPageEl.__vue__.$parent.beforeLeave &&
      !routeTo.path.startsWith(routeFrom.path)) {
    this.currentPageEl.__vue__.$parent.beforeLeave(this, routeTo, routeFrom, resolve, reject)
  } else {
    resolve()
  }
}

const loadAsync = (page, props) => {
  return (routeTo, routeFrom, resolve, reject) => {
    if (!props) {
      page().then((c) => { resolve({ component: c.default }) })
    } else if (typeof props === 'object') {
      page().then((c) => { resolve({ component: c.default }, { props }) })
    } else if (typeof props === 'function') {
      page().then((c) => { resolve({ component: c.default }, { props: props(routeTo, routeFrom, resolve, reject) }) })
    }
  }
}

export default [
  {
    path: '/',
    component: HomePage,
    // keepAlive: true,
    options: {
      transition: 'f7-dive'
    }
  },
  {
    path: '/page/:uid',
    component: PageViewPage
  },
  {
    path: '/about/',
    async: loadAsync(AboutPage),
    options: {
      animate: false
    }
  },
  {
    path: '/setup-wizard/',
    async: loadAsync(SetupWizardPage)
  },
  {
    path: '/profile/',
    async: loadAsync(UserProfilePage),
    options: {
      animate: false
    }
  },
  {
    path: '/settings/',
    async: loadAsync(SettingsMenuPage),
    keepAlive: true,
    routes: [
      {
        path: 'items',
        async: loadAsync(ItemsListPage),
        routes: [
          {
            path: 'add',
            async: loadAsync(ItemEditPage, { createMode: true })
          },
          {
            path: 'add-from-textual-definition',
            async: loadAsync(ItemsAddFromTextualDefinition)
          },
          {
            path: ':itemName',
            async: loadAsync(ItemDetailsPage),
            routes: [
              {
                path: 'edit',
                beforeLeave: checkDirtyBeforeLeave,
                async: loadAsync(ItemEditPage)
              },
              {
                path: 'metadata/:namespace',
                beforeLeave: checkDirtyBeforeLeave,
                async: loadAsync(ItemMetadataEditPage)
              }
            ]
          }
        ]
      },
      {
        path: 'pages',
        async: loadAsync(PagesListPage),
        routes: [
          {
            path: ':type/:uid',
            beforeLeave: checkDirtyBeforeLeave,
            async (routeTo, routeFrom, resolve, reject) {
              PageEditors[routeTo.params.type]().then((c) => { resolve({ component: c.default }, (routeTo.params.uid === 'add') ? { props: { createMode: true } } : {}) })
            }
          }
        ]
      },
      {
        path: 'things/',
        async: loadAsync(ThingsListPage),
        routes: [
          {
            path: 'add',
            async: loadAsync(AddThingChooseBindingPage),
            routes: [
              // {
              //   path: 'install-binding',
              //   async: loadAsync(AddonsAddPage, { addonType: 'binding' })
              // },
              {
                path: ':bindingId',
                async: loadAsync(AddThingChooseThingTypePage),
                routes: [
                  {
                    path: ':thingTypeId',
                    async: loadAsync(AddThingPage)
                  }
                ]
              }
            ]
          },
          {
            path: 'inbox',
            async: loadAsync(InboxListPage)
          },
          {
            path: ':thingId',
            beforeLeave: checkDirtyBeforeLeave,
            async: loadAsync(ThingDetailsPage)
          }
        ]
      },
      {
        path: 'model',
        async: loadAsync(SemanticModelPage)
      },
      {
        path: 'rules/',
        async: loadAsync(RulesListPage),
        routes: [
          {
            path: ':ruleId',
            beforeLeave: checkDirtyBeforeLeave,
            async: loadAsync(RuleEditPage, (routeTo) => (routeTo.params.ruleId === 'add') ? { createMode: true } : {}),
            routes: [
              {
                path: 'script/:moduleId',
                beforeLeave: checkDirtyBeforeLeave,
                async: loadAsync(ScriptEditPage, (routeTo) => (routeTo.params.ruleId === 'add') ? { createMode: true } : {})
              }
            ]
          }
        ]
      },
      {
        path: 'scripts/',
        async: loadAsync(RulesListPage, { showScripts: true }),
        routes: [
          {
            path: ':ruleId',
            beforeLeave: checkDirtyBeforeLeave,
            async: loadAsync(ScriptEditPage, (routeTo) => (routeTo.params.ruleId === 'add') ? { createMode: true } : {})
          }
        ]
      },
      {
        path: 'schedule/',
        async: loadAsync(SchedulePage),
        routes: [
          {
            path: 'add',
            beforeLeave: checkDirtyBeforeLeave,
            async: loadAsync(RuleEditPage, { createMode: true, schedule: true })
          }
        ]
      },
      {
        path: 'addons',
        async: loadAsync(AddonsStorePage),
        routes: [
          {
            path: ':addonId',
            async: loadAsync(AddonDetailsPage)
          },
          {
            path: ':addonId/config',
            async: loadAsync(AddonsConfigureBindingPage)
          }
        ]
      },
      {
        path: 'services/:serviceId',
        beforeLeave: checkDirtyBeforeLeave,
        async: loadAsync(ServiceSettingsPage)
      }
    ]
  },
  {
    path: '/developer/',
    async: loadAsync(DeveloperToolsPage),
    routes: [
      {
        path: 'widgets/',
        async: loadAsync(WidgetsListPage),
        routes: [
          {
            path: ':uid',
            beforeLeave: checkDirtyBeforeLeave,
            async: loadAsync(WidgetEditPage, (routeTo) => (routeTo.params.uid === 'add') ? { createMode: true } : {})
          }
        ]
      },
      {
        path: 'blocks/',
        async: loadAsync(BlocksListPage),
        routes: [
          {
            path: ':uid',
            beforeLeave: checkDirtyBeforeLeave,
            async: loadAsync(BlocksEditPage, (routeTo) => (routeTo.params.uid === 'add') ? { createMode: true } : {})
          }
        ]
      },
      {
        path: 'add-items-dsl',
        async: loadAsync(ItemsAddFromTextualDefinition)
      },
      {
        path: 'api-explorer',
        async: loadAsync(ApiExplorerPage)
      }
    ]
  },
  {
    path: '/analyzer/',
    popup: {
      component: AnalyzerPopup
    }
  },
  /* For Cordova */
  {
    path: '/res/(.*)',
    redirect: '/'
  },
  {
    path: '/home/',
    redirect: '/'
  },
  // temp disable
  // {
  //   path: '/android_asset/(.*)',
  //   redirect: '/'
  // },
  // {
  //   path: '/var/containers/(.*)',
  //   redirect: '/'
  // },
  {
    path: '(.*)',
    component: NotFoundPage
  }
]
