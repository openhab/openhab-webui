import HomePage from '../pages/home.vue'
import AboutPage from '../pages/about.vue'
import NotFoundPage from '../pages/not-found.vue'

import SitemapPage from '../pages/sitemap.vue'

import SetupWizard from '../pages/wizards/setup-wizard.vue'
import SetupWizardPage from '../pages/wizards/setup-wizard-page.vue'
import SettingsMenuPage from '../pages/settings/settings-menu.vue'
import ServiceSettingsPage from '../pages/settings/services/service-settings.vue'
import AddonsListPage from '../pages/settings/addons/addons-list.vue'
import AddonsAddPage from '../pages/settings/addons/addons-add.vue'
import AddonsConfigureBindingPage from '../pages/settings/addons/binding-config.vue'

import ItemsListPage from '../pages/settings/items/items-list-vlist.vue'
import ItemDetailsPage from '../pages/settings/items/item-details.vue'
import ItemEditPage from '../pages/settings/items/item-edit.vue'
import ItemsAddFromTextualDefinition from '../pages/settings/items/parser/items-add-from-textual-definition.vue'

import ThingsListPage from '../pages/settings/things/things-list.vue'
import ThingDetailsPage from '../pages/settings/things/thing-details.vue'
import AddThingChooseBindingPage from '../pages/settings/things/add/choose-binding.vue'
import AddThingChooseThingTypePage from '../pages/settings/things/add/choose-thing-type.vue'
import AddThingPage from '../pages/settings/things/add/thing-add.vue'

import InboxListPage from '../pages/settings/inbox/inbox-list.vue'

import SemanticModelPage from '../pages/settings/model/model.vue'

import RulesListPage from '../pages/settings/rules/rules-list.vue'
import RuleEditPage from '../pages/settings/rules/rule-edit.vue'
import RuleConfigureModulePage from '../pages/settings/rules/rule-configure-module.vue'

// import SchedulePage from '../pages/settings/schedule/schedule.vue'

import Analyzer from '../pages/analyzer/analyzer.vue'

import DeveloperToolsPage from '../pages/developer/developer-tools.vue'

export default [
  {
    path: '/',
    component: HomePage,
    // keepAlive: true,
    options: {
      // animate: false
      transition: 'f7-dive'
    }
    // tabs: [
    //   {
    //     path: '/',
    //     id: 'tab-overview',
    //     content: `
    //     <div class="block">
    //       <p>Tab 1 content</p>
    //       <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ullam enim quia molestiae facilis laudantium voluptates obcaecati officia cum, sit libero commodi. Ratione illo suscipit temporibus sequi iure ad laboriosam accusamus?</p>
    //       <p>Saepe explicabo voluptas ducimus provident, doloremque quo totam molestias! Suscipit blanditiis eaque exercitationem praesentium reprehenderit, fuga accusamus possimus sed, sint facilis ratione quod, qui dignissimos voluptas! Aliquam rerum consequuntur deleniti.</p>
    //       <p>Totam reprehenderit amet commodi ipsum nam provident doloremque possimus odio itaque, est animi culpa modi consequatur reiciendis corporis libero laudantium sed eveniet unde delectus a maiores nihil dolores? Natus, perferendis.</p>
    //     </div>
    //     `,
    //     component: OverviewTab
    //   },
    //   {
    //     path: '/locations/',
    //     id: 'tab-locations',
    //     component: LocationsTab
    //   },
    //   {
    //     path: '/equipments/',
    //     id: 'tab-equipments',
    //     component: EquipmentsTab
    //   },
    //   {
    //     path: '/properties/',
    //     id: 'tab-properties',
    //     component: PropertiesTab
    //   }
    // ]
  },
  {
    path: '/setup/',
    loginScreen: {
      component: SetupWizard
    }
  },
  {
    path: '/sitemap/:sitemapId/:pageId',
    component: SitemapPage
  },
  {
    path: '/about/',
    component: AboutPage,
    options: {
      animate: false
    }
  },
  {
    path: '/setup-wizard/',
    component: SetupWizardPage,
    options: {
      transition: 'f7-cover-v'
    }
  },
  {
    path: '/settings/',
    component: SettingsMenuPage,
    keepAlive: true,
    routes: [
      {
        path: 'items',
        component: ItemsListPage,
        routes: [
          {
            path: 'add',
            component: ItemEditPage,
            options: {
              props: {
                createMode: true
              }
            }
          },
          {
            path: 'add-from-textual-definition',
            component: ItemsAddFromTextualDefinition
          },
          {
            path: ':itemName',
            component: ItemDetailsPage,
            routes: [
              {
                path: 'edit',
                component: ItemEditPage
              }
            ]
          }
        ]
      },
      // {
      //   path: 'items-virtual',
      //   component: ItemsVirtualListPage,
      //   routes: [
      //     {
      //       path: ':itemName',
      //       component: ItemDetailsPage,
      //       routes: [
      //         {
      //           path: 'edit',
      //           component: ItemEditPage
      //         }
      //       ]
      //     }
      //   ]
      // },
      {
        path: 'things/',
        component: ThingsListPage,
        routes: [
          {
            path: 'add',
            component: AddThingChooseBindingPage,
            routes: [
              {
                path: ':bindingId',
                component: AddThingChooseThingTypePage,
                routes: [
                  {
                    path: ':thingTypeId',
                    component: AddThingPage
                  }
                ]
              }
            ]
          },
          {
            path: ':thingId',
            component: ThingDetailsPage
          }
        ]
      },
      {
        path: 'model',
        component: SemanticModelPage
        // keepAlive: true
        // routes: [
        //   {
        //     path: ':itemName',
        //     component: ItemDetailsPage,
        //     routes: [
        //       {
        //         path: 'edit',
        //         component: ItemEditPage
        //       }
        //     ]
        //   }
        // ]
      },
      {
        path: 'rules/',
        component: RulesListPage,
        keepAlive: true,
        routes: [
          {
            path: 'add',
            component: RuleEditPage,
            options: {
              props: {
                createMode: true
              }
            }
          },
          {
            path: ':ruleId',
            component: RuleEditPage,
            // master: true,
            // detailRoutes: [
            routes: [
              {
                path: ':moduleType/:moduleId',
                // path: '/settings/rules/:ruleId/:moduleType/:moduleId',
                component: RuleConfigureModulePage
              }
            ]
          }
        ]
      },
      {
        path: 'schedule/',
        async (routeTo, routeFrom, resolve, reject) {
          // dynamic import component; returns promise
          const scheduleComponent = () => import('../pages/settings/schedule/schedule.vue')
          // resolve promise
          scheduleComponent().then((vc) => {
            // resolve with component
            resolve({
              component: vc.default
            })
          })
        },
        routes: [
          {
            path: 'add',
            component: RuleEditPage,
            options: {
              props: {
                createMode: true,
                schedule: true
              }
            }
          }
        ]
      },
      {
        path: 'inbox/',
        component: InboxListPage
      },
      {
        path: 'addons/:addonType',
        component: AddonsListPage,
        routes: [
          {
            path: 'add',
            component: AddonsAddPage
          },
          {
            path: ':bindingId/config',
            component: AddonsConfigureBindingPage
          }

        ]
      },
      {
        path: 'services/:serviceId',
        component: ServiceSettingsPage
      }
    ]
  },
  {
    path: '/developer/',
    component: DeveloperToolsPage,
    options: {
      animate: false
    }
  },
  {
    path: '/analyzer/',
    popup: {
      component: Analyzer
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
