import cloneDeep from 'lodash/cloneDeep'
import * as types from '@/assets/item-types.js'
import ItemMixin from '@/components/item/item-mixin'
import TagMixin from '@/components/tags/tag-mixin'

export default {
  mixins: [ItemMixin, TagMixin],
  watch: {
    moveState: {
      handler: function () {
        // console.debug('Watch - moveState:', cloneDeep(this.moveState))
        if (this.canSave) {
          this.saveModelUpdate()
        } else if (this.canRemove) {
          this.validateRemove()
        } else if (this.canAdd) {
          this.validateAdd()
        }
      },
      deep: true
    }
  },
  computed: {
    children: {
      get: function () {
        return this.nodeChildren()
      },
      set: function (nodeList) {
        this.$set(this.model.children, 'locations', nodeList.filter(n => n.item.metadata?.semantics?.value?.startsWith('Location')))
        this.$set(this.model.children, 'equipment', nodeList.filter(n => n.item.metadata?.semantics?.value?.startsWith('Equipment')))
        this.$set(this.model.children, 'points', nodeList.filter(n => n.item.metadata?.semantics?.value?.startsWith('Point')))
        this.$set(this.model.children, 'groups', nodeList.filter(n => !n.item.metadata?.semantics && n.item.type === 'Group'))
        this.$set(this.model.children, 'items', nodeList.filter(n => !n.item.metadata?.semantics && n.item.type !== 'Group'))
      }
    },
    iconColor () {
      return (this.model.item.metadata && this.model.item.metadata.semantics) ? '' : 'gray'
    },
    canAdd () {
      return this.moveState.dragEnd && !this.moveState.dragFinished && this.moveState.canAdd && !this.moveState.adding
    },
    canRemove () {
      return this.moveState.dragEnd && !this.moveState.dragFinished && !this.moveState.canAdd && this.moveState.canRemove && !this.moveState.removing
    },
    canSave () {
      return this.moveState.dragEnd && this.moveState.dragFinished && !this.moveState.canAdd && !this.moveState.canRemove && !this.moveState.saving
    }
  },
  methods: {
    onDragStart (event) {
      console.debug('Drag start - event:', event)
      this.$set(this.moveState, 'canAdd', false)
      this.$set(this.moveState, 'canRemove', false)
      this.$set(this.moveState, 'dragEnd', false)
      this.$set(this.moveState, 'dragFinished', false)
      this.$set(this.moveState, 'node', this.children[event.oldIndex])
      console.debug('Drag start - moveState:', cloneDeep(this.moveState))
    },
    onDragChange (event) {
      console.debug('Drag change - event:', event)
      if (event.added) {
        this.$set(this.moveState, 'newParent', this.model)
        this.$set(this.moveState, 'canAdd', true)
      }
      if (event.removed) {
        this.$set(this.moveState, 'oldParent', this.model)
        this.$set(this.moveState, 'oldIndex', event.removed.oldIndex)
        this.$set(this.moveState, 'canRemove', true)
      }
      console.debug('Drag change - moveState:', cloneDeep(this.moveState))
    },
    onDragMove (event) {
      if (event.relatedContext.element?.item?.type === 'Group' && !event.relatedContext.element.opened) {
        event.relatedContext.element.opened = true
      }
    },
    onDragEnd (event) {
      this.$set(this.moveState, 'dragEnd', true)
      console.debug('Drag end - event:', event)
      console.debug('Drag end - moveState:', cloneDeep(this.moveState))
    },
    nestedNodes (node, nodes) {
      const children = [...node.children.locations, ...node.children.equipment, ...node.children.points, ...node.children.groups, ...node.children.items]
      nodes.push(...children)
      children.forEach((child) => this.nestedNodes(child, nodes))
      return nodes
    },
    validateAdd () {
      this.$set(this.moveState, 'adding', true)
      const node = this.moveState.node
      const parentNode = this.moveState.newParent
      const oldParentNode = this.moveState.oldParent
      const semantics = {
        'value': null,
        'config': {
          'hasLocation': null,
          'isPartOf': null,
          'isPointOf': null
        }
      }
      if (node.item.type === 'Group' && node.class === '') {
        const semanticNode = this.nestedNodes(node, []).find((n) => n.class !== '')
        if (semanticNode) {
          this.$f7.dialog.alert(
            'Cannot insert non-semantic group "' + this.itemLabel(node.item) +
            '" with semantic child "' + this.itemLabel(semanticNode.item) +
            '" into semantic group'
          ).open()
          this.restoreModelUpdate()
          return
        }
      }
      if (node.class !== '' && parentNode.class !== '' && oldParentNode?.class === '') {
        this.$f7.dialog.alert(
          'Cannot move semantic item "' + this.itemLabel(node.item) +
          '" from non-semantic group "' + this.itemLabel(oldParentNode.item) +
          '" into semantic group'
        ).open()
        this.restoreModelUpdate()
        return
      }
      if (!this.isValidGroupType(node, parentNode)) {
        this.restoreModelUpdate()
        return
      }
      if (parentNode.class.startsWith('Location')) {
        if (node.class.startsWith('Location')) {
          this.addLocation(node, parentNode, semantics)
        } else if (node.class.startsWith('Equipment')) {
          this.addEquipment(node, parentNode, semantics)
        } else if (node.class.startsWith('Point')) {
          this.addPoint(node, parentNode, semantics)
        } else if (node.item.type === 'Group') {
          this.$f7.dialog.create({
            text: 'Insert "' + this.itemLabel(node.item) + '" as',
            buttons: [
              { text: 'Location', onClick: () => this.addLocation(node, parentNode, semantics) },
              { text: 'Equipment', onClick: () => this.addEquipment(node, parentNode, semantics) }
            ]
          }).open()
        } else {
          this.$f7.dialog.create({
            text: 'Insert "' + this.itemLabel(node.item) + '" as',
            buttons: [
              { text: 'Equipment', onClick: () => this.addEquipment(node, parentNode, semantics) },
              { text: 'Point', onClick: () => this.addPoint(node, parentNode, semantics) }
            ]
          }).open()
        }
      } else if (parentNode.class.startsWith('Equipment')) {
        if (node.class.startsWith('Location')) {
          this.$f7.dialog.alert('Cannot move Location "' + this.itemLabel(node.item) + '" into Equipment "' + this.itemLabel(parentNode.item) + '"').open()
          this.restoreModelUpdate()
          return
        } else if (node.class.startsWith('Equipment')) {
          this.addEquipment(node, parentNode, semantics)
        } else if (node.class.startsWith('Point')) {
          this.addPoint(node, parentNode, semantics)
        } else if (node.item.type === 'Group') {
          this.addEquipment(node, parentNode, semantics)
        } else {
          this.$f7.dialog.create({
            text: 'Insert "' + this.itemLabel(node.item) + '" as',
            buttons: [
              { text: 'Equipment', onClick: () => this.addEquipment(node, parentNode, semantics) },
              { text: 'Point', onClick: () => this.addPoint(node, parentNode, semantics) }
            ]
          }).open()
        }
      } else {
        if (parentNode.item) {
          this.addNonSemantic(node, parentNode, semantics)
        } else if (node.class.startsWith('Location')) {
          this.addLocation(node, parentNode, semantics)
        } else if (node.class.startsWith('Equipment')) {
          this.addEquipment(node, parentNode, semantics)
        } else if (node.class.startsWith('Point')) {
          this.addPoint(node, parentNode, semantics)
        } else if (node.item.type === 'Group') {
          this.$f7.dialog.create({
            text: 'Insert "' + this.itemLabel(node.item) + '" as',
            buttons: [
              { text: 'Location', onClick: () => this.addLocation(node, parentNode, semantics) },
              { text: 'Equipment', onClick: () => this.addEquipment(node, parentNode, semantics) },
              { text: 'Non Semantic', onClick: () => this.addNonSemantic(node, parentNode, semantics) }
            ]
          }).open()
        } else {
          this.$f7.dialog.create({
            text: 'Insert "' + this.itemLabel(node.item) + '" as',
            buttons: [
              { text: 'Equipment', onClick: () => this.addEquipment(node, parentNode, semantics) },
              { text: 'Point', onClick: () => this.addPoint(node, parentNode, semantics) },
              { text: 'Non Semantic', onClick: () => this.addNonSemantic(node, parentNode, semantics) }
            ]
          }).open()
        }
      }
    },
    isValidGroupType (node, parentNode) {
      const groupTypeDef = parentNode.item?.groupType?.split(':')
      const baseType = groupTypeDef ? groupTypeDef[0] : 'None'
      if (baseType === 'None') return true
      const baseDimension = groupTypeDef && groupTypeDef.length > 1 ? groupTypeDef[1] : null

      const typeDef = node.item.type !== 'Group' ? node.item.type?.split(':') : node.item.groupType?.split(':')
      const type = typeDef ? typeDef[0] : 'None'
      const dimension = typeDef.length > 1 ? typeDef[1] : null
      if ((type === 'Number' || type === 'None') && baseType === 'Number') {
        if (baseDimension && dimension && baseDimension !== dimension) {
          this.$f7.dialog.alert(
            'Group dimension "' + baseDimension +
             '" of group "' + this.itemLabel(parentNode.item) +
             '" not compatible with "' + (node.item.type === 'Group' ? 'group ' : '') + 'item dimension "' + dimension +
             '" of "' + (node.item.type === 'Group' ? 'group ' : '') + '" item "' + this.itemLabel(node.item) +'"'
          ).open()
          return false
        }
        if (dimension) {
          const childWithDifferentDimension = parentNode.children.map((child) => {
            const childTypeDef = child.item.type !== 'Group' ? child.item.type.split(':') : child.item.groupType?.split(':')
            return childTypeDef.length > 1 ? { item: child.item, dimension: childTypeDef[1] } : null
          }).find((child) => { return dimension !== child?.dimension })
          if (childWithDifferentDimension) {
            this.$f7.dialog.alert(
              'Group "' + this.itemLabel(parentNode.item) +
              '" already contains item "' + this.itemLabel(childWithDifferentDimension.item) +
              '" with dimension "' + childWithDifferentDimension.dimension +
              '" different from group dimension "' + dimension + '"'
            ).open()
            return false
          }
        }
      }
      const aggregationFunction = parentNode.item?.function?.name
      if (aggregationFunction && !this.aggregationFunctions(type).includes(aggregationFunction)) {
        this.$f7.dialog.alert(
          'Group aggreggation function "' + aggregationFunction +
          '" for group "' + this.itemLabel(parentNode.item) +
          '" not compatible with type "' + type +
          '" of item "' + this.itemLabel(node.item) + '"'
        ).open()
        return false
      }
      return true
    },
    aggregationFunctions (type) {
      const specificAggregationFunctions = (type) => {
        switch (type) {
          case 'Dimmer':
          case 'Rollershutter':
          case 'Number':
            return types.ArithmeticFunctions
          case 'Contact':
            return types.LogicalOpenClosedFunctions
          case 'Player':
            return types.LogicalPlayPauseFunctions
          case 'DateTime':
            return types.DateTimeFunctions
          case 'Switch':
            return types.LogicalOnOffFunctions
        }
        return []
      }
      return [...types.CommonFunctions, ...specificAggregationFunctions(type)]
    },
    addLocation (node, parentNode, semantics) {
      semantics.value = node.item?.metadata?.semantics?.value || 'Location'
      if (parentNode.class.startsWith('Location')) {
        semantics.config.isPartOf = parentNode.item.name
      }
      if (!this.moveState.node.item.tags.includes(semantics.value)) this.moveState.node.item.tags.push(semantics.value)
      this.$set(this.moveState.node, 'class', semantics.value)
      this.updateAfterAdd(node, parentNode, semantics)
    },
    addEquipment (node, parentNode, semantics) {
      semantics.value = node.item?.metadata?.semantics?.value || 'Equipment'
      if (parentNode.class.startsWith('Location')) {
        semantics.config.hasLocation = parentNode.item.name
      } else if (parentNode.class.startsWith('Equipment')) {
        semantics.config.isPartOf = parentNode.item.name
      }
      if (!this.moveState.node.item.tags.includes(semantics.value)) this.moveState.node.item.tags.push(semantics.value)
      this.$set(this.moveState.node, 'class', semantics.value)
      this.updateAfterAdd(node, parentNode, semantics)
    },
    addPoint (node, parentNode, semantics) {
      semantics.value = node.item?.metadata?.semantics?.value || 'Point'
      if (parentNode.class.startsWith('Location')) {
        semantics.config.hasLocation = parentNode.item.name
      } else if (parentNode.class.startsWith('Equipment')) {
        semantics.config.isPointOf = parentNode.item.name
      }
      if (!this.moveState.node.item.tags.includes(semantics.value)) this.moveState.node.item.tags.push(semantics.value)
      this.$set(this.moveState.node, 'class', semantics.value)
      this.updateAfterAdd(node, parentNode, semantics)
    },
    addNonSemantic (node, parentNode, semantics) {
      this.$set(this.moveState.node, 'class', '')
      this.updateAfterAdd(node, parentNode, null)
    },
    updateAfterAdd (node, parentNode, semantics) {
      if (semantics === null) {
        if (node.item.metadata?.semantics) {
          this.$set(this.moveState.node.item.metadata, 'semantics', null)
        }
      } else if (node.item.metadata) {
        this.$set(this.moveState.node.item.metadata, 'semantics', semantics)
      } else {
        this.$set(this.moveState.node.item, 'metadata', { semantics })
      }
      if (parentNode.item?.type === 'Group' && !node.item.groupNames.includes(parentNode.item.name)) {
        node.item.groupNames.push(parentNode.item.name)
      }
      console.debug('Add - new moveState:', cloneDeep(this.moveState))
      console.debug('Add - parentNode:', cloneDeep(parentNode))
      console.debug('Add - children:', cloneDeep(this.children))
      if (!this.children.find(n => n.item.name === node.item.name)) {
        // sometimes the list gets updates when dragging, sometimes it is missed so we have to add here
        this.children.push(node)
      }
      const newChildren = this.children
      this.children = newChildren // force setters to update model
      console.debug('Add - new children:', cloneDeep(this.children))
      console.debug('Add - added to parent:', cloneDeep(parentNode))
      this.$set(this.moveState, 'canAdd', false)
      this.$set(this.moveState, 'adding', false)
      console.debug('Add - finished, new moveState:', cloneDeep(this.moveState))
    },
    validateRemove () {
      this.$set(this.moveState, 'removing', true)
      const node = this.moveState.node
      const parentNode = this.moveState.oldParent
      const oldIndex = this.moveState.oldIndex
      console.debug('Remove - new moveState:', cloneDeep(this.moveState))
      console.debug('Remove - parentNode:', cloneDeep(parentNode))
      console.debug('Remove - children:', cloneDeep(this.children))
      if (parentNode.class !== '' && this.moveState.newParent.class !== '') {
        // always remove from semantic model groups, unless moving into non-semantic group
        this.remove(node, parentNode, oldIndex)
      } else if (!parentNode.item && node.class !== '') {
        // always remove semantic item from root level when moving into another group
        this.remove(node, parentNode, oldIndex)
      } else if (parentNode.item?.type === 'Group') {
        this.$f7.dialog.create({
          text: 'Item "' + this.itemLabel(node.item) + '" dragged from group "' + this.itemLabel(parentNode.item) + '", remove original?',
          buttons: [
            { text: 'Remove', onClick: () => this.remove(node, parentNode, oldIndex) },
            { text: 'Keep', onClick: () => {
                this.updateAfterRemove()
              }
          }
          ]
        }).open()
      } else {
        this.updateAfterRemove()
      }
    },
    remove (node, parentNode, oldIndex) {
      const groupNameIndex = node.item.groupNames.findIndex(g => g === parentNode.item?.name)
      if (groupNameIndex >= 0) {
        node.item.groupNames.splice(groupNameIndex, 1)
      }
      const newChildren = this.nodeChildren(parentNode)
      newChildren.splice(oldIndex, 1)
      this.children = newChildren
      console.debug('Remove - new children:', cloneDeep(this.children))
      console.debug('Remove - removed from parent:', parentNode)
      this.updateAfterRemove()
      console.debug('Remove - finished, new moveState:', cloneDeep(this.moveState))
    },
    updateAfterRemove () {
      this.$set(this.moveState, 'canRemove', false)
      this.$set(this.moveState, 'removing', false)
      this.$set(this.moveState, 'dragFinished', true)
    },
    saveModelUpdate () {
      this.$set(this.moveState, 'saving', true)
      this.$set(this.moveState, 'dragFinished', false)
      const updatedItem = this.moveState.node.item
      console.debug('Save - updatedItem: ', cloneDeep(updatedItem))
      this.saveItem(updatedItem)
      this.$set(this.moveState, 'saving', false)
    },
    restoreModelUpdate() {
      this.$set(this.moveState, 'canRemove', false)
      this.$set(this.moveState, 'canAdd', false)
      this.$emit('reload')
    },
    itemLabel (item) {
      return (item.label ? (this.includeItemName ? item.label + ' (' + item.name + ')' : item.label) : item.name)
    },
    nodeChildren (node) {
      const parentNode = node || this.model
      if (!parentNode.children) return []
      return [parentNode.children.locations,
        parentNode.children.equipment, parentNode.children.points,
        parentNode.children.groups, parentNode.children.items].flat()
    }
  }
}
