import { compareItems } from '@/components/widgets/widget-order'

function compareModelItems (o1, o2) {
  return compareItems(o1.item || o1, o2.item || o2)
}

/**
 * Mixin for model page and model picker popup.
 *
 * The component using this mixin has to provide the following methods:
 * - `selectItem(item)`: Called when an item is selected.
 * - `modelItem(item)`: Called to create a model item from an item.
 */
export default {
  data () {
    return {
      ready: false,
      loading: false,
      includeNonSemantic: false,

      items: [],
      links: [],
      locations: [],
      rootLocations: [],
      equipment: {},
      rootEquipment: [],
      rootPoints: [],
      rootGroups: [],
      rootItems: [],

      previousSelection: null,
      selectedItem: null
    }
  },
  methods: {
    /**
     * Load the items and links from the REST API and build the model.
     *
     * @returns {Promise<void>}
     */
    loadModel () {
      if (this.loading) return
      this.loading = true

      const items = this.$oh.api.get('/rest/items?staticDataOnly=true&metadata=.+')
      const links = this.$oh.api.get('/rest/links')
      return Promise.all([items, links]).then((data) => {
        this.items = data[0]
        this.links = data[1]

        if (this.newItem) {
          this.items.push(this.newItem)
        }

        this.locations = this.items.filter((i) => i.metadata && i.metadata.semantics && i.metadata.semantics.value.indexOf('Location') === 0)
        this.equipment = this.items.filter((i) => i.metadata && i.metadata.semantics && i.metadata.semantics.value.indexOf('Equipment') === 0)
        this.points = this.items.filter((i) => i.metadata && i.metadata.semantics && i.metadata.semantics.value.indexOf('Point') === 0)

        this.rootLocations = this.locations
          .filter((i) => !i.metadata.semantics.config || !i.metadata.semantics.config.isPartOf)
          .map(this.modelItem).sort(compareModelItems)
        this.rootLocations.forEach(this.getChildren)
        this.rootEquipment = this.equipment
          .filter((i) => !i.metadata.semantics.config || (!i.metadata.semantics.config.isPartOf && !i.metadata.semantics.config.hasLocation))
          .map(this.modelItem).sort(compareModelItems)
        this.rootEquipment.forEach(this.getChildren)
        this.rootPoints = this.points
          .filter((i) => !i.metadata.semantics.config || (!i.metadata.semantics.config.isPointOf && !i.metadata.semantics.config.hasLocation))
          .map(this.modelItem).sort(compareModelItems)

        if (this.includeNonSemantic) {
          this.rootGroups = this.items
            .filter((i) => i.type === 'Group' && (!i.metadata || !i.metadata.semantics) && i.groupNames.length === 0)
            .map(this.modelItem).sort(compareModelItems)
          this.rootGroups.forEach(this.getChildren)
          this.rootItems = this.items
            .filter((i) => i.type !== 'Group' && (!i.metadata || !i.metadata.semantics) && i.groupNames.length === 0)
            .map(this.modelItem).sort(compareModelItems)
        }

        this.loading = false
        this.ready = true

        return Promise.resolve()
      }).catch((error) => {
        return Promise.reject(error)
      })
    },
    getChildren (parent) {
      // open the parent node of the placeholder
      if (this.newItemParent && this.newItemParent === parent.item.name) {
        parent.opened = true
      }

      // restore previous selection
      if (this.previousSelection && parent.item.name === this.previousSelection.item.name) {
        this.selectedItem = parent
        this.previousSelection = null
        this.selectItem(parent)
      }

      if (parent.class.indexOf('Location') === 0) {
        parent.children.locations = this.locations
          .filter((i) => i.metadata.semantics.config && i.metadata.semantics.config.isPartOf === parent.item.name)
          .map(this.modelItem).sort(compareModelItems)
        parent.children.locations.forEach(this.getChildren)
        parent.children.equipment = this.equipment
          .filter((i) => i.metadata.semantics.config && i.metadata.semantics.config.hasLocation === parent.item.name)
          .map(this.modelItem).sort(compareModelItems)
        parent.children.equipment.forEach(this.getChildren)

        parent.children.points = this.points
          .filter((i) => i.metadata.semantics.config && i.metadata.semantics.config.hasLocation === parent.item.name)
          .map(this.modelItem).sort(compareModelItems)
      } else {
        parent.children.equipment = this.equipment
          .filter((i) => i.metadata.semantics.config && i.metadata.semantics.config.isPartOf === parent.item.name)
          .map(this.modelItem).sort(compareModelItems)
        parent.children.equipment.forEach(this.getChildren)

        parent.children.points = this.points
          .filter((i) => i.metadata.semantics.config && i.metadata.semantics.config.isPointOf === parent.item.name)
          .map(this.modelItem).sort(compareModelItems)
      }

      if (this.includeNonSemantic) {
        parent.children.groups = this.items
          .filter((i) => i.type === 'Group' && (!i.metadata || (i.metadata && !i.metadata.semantics)) && i.groupNames.indexOf(parent.item.name) >= 0)
          .map(this.modelItem).sort(compareModelItems)
        parent.children.groups.forEach(this.getChildren)
        if (parent.item.metadata && parent.item.metadata.semantics) {
          parent.children.items = this.items
            .filter((i) => i.type !== 'Group' && (!i.metadata || (i.metadata && !i.metadata.semantics)) && i.groupNames.indexOf(parent.item.name) >= 0)
            .map(this.modelItem).sort(compareModelItems)
        } else {
          parent.children.items = this.items
            .filter((i) => i.type !== 'Group' && i.groupNames.indexOf(parent.item.name) >= 0)
            .map(this.modelItem).sort(compareModelItems)
        }
      }
    },
    /**
     * Expands or collapses all treeview items based on the current state of `this.expanded`.
     * `this.expanded` has to be provided by the component using this mixin.
     */
    applyExpandedOption () {
      const treeviewItems = document.querySelectorAll('.treeview-item')

      treeviewItems.forEach(item => {
        if (item.classList.contains('treeview-item')) {
          if (this.expanded) {
            item.classList.add('treeview-item-opened')
          } else {
            item.classList.remove('treeview-item-opened')
          }
        }
      })
    }
  }
}
