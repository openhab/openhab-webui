<template>
  <f7-block class="developer-sidebar">
    <f7-row :inner="false" v-if="!theme.md">
      <f7-searchbar ref="searchbar"
                    style="width: 100%"
                    custom-search
                    placeholder="Search and Pin"
                    :backdrop="false"
                    @searchbar:search="search"
                    @searchbar:clear="clearSearch" />
    </f7-row>
    <f7-row style="width: 100%" :inner="false" v-else>
      <f7-searchbar ref="searchbar"
                    custom-search
                    placeholder="Search and Pin"
                    :backdrop="false"
                    @searchbar:search="search"
                    @searchbar:clear="clearSearch" />
    </f7-row>
    <div v-if="!searching" class="developer-sidebar-content">
      <div v-if="activeToolTab === 'pin'">
        <f7-block class="no-margin no-padding">
          <f7-block-title class="padding-horizontal" medium>
            Pinned Objects
          </f7-block-title>
        </f7-block>
        <f7-list v-if="Object.keys(developerStore.pinCollections).length > 0 || isAnythingPinned">
          <f7-list-item accordion-item
                        title="Saved Pins"
                        ref="pinCollectionsAccordion"
                        @accordion:opened="onPinCollectionsAccordionOpened">
            <f7-accordion-content>
              <f7-list>
                <f7-list-input v-if="isAnythingPinned"
                               type="text"
                               :input="false"
                               clear-button>
                  <template #input>
                    <input type="text"
                           placeholder="Save current pins as"
                           v-model="newCollectionName"
                           @keyup="savePinCollection">
                  </template>
                </f7-list-input>
              </f7-list>
              <f7-list v-if="developerStore.sortedCollectionNames.length > 0" class="pin-collections">
                <f7-list-item group-title title="Saved Pin Collections" class="padding-vertical" />
                <f7-list-item v-for="collectionName in developerStore.sortedCollectionNames"
                              :ref="collectionName === currentPinCollection ? 'currentPinCollectionItem' : null"
                              :key="collectionName"
                              :title="collectionName"
                              :link="true"
                              :class="{ 'current-pin-collection': collectionName === currentPinCollection }"
                              @click="loadPinCollection(collectionName)">
                  <template #after>
                    <f7-link color="red"
                             icon-f7="trash"
                             tooltip="Delete Collection"
                             @click.stop="delete developerStore.pinCollections[collectionName]" />
                  </template>
                </f7-list-item>
              </f7-list>
            </f7-accordion-content>
          </f7-list-item>
        </f7-list>
        <f7-block class="no-margin no-padding" v-if="!isAnythingPinned">
          <p class="padding-horizontal">
            Use the search box above or the button below to temporarily pin objects here for quick access.
          </p>
          <p class="padding-horizontal">
            <f7-button fill color="blue" @click="openModelPicker">
              Pin Items from Model
            </f7-button>
          </p>
        </f7-block>
        <!-- Pinned Items -->
        <f7-block class="no-margin no-padding" v-if="developerStore.pinnedObjects.items.length">
          <f7-block-title class="padding-horizontal display-flex">
            <span>Pinned Items</span>
            <span style="margin-left: auto">
              <!-- <f7-link color="gray" icon-f7="eye" icon-size="14"></f7-link> -->
              <f7-link color="gray"
                       icon-f7="list_bullet_indent"
                       icon-size="14"
                       @click="openModelPicker" />
              <f7-link color="gray"
                       icon-f7="multiply"
                       icon-size="14"
                       @click="unpinAll('items')" />
            </span>
          </f7-block-title>
          <f7-list>
            <ul>
              <item v-for="item in developerStore.pinnedObjects.items"
                    :key="item.name"
                    link=""
                    :item="item"
                    :context="context"
                    :no-icon="true"
                    :no-type="true"
                    :no-tags="true"
                    @click="(evt) => showItem(evt, item)">
                <template #footer>
                  <div class="display-flex align-items-flex-end justify-content-flex-end" style="margin-top: 3px">
                    <f7-link color="gray" class="margin-right itemlist-actions">
                      <clipboard-icon :value="item.name" :size="18" tooltip="Copy Item name" />
                    </f7-link>
                    <f7-link class="margin-right itemlist-actions"
                             color="gray"
                             icon-f7="pencil"
                             icon-size="18"
                             tooltip="Edit"
                             :href="'/settings/items/' + item.name"
                             :animate="false" />
                    <f7-link class="itemlist-actions"
                             color="red"
                             icon-f7="pin_slash_fill"
                             icon-size="18"
                             tooltip="Unpin"
                             @click="unpin('items', item, 'name')" />
                  </div>
                </template>
              </item>
            </ul>
            <!-- <f7-list-button title="Pick Items" @click="modelPickerOpened = true"></f7-list-button> -->
          </f7-list>
        </f7-block>
        <!-- Pinned Things -->
        <f7-block class="no-margin no-padding" v-if="developerStore.pinnedObjects.things.length">
          <f7-block-title class="padding-horizontal display-flex">
            <span>Pinned Things</span>
            <span style="margin-left: auto">
              <f7-link color="gray"
                       icon-f7="multiply"
                       icon-size="14"
                       @click="unpinAll('things')" />
            </span>
          </f7-block-title>
          <f7-list media-list>
            <ul>
              <f7-list-item v-for="thing in developerStore.pinnedObjects.things"
                            :key="thing.UID"
                            media-item
                            :title="thing.label"
                            :footer="thing.UID">
                <template #after>
                  <f7-badge :color="thingStatusBadgeColor(thing.statusInfo)"
                            :tooltip="thing.statusInfo.description">
                    {{ thingStatusBadgeText(thing.statusInfo) }}
                  </f7-badge>
                </template>
                <template #footer>
                  <div class="display-flex align-items-flex-end justify-content-flex-end" style="margin-top: 3px">
                    <f7-link color="gray" class="margin-right">
                      <clipboard-icon :value="thing.UID" :size="18" tooltip="Copy Thing UID" />
                    </f7-link>
                    <f7-link class="margin-right"
                             :icon-color="thing.statusInfo.statusDetail === 'DISABLED' ? 'orange' : 'gray'"
                             :tooltip="thing.statusInfo.statusDetail === 'DISABLED' ? 'Enable' : 'Disable'"
                             icon-f7="pause_circle"
                             icon-size="18"
                             @click="toggleThingDisabled(thing)" />
                    <f7-link class="margin-right"
                             color="gray"
                             icon-f7="pencil"
                             icon-size="18"
                             tooltip="Edit"
                             :href="'/settings/things/' + thing.UID"
                             :animate="false" />
                    <f7-link color="red"
                             icon-f7="pin_slash_fill"
                             icon-size="18"
                             tooltip="Unpin"
                             @click="unpin('things', thing, 'UID')" />
                  </div>
                </template>
              </f7-list-item>
            </ul>
          </f7-list>
        </f7-block>
        <!-- Pinned Rules -->
        <f7-block class="no-margin no-padding"
                  v-if="developerStore.pinnedObjects.rules.length">
          <f7-block-title class="padding-horizontal display-flex">
            <span>Pinned Rules</span>
            <span style="margin-left: auto">
              <f7-link color="gray"
                       icon-f7="multiply"
                       icon-size="14"
                       @click="unpinAll('rules')" />
            </span>
          </f7-block-title>
          <f7-list media-list>
            <ul>
              <f7-list-item v-for="rule in developerStore.pinnedObjects.rules"
                            :key="rule.uid"
                            media-item
                            :title="rule.name"
                            :footer="rule.uid">
                <template #after>
                  <f7-badge :color="ruleStatusBadgeColor(rule.status)"
                            :tooltip="rule.status.description">
                    {{ ruleStatusBadgeText(rule.status) }}
                  </f7-badge>
                </template>
                <template #footer>
                  <div class="display-flex align-items-flex-end justify-content-flex-end" style="margin-top: 3px">
                    <f7-link color="gray" class="margin-right">
                      <clipboard-icon :value="rule.uid" :size="18" tooltip="Copy Rule UID" />
                    </f7-link>
                    <f7-link class="margin-right"
                             :icon-color="rule.status.statusDetail === 'DISABLED' ? 'orange' : 'gray'"
                             :tooltip="rule.status.statusDetail === 'DISABLED' ? 'Enable' : 'Disable'"
                             icon-f7="pause_circle"
                             icon-size="18"
                             @click="toggleRuleDisabled(rule)" />
                    <f7-link class="margin-right"
                             :color="rule.status.status === 'IDLE' ? 'blue' : 'gray'"
                             icon-f7="play"
                             icon-size="18"
                             tooltip="Run"
                             @click="runRuleNow(rule)" />
                    <f7-link class="margin-right"
                             color="gray"
                             icon-f7="pencil"
                             icon-size="18"
                             tooltip="Edit"
                             :href="'/settings/' + (rule.tags.indexOf('Script') >= 0 ? 'scripts' : 'rules') + '/' + rule.uid"
                             :animate="false" />
                    <f7-link color="red"
                             icon-f7="pin_slash_fill"
                             icon-size="18"
                             tooltip="Unpin"
                             @click="unpin('rules', rule, 'uid')" />
                  </div>
                </template>
              </f7-list-item>
            </ul>
          </f7-list>
        </f7-block>
        <!-- Pinned Scenes -->
        <f7-block class="no-margin no-padding"
                  v-if="developerStore.pinnedObjects.scenes.length">
          <f7-block-title class="padding-horizontal display-flex">
            <span>Pinned Scenes</span>
            <span style="margin-left: auto">
              <f7-link color="gray"
                       icon-f7="multiply"
                       icon-size="14"
                       @click="unpinAll('scenes')" />
            </span>
          </f7-block-title>
          <f7-list media-list>
            <ul>
              <f7-list-item v-for="rule in developerStore.pinnedObjects.scenes"
                            :key="rule.uid"
                            media-item
                            :title="rule.name"
                            :footer="rule.uid">
                <template #after>
                  <f7-badge :color="ruleStatusBadgeColor(rule.status)" :tooltip="rule.status.description">
                    {{ ruleStatusBadgeText(rule.status) }}
                  </f7-badge>
                </template>
                <template #footer>
                  <div class="display-flex align-items-flex-end justify-content-flex-end"
                       style="margin-top: 3px">
                    <f7-link color="gray" class="margin-right">
                      <clipboard-icon :value="rule.uid" :size="18" tooltip="Copy Rule UID" />
                    </f7-link>
                    <f7-link class="margin-right"
                             :icon-color="(rule.status.statusDetail === 'DISABLED') ? 'orange' : 'gray'"
                             :tooltip="(rule.status.statusDetail === 'DISABLED') ? 'Enable' : 'Disable'"
                             icon-f7="pause_circle"
                             icon-size="18"
                             @click="toggleRuleDisabled(rule, 'Scene')" />
                    <f7-link class="margin-right"
                             :color="(rule.status.status === 'IDLE') ? 'blue' : 'gray'"
                             icon-f7="play"
                             icon-size="18"
                             tooltip="Run"
                             @click="runRuleNow(rule, 'Scene')" />
                    <f7-link class="margin-right"
                             color="gray"
                             icon-f7="pencil"
                             icon-size="18"
                             tooltip="Edit"
                             :href="'/settings/' + (rule.tags.indexOf('Script') >= 0 ? 'scripts' : 'rules') + '/' + rule.uid"
                             :animate="false" />
                    <f7-link color="red"
                             icon-f7="pin_slash_fill"
                             icon-size="18"
                             tooltip="Unpin"
                             @click="unpin('scenes', rule, 'uid')" />
                  </div>
                </template>
              </f7-list-item>
            </ul>
          </f7-list>
        </f7-block>
        <!-- Pinned Scripts -->
        <f7-block class="no-margin no-padding"
                  v-if="developerStore.pinnedObjects.scripts.length">
          <f7-block-title class="padding-horizontal display-flex">
            <span>Pinned Scripts</span>
            <span style="margin-left: auto">
              <f7-link color="gray"
                       icon-f7="multiply"
                       icon-size="14"
                       @click="unpinAll('scripts')" />
            </span>
          </f7-block-title>
          <f7-list media-list>
            <ul>
              <f7-list-item v-for="rule in developerStore.pinnedObjects.scripts"
                            :key="rule.uid"
                            media-item
                            :title="rule.name"
                            :footer="rule.uid">
                <template #after>
                  <f7-badge :color="ruleStatusBadgeColor(rule.status)"
                            :tooltip="rule.status.description">
                    {{ ruleStatusBadgeText(rule.status) }}
                  </f7-badge>
                </template>
                <template #footer>
                  <div class="display-flex align-items-flex-end justify-content-flex-end"
                       style="margin-top: 3px">
                    <f7-link color="gray" class="margin-right">
                      <clipboard-icon :value="rule.uid" :size="18" tooltip="Copy Rule UID" />
                    </f7-link>
                    <f7-link class="margin-right"
                             :icon-color="(rule.status.statusDetail === 'DISABLED') ? 'orange' : 'gray'"
                             :tooltip="(rule.status.statusDetail === 'DISABLED') ? 'Enable' : 'Disable'"
                             icon-f7="pause_circle"
                             icon-size="18"
                             @click="toggleRuleDisabled(rule, 'Script')" />
                    <f7-link class="margin-right"
                             :color="(rule.status.status === 'IDLE') ? 'blue' : 'gray'"
                             icon-f7="play"
                             icon-size="18"
                             tooltip="Run"
                             @click="runRuleNow(rule, 'Script')" />
                    <f7-link class="margin-right"
                             color="gray"
                             icon-f7="pencil"
                             icon-size="18"
                             tooltip="Edit"
                             :href="'/settings/' + (rule.tags.indexOf('Script') >= 0 ? 'scripts' : 'rules') + '/' + rule.uid"
                             :animate="false" />
                    <f7-link color="red"
                             icon-f7="pin_slash_fill"
                             icon-size="18"
                             tooltip="Unpin"
                             @click="unpin('scripts', rule, 'uid')" />
                  </div>
                </template>
              </f7-list-item>
            </ul>
          </f7-list>
        </f7-block>
        <!-- Pinned Pages -->
        <f7-block class="no-margin no-padding"
                  v-if="developerStore.pinnedObjects.pages.length">
          <f7-block-title class="padding-horizontal display-flex">
            <span>Pinned Pages</span>
            <span style="margin-left: auto">
              <f7-link color="gray"
                       icon-f7="multiply"
                       icon-size="14"
                       @click="unpinAll('pages')" />
            </span>
          </f7-block-title>
          <f7-list media-list>
            <ul>
              <f7-list-item v-for="page in developerStore.pinnedObjects.pages"
                            :key="page.uid"
                            media-item
                            :title="page.config.label"
                            :footer="page.uid">
                <template #footer>
                  <div class="display-flex align-items-flex-end justify-content-flex-end"
                       style="margin-top: 3px">
                    <f7-link color="gray" class="margin-right">
                      <clipboard-icon :value="page.uid" :size="18" tooltip="Copy Page UID" />
                    </f7-link>
                    <!-- <f7-link class="margin-right" color="blue" icon-f7="rectangle_on_rectangle" icon-size="18" tooltip="Open in Popup" /> -->
                    <f7-link class="margin-right"
                             color="blue"
                             icon-f7="play"
                             icon-size="18"
                             tooltip="View"
                             :href="'/page/' + page.uid"
                             :animate="false" />
                    <f7-link class="margin-right"
                             color="gray"
                             icon-f7="pencil"
                             icon-size="18"
                             tooltip="Edit"
                             :href="'/settings/pages/' + getPageType(page).type + '/' + page.uid"
                             :animate="false" />
                    <f7-link color="red"
                             icon-f7="pin_slash_fill"
                             icon-size="18"
                             tooltip="Unpin"
                             @click="unpin('pages', page, 'uid')" />
                  </div>
                </template>
              </f7-list-item>
            </ul>
          </f7-list>
        </f7-block>
        <!-- Pinned Widgets -->
        <f7-block class="no-margin no-padding"
                  v-if="developerStore.pinnedObjects.widgets.length">
          <f7-block-title class="padding-horizontal display-flex">
            <span>Pinned Widgets</span>
            <span style="margin-left: auto">
              <f7-link color="gray"
                       icon-f7="multiply"
                       icon-size="14"
                       @click="unpinAll('widgets')" />
            </span>
          </f7-block-title>
          <f7-list media-list>
            <ul>
              <f7-list-item v-for="widget in developerStore.pinnedObjects.widgets"
                            :key="widget.uid"
                            media-item
                            :title="widget.uid">
                <template #footer>
                  <div class="display-flex align-items-flex-end justify-content-flex-end">
                    <f7-link color="gray" class="margin-right">
                      <clipboard-icon :value="widget.uid" :size="18" tooltip="Copy Widget UID" />
                    </f7-link>
                    <f7-link class="margin-right"
                             color="gray"
                             icon-f7="pencil"
                             icon-size="18"
                             tooltip="Edit"
                             :href="'/developer/widgets/' + widget.uid"
                             :animate="false" />
                    <f7-link color="red"
                             icon-f7="pin_slash_fill"
                             icon-size="18"
                             tooltip="Unpin"
                             @click="unpin('widgets', widget, 'uid')" />
                  </div>
                </template>
              </f7-list-item>
            </ul>
          </f7-list>
        </f7-block>
        <!-- Pinned Transformations -->
        <f7-block class="no-margin no-padding"
                  v-if="developerStore.pinnedObjects.transformations.length">
          <f7-block-title class="padding-horizontal display-flex">
            <span>Pinned Transformations</span>
            <span style="margin-left: auto">
              <f7-link color="gray"
                       icon-f7="multiply"
                       icon-size="14"
                       @click="unpinAll('transformations')" />
            </span>
          </f7-block-title>
          <f7-list media-list>
            <ul>
              <f7-list-item v-for="transformation in developerStore.pinnedObjects.transformations"
                            :key="transformation.uid"
                            media-item
                            :title="transformation.label"
                            :footer="transformation.uid">
                <template #footer>
                  <div class="display-flex align-items-flex-end justify-content-flex-end"
                       style="margin-top: 3px">
                    <f7-link color="gray" class="margin-right">
                      <clipboard-icon :value="transformation.uid" :size="18" tooltip="Copy Transformation UID" />
                    </f7-link>
                    <f7-link class="margin-right"
                             color="gray"
                             icon-f7="pencil"
                             icon-size="18"
                             tooltip="Edit"
                             :href="'/settings/transformations/' + transformation.uid"
                             :animate="false" />
                    <f7-link color="red"
                             icon-f7="pin_slash_fill"
                             icon-size="18"
                             tooltip="Unpin"
                             @click="unpin('transformations', transformation, 'uid')" />
                  </div>
                </template>
              </f7-list-item>
            </ul>
          </f7-list>
        </f7-block>
        <!-- Pinned Persistence configs -->
        <f7-block class="no-margin no-padding"
                  v-if="developerStore.pinnedObjects.persistenceConfigs.length">
          <f7-block-title class="padding-horizontal display-flex">
            <span>Pinned Persistence Configs</span>
            <span style="margin-left: auto">
              <f7-link color="gray"
                       icon-f7="multiply"
                       icon-size="14"
                       @click="unpinAll('persistenceConfigs')" />
            </span>
          </f7-block-title>
          <f7-list media-list>
            <ul>
              <f7-list-item v-for="persistenceConfig in developerStore.pinnedObjects.persistenceConfigs"
                            :key="persistenceConfig.serviceId"
                            media-item
                            :title="persistenceConfig.label"
                            :footer="persistenceConfig.serviceId">
                <template #footer>
                  <div class="display-flex align-items-flex-end justify-content-flex-end"
                       style="margin-top: 3px">
                    <f7-link color="gray" class="margin-right">
                      <clipboard-icon :value="persistenceConfig.serviceId" :size="18" tooltip="Copy Service ID" />
                    </f7-link>
                    <f7-link class="margin-right"
                             color="gray"
                             icon-f7="pencil"
                             icon-size="18"
                             tooltip="Edit"
                             :href="'/settings/persistence/' + persistenceConfig.serviceId"
                             :animate="false" />
                    <f7-link color="red"
                             icon-f7="pin_slash_fill"
                             icon-size="18"
                             tooltip="Unpin"
                             @click="unpin('persistenceConfig', persistenceConfig, 'serviceId')" />
                  </div>
                </template>
              </f7-list-item>
            </ul>
          </f7-list>
        </f7-block>
      </div>

      <div v-else-if="activeToolTab === 'events'">
        <f7-block class="no-margin no-padding">
          <f7-block-title class="padding-horizontal display-flex" medium>
            <span>Event Monitor</span>
            <span style="margin-left: auto">
              <f7-link :color="eventTopicFilter ? 'blue' : 'gray'"
                       :icon-f7="eventTopicFilter ? 'line_horizontal_3_decrease_circle_fill' : 'line_horizontal_3_decrease_circle'"
                       icon-size="14"
                       tooltip="Filter topics"
                       @click="changeEventTopicFilter" />
            </span>
          </f7-block-title>
          <f7-block>
            <p v-if="!sseClient">
              <f7-button fill color="blue" @click="startSSE">
                Stream Events
              </f7-button>
            </p>
            <p v-if="sseClient">
              <f7-button fill color="red" @click="stopSSE">
                Stop Streaming
              </f7-button>
            </p>
          </f7-block>
          <f7-list media-list>
            <f7-list-item v-for="event in sseEvents"
                          :key="event.time.getTime()"
                          :title="event.topic"
                          :subtitle="event.type"
                          :footer="event.payload" />
          </f7-list>
        </f7-block>
      </div>

      <div v-else-if="activeToolTab === 'scripting'">
        <f7-block class="no-margin no-padding">
          <f7-block-title class="padding-horizontal" medium>
            Code Tools
          </f7-block-title>
        </f7-block>
        <expression-tester :context="{
          component: {
            config: {
              style: {
                fontFamily: 'monospace'
              },
              noBorder: true,
              noShadow: true,
              text: ''
            }
          },
          editmode: true,
          vars: {},
          store: statesStore.trackedItems
        }" />
        <f7-block class="no-margin no-padding">
          <f7-block-title class="padding-horizontal">
            Scripting Scratchpad
          </f7-block-title>
          <f7-list>
            <f7-list-button @click="openScriptingScratchpad" color="blue">
              Open Scratchpad
            </f7-list-button>
          </f7-list>
        </f7-block>
      </div>

      <div v-else-if="activeToolTab === 'tools'">
        <f7-block class="no-margin no-padding">
          <f7-block-title class="padding-horizontal" medium>
            Create Shortcuts
          </f7-block-title>
        </f7-block>
        <f7-block class="no-margin no-padding">
          <f7-list>
            <f7-list-item divider title="Things" />
            <f7-list-button href="/settings/things/add" color="blue" :animate="false">
              Add Thing
            </f7-list-button>
            <f7-list-button @click="quickAddThing" color="blue">
              Add Thing (quick)
            </f7-list-button>
            <f7-list-button href="/settings/things/inbox" color="blue" :animate="false">
              Inbox
            </f7-list-button>
            <f7-list-item divider title="Items" />
            <f7-list-button href="/settings/items/add" color="blue" :animate="false">
              Create Item
            </f7-list-button>
            <f7-list-button href="/settings/items/add-from-textual-definition" color="blue" :animate="false">
              Add Items (textual)
            </f7-list-button>
            <f7-list-item divider title="Pages" />
            <f7-list-button href="/settings/pages/layout/add" color="blue" :animate="false">
              Create layout page
            </f7-list-button>
            <f7-list-button href="/settings/pages/tabs/add" color="blue" :animate="false">
              Create tabbed page
            </f7-list-button>
            <f7-list-button href="/settings/pages/map/add" color="blue" :animate="false">
              Create map view
            </f7-list-button>
            <f7-list-button href="/settings/pages/plan/add" color="blue" :animate="false">
              Create floor plan
            </f7-list-button>
            <f7-list-button href="/settings/pages/chart/add" color="blue" :animate="false">
              Create chart
            </f7-list-button>
            <f7-list-button href="/settings/pages/sitemap/add" color="blue" :animate="false">
              Create sitemap
            </f7-list-button>
            <f7-list-item divider title="Automation" />
            <f7-list-button href="/settings/rules/add" color="blue" :animate="false">
              Create rule
            </f7-list-button>
            <f7-list-button href="/settings/scripts/add" color="blue" :animate="false">
              Create script
            </f7-list-button>
            <f7-list-button href="/settings/schedule/add" color="blue" :animate="false">
              Create scheduled rule
            </f7-list-button>
            <f7-list-item divider title="Advanced" />
            <f7-list-button href="/developer/widgets/add" color="blue" :animate="false">
              Create widget
            </f7-list-button>
            <f7-list-button href="/developer/blocks/add" color="blue" :animate="false">
              Create block library
            </f7-list-button>
          </f7-list>
        </f7-block>
      </div>
    </div>

    <f7-popover ref="itemPopover" class="item-popover">
      <item-standalone-control v-if="openedItem"
                               :item="openedItem"
                               :context="context"
                               :no-border="true" />
    </f7-popover>
    <search-results v-if="searching"
                    class="margin-top"
                    :searchResults="searchResults"
                    :pinnedObjects="developerStore.pinnedObjects"
                    @pin="pin"
                    @unpin="unpin"
                    :cachedObjects="cachedObjects"
                    :loading="searchResultsLoading" />
  </f7-block>
</template>

<style lang="stylus">
.developer-sidebar
  scrollbar-width none /* Firefox */
  -ms-overflow-style none  /* IE 10+ */
  margin 0 !important
  padding 0
  padding-top 0.3rem
  width 100%

  .developer-sidebar-content
    margin-top 1rem
    .pin-collections
      max-height 11rem /* Make the last item partially show to hint that there are more items */
      overflow-y auto
      .current-pin-collection
        background-color rgba(33,150,243, 0.2) /* How do we use the theme color (blue) here without hardcoding? */

  .searchbar
    width 100%

  &.page
    background #e7e7e7 !important

  .page-content
    overflow-x hidden
.md .developer-sidebar-content
  margin-top 0
.dark
  .developer-sidebar
    &.page
      background #232323 !important
</style>

<script>
import { f7, theme } from 'framework7-vue'
import { nextTick } from 'vue'
import { mapStores } from 'pinia'

import { useDeveloperStore } from '@/js/stores/useDeveloperStore'
import { useStatesStore } from '@/js/stores/useStatesStore'
import { useComponentsStore } from '@/js/stores/useComponentsStore'

import Fuse from 'fuse.js'
import Item from '@/components/item/item.vue'
import ItemStandaloneControl from '@/components/item/item-standalone-control.vue'
import ModelPickerPopup from '@/components/model/model-picker-popup.vue'
import SearchResults from './search-results.vue'
import ExpressionTester from './expression-tester.vue'
import ClipboardIcon from '@/components/util/clipboard-icon.vue'

import RuleStatus from '@/components/rule/rule-status-mixin'
import ThingStatus from '@/components/thing/thing-status-mixin'
import cloneDeep from 'lodash/cloneDeep'

export default {
  mixins: [RuleStatus, ThingStatus],
  components: {
    ClipboardIcon,
    Item,
    ItemStandaloneControl,
    SearchResults,
    ExpressionTester
  },
  props: {
    activeToolTab: String,
    searchFor: String
  },
  watch: {
    searchFor (val) {
      if (val) this.$refs.searchbar.$el.f7Searchbar.search(val)
    },
    'developerStore.pinnedObjects': {
      handler (val) {
        this.pinsDirty = true
      },
      deep: true
    }
  },
  data () {
    return {
      searchQuery: '',
      searchResultsLoading: false,
      searching: false,
      monitoredItems: [],
      sseClient: null,
      eventTopicFilter: '',
      eventSource: null,
      cachedObjects: null,
      cachedFuseObjects: null,
      searchResults: {
        items: [],
        things: [],
        rules: [],
        scenes: [],
        scripts: [],
        pages: [],
        widgets: [],
        transformations: [],
        persistenceConfigs: []
      },
      currentPinCollection: '',
      pinsDirty: false,
      newCollectionName: '',
      sseEvents: [],
      openedItem: null,
      pageTypes: [
        { type: 'sitemap', label: 'Sitemap', componentType: 'Sitemap', icon: 'menu' },
        { type: 'layout', label: 'Layout', componentType: 'oh-layout-page', icon: 'rectangle_grid_2x2' },
        { type: 'home', label: 'Home', componentType: 'oh-home-page', icon: 'house' },
        { type: 'tabs', label: 'Tabbed', componentType: 'oh-tabs-page', icon: 'squares_below_rectangle' },
        { type: 'map', label: 'Map', componentType: 'oh-map-page', icon: 'map' },
        { type: 'plan', label: 'Floor plan', componentType: 'oh-plan-page', icon: 'square_stack_3d_up' },
        { type: 'chart', label: 'Chart', componentType: 'oh-chart-page', icon: 'graph_square' }
      ],
      testExpression: '',
      addThingAutocomplete: null,
      theme
    }
  },
  created () {
    const fuseOptions = {
      threshold: 0, // precise search, no fuzzy matching
      ignoreLocation: true, // search anywhere in the string
      useExtendedSearch: true // see https://www.fusejs.io/examples.html#extended-search
    }

    const slots = {
      name: 'slots',
      getFn: (obj) => JSON.stringify(obj.slots)
    }

    const props = {
      name: 'props',
      getFn: (obj) => JSON.stringify(obj.props)
    }

    const metadata = {
      name: 'metadata',
      getFn: (obj) => JSON.stringify(obj.metadata)
    }

    this.SEARCH = {
      items: {
        keys: ['name', 'label', 'tags', metadata]
      },
      things: {
        keys: ['UID', 'label']
      },
      rules: {
        keys: [
          'uid',
          'name',
          'description',
          'tags',
          'triggers.configuration.itemName',
          'triggers.configuration.groupName',
          'triggers.configuration.thingUID',
          'actions.configuration.itemName',
          'actions.configuration.thingUID',
          'actions.configuration.type',
          'actions.configuration.blockSource',
          'actions.configuration.script',
          'conditions.configuration.itemName',
          'conditions.configuration.thingUID',
          'conditions.configuration.type',
          'conditions.configuration.blockSource',
          'conditions.configuration.script'
        ]
      },
      pages: {
        keys: ['uid', 'config.label', slots]
      },
      widgets: {
        keys: ['uid', props, slots]
      },
      transformations: {
        keys: ['uid', 'label', 'configuration.function']
      },
      persistence: {
        keys: ['serviceId', 'label', 'configs.items']
      }
    }

    // Add fuseOptions to all SEARCH
    Object.values(this.SEARCH).forEach((options) => Object.assign(options, fuseOptions))
  },
  computed: {
    context () {
      return {
        store: useStatesStore().trackedItems
      }
    },
    isAnythingPinned () {
      return Object.values(useDeveloperStore().pinnedObjects).some((obj) => obj.length > 0)
    },
    ...mapStores(useDeveloperStore, useStatesStore)
  },
  mounted () {
    this.startEventSource()
    nextTick(() => {
      if (this.$device.desktop && this.$refs.searchbar) {
        f7.input.focus('searchbar')
        if (this.searchFor) this.$refs.searchbar.$el.f7Searchbar.search(this.searchFor)
      }
    })
  },
  beforeUnmount () {
    this.stopEventSource()
    if (this.addThingAutocomplete) this.addThingAutocomplete.destroy()
  },
  methods: {
    addItemsFromModel (value) {
      useDeveloperStore().pinnedObjects.items = [...value]
    },
    openModelPicker () {
      const popup = {
        component: ModelPickerPopup
      }

      f7.views.main.router.navigate({
        url: 'pick-from-model',
        route: {
          path: 'pick-from-model',
          popup
        }
      }, {
        props: {
          value: useDeveloperStore().pinnedObjects.items,
          multiple: true,
          allowEmpty: true,
          popupTitle: 'Pin Items from Model',
          actionLabel: 'Pin'
        }
      })

      f7.once('itemsPicked', this.addItemsFromModel)
      f7.once('modelPickerClosed', () => {
        f7.off('itemsPicked', this.addItemsFromModel)
      })
    },
    /**
     * Load all persistence configs and extend them with the persistence service label.
     *
     * @returns {Promise} load promise
     */
    async loadPersistenceConfigs () {
      return this.$oh.api.get('/rest/persistence').then((data) => {
        const labels = {}
        data.forEach((p) => {
          labels[p.id] = p.label
        })
        const loadPromises = data.map((p) => this.$oh.api.get('/rest/persistence/' + p.id))
        const configs = []

        Promise.allSettled(loadPromises).then((results) => {
          for (const result of results) {
            if (result.value) {
              result.value.label = labels[result.value.serviceId]
              configs.push(result.value)
            }
          }
        })

        return configs
      })
    },
    search (searchbar, query, previousQuery) {
      if (!query) {
        this.clearSearch()
        return
      }
      this.searching = true
      query = query.trim()
      this.searchQuery = query

      if (this.searchResultsLoading) return

      const promises = this.cachedObjects
        ? this.cachedObjects.map((o) => Promise.resolve(o))
        : [
          this.$oh.api.get('/rest/items?staticDataOnly=true&metadata=.*'), // 0
          this.$oh.api.get('/rest/things?summary=true'), // 1
          this.$oh.api.get('/rest/rules?summary=false'), // 2
          Promise.resolve(useComponentsStore().pages()), // 3
          this.$oh.api.get('/rest/ui/components/system:sitemap'), // 4
          Promise.resolve(useComponentsStore().widgets()), // 5
          this.$oh.api.get('/rest/transformations'), // 6
          this.loadPersistenceConfigs() // 7
        ]

      this.searchResultsLoading = true
      Promise.all(promises).then((data) => {
        this.cachedObjects = data

        if (!this.cachedFuseObjects) {
          this.cachedFuseObjects = {
            items: new Fuse(data[0], this.SEARCH.items),
            things: new Fuse(data[1], this.SEARCH.things),
            rules: new Fuse(data[2], this.SEARCH.rules),
            pages: new Fuse([...data[3], ...data[4]], this.SEARCH.pages),
            widgets: new Fuse(data[5], this.SEARCH.widgets),
            transformations: new Fuse(data[6], this.SEARCH.transformations),
            persistence: new Fuse(data[7], this.SEARCH.persistence)
          }
        }

        const items = this.searchData(this.cachedFuseObjects.items, query)
        const things = this.searchData(this.cachedFuseObjects.things, query)

        const rulesScenesScripts = this.searchData(this.cachedFuseObjects.rules, query)
        const { rules, scenes, scripts } = rulesScenesScripts.reduce(
          (acc, r) => {
            if (r.tags.includes('Scene')) {
              acc.scenes.push(r)
            } else if (r.tags.includes('Script')) {
              acc.scripts.push(r)
            } else {
              acc.rules.push(r)
            }
            return acc
          },
          { rules: [], scenes: [], scripts: [] }
        )

        const pages = this.searchData(this.cachedFuseObjects.pages, query)
        const widgets = this.searchData(this.cachedFuseObjects.widgets, query)
        const transformations = this.searchData(this.cachedFuseObjects.transformations, query)
        const persistenceConfigs = this.searchData(this.cachedFuseObjects.persistence, query)

        this.searchResults =  {
          items,
          things,
          rules,
          scenes,
          scripts,
          pages,
          widgets,
          transformations,
          persistenceConfigs
        }
        this.searchResultsLoading = false
      })
    },
    searchData (fuse, query) {
      if (!query) return []

      return fuse
        .search(query)
        .map((result) => result.item)
        .sort((a, b) => {
          const nameA = a.label || a.name || a.uid || a.UID || ''
          const nameB = b.label || b.name || b.uid || b.UID || ''
          return nameA.localeCompare(nameB)
        })
    },
    clearSearch () {
      this.searching = false
      this.searchResultsLoading = false
      this.searchQuery = ''
      this.cachedObjects = null
      this.cachedFuseObjects = null
      this.searchResults = { items: [], things: [], rules: [], scenes: [], scripts: [], pages: [], widgets: [], transformations: [], persistenceConfigs: [] }
    },
    pin (type, obj) {
      useDeveloperStore().pinnedObjects[type].push(obj)
    },
    unpin (type, obj, keyName) {
      let index = useDeveloperStore().pinnedObjects[type].findIndex((o) => o[keyName] === obj[keyName])
      if (index >= 0) {
        useDeveloperStore().pinnedObjects[type].splice(index, 1)
      }
    },
    unpinAll (type) {
      useDeveloperStore().pinnedObjects[type] = []
    },
    savePinCollection (evt) {
      if (evt.key !== 'Enter') return
      this.newCollectionName = this.newCollectionName.trim()
      if (!this.newCollectionName) return

      const saveCurrentCollection = () => {
        useDeveloperStore().pinCollections[this.newCollectionName] = cloneDeep(useDeveloperStore().pinnedObjects)
        this.pinsDirty = false
        this.currentPinCollection = this.newCollectionName
        f7.accordion.close(this.$refs.pinCollectionsAccordion.$el)
        this.newCollectionName = ''
      }

      if (useDeveloperStore().pinCollections[this.newCollectionName]) {
        f7.dialog.confirm('Collection with this name already exists, do you want to overwrite it?', () => {
          saveCurrentCollection()
        })
      } else {
        saveCurrentCollection()
      }
    },
    loadPinCollection (name) {
      if (!useDeveloperStore().pinCollections[name]) return

      const load = () => {
        useDeveloperStore().pinnedObjects = cloneDeep(useDeveloperStore().pinCollections[name])
        f7.accordion.close(this.$refs.pinCollectionsAccordion.$el)
        this.currentPinCollection = name
        this.$nextTick(() => {
          this.pinsDirty = false
        })
      }

      const saveCurrentCollection = () => {
        useDeveloperStore().pinCollections[this.currentPinCollection] = cloneDeep(useDeveloperStore().pinnedObjects)
        this.pinsDirty = false
        f7.accordion.close(this.$refs.pinCollectionsAccordion.$el)
      }

      if (this.pinsDirty && this.isAnythingPinned) {
        if (this.currentPinCollection === name) {
          f7.dialog.confirm(`Save changes to '${this.currentPinCollection}' collection?`, () => {
            saveCurrentCollection()
            load()
          }, () => {
            load()
          })
          return
        }

        f7.dialog.create({
          title: 'Unsaved Changes',
          text: `Before switching to a different collection, would you like to save the changes to '${this.currentPinCollection}' collection?`,
          buttons: [
            {
              text: 'Cancel',
              color: 'gray'
            },
            {
              text: 'Save',
              color: 'blue',
              onClick: () => {
                saveCurrentCollection()
                load()
              }
            },
            {
              text: 'Discard',
              color: 'red',
              onClick: () => {
                load()
              }
            }
          ],
          destroyOnClose: true
        }).open()
      } else {
        load()
      }
    },
    onPinCollectionsAccordionOpened () {
      this.$nextTick(() => {
        const el = this.$refs.currentPinCollectionItem
        if (el && el[0]) {
          el[0].$el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
        }
      })
    },
    getPageType (page) {
      return this.pageTypes.find((t) => t.componentType === page.component)
    },
    showItem (evt, item) {
      evt.cancelBubble = true
      if (this.$$(evt.target).closest('.itemlist-actions').length) return
      const itemEl = this.$$(evt.target).closest('.itemlist-item')
      if (!itemEl.length) return
      this.openedItem = item
      nextTick(() => this.$refs.itemPopover.$el.f7Popover.open(itemEl[0]))
    },
    toggleThingDisabled (thing) {
      const enable = (thing.statusInfo.statusDetail === 'DISABLED')
      this.$oh.api.putPlain('/rest/things/' + thing.UID + '/enable', enable.toString()).then((data) => {
        f7.toast.create({
          text: enable ? 'Thing enabled' : 'Thing disabled',
          destroyOnClose: true,
          closeTimeout: 2000
        }).open()
      }).catch((err) => {
        f7.toast.create({
          text: 'Error while disabling or enabling: ' + err,
          destroyOnClose: true,
          closeTimeout: 2000
        }).open()
      })
    },
    toggleRuleDisabled (rule, type = 'Rule') {
      const enable = (rule.status.statusDetail === 'DISABLED')
      this.$oh.api.postPlain('/rest/rules/' + rule.uid + '/enable', enable.toString()).then((data) => {
        f7.toast.create({
          text: (enable) ? `${type} enabled` : `${type} disabled`,
          destroyOnClose: true,
          closeTimeout: 2000
        }).open()
      }).catch((err) => {
        f7.toast.create({
          text: `Error while disabling or enabling ${type.toLowerCase()}: ` + err,
          destroyOnClose: true,
          closeTimeout: 2000
        }).open()
      })
    },
    runRuleNow (rule, type = 'Rule') {
      if (rule.status.status === 'RUNNING' || rule.status.status === 'UNINITIALIZED') {
        return f7.toast.create({
          text: `${type} cannot be run ${(rule.status.status === 'RUNNING') ? 'while already running, please wait' : 'if it is uninitialized'}!`,
          destroyOnClose: true,
          closeTimeout: 2000
        }).open()
      }
      f7.toast.create({
        text: `Running ${type.toLowerCase()}`,
        destroyOnClose: true,
        closeTimeout: 2000
      }).open()
      this.$oh.api.postPlain('/rest/rules/' + rule.uid + '/runnow', '').catch((err) => {
        f7.toast.create({
          text: `Error while running ${type.toLowerCase()}: ` + err,
          destroyOnClose: true,
          closeTimeout: 2000
        }).open()
      })
    },
    openScriptingScratchpad () {
      this.$oh.api.get('/rest/rules/scratchpad')
        .then((data) => {
          f7.views.main.router.navigate('/settings/scripts/scratchpad', { animate: false })
        })
        .catch(() => {
          this.$oh.api.get('/rest/module-types/script.ScriptAction').then((data) => {
            const languages = data.configDescriptions.find((c) => c.name === 'type').options
            f7.actions.create({
              buttons: [
                [
                  { label: true, text: 'Scripting Language' },
                  ...languages.map((l) => {
                    return {
                      text: l.label,
                      color: 'blue',
                      onClick: () => {
                        const scratchpad = {
                          uid: 'scratchpad',
                          name: '-Scratchpad-',
                          description: 'Created from the developer sidebar on ' + new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString(),
                          triggers: [],
                          conditions: [],
                          actions: [
                            {
                              id: 'script',
                              type: 'script.ScriptAction',
                              configuration: {
                                type: l.value,
                                script: ''
                              }
                            }
                          ],
                          tags: ['Script', 'Scratchpad']
                        }
                        this.$oh.api.postPlain('/rest/rules', JSON.stringify(scratchpad), 'text/plain', 'application/json').then(() => {
                          f7.toast.create({
                            text: 'Scratchpad script created',
                            destroyOnClose: true,
                            closeTimeout: 2000
                          }).open()
                          f7.views.main.router.navigate('/settings/scripts/scratchpad', { animate: false })
                        })
                      }
                    }
                  })
                ],
                [
                  { color: 'red', text: 'Cancel', close: true }
                ]
              ]
            }).open()
          })
        })
    },
    quickAddThing () {
      if (this.addThingAutocomplete) {
        this.addThingAutocomplete.value = []
        this.addThingAutocomplete.open()
      } else {
        f7.preloader.show()
        const self = this
        this.$oh.api.get('/rest/thing-types').then((data) => {
          const listedThingTypes = data.filter((t) => t.listed).map((t) => { return { UID: t.UID, label: `${t.label} (${t.UID})` } }).sort((a, b) => a.label.localeCompare(b.label))
          f7.preloader.hide()
          this.addThingAutocomplete = f7.autocomplete.create({
            openIn: 'popup',
            autoFocus: true,
            value: [],
            pageTitle: 'Select Thing Type',
            searchbarPlaceholder: 'Search thing types',
            requestSourceOnOpen: true,
            multiple: false,
            valueProperty: 'UID',
            textProperty: 'label',
            url: 'quick-add-thing/',
            source (query, render) {
              if (query.length === 0) {
                render(listedThingTypes)
              } else {
                render(listedThingTypes.filter((t) => (t.label.toLowerCase().indexOf(query.toLowerCase()) >= 0 || t.UID.toLowerCase().indexOf(query.toLowerCase()) >= 0)))
              }
            },
            on: {
              change (value) {
                if (!value.length) return
                f7.views.main.router.navigate('/settings/things/add/' + value[0].UID.split(':')[0] + '/' + value[0].UID, { animate: false })
              }
            }
          }).open()
        })
      }
    },
    changeEventTopicFilter () {
      f7.dialog.prompt('Filter events by topics (comma-separated, wildcards accepted):',
        'Event Monitor',
        (filter) => {
          this.eventTopicFilter = filter
        },
        null,
        this.eventTopicFilter)
    },
    startSSE () {
      this.sseEvents = []
      this.sseClient = this.$oh.sse.connect('/rest/events' + (this.eventTopicFilter ? '?topics=' + this.eventTopicFilter : ''), '', (event) => {
        event.time = new Date()
        this.sseEvents.unshift(...[event])
        this.sseEvents.splice(20)
      })
    },
    stopSSE () {
      this.$oh.sse.close(this.sseClient)
      this.sseClient = null
    },
    startEventSource () {
      this.eventSource = this.$oh.sse.connect('/rest/events?topics=openhab/rules/*/*,openhab/things/*/*,openhab/addons/*/*', null, (event) => {
        const topicParts = event.topic.split('/')
        switch (topicParts[1]) {
          case 'addons':
            if (this.addThingAutocomplete) this.addThingAutocomplete.destroy()
            break
          case 'things':
            switch (topicParts[3]) {
              case 'removed':
                this.unpin('things', { UID: topicParts[2] }, 'UID')
                break
              case 'status':
                const updatedThing = useDeveloperStore().pinnedObjects.things.find((t) => t.UID === topicParts[2])
                if (!updatedThing) break
                const newStatus = JSON.parse(event.payload)
                if (updatedThing) {
                  if (updatedThing.statusInfo.status !== newStatus.status)
                    updatedThing.statusInfo.status = newStatus.status
                  if (updatedThing.statusInfo.statusDetail !== newStatus.statusDetail)
                    updatedThing.statusInfo.statusDetail = newStatus.statusDetail
                  if (updatedThing.statusInfo.description !== newStatus.description)
                    updatedThing.statusInfo.description = newStatus.description
                }
            }
            break
          case 'rules':
            switch (topicParts[3]) {
              case 'removed':
                this.unpin('rules', { uid: topicParts[2] }, 'uid')
                break
              case 'state':
                let rule = useDeveloperStore().pinnedObjects.rules.find((r) => r.uid === topicParts[2])
                if (!rule) rule = useDeveloperStore().pinnedObjects.scenes.find((r) => r.uid === topicParts[2])
                if (!rule) rule = useDeveloperStore().pinnedObjects.scripts.find((r) => r.uid === topicParts[2])
                if (!rule) break
                rule.status = JSON.parse(event.payload)
            }
            break
        }
      })
    },
    stopEventSource () {
      this.$oh.sse.close(this.eventSource)
      this.eventSource = null
    }
  }
}
</script>
