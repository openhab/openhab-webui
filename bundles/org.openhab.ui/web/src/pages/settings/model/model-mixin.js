import { compareItems } from '@/components/widgets/widget-order'

function compareModelItems (o1, o2) {
  return compareItems(o1.item || o1, o2.item || o2)
}

/**
 * Mixin for the model page and model picker popup.
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

      items: [],
      links: [],
      locations: [],
      rootLocations: [],
      equipment: [],
      rootEquipment: [],
      points: [],
      rootPoints: [],
      rootGroups: [],
      rootItems: [],

      expandedTreeviewItems: [],

      previousSelection: null,
      selectedItem: null
    }
  },
  computed: {
    rootElements () {
      return [...this.rootLocations, ...this.rootEquipment, ...this.rootPoints, ...this.rootGroups, ...this.rootItems]
    }
  },
  methods: {
    /**
     * Load the items and links from the REST API and build the model.
     *
     * @param relatedToItem optional parameter for an item, only the part of the model related to the item will be build, including all parents and the semantic children.
     *                      The items and links Array variable will also be limited to these related items, and not the full items and links list retrieved from the REST API.
     *
     * @returns {Promise<void>}
     */
    async loadModel (relatedToItem) {
      if (this.loading) return Promise.resolve()
      this.loading = true

      this.saveExpanded()

      let items, links
      if (relatedToItem) {
        // use the information already available in the argument to construct the response and avoid a REST call for the full model
        const tempItems = []
        const addItems = (items, item, up) => {
          items.push(item)
          if (up) {
            item.parents?.filter((p) => {
              const semanticsConfig = item.metadata?.semantics?.config
              if (!semanticsConfig) return false
              return p.name === semanticsConfig.hasLocation || p.name === semanticsConfig.isPartOf || p.name === semanticsConfig.isPointOf
            }).forEach((p) => addItems(items, p, true))
          } else {
            item.members?.filter((m) => {
              const semanticsConfig = m.metadata?.semantics?.config
              if (!semanticsConfig) return false
              return item.name === semanticsConfig.hasLocation || item.name === semanticsConfig.isPartOf || item.name === semanticsConfig.isPointOf
            }).forEach((m) => addItems(items, m, false))
          }
        }
        addItems(tempItems, relatedToItem, true) // add semantic parent items
        addItems(tempItems, relatedToItem, false) // add semantic member items
        const itemNames = [...new Set(tempItems.map((i) => i.name))] // remove doubles
        items = itemNames.map((n) => tempItems.find((i) => i.name === n))
        links = this.$oh.api.get('/rest/links?itemName=' + relatedToItem.name)
      } else {
        items = this.$oh.api.get('/rest/items?staticDataOnly=true&metadata=.+')
        links = this.$oh.api.get('/rest/links')
      }
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

        // look for checked or selected items and include non semantic checked items in model tree
        const selectedItems = this.value ? (Array.isArray(this.value) ? [...this.value] : [this.value]) : null
        this.includeNonSemantic = this.includeNonSemantic || selectedItems?.some((selected) => {
          const item = this.items.find((i) => selected === i.name)
          const isNonSemantic = !item?.metadata?.semantics
          const hasSemanticGroup = item?.groupNames.some((g) => this.items.some((gi) => g === gi.name && gi.metadata?.semantics))
          const onlyNonSemanticGroup = !hasSemanticGroup && !item?.groupNames.some((g) => !this.items.some((gi) => g === gi.name && gi.metadata?.semantics))
          return isNonSemantic || onlyNonSemanticGroup
        })

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
          .filter((i) => i.type === 'Group' && !(parent.item.metadata && parent.item.metadata.semantics) && i.groupNames.indexOf(parent.item.name) >= 0)
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
      // Don't directly update the item classlist as items are only conditionaly rendered in the DOM to improve performance on large trees
      this.rootElements.forEach((c) => this.applyExpandedOptionChild(c))
    },
    applyExpandedOptionChild (child) {
      child.opened = this.expanded
      Object.values(child.children).flat().forEach((c) => {
        this.applyExpandedOptionChild(c)
      })
    },
    saveExpanded () {
      this.expandedTreeviewItems.splice(0)
      this.rootElements.forEach((c) => this.saveExpandedChild(c))
    },
    saveExpandedChild (child) {
      if (child.opened) {
        this.expandedTreeviewItems.push(child.item.name)
      }
      Object.values(child.children).flat().forEach((c) => {
        this.saveExpandedChild(c)
      })
    },
    restoreExpanded () {
      this.rootElements.forEach((child) => this.restoreExpandedChild(child, false))
    },
    restoreExpandedChild (child, parentClosed) {
      if (parentClosed) {
        child.opened = false
      } else {
        child.opened = this.expandedTreeviewItems.includes(child.item.name)
      }
      Object.values(child.children).flat().forEach((c) => {
        this.restoreExpandedChild(c, !child.opened)
      })
    },
    expandSelected (selection) {
      // expand so all checked items are opened
      this.rootElements.forEach((c) => this.expandSelectedChild(c, selection))
    },
    expandSelectedChild (child, selection) {
      return Object.values(child.children).flat().map((c) => {
        if (this.expandSelectedChild(c, selection) || c.checked || c.item.name === this.selectedItem?.item?.name || (selection && c.item.name === selection.name)) {
          child.opened = true
          return true
        }
        return false
      }).reduce((prev, curr) => prev || curr, false)
    }
  }
}
