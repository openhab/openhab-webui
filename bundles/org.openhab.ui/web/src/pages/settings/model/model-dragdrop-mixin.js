import cloneDeep from 'lodash/cloneDeep'
import * as types from '@/assets/item-types.js'
import ItemMixin from '@/components/item/item-mixin'
import TagMixin from '@/components/tags/tag-mixin'

export default {
  mixins: [ItemMixin, TagMixin],
  data () {
    return {
      localMoveState: this.moveState ? this.moveState : {}
    }
  },
  watch: {
    moveState: {
      handler () {
        if (this.moveFinished) {
          this.saveModelUpdate(this.localMoveState)
          this.$set(this.localMoveState, 'hasMoved', false)
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
    moveFinished () {
      return this.localMoveState.dragFinished && this.localMoveState.addFinished && this.localMoveState.removeFinished && this.localMoveState.hasMoved
    }
  },
  methods: {
    onDragStart (event) {
      console.debug('Drag start - event:', event)
      this.$set(this.localMoveState, 'dragFinished', false)
      this.$set(this.localMoveState, 'node', this.children[event.oldIndex])
      console.debug('Drag start - stored moveState:', cloneDeep(this.localMoveState))
    },
    onDragChange (event) {
      console.debug('Drag change - event:', event)
      console.debug('Drag change - stored moveState:', cloneDeep(this.localMoveState))
      if (event.added) {
        this.$set(this.localMoveState, 'addFinished', false)
        this.validateAdd()
      }
      if (event.removed) {
        this.$set(this.localMoveState, 'removeFinished', false)
        this.validateRemove(event.removed.oldIndex)
      }
    },
    onDragMove (event) {
      if (event.relatedContext.element?.item?.type === 'Group' && !event.relatedContext.element.opened) {
        event.relatedContext.element.opened = true
      }
    },
    onDragEnd (event) {
      this.$set(this.localMoveState, 'dragFinished', true)
      console.debug('Drag end - event:', event)
      console.debug('Drag end - stored moveState:', cloneDeep(this.localMoveState))
    },
    nestedNodes (node, nodes) {
      const children = [...node.children.locations, ...node.children.equipment, ...node.children.points, ...node.children.groups, ...node.children.items]
      nodes.push(...children)
      children.forEach((child) => this.nestedNodes(child, nodes))
      return nodes
    },
    validateAdd () {
      const node = this.localMoveState.node
      const parentNode = this.model
      const semantics = {
        'value': null,
        'config': {
          'hasLocation': null,
          'isPartOf': null,
          'isPointOf': null
        }
      }
      if (node.item.type === 'Group' && node.class === '' && parentNode?.class) {
        const semanticNode = this.nestedNodes(node, []).find((n) => n.class !== '')
        if (semanticNode) {
          this.$f7.dialog.alert(
            'Cannot insert non-semantic group ' + this.itemLabel(node.item) +
            ' with semantic child ' + this.itemLabel(semanticNode.item) +
            ' into semantic group'
          ).open()
          this.$set(this.localMoveState, 'addFinished', true)
          return
        }
      }
      if (!this.isValidGroupType(node, parentNode)) {
        this.$set(this.localMoveState, 'addFinished', true)
        return
      }
      if (parentNode?.class === 'Location') {
        if (node.class === 'Location') {
          this.addLocation(node, parentNode, semantics)
        } else if (node.class === 'Equipment') {
          this.addEquipment(node, parentNode, semantics)
        } else if (node.class?.startsWith('Point')) {
          this.addPoint(node, parentNode, semantics)
        } else if (node.item.type === 'Group') {
          this.$f7.dialog.create({
            text: 'Insert ' + this.itemLabel(node.item) + ' as',
            buttons: [
              { text: 'Location', onClick: () => this.addLocation(node, parentNode, semantics) },
              { text: 'Equipment', onClick: () => this.addEquipment(node, parentNode, semantics) }
            ]
          }).open()
        } else {
          this.$f7.dialog.create({
            text: 'Insert ' + this.itemLabel(node.item) + ' as',
            buttons: [
              { text: 'Equipment', onClick: () => this.addEquipment(node, parentNode, semantics) },
              { text: 'Point', onClick: () => this.addPoint(node, parentNode, semantics) }
            ]
          }).open()
        }
      } else if (parentNode?.class === 'Equipment') {
        if (node.class === 'Location') {
          this.$f7.dialog.alert('Cannot move Location ' + this.itemLabel(node.item) + ' into Equipment ' + this.itemLabel(parentNode.item)).open()
          return false
        } else if (node.class === 'Equipment') {
          this.addEquipment(node, parentNode, semantics)
        } else if (node.class?.startsWith('Point')) {
          this.addPoint(node, parentNode, semantics)
        } else if (node.item.type === 'Group') {
          this.addEquipment(node, parentNode, semantics)
        } else {
          this.$f7.dialog.create({
            text: 'Insert ' + this.itemLabel(node.item) + ' as',
            buttons: [
              { text: 'Equipment', onClick: () => this.addEquipment(node, parentNode, semantics) },
              { text: 'Point', onClick: () => this.addPoint(node, parentNode, semantics) }
            ]
          }).open()
        }
      } else {
        if (parentNode.item) {
          this.addNonSemantic(node, parentNode, semantics)
        } else if (node.class === 'Location') {
          this.addLocation(node, parentNode, semantics)
        } else if (node.class === 'Equipment') {
          this.addEquipment(node, parentNode, semantics)
        } else if (node.class?.startsWith('Point')) {
          this.addPoint(node, parentNode, semantics)
        } else if (node.item.type === 'Group') {
          this.$f7.dialog.create({
            text: 'Insert ' + this.itemLabel(node.item) + ' as',
            buttons: [
              { text: 'Location', onClick: () => this.addLocation(node, parentNode, semantics) },
              { text: 'Equipment', onClick: () => this.addEquipment(node, parentNode, semantics) },
              { text: 'Non Semantic', onClick: () => this.addNonSemantic(node, parentNode, semantics) }
            ]
          }).open()
        } else {
          this.$f7.dialog.create({
            text: 'Insert ' + this.itemLabel(node.item) + ' as',
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
            'Group dimension ' + baseDimension +
             ' of group ' + this.itemLabel(parentNode.item) +
             ' not compatible with ' + (node.item.type === 'Group' ? 'group ' : '') + 'item dimension ' + dimension +
             ' of ' + (node.item.type === 'Group' ? 'group ' : '') + 'item ' + this.itemLabel(node.item)
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
              'Group ' + this.itemLabel(parentNode.item) +
              ' already contains item ' + this.itemLabel(childWithDifferentDimension.item) +
              ' with dimension ' + childWithDifferentDimension.dimension +
              ' different from group dimension ' + dimension
            ).open()
            return false
          }
        }
      }
      const aggregationFunction = parentNode.item?.function?.name
      if (aggregationFunction && !this.aggregationFunctions(type).contains(aggregationFunction)) {
        this.$f7.dialog.alert(
          'Group aggreggation function ' + aggregationFunction +
          ' for group ' + this.itemLabel(parentNode.item) +
          ' not compatible with type ' + type +
          ' of item ' + this.itemLabel(node.item)
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
      if (parentNode.class === 'Location') {
        semantics.config.isPartOf = parentNode.item.name
      }
      if (!this.localMoveState.node.item.tags.includes(semantics.value)) this.localMoveState.node.item.tags.push(semantics.value)
      this.$set(this.localMoveState.node, 'class', 'Location')
      this.updateAfterAdd(node, parentNode, semantics)
    },
    addEquipment (node, parentNode, semantics) {
      semantics.value = node.item?.metadata?.semantics?.value || 'Equipment'
      if (parentNode.class === 'Location') {
        semantics.config.hasLocation = parentNode.item.name
      } else if (parentNode.class === 'Equipment') {
        semantics.config.isPartOf = parentNode.item.name
      }
      if (!this.localMoveState.node.item.tags.includes(semantics.value)) this.localMoveState.node.item.tags.push(semantics.value)
      this.$set(this.localMoveState.node, 'class', 'Equipment')
      this.updateAfterAdd(node, parentNode, semantics)
    },
    addPoint (node, parentNode, semantics) {
      semantics.value = node.item?.metadata?.semantics?.value || 'Point'
      if (parentNode.class === 'Location') {
        semantics.config.hasLocation = parentNode.item.name
      } else if (parentNode.class === 'Equipment') {
        semantics.config.isPointOf = parentNode.item.name
      }
      if (!this.localMoveState.node.item.tags.includes(semantics.value)) this.localMoveState.node.item.tags.push(semantics.value)
      this.$set(this.localMoveState.node, 'class', 'Point')
      this.updateAfterAdd(node, parentNode, semantics)
    },
    addNonSemantic (node, parentNode, semantics) {
      this.$set(this.localMoveState.node, 'class', '')
      if (node.item.metadata?.semantics) {
        this.$set(this.localMoveState.node.item.metadata, 'semantics', null)
      }
      this.updateAfterAdd(node, parentNode, semantics)
    },
    updateAfterAdd (node, parentNode, semantics) {
      this.$set(this.localMoveState, 'hasMoved', true)
      if (node.item.metadata) {
        this.$set(this.localMoveState.node.item.metadata, 'semantics', semantics)
      } else {
        this.$set(this.localMoveState.node.item, 'metadata', { semantics })
      }
      if (parentNode?.item?.type === 'Group' && !node.item.groupNames.includes(parentNode.item.name)) {
        node.item.groupNames.push(parentNode.item.name)
      }
      console.debug('Add - new moveState:', cloneDeep(this.localMoveState))
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
      this.$set(this.localMoveState, 'addFinished', true)
      console.debug('Add - finished, new moveState:', cloneDeep(this.localMoveState))
    },
    validateRemove (oldIndex) {
      const node = this.localMoveState.node
      const parentNode = this.model
      console.debug('Remove - new moveState:', cloneDeep(this.localMoveState))
      console.debug('Remove - parentNode:', cloneDeep(parentNode))
      console.debug('Remove - children:', cloneDeep(this.children))
      if (parentNode.class !== '') {
        // always remove from semantic model groups
        this.remove(node, parentNode, oldIndex)
      } else if (!parentNode.item && node.class !== '') {
        // always remove semantic item from root level when moving into another group
        this.remove(node, parentNode, oldIndex)
      } else if (parentNode.item?.type === 'Group') {
        this.$f7.dialog.create({
          text: 'Item ' + this.itemLabel(node.item) + ' dragged from group ' + this.itemLabel(parentNode.item) + ': Remove original ?',
          buttons: [
            { text: 'Remove', onClick: () => this.remove(node, parentNode, oldIndex) },
            { text: 'Keep', onClick: () => this.$set(this.moveState, 'removeFinished', true) }
          ]
        }).open()
      } else {
        this.$set(this.localMoveState, 'removeFinished', true)
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
      this.$set(this.localMoveState, 'removeFinished', true)
      console.debug('Remove - finished, new moveState:', cloneDeep(this.localMoveState))
    },
    saveModelUpdate (moveState) {
      const updatedItem = moveState.node.item
      console.debug('Save - updatedItem: ', cloneDeep(updatedItem))
      this.saveItem(updatedItem)
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
