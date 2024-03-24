<template>
  <f7-page @page:afterin="onPageAfterIn">
    <f7-navbar title="Add Items from Thing" back-link="Back">
      <f7-nav-right class="if-not-aurora">
        <f7-link @click="add()" v-if="$theme.md" icon-md="material:save" icon-only />
        <f7-link @click="add()" v-if="!$theme.md">
          Add
        </f7-link>
      </f7-nav-right>
    </f7-navbar>

    <f7-block class="block-narrow">
      <f7-col>
        <f7-block-title v-if="parent || thingId">
          Parent Group
        </f7-block-title>
        <f7-list media-list v-if="parent">
          <ul>
            <item :item="parent.item" />
          </ul>
        </f7-list>
        <f7-block-footer v-if="thingId" class="padding-left padding-right">
          Select the parent Location or Equipment group in the semantic model, under which the new items will be inserted (optional, but recommended).
        </f7-block-footer>
        <f7-list v-if="thingId">
          <ul v-if="parentGroup">
            <item :item="parentGroup" :link="true" @click="openModelPicker" />
          </ul>
          <f7-list-item v-else title="Pick From Model" link @click="openModelPicker" />
        </f7-list>
        <f7-block-title v-if="selectedThing.statusInfo">
          Source Thing
        </f7-block-title>
        <f7-list v-if="selectedThing.statusInfo" media-list>
          <f7-list-item
            :title="selectedThing.label"
            :footer="selectedThing.UID"
            :badge="thingStatusBadgeText(selectedThing.statusInfo)"
            :badge-color="thingStatusBadgeColor(selectedThing.statusInfo)" />
        </f7-list>
        <f7-block-title v-if="createEquipment">
          Equipment
        </f7-block-title>
        <f7-block-footer v-if="createEquipment && !thingId" class="padding-left padding-right">
          Select the Thing you wish to create as a new Equipment group in the model. It will be placed under the parent group above, if any.
          You can alter the new group's details and change its equipment class.
        </f7-block-footer>
        <f7-block-footer v-else-if="createEquipment && thingId" class="padding-left padding-right">
          Complete the details of the new Equipment group to add to the model. It will be placed under the parent group above, if any.
          You can alter the new group's details and change its equipment class.
        </f7-block-footer>
        <f7-block-footer v-else-if="!createEquipment && !thingId" class="padding-left padding-right">
          Select the Thing for which you wish to create Point Items from its Channels. They will be placed under the parent group above, if any.
        </f7-block-footer>
        <f7-list inline-labels no-hairlines-md v-if="!thingId">
          <thing-picker title="Thing" name="thing" :value="selectedThingId" @input="(e) => selectedThingId = e" />
        </f7-list>
        <f7-block v-if="!ready" class="text-align-center">
          <f7-preloader />
          <div>Loading...</div>
        </f7-block>
        <div v-else-if="selectedThing.UID && selectedThingType.UID">
          <item-form v-if="createEquipment" :item="newEquipmentItem" :items="items" :createMode="true" :hide-type="true" :force-semantics="true" />
          <f7-block-title>Channels</f7-block-title>
          <f7-block-footer class="padding-left padding-right">
            Check the channels you wish to create as new Point items.
            You can alter the suggested names and labels as well as the semantic class and related property.<br><br>
            The newly created Points will be linked to their respective channels with the default profile
            (you will be able to configure the links individually later if needed).
            <f7-link class="display-block margin-top-half" @click="switchToExpertMode" color="blue">
              Expert Mode
            </f7-link>
          </f7-block-footer>
          <channel-list :thing="selectedThing" :thingType="selectedThingType" :channelTypes="selectedThingChannelTypes" :items="items"
                        :multiple-links-mode="true" :new-items-prefix="(createEquipment) ? newEquipmentItem.name : (parentGroup) ? parentGroup.name : ''"
                        :new-items="newPointItems" />
        </div>
      </f7-col>
    </f7-block>

    <div v-if="ready && selectedThing.UID" class="if-aurora display-flex justify-content-center margin padding">
      <div class="flex-shrink-0">
        <f7-button class="padding-left padding-right" style="width: 150px" color="blue" large raised fill @click="add">
          Add to Model
        </f7-button>
      </div>
    </div>
  </f7-page>
</template>

<script>
import ThingPicker from '@/components/config/controls/thing-picker.vue'
import ModelPickerPopup from '@/components/model/model-picker-popup.vue'
import ChannelList from '@/components/thing/channel-list.vue'
import ItemForm from '@/components/item/item-form.vue'

import Item from '@/components/item/item.vue'

import ThingStatus from '@/components/thing/thing-status-mixin'
import ItemMixin from '@/components/item/item-mixin'

import generateTextualDefinition from './generate-textual-definition'

export default {
  mixins: [ThingStatus, ItemMixin],
  components: {
    Item,
    ThingPicker,
    ChannelList,
    ItemForm
  },
  props: ['parent', 'createEquipment', 'thingId'],
  data () {
    return {
      ready: true,
      parentGroup: null,
      selectedThingId: '',
      selectedThing: {},
      selectedThingType: {},
      selectedThingChannelTypes: {},
      newEquipmentItem: {},
      newPointItems: [],
      items: null
    }
  },
  methods: {
    onPageAfterIn () {
      if (this.thingId) {
        this.selectedThingId = this.thingId
      }
    },
    switchToExpertMode () {
      try {
        let parentGroupsForEquipment, parentGroupsForPoints
        if (this.createEquipment) {
          parentGroupsForEquipment = (this.parentGroup) ? [this.parentGroup.name] : []
          parentGroupsForPoints = [this.newEquipmentItem.name]
        } else {
          parentGroupsForEquipment = []
          parentGroupsForPoints = (this.parent) ? [this.parent.item.name] : (this.parentGroup) ? [this.parentGroup.name] : []
        }

        const itemsDefinition = generateTextualDefinition(this.selectedThing, this.selectedThingChannelTypes, (this.createEquipment) ? this.newEquipmentItem : null, parentGroupsForEquipment, parentGroupsForPoints)

        this.$f7router.navigate('/settings/items/add-from-textual-definition', {
          props: {
            textualDefinition: itemsDefinition
          },
          pushState: false,
          reloadCurrent: true
        })
      } catch (e) {
        console.error(e)
        this.$f7.dialog.alert('There was an error generating the items definition: ' + e)
      }
    },
    add () {
      if (!this.selectedThingId) {
        this.$f7.dialog.alert('Please select a Thing')
        return
      }
      if (this.createEquipment && !this.newEquipmentItem.name) {
        this.$f7.dialog.alert('Please fill out the details for the new Equipment group')
        return
      }
      if (!this.newPointItems.length) {
        this.$f7.dialog.alert('Please check at least one channel')
        return
      }

      let valid = true
      if (this.parentGroup && this.createEquipment) {
        this.newEquipmentItem.groupNames = [this.parentGroup.name]
      }
      this.newPointItems.forEach((p) => {
        if (!p.name) valid = false
        if (this.createEquipment) {
          p.groupNames = [this.newEquipmentItem.name]
        } else {
          p.groupNames = (this.parent) ? [this.parent.item.name] : (this.parentGroup) ? [this.parentGroup.name] : []
        }
      })

      if (!valid) {
        this.$f7.dialog.alert('There are validation errors in some of the Points item to create and link to checked channels')
        return
      }

      let dialog = this.$f7.dialog.progress('Creating the Equipment and Points...')
      const payload = [...this.newPointItems.map((p) => {
        let copy = Object.assign({}, p)
        delete (copy.channel)
        delete (copy.channelType)
        return copy
      })]
      if (this.createEquipment) payload.unshift(this.newEquipmentItem)

      this.$oh.api.put('/rest/items/', payload).then((data) => {
        dialog.setText('Updating unit metadata...')
        dialog.setProgress(40)
        const unitPromises = this.newPointItems.map((p) => {
          return this.saveUnit(p, p.unit).then(() => { return this.saveStateDescription(p, p.stateDescriptionPattern) })
        })
        Promise.all(unitPromises).then((data) => {
          dialog.setText('Creating links...')
          dialog.setProgress(60)
          const linkPromises = this.newPointItems.map((p) => {
            return this.$oh.api.put(`/rest/links/${p.name}/${encodeURIComponent(p.channel.uid)}`, {
              itemName: p.name,
              channelUID: p.channel.uid,
              configuration: {}
            })
          })

          Promise.all(linkPromises).then((data) => {
            dialog.setProgress(100)
            this.$f7.toast.create({
              text: 'Items created and linked',
              destroyOnClose: true,
              closeTimeout: 2000
            }).open()
            dialog.close()
            this.$f7router.back()
          }).catch((err) => {
            dialog.close()
            console.error(err)
            this.$f7.dialog.alert('An error occurred while creating the links: ' + err)
          })
        }).catch((err) => {
          dialog.close()
          console.error(err)
          this.$f7.dialog.alert('An error occurred while creating unit metadata: ' + err)
        })
      }).catch((err) => {
        dialog.close()
        console.error(err)
        this.$f7.dialog.alert('An error occurred while creating the items: ' + err)
      })
    },
    pickParentFromModel (value) {
      this.parentGroup = value
    },
    openModelPicker () {
      const popup = {
        component: ModelPickerPopup
      }

      this.$f7router.navigate({
        url: 'pick-from-model',
        route: {
          path: 'pick-from-model',
          popup
        }
      }, {
        props: {
          value: (this.parentGroup) ? this.parentGroup.name : null,
          multiple: false,
          allowEmpty: true,
          popupTitle: 'Parent Group',
          groupsOnly: true
        }
      })

      this.$f7.once('itemsPicked', this.pickParentFromModel)
      this.$f7.once('modelPickerClosed', () => {
        this.$f7.off('itemsPicked', this.pickParentFromModel)
      })
    }
  },
  watch: {
    selectedThingId () {
      this.selectedThing = {}
      this.selectedThingType = {}
      this.newPointItems = []
      this.ready = false
      if (!this.selectedThingId) return
      this.$oh.api.get('/rest/things/' + this.selectedThingId).then((data) => {
        this.selectedThing = data

        let typePromises = [this.$oh.api.get('/rest/thing-types/' + this.selectedThing.thingTypeUID),
          this.$oh.api.get('/rest/channel-types?prefixes=system,' + this.selectedThing.thingTypeUID.split(':')[0])]

        Promise.all(typePromises).then(data2 => {
          this.selectedThingType = data2[0]
          this.selectedThingChannelTypes = data2[1]

          if (this.createEquipment) {
            this.newEquipmentItem = {
              name: this.$oh.utils.normalizeLabel(this.selectedThing.label),
              label: this.selectedThing.label,
              tags: ['Equipment'],
              type: 'Group',
              groupNames: (this.parent) ? [this.parent.item.name] : []
            }
          }

          if (this.items) {
            this.ready = true
          } else {
            this.$oh.api.get('/rest/items').then((items) => {
              this.items = items
              this.ready = true
            })
          }
        })
      })
    }
  }
}
</script>
