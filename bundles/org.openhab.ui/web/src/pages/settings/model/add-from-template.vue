<template>
  <f7-page>
    <f7-navbar title="Add Locations from Template" back-link="Back">
      <f7-nav-right class="if-not-aurora">
        <f7-link @click="add()" v-if="$theme.md" icon-md="material:save" icon-only />
        <f7-link @click="add()" v-if="!$theme.md">
          Add
        </f7-link>
      </f7-nav-right>
    </f7-navbar>

    <f7-block class="block-narrow">
      <f7-col>
        <f7-block class="no-padding">
          <f7-block-title class="padding-horizontal">
            Location Template
          </f7-block-title>
          <f7-list>
            <f7-list-item radio value="0" @change="onSelectTemplate(0)" title="One Bedroom Apartment" name="select-template" />
            <f7-list-item radio value="1" @change="onSelectTemplate(1)" title="One Story House" name="select-template" />
            <f7-list-item radio value="2" @change="onSelectTemplate(2)" title="Two Story House" name="select-template" />
          </f7-list>
          <f7-block-footer class="padding-left padding-right">
            Select the template that best matches the description of your property.
          </f7-block-footer>
        </f7-block>
        <f7-block class="no-padding">
          <f7-block-title class="padding-horizontal">
            Item Name Prefix
          </f7-block-title>
          <f7-list>
            <f7-list-input label="Prefix" type="text" placeholder="item prefix"
                           @input="onPrefixInput" clear-button :error-message="prefixErrorMessage"
                           :error-message-force="!!prefixErrorMessage" />
          </f7-list>
          <f7-block-footer class="padding-horizontal">
            Add a prefix to each created item's name (optional, default is 'l')
          </f7-block-footer>
        </f7-block>
        <f7-block v-if="selectedTemplate !== null" class="semantic-tree-wrapper">
          <f7-block-footer class="padding-left padding-right">
            Select the locations to add to your model (you may add others from the model page at a later time).
          </f7-block-footer>
          <f7-block class="semantic-tree">
            <model-treeview class="model-picker-treeview" :rootNodes="rootLocations"
                            :selected-item="selectedItem" @selected="selectItem" @checked="checkItem" />
          </f7-block>
        </f7-block>
      </f7-col>
    </f7-block>

    <div v-if="selectedTemplate !== null && (checkedItems.length > 0)" class="if-aurora display-flex justify-content-center margin padding">
      <div class="flex-shrink-0">
        <f7-button class="padding-left padding-right" style="width: 150px" color="blue" large raised fill @click="add">
          Add to Model
        </f7-button>
      </div>
    </div>
  </f7-page>
</template>

<style lang="stylus">
.semantic-tree-wrapper
  padding 0
  margin-bottom 0
.semantic-tree
  padding 0
  border-top 1px solid var(--f7-block-strong-border-color)
  border-bottom 1px solid var(--f7-block-strong-border-color)
  background: var(--f7-list-bg-color)
  .treeview
    --f7-treeview-item-height 40px
    .treeview-item-label
      font-size 10pt
      white-space nowrap
      overflow-x hidden
    .semantic-class
      font-size 8pt
      color var(--f7-list-item-footer-text-color)
@media (min-width: 768px)
  .semantic-tree-wrapper
    height calc(100% - var(--f7-navbar-height))
    .row
      height 100%
      .col-100
        height 100%
        overflow auto
        .semantic-tree
          min-height 100%
          margin 0
          height auto

@media (max-width: 767px)
  .semantic-tree-wrapper.sheet-opened
    margin-bottom var(--f7-sheet-height)
</style>

<script>
import ModelTreeview from '@/components/model/model-treeview.vue'

import { compareItems } from '@/components/widgets/widget-order'

function compareModelItems (o1, o2) {
  return compareItems(o1.item || o1, o2.item || o2)
}

export default {
  props: ['itemList'],
  components: {
    ModelTreeview
  },
  data () {
    return {
      selectedItem: null,
      previousSelection: null,
      checkedItems: [],
      selectedTemplate: null,
      currentModel: null, // cache for computed rootLocations
      prefix: null,
      prefixErrorMessage: null
    }
  },
  computed: {
    locations () {
      const floor1 = (this.selectedTemplate === 0) ? 'lApartment' : (this.selectedTemplate === 1) ? 'lHouse' : 'lFloor_Ground'
      const floor2 = (this.selectedTemplate === 0) ? 'lApartment' : (this.selectedTemplate === 1) ? 'lHouse' : 'lFloor_Second'

      return [
        {
          'metadata': {
            'semantics': {
              'value': 'Location_Indoor_Room_Bathroom',
              'config': {
                'isPartOf': floor2
              }
            }
          },
          'type': 'Group',
          'name': 'lBathroom2',
          'label': 'Bathroom',
          'category': 'bath',
          'tags': [
            'Bathroom'
          ],
          'groupNames': [
            floor2
          ],
          'templates': 4
        },
        {
          'metadata': {
            'semantics': {
              'value': 'Location_Indoor_Building',
              'config': {
                'isPartOf': 'lProperty'
              }
            }
          },
          'type': 'Group',
          'name': 'lApartment',
          'label': 'Apartment',
          'category': 'corridor',
          'tags': [
            'Building'
          ],
          'groupNames': [
            'lProperty'
          ],
          'templates': 1
        },
        {
          'metadata': {
            'semantics': {
              'value': 'Location_Indoor_Building',
              'config': {
                'isPartOf': 'lProperty'
              }
            }
          },
          'type': 'Group',
          'name': 'lHouse',
          'label': 'House',
          'category': 'house',
          'tags': [
            'Building'
          ],
          'groupNames': [
            'lProperty'
          ],
          'templates': 6
        },
        {
          'metadata': {
            'semantics': {
              'value': 'Location'
            }
          },
          'type': 'Group',
          'name': 'lProperty',
          'label': 'Property',
          'category': 'none',
          'tags': [
            'Location'
          ],
          'groupNames': [],
          'templates': 7
        },
        {
          'metadata': {
            'semantics': {
              'value': 'Location_Indoor_Room_Kitchen',
              'config': {
                'isPartOf': floor1
              }
            }
          },
          'type': 'Group',
          'name': 'lKitchen',
          'label': 'Kitchen',
          'category': 'kitchen',
          'tags': [
            'Kitchen'
          ],
          'groupNames': [
            floor1
          ],
          'templates': 7
        },
        {
          'metadata': {
            'semantics': {
              'value': 'Location_Indoor_Building_Garage',
              'config': {
                'isPartOf': floor1
              }
            }
          },
          'type': 'Group',
          'name': 'lGarage',
          'label': 'Garage',
          'category': 'garage',
          'tags': [
            'Garage'
          ],
          'groupNames': [
            floor1
          ],
          'templates': 6
        },
        {
          'metadata': {
            'semantics': {
              'value': 'Location',
              'config': {
                'isPartOf': 'lProperty'
              }
            }
          },
          'type': 'Group',
          'name': 'lBackYard',
          'label': 'Back Yard',
          'category': 'garden',
          'tags': [
            'Location'
          ],
          'groupNames': [
            'lProperty'
          ],
          'templates': 6
        },
        {
          'metadata': {
            'semantics': {
              'value': 'Location_Indoor_Room_Entry',
              'config': {
                'isPartOf': floor1
              }
            }
          },
          'type': 'Group',
          'name': 'lEntry',
          'label': 'Entry',
          'category': 'corridor',
          'tags': [
            'Entry'
          ],
          'groupNames': [
            floor1
          ],
          'templates': 7
        },
        {
          'metadata': {
            'semantics': {
              'value': 'Location_Indoor_Room_LivingRoom',
              'config': {
                'isPartOf': floor1
              }
            }
          },
          'type': 'Group',
          'name': 'lLivingRoom',
          'label': 'Living Room',
          'category': 'sofa',
          'tags': [
            'LivingRoom'
          ],
          'groupNames': [
            floor1
          ],
          'templates': 7
        },
        {
          'metadata': {
            'semantics': {
              'value': 'Location_Indoor_Floor',
              'config': {
                'isPartOf': 'lHouse'
              }
            }
          },
          'type': 'Group',
          'name': 'lFloor_Ground',
          'label': 'Ground Floor',
          'category': 'groundfloor',
          'tags': [
            'Floor'
          ],
          'groupNames': [
            'lHouse'
          ],
          'templates': 4
        },
        {
          'metadata': {
            'semantics': {
              'value': 'Location_Indoor_Room_DiningRoom',
              'config': {
                'isPartOf': floor1
              }
            }
          },
          'type': 'Group',
          'name': 'lDiningRoom',
          'label': 'Dining Room',
          'category': 'none',
          'tags': [
            'DiningRoom'
          ],
          'groupNames': [
            floor1
          ],
          'templates': 6
        },
        {
          'metadata': {
            'semantics': {
              'value': 'Location_Indoor_Room_Office',
              'config': {
                'isPartOf': floor2
              }
            }
          },
          'type': 'Group',
          'name': 'lOffice',
          'label': 'Office',
          'category': 'office',
          'tags': [
            'Office'
          ],
          'groupNames': [
            floor2
          ],
          'templates': 4
        },
        {
          'metadata': {
            'semantics': {
              'value': 'Location',
              'config': {
                'isPartOf': 'lProperty'
              }
            }
          },
          'type': 'Group',
          'name': 'lFrontYard',
          'label': 'Front Yard',
          'category': 'lawnmower',
          'tags': [
            'Location'
          ],
          'groupNames': [
            'lProperty'
          ],
          'templates': 6
        },
        {
          'metadata': {
            'semantics': {
              'value': 'Location_Indoor_Room_Bedroom',
              'config': {
                'isPartOf': floor2
              }
            }
          },
          'type': 'Group',
          'name': 'lBedroom1',
          'label': 'Main Bedroom',
          'category': 'bedroom_blue',
          'tags': [
            'Bedroom'
          ],
          'groupNames': [
            floor2
          ],
          'templates': 7
        },
        {
          'metadata': {
            'semantics': {
              'value': 'Location_Indoor_Room_Bedroom',
              'config': {
                'isPartOf': floor2
              }
            }
          },
          'type': 'Group',
          'name': 'lBedroom2',
          'label': 'Second Bedroom',
          'category': 'bedroom_red',
          'tags': [
            'Bedroom'
          ],
          'groupNames': [
            floor2
          ],
          'templates': 6
        },
        {
          'metadata': {
            'semantics': {
              'value': 'Location_Indoor_Room_Bathroom',
              'config': {
                'isPartOf': floor1
              }
            }
          },
          'type': 'Group',
          'name': 'lBathroom1',
          'label': 'Bathroom',
          'category': 'bath',
          'tags': [
            'Bathroom'
          ],
          'groupNames': [
            floor1
          ],
          'templates': 7
        },
        {
          'metadata': {
            'semantics': {
              'value': 'Location_Indoor_Floor',
              'config': {
                'isPartOf': 'lHouse'
              }
            }
          },
          'type': 'Group',
          'name': 'lFloor_Second',
          'label': 'Upstairs',
          'category': 'firstfloor',
          'tags': [
            'Floor'
          ],
          'groupNames': [
            'lHouse'
          ],
          'templates': 4
        }
      ]
    },
    rootLocations () {
      if (this.currentModel) {
        return this.currentModel
      }
      const newModel = this.locations
        .filter((i) => (!i.metadata.semantics.config || !i.metadata.semantics.config.isPartOf) && (i.templates & (1 << this.selectedTemplate)))
        .map(this.modelItem).sort(compareModelItems)
      newModel.forEach(this.getChildren)
      this.currentModel = newModel // eslint-disable-line vue/no-side-effects-in-computed-properties

      return newModel
    }
  },
  methods: {
    modelItem (item) {
      const modelItem = {
        item: item,
        opened: true,
        checked: true,
        checkable: true,
        class: (item.metadata && item.metadata.semantics) ? item.metadata.semantics.value : '',
        children: {
          locations: [],
          equipment: [],
          points: [],
          groups: [],
          items: []
        }
      }
      if (this.previousSelection && item.name === this.previousSelection.item.name) {
        this.selectedItem = parent
        this.previousSelection = null
        this.selectItem(modelItem)
      }
      this.checkedItems.push(modelItem)

      return modelItem
    },
    getChildren (parent) {
      // restore previous selection
      if (this.previousSelection && parent.item.name === this.previousSelection.item.name) {
        this.selectedItem = parent
        this.previousSelection = null
        this.selectItem(parent)
      }

      parent.children.locations = this.locations
        .filter((i) => i.metadata.semantics.config && i.metadata.semantics.config.isPartOf === parent.item.name && (i.templates & (1 << this.selectedTemplate)))
        .map(this.modelItem).sort(compareModelItems)
      parent.children.locations.forEach(this.getChildren)
    },
    selectItem (item) {
      if (item.children && item.opened !== undefined) {
        item.opened = !item.opened
      }
    },
    findLocation (searchNode, name) {
      if (searchNode.item.name === name) {
        return searchNode
      } else if (searchNode.children.locations != null) {
        let foundNode = null
        const childList = searchNode.children.locations
        for (let i = 0; i < childList.length; i++) {
          foundNode = this.findLocation(childList[i], name)
          if (foundNode) {
            return foundNode
          }
        }
        return null
      }
      return null
    },
    checkItem (item, check) {
      if (check) {
        this.checkedItems.push(item)
        if (item.item.groupNames.length > 0) {
          const parentNode = this.findLocation(this.rootLocations[0], item.item.groupNames[0])
          if (parentNode && !parentNode.checked) {
            parentNode.checked = true
            this.checkItem(parentNode, true)
          }
        }
      } else {
        this.checkedItems.splice(this.checkedItems.indexOf(item), 1)
        item.children.locations.forEach((i) => {
          if (i.checked) {
            i.checked = false
            this.checkItem(i, false)
          }
        })
      }
    },
    onSelectTemplate (template) {
      this.$set(this, 'checkedItems', [])
      this.currentModel = null
      this.selectedTemplate = template
    },
    add () {
      if (this.prefixErrorMessage) {
        this.$f7.dialog.alert('Invalid prefix for item names')
        return
      }
      if (this.prefix) {
        this.checkedItems.forEach((i) => {
          i.item.name = this.prefix + i.item.name.substr(1)
          if (i.item.groupNames.length > 0) {
            i.item.groupNames[0] = this.prefix + i.item.groupNames[0].substr(1)
          }
        })
      }
      const existingNames = this.itemList.map((i) => i.name)
      if (this.checkedItems.length === 0) {
        this.$f7.dialog.alert('Please select some locations')
      } else if (this.checkedItems.some((i) => existingNames.includes(i.item.name))) {
        this.$f7.dialog.confirm('Some Item names already exist. Continuing will overwrite those Items. Continue?',
          'Warning',
          () => { this.doAdd() }
        )
      } else {
        this.doAdd()
      }
    },
    doAdd () {
      const dialog = this.$f7.dialog.progress('Creating template...')
      const payload = this.checkedItems.map((i) => i.item)

      this.$oh.api.put('/rest/items/', payload).then((data) => {
        dialog.setText('Creating Items...')
        dialog.setProgress(50)
      }).catch((err) => {
        dialog.close()
        console.error(err)
        this.$f7.dialog.alert('An error occurred while creating the model items: ' + err)
      }).then((data) => {
        dialog.setProgress(100)
        this.$f7.toast.create({
          text: 'Model created',
          destroyOnClose: true,
          closeTimeout: 2000
        }).open()
        dialog.close()
        this.$f7router.back()
      })
    },
    onPrefixInput (event) {
      this.prefix = event.target.value
      this.validatePrefix(this.prefix)
    },
    validatePrefix (prefix) {
      if (prefix && (!/^[A-Za-z0-9_]+$/.test(prefix))) {
        this.prefixErrorMessage = 'A-Z,a-z,0-9,_ only'
      } else {
        this.prefixErrorMessage = ''
      }
    }
  }
}
</script>
