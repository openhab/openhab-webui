import store from '@/js/store'
import { authorize, isLoggedIn, enforceAdminForRoute } from '@/js/openhab/auth'

import HomePage from '../pages/home.vue'
import NotFoundPage from '../pages/not-found.vue'
import PageViewPage from '../pages/page/page-view.vue'
import AnalyzerPopup from '../pages/analyzer/analyzer-popup.vue'

const AboutPage = () => import(/* webpackChunkName: "about-page" */ '../pages/about.vue')
const UserProfilePage = () => import(/* webpackChunkName: "profile-page" */ '../pages/profile.vue')

const SettingsMenuPage = () => import(/* webpackChunkName: "admin-base" */ '../pages/settings/menu/settings-menu.vue')
const ServiceSettingsPage = () => import(/* webpackChunkName: "admin-base" */ '../pages/settings/services/service-settings.vue')
const AddonsListPage = () => import(/* webpackChunkName: "admin-base" */ '@/pages/addons/addons-list.vue')
const AddonsAddPage = () => import(/* webpackChunkName: "admin-base" */ '@/pages/addons/addons-add.vue')
const AddonsConfigureBindingPage = () => import(/* webpackChunkName: "admin-base" */ '@/pages/addons/addon-config.vue')
const AddonsStorePage = () => import(/* webpackChunkName: "admin-base" */ '@/pages/addons/addons-store.vue')
const AddonDetailsPage = () => import(/* webpackChunkName: "admin-base" */ '@/pages/addons/addon-details.vue')

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

const TransformationsListPage = () => import(/* webpackChunkName: "admin-config" */ '../pages/settings/transformations/transformations-list.vue')
const TransformationsEditPage = () => import(/* webpackChunkName: "admin-rules" */ '../pages/settings/transformations/transformation-edit.vue')

const PersistenceEditPage = () => import(/* webpackChunkName: "admin-config" */ '../pages/settings/persistence/persistence-edit.vue')

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
const SceneEditPage = () => import(/* webpackChunkName: "admin-rules" */ '../pages/settings/rules/scene/scene-edit.vue')
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
    beforeEnter: [enforceAdminForRoute],
    async: loadAsync(SetupWizardPage)
  },
  {
    path: '/profile/',
    beforeEnter: [(to, from, resolve, reject) => {
      if (isLoggedIn()) {
        resolve()
      } else {
        reject()
        authorize()
      }
    }],
    async: loadAsync(UserProfilePage),
    options: {
      animate: false
    }
  },
  {
    path: '/settings/',
    beforeEnter: [enforceAdminForRoute],
    async: loadAsync(SettingsMenuPage),
    keepAlive: true,
    routes: [
      {
        path: 'items',
        beforeEnter: [enforceAdminForRoute],
        async: loadAsync(ItemsListPage),
        routes: [
          {
            path: 'add',
            beforeEnter: [enforceAdminForRoute],
            async: loadAsync(ItemEditPage, { createMode: true })
          },
          {
            path: 'add-from-textual-definition',
            beforeEnter: [enforceAdminForRoute],
            async: loadAsync(ItemsAddFromTextualDefinition)
          },
          {
            path: ':itemName',
            beforeEnter: [enforceAdminForRoute],
            async: loadAsync(ItemDetailsPage),
            routes: [
              {
                path: 'edit',
                beforeEnter: [enforceAdminForRoute],
                beforeLeave: [checkDirtyBeforeLeave],
                async: loadAsync(ItemEditPage)
              },
              {
                path: 'metadata/:namespace',
                beforeEnter: [enforceAdminForRoute],
                beforeLeave: [checkDirtyBeforeLeave],
                async: loadAsync(ItemMetadataEditPage)
              }
            ]
          }
        ]
      },
      {
        path: 'pages',
        async: loadAsync(PagesListPage),
        beforeEnter: [enforceAdminForRoute],
        routes: [
          {
            path: ':type/:uid',
            beforeEnter: [enforceAdminForRoute],
            beforeLeave: [checkDirtyBeforeLeave],
            async: (routeTo, routeFrom, resolve, reject) => {
              PageEditors[routeTo.params.type]().then((c) => { resolve({ component: c.default }, (routeTo.params.uid === 'add') ? { props: { createMode: true } } : {}) })
            }
          }
        ]
      },
      {
        path: 'transformations/',
        async: loadAsync(TransformationsListPage),
        routes: [
          {
            path: ':transformationId',
            beforeLeave: checkDirtyBeforeLeave,
            async: loadAsync(TransformationsEditPage, (routeTo) => (routeTo.params.transformationId === 'add') ? { createMode: true } : {})
          }
        ]
      },
      {
        path: 'things/',
        beforeEnter: [enforceAdminForRoute],
        async: loadAsync(ThingsListPage),
        routes: [
          {
            path: 'add',
            beforeEnter: [enforceAdminForRoute],
            async: loadAsync(AddThingChooseBindingPage),
            routes: [
              // {
              //   path: 'install-binding',
              //   async: loadAsync(AddonsAddPage, { addonType: 'binding' })
              // },
              {
                path: ':bindingId',
                beforeEnter: [enforceAdminForRoute],
                async: loadAsync(AddThingChooseThingTypePage),
                routes: [
                  {
                    path: ':thingTypeId',
                    beforeEnter: [enforceAdminForRoute],
                    async: loadAsync(AddThingPage)
                  }
                ]
              }
            ]
          },
          {
            path: 'inbox',
            beforeEnter: [enforceAdminForRoute],
            async: loadAsync(InboxListPage)
          },
          {
            path: ':thingId',
            beforeEnter: [enforceAdminForRoute],
            beforeLeave: [checkDirtyBeforeLeave],
            async: loadAsync(ThingDetailsPage)
          }
        ]
      },
      {
        path: 'model',
        beforeEnter: [enforceAdminForRoute],
        async: loadAsync(SemanticModelPage)
      },
      {
        path: 'persistence/',
        routes: [
          {
            path: ':serviceId',
            beforeEnter: [enforceAdminForRoute],
            beforeLeave: [checkDirtyBeforeLeave],
            async: loadAsync(PersistenceEditPage)
          }
        ]
      },
      {
        path: 'rules/',
        beforeEnter: [enforceAdminForRoute],
        async: loadAsync(RulesListPage),
        routes: [
          {
            path: ':ruleId',
            beforeEnter: [enforceAdminForRoute],
            beforeLeave: [checkDirtyBeforeLeave],
            async: loadAsync(RuleEditPage, (routeTo) => (routeTo.params.ruleId === 'add') ? { createMode: true } : {}),
            routes: [
              {
                path: 'script/:moduleId',
                beforeEnter: [enforceAdminForRoute],
                beforeLeave: [checkDirtyBeforeLeave],
                async: loadAsync(ScriptEditPage, (routeTo) => (routeTo.params.ruleId === 'add') ? { createMode: true } : {})
              }
            ]
          }
        ]
      },
      {
        path: 'scenes/',
        beforeEnter: [enforceAdminForRoute],
        async: loadAsync(RulesListPage, { showScenes: true }),
        routes: [
          {
            path: ':ruleId',
            beforeEnter: [enforceAdminForRoute],
            beforeLeave: [checkDirtyBeforeLeave],
            async: loadAsync(SceneEditPage, (routeTo) => (routeTo.params.ruleId === 'add') ? { createMode: true } : {})
          }
        ]
      },
      {
        path: 'scripts/',
        beforeEnter: [enforceAdminForRoute],
        async: loadAsync(RulesListPage, { showScripts: true }),
        routes: [
          {
            path: ':ruleId',
            beforeEnter: [enforceAdminForRoute],
            beforeLeave: [checkDirtyBeforeLeave],
            async: loadAsync(ScriptEditPage, (routeTo) => (routeTo.params.ruleId === 'add') ? { createMode: true } : {})
          }
        ]
      },
      {
        path: 'schedule/',
        beforeEnter: [enforceAdminForRoute],
        async: loadAsync(SchedulePage),
        routes: [
          {
            path: 'add',
            beforeEnter: [enforceAdminForRoute],
            beforeLeave: [checkDirtyBeforeLeave],
            async: loadAsync(RuleEditPage, { createMode: true, schedule: true })
          }
        ]
      },
      {
        path: 'addons',
        beforeEnter: [enforceAdminForRoute],
        async: loadAsync(AddonsStorePage),
        routes: [
          {
            path: ':addonId',
            beforeEnter: [enforceAdminForRoute],
            async: loadAsync(AddonsConfigureBindingPage)
          }
        ]
      },
      {
        path: 'services/:serviceId',
        beforeEnter: [enforceAdminForRoute],
        beforeLeave: [checkDirtyBeforeLeave],
        async: loadAsync(ServiceSettingsPage)
      }
    ]
  },
  {
    path: '/addons/',
    beforeEnter: [enforceAdminForRoute],
    async: loadAsync(AddonsStorePage),
    routes: [
      {
        path: ':addonId',
        beforeEnter: [enforceAdminForRoute],
        async: loadAsync(AddonDetailsPage)
      }
    ]
  },
  {
    path: '/developer/',
    beforeEnter: [enforceAdminForRoute],
    async: loadAsync(DeveloperToolsPage),
    routes: [
      {
        path: 'widgets/',
        beforeEnter: [enforceAdminForRoute],
        async: loadAsync(WidgetsListPage),
        routes: [
          {
            path: ':uid',
            beforeEnter: [enforceAdminForRoute],
            beforeLeave: [checkDirtyBeforeLeave],
            async: loadAsync(WidgetEditPage, (routeTo) => (routeTo.params.uid === 'add') ? { createMode: true } : {})
          }
        ]
      },
      {
        path: 'blocks/',
        beforeEnter: [enforceAdminForRoute],
        async: loadAsync(BlocksListPage),
        routes: [
          {
            path: ':uid',
            beforeEnter: [enforceAdminForRoute],
            beforeLeave: [checkDirtyBeforeLeave],
            async: loadAsync(BlocksEditPage, (routeTo) => (routeTo.params.uid === 'add') ? { createMode: true } : {})
          }
        ]
      },
      {
        path: 'add-items-dsl',
        beforeEnter: [enforceAdminForRoute],
        async: loadAsync(ItemsAddFromTextualDefinition)
      },
      {
        path: 'api-explorer',
        beforeEnter: [enforceAdminForRoute],
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
