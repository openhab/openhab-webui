import cloneDeep from 'lodash/cloneDeep'
import * as types from '@/assets/item-types.js'
import ItemMixin from '@/components/item/item-mixin'
import TagMixin from '@/components/tags/tag-mixin'
import fastDeepEqual from 'fast-deep-equal/es6'

export default {
  mixins: [ItemMixin, TagMixin],
  props: {
    moveState: {
      type: Object,
      default: () => ({
        moving: false,
        canAdd: false,
        canRemove: false,
        dragEnd: true,
        dragFinished: false,
        saving: false,
        cancelled: false,
        moveConfirmed: false,
        node: null,
        newParent: null,
        oldParent: null,
        oldIndex: null,
        dragStartTimestamp: null,
        nodesToUpdate: [],
        moveDelayedOpen: null,
        moveTarget: null
      })
    }
  },
  watch: {
    canSave (val) {
      if (val) this.saveUpdate()
    },
    canRemove (val) {
      if (val) this.validateRemove()
    },
    canAdd (val) {
      if (val) this.validateAdd()
    }
  },
  computed: {
    children: {
      get: function () {
        if (!this.model.children) return []
        return [this.model.children.locations, this.model.children.equipment, this.model.children.points, this.model.children.groups, this.model.children.items].flat()
      },
      set: function (nodeList) {
        console.debug('Updating children', cloneDeep(nodeList))
        const newChildren = {}
        newChildren.locations = nodeList.filter(n => n.item.metadata?.semantics?.value?.startsWith('Location'))
        newChildren.equipment = nodeList.filter(n => n.item.metadata?.semantics?.value?.startsWith('Equipment'))
        newChildren.points = nodeList.filter(n => n.item.metadata?.semantics?.value?.startsWith('Point'))
        newChildren.groups = nodeList.filter(n => !n.item.metadata?.semantics && n.item.type === 'Group')
        newChildren.items = nodeList.filter(n => !n.item.metadata?.semantics && n.item.type !== 'Group')
        this.$set(this.model, 'children', newChildren)
      }
    },
    iconColor () {
      return (this.model.item.metadata && this.model.item.metadata.semantics) ? '' : 'gray'
    },
    dragDropActive () {
      return !this.moveState.dragEnd
    },
    canAdd () {
      return !this.moveState.cancelled && this.moveState.newParent && this.moveState.dragEnd &&
             !this.moveState.dragFinished && this.moveState.canAdd && !this.moveState.adding
    },
    canRemove () {
      return !this.moveState.cancelled && this.moveState.newParent && this.moveState.oldParent &&
             this.moveState.dragEnd && !this.moveState.dragFinished && !this.moveState.canAdd && this.moveState.canRemove && !this.moveState.removing
    },
    canSave () {
      return !this.moveState.cancelled && this.moveState.dragEnd && this.moveState.dragFinished && !this.moveState.canAdd && !this.moveState.canRemove && !this.moveState.saving
    },
    canHaveChildren () {
      return ((this.model.item.type === 'Group') && (this.children.length > 0 || this.moveState.moving)) === true
    },
    allowDrop () {
      return this.dropAllowed(this.model)
    }
  },
  methods: {
    onDragStart (event) {
      this.moveState.node = this.children[event.oldIndex]
      if (!this.moveState.node.item.editable) return
      console.time('Timer: Drag')
      console.debug('Drag start - event:', event)
      window.addEventListener('keydown', this.keyDownHandler)
      this.moveState.moving = true
      this.moveState.canAdd = false
      this.moveState.canRemove = false
      this.moveState.dragEnd = false
      this.moveState.dragFinished = false
      this.moveState.saving = false
      this.moveState.cancelled = false
      this.moveState.moveConfirmed = false
      this.moveState.nodesToUpdate.splice(0)
      this.moveState.moveDelayedOpen = null
      this.moveState.moveTarget = this.rootNode
      console.debug('Drag start - moveState:', cloneDeep(this.moveState))
    },
    onDragChange (event) {
      console.timeLog('Timer: Drag')
      console.debug('Drag change - event:', event)
      if (this.moveState.cancelled) {
        console.debug('Drag change - cancelled')
        return
      }
      if (event.added) {
        this.moveState.newParent = this.moveState.moveTarget
        this.moveState.canAdd = true
      } else if (event.removed) {
        this.moveState.oldParent = this.model
        this.moveState.oldIndex = event.removed.oldIndex
        this.moveState.canRemove = true
      } else if (event.moved) {
        this.moveState.newParent = this.moveState.moveTarget
        this.moveState.canAdd = true
        this.moveState.oldParent = this.model
        this.moveState.canRemove = true
        return
      }
      console.debug('Drag change - moveState:', cloneDeep(this.moveState))
    },
    onDragMove (event) {
      console.timeLog('Timer: Drag')
      console.debug('Drag move - event:', event)
      const target = event.relatedContext?.element || this.rootNode
      // cancel opening previous group we moved over as we moved away from it
      const movedToSamePlace = target?.item?.name === this.moveState.moveTarget?.item?.name
      if (!movedToSamePlace && this.moveState.moveDelayedOpen) {
        clearTimeout(this.moveState.moveDelayedOpen)
        this.moveState.moveDelayedOpen = null
      }
      // return if we cannot drop here
      if (this.moveState.cancelled || !this.moveState.node.item.editable || !this.dropAllowed(target)) {
        return false
      }
      if (!target.item || target.item.type === 'Group') {
        this.moveState.moveTarget = target
      }
      // Open group if not open yet, with a delay so you don't open it if you just drag over it
      if (!movedToSamePlace && target?.item?.type === 'Group' && !target.opened) {
        this.moveState.moveDelayedOpen = setTimeout((node) => {
          node.opened = true
        }, 1000, target)
      }
      console.debug('Drag move - moveState:', cloneDeep(this.moveState))
      return true
    },
    onDragEnd (event) {
      console.timeLog('Timer: Drag')
      if (!this.moveState.node.item.editable) {
        return
      }
      console.debug('Drag end - event:', event)
      window.removeEventListener('keydown', this.keyDownHandler)
      if (this.moveState.cancelled) {
        console.debug('Drag end - cancelled')
        this.restoreModelUpdate()
        return
      }
      this.moveState.moving = false
      this.moveState.dragEnd = true
      console.debug('Drag end - moveState:', cloneDeep(this.moveState))
    },
    dropAllowed (node) {
      if (!this.moveState.moving || this.moveState.node.item?.name === node.item?.name) return true
      if (node.item?.type && node.item.type !== 'Group') return false
      if (node?.class?.startsWith('Point')) {
        return false
      }
      if (this.moveState.node?.class?.startsWith('Location') && node?.class?.startsWith('Equipment')) {
        return false
      }
      return true
    },
    nestedSemanticNode (node) {
      const children = [...node.children.locations, ...node.children.equipment, ...node.children.points, ...node.children.groups, ...node.children.items]
      const semanticNode = children.find((c) => c.class !== '')
      if (semanticNode) return semanticNode
      return children.find((c) => {
        return this.nestedSemanticNode(c)
      })
    },
    validateAdd () {
      console.timeLog('Timer: Drag')
      console.time('Timer: validateAdd')
      this.moveState.adding = true
      const node = this.moveState.node
      const parentNode = this.moveState.newParent
      const oldParentNode = this.moveState.oldParent
      if (node.item.name === parentNode?.item?.name) {
        // This should not be possible, but just to make sure to avoid infinite loop
        this.restoreModelUpdate()
        console.timeEnd('Timer: validateAdd')
        return
      }
      if (parentNode.item && node.item.groupNames?.includes(parentNode.item.name)) {
        const message = 'Group "' + this.itemLabel(parentNode.item) +
          '" already contains item "' + this.itemLabel(node.item) + '"'
        console.debug('Add rejected: ' + message)
        this.$f7.dialog.alert(message).open()
        this.restoreModelUpdate()
        console.timeEnd('Timer: validateAdd')
        return
      }
      if (node.item.type === 'Group' && node.class === '') {
        const semanticNode = this.nestedSemanticNode(node)
        if (semanticNode) {
          const message = 'Cannot insert non-semantic group "' + this.itemLabel(node.item) +
            '" with semantic child "' + this.itemLabel(semanticNode.item) +
            '" into semantic group "' + this.itemLabel(parentNode.item) + '"'
          console.debug('Add rejected: ' + message)
          this.$f7.dialog.alert(message).open()
          this.restoreModelUpdate()
          console.timeEnd('Timer: validateAdd')
          return
        }
      }
      if (node.class !== '' && parentNode.class !== '' && (oldParentNode.item && oldParentNode?.class === '')) {
        const message = 'Cannot move semantic item "' + this.itemLabel(node.item) +
          '" from non-semantic group "' + this.itemLabel(oldParentNode.item) +
          '" into semantic group "' + this.itemLabel(parentNode.item) + '"'
        console.debug('Add rejected:' + message)
        this.$f7.dialog.alert(message).open()
        this.restoreModelUpdate()
        console.timeEnd('Timer: validateAdd')
        return
      }
      if (node.class.startsWith('Point') && parentNode.class !== '') {
        if (oldParentNode.class.startsWith('Equipment') && parentNode.class.startsWith('Location')) {
          const oldLocation = node.item.metadata.semantics.config.hasLocation
          if (oldLocation) {
            const message = 'Cannot move Point "' + this.itemLabel(node.item) +
              '" from Equipment "' + this.itemLabel(oldParentNode.item) +
              '" to Location "' + this.itemLabel(parentNode.item) +
              '" as it is already in Location "' + oldLocation + '"'
            console.debug('Add rejected:' + message)
            this.$f7.dialog.alert(message).open()
            this.restoreModelUpdate()
            console.timeEnd('Timer: validateAdd')
            return
          }
        } else if (oldParentNode.class.startsWith('Location') && parentNode.class.startsWith('Equipment')) {
          const oldEquipment = node.item.metadata.semantics.config.isPointOf
          if (oldEquipment) {
            const message = 'Cannot move Point "' + this.itemLabel(node.item) +
              '" from Location "' + this.itemLabel(oldParentNode.item) +
              '" to Equipment "' + this.itemLabel(parentNode.item) +
              '" as it is already part of Equipment "' + oldEquipment + '"'
            console.debug('Add rejected:' + message)
            this.$f7.dialog.alert(message).open()
            this.restoreModelUpdate()
            console.timeEnd('Timer: validateAdd')
            return
          }
        }
      }
      if (!this.isValidGroupType(node, parentNode)) {
        this.restoreModelUpdate()
        console.timeEnd('Timer: validateAdd')
        return
      }
      if (parentNode.class.startsWith('Location')) {
        this.addIntoLocation(node, parentNode)
      } else if (parentNode.class.startsWith('Equipment')) {
        this.addIntoEquipment(node, parentNode)
      } else if (parentNode.item) {
        this.addIntoGroup(node, parentNode)
      } else {
        this.addIntoRoot(node, parentNode)
      }
      this.moveState.canAdd = false
      this.moveState.adding = false
      console.timeEnd('Timer: validateAdd')
    },
    isValidGroupType (node, parentNode) {
      console.time('Timer: isValidGroupType')
      const groupTypeDef = parentNode.item?.groupType?.split(':')
      const baseType = groupTypeDef ? groupTypeDef[0] : 'None'
      if (baseType === 'None') {
        console.timeEnd('Timer: isValidGroupType')
        return true
      }
      const baseDimension = groupTypeDef && groupTypeDef.length > 1 ? groupTypeDef[1] : null

      const typeDef = node.item.type !== 'Group' ? node.item.type?.split(':') : node.item.groupType?.split(':')
      const type = typeDef ? typeDef[0] : 'None'
      const dimension = typeDef.length > 1 ? typeDef[1] : null
      if ((type === 'Number' || type === 'None') && baseType === 'Number') {
        if (baseDimension && dimension && baseDimension !== dimension) {
          const message = 'Group dimension "' + baseDimension +
             '" of group "' + this.itemLabel(parentNode.item) +
             '" not compatible with "' + (node.item.type === 'Group' ? 'group ' : '') + 'item dimension "' + dimension +
             '" of "' + (node.item.type === 'Group' ? 'group ' : '') + '" item "' + this.itemLabel(node.item) + '"'
          console.debug('Add rejected: ' + message)
          this.$f7.dialog.alert(message).open()
          console.timeEnd('Timer: isValidGroupType')
          return false
        }
        if (dimension) {
          const childWithDifferentDimension = parentNode.children.map((child) => {
            const childTypeDef = child.item.type !== 'Group' ? child.item.type.split(':') : child.item.groupType?.split(':')
            return childTypeDef.length > 1 ? { item: child.item, dimension: childTypeDef[1] } : null
          }).find((child) => { return dimension !== child?.dimension })
          if (childWithDifferentDimension) {
            const message = 'Group "' + this.itemLabel(parentNode.item) +
              '" already contains item "' + this.itemLabel(childWithDifferentDimension.item) +
              '" with dimension "' + childWithDifferentDimension.dimension +
              '" different from group dimension "' + dimension + '"'
            console.debug('Add rejected: ' + message)
            this.$f7.dialog.alert(message).open()
            console.timeEnd('Timer: isValidGroupType')
            return false
          }
        }
      }
      const aggregationFunction = parentNode.item?.function?.name
      if (aggregationFunction && !this.aggregationFunctions(type).includes(aggregationFunction)) {
        const message = 'Group aggreggation function "' + aggregationFunction +
          '" for group "' + this.itemLabel(parentNode.item) +
          '" not compatible with type "' + type +
          '" of item "' + this.itemLabel(node.item) + '"'
        console.debug('Add rejected: ' + message)
        this.$f7.dialog.alert(message).open()
        console.timeEnd('Timer: isValidGroupType')
        return false
      }
      console.timeEnd('Timer: isValidGroupType')
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
    addIntoLocation (node, parentNode) {
      console.time('Timer: addIntoLocation')
      if (node.class.startsWith('Location')) {
        this.addLocation(node, parentNode)
      } else if (node.class.startsWith('Equipment')) {
        this.addEquipment(node, parentNode)
      } else if (node.class.startsWith('Point')) {
        this.addPoint(node, parentNode)
      } else if (node.item.type === 'Group') {
        this.moveState.moveConfirmed = true
        this.$f7.dialog.create({
          text: 'Insert "' + this.itemLabel(node.item) +
            '" into "' + this.itemLabel(parentNode.item) +
            '" as',
          verticalButtons: true,
          buttons: [
            { text: 'Cancel', color: 'gray', keycodes: [27], onClick: () => this.restoreModelUpdate() },
            { text: 'Location', strong: true, keycodes: [13], onClick: () => this.addLocation(node, parentNode) },
            { text: 'Equipment', onClick: () => this.addEquipment(node, parentNode) }
          ]
        }).open()
      } else {
        this.moveState.moveConfirmed = true
        this.$f7.dialog.create({
          text: 'Insert "' + this.itemLabel(node.item) +
            '" into "' + this.itemLabel(parentNode.item) +
            '" as',
          verticalButtons: true,
          buttons: [
            { text: 'Cancel', color: 'gray', keycodes: [27], onClick: () => this.restoreModelUpdate() },
            { text: 'Equipment', onClick: () => this.addEquipment(node, parentNode) },
            { text: 'Point', strong: true, keycodes: [13], onClick: () => this.addPoint(node, parentNode) }
          ]
        }).open()
      }
      console.timeEnd('Timer: addIntoLocation')
    },
    addIntoEquipment (node, parentNode) {
      console.time('Timer: addIntoEquipment')
      if (node.class.startsWith('Location')) {
        this.$f7.dialog.alert(
          'Cannot move Location "' + this.itemLabel(node.item) +
          '" into Equipment "' + this.itemLabel(parentNode.item) + '"'
        ).open()
        this.restoreModelUpdate()
      } else if (node.class.startsWith('Equipment')) {
        this.addEquipment(node, parentNode)
      } else if (node.class.startsWith('Point')) {
        this.addPoint(node, parentNode)
      } else if (node.item.type === 'Group') {
        this.addEquipment(node, parentNode)
      } else {
        this.moveState.moveConfirmed = true
        const dialog = this.$f7.dialog.create({
          text: 'Insert "' + this.itemLabel(node.item) +
            '" into "' + this.itemLabel(parentNode.item) +
            '" as',
          verticalButtons: true,
          buttons: [
            { text: 'Cancel', color: 'gray', keycodes: [27], onClick: () => this.restoreModelUpdate() },
            { text: 'Equipment', onClick: () => this.addEquipment(node, parentNode) },
            { text: 'Point', strong: true, keycodes: [13], onClick: () => this.addPoint(node, parentNode) }
          ]
        }).open()
      }
      console.timeEnd('Timer: addIntoEquipment')
    },
    addIntoGroup (node, parentNode) {
      console.time('Timer: addIntoGroup')
      if (node.class.startsWith('Location')) {
        this.addLocation(node, parentNode)
      } else if (node.class.startsWith('Equipment')) {
        this.addEquipment(node, parentNode)
      } else if (node.class.startsWith('Point')) {
        this.addPoint(node, parentNode)
      } else {
        this.addNonSemantic(node, parentNode)
      }
      console.timeEnd('Timer: addIntoGroup')
    },
    addIntoRoot (node, parentNode) {
      console.time('Timer: addIntoRoot')
      if (node.class.startsWith('Location')) {
        this.addLocation(node, parentNode)
      } else if (node.class.startsWith('Equipment')) {
        this.addEquipment(node, parentNode)
      } else if (node.class.startsWith('Point')) {
        this.addPoint(node, parentNode)
      } else if (node.item.type === 'Group') {
        this.moveState.moveConfirmed = true
        this.$f7.dialog.create({
          text: 'Insert "' + this.itemLabel(node.item) +
            '" into "' + this.itemLabel(parentNode.item) +
            '" as',
          verticalButtons: true,
          buttons: [
            { text: 'Cancel', color: 'gray', keycodes: [27], onClick: () => this.restoreModelUpdate() },
            { text: 'Location', onClick: () => this.addLocation(node, parentNode) },
            { text: 'Equipment', onClick: () => this.addEquipment(node, parentNode) },
            { text: 'Non Semantic', strong: true, keycodes: [13], onClick: () => this.addNonSemantic(node, parentNode) }
          ]
        }).open()
      } else {
        this.moveState.moveConfirmed = true
        this.$f7.dialog.create({
          text: 'Insert "' + this.itemLabel(node.item) +
            '" into "' + this.itemLabel(parentNode.item) +
            '" as',
          verticalButtons: true,
          buttons: [
            { text: 'Cancel', color: 'gray', keycodes: [27], onClick: () => this.restoreModelUpdate() },
            { text: 'Equipment', onClick: () => this.addEquipment(node, parentNode) },
            { text: 'Point', onClick: () => this.addPoint(node, parentNode) },
            { text: 'Non Semantic', strong: true, keycodes: [13], onClick: () => this.addNonSemantic(node, parentNode) }
          ]
        }).open()
      }
      console.timeEnd('Timer: addIntoRoot')
    },
    addLocation (node, parentNode) {
      console.time('Timer: addLocation')
      const semantics = { config: {} }
      semantics.value = node.item?.metadata?.semantics?.value || 'Location'
      if (parentNode.class.startsWith('Location')) {
        semantics.config.isPartOf = parentNode.item.name
      }
      const tag = semantics.value.split('_').pop()
      if (!node.item.tags.includes(tag)) node.item.tags.push(tag)
      node.class = semantics.value
      const nodeChildren = this.nodeChildren(node)
      nodeChildren.filter((n) => !n.class).forEach((n) => this.addIntoLocation(n, node))
      this.updateAfterAdd(node, parentNode, semantics)
      console.timeEnd('Timer: addLocation')
    },
    addEquipment (node, parentNode) {
      console.time('Timer: addEquipment')
      const semantics = { config: {} }
      semantics.value = node.item?.metadata?.semantics?.value || 'Equipment'
      if (parentNode.class.startsWith('Location')) {
        semantics.config.hasLocation = parentNode.item.name
      } else if (parentNode.class.startsWith('Equipment')) {
        semantics.config.isPartOf = parentNode.item.name
      }
      const tag = semantics.value.split('_').pop()
      if (!node.item.tags.includes(tag)) node.item.tags.push(tag)
      node.class = semantics.value
      const nodeChildren = this.nodeChildren(node)
      nodeChildren.filter((n) => !n.class).forEach((n) => this.addIntoEquipment(n, node))
      this.updateAfterAdd(node, parentNode, semantics)
      console.timeEnd('Timer: addEquipment')
    },
    addPoint (node, parentNode) {
      console.time('Timer: addPoint')
      const semantics = { config: {} }
      semantics.value = node.item?.metadata?.semantics?.value || 'Point'
      if (parentNode.class.startsWith('Location')) {
        semantics.config.hasLocation = parentNode.item.name
      } else if (parentNode.class.startsWith('Equipment')) {
        semantics.config.isPointOf = parentNode.item.name
      }
      const tag = semantics.value.split('_').pop()
      if (!node.item.tags.includes(tag)) node.item.tags.push(tag)
      node.class = semantics.value
      this.updateAfterAdd(node, parentNode, semantics)
      console.timeEnd('Timer: addPoint')
    },
    addNonSemantic (node, parentNode) {
      console.time('Timer: addNonSemantic')
      node.class = ''
      this.updateAfterAdd(node, parentNode, null)
      console.timeEnd('Timer: addNonSemantic')
    },
    updateAfterAdd (node, parentNode, semantics) {
      console.timeLog('Timer: Drag')
      console.time('Timer: updateAfterAdd')
      let updateRequired = false
      if (semantics === null) {
        if (node.item.metadata?.semantics) {
          node.item.metadata.semantics = null
          updateRequired = true
        }
      } else if (node.item.metadata) {
        if (!fastDeepEqual(node.item.metadata.semantics, semantics)) {
          node.item.metadata.semantics = semantics
          updateRequired = true
        }
      } else {
        node.item.metadata = { semantics }
        updateRequired = true
      }
      if (parentNode.item?.type === 'Group' && !node.item.groupNames.includes(parentNode.item.name)) {
        node.item.groupNames.push(parentNode.item.name)
        updateRequired = true
      }
      console.debug('Add - new moveState:', cloneDeep(this.moveState))
      if (!this.children.some(n => n.item.name === node.item.name)) {
        // sometimes the list gets updates when dragging, sometimes it is missed so we have to add here
        this.children.push(node)
      }
      if (updateRequired) {
        this.moveState.nodesToUpdate.push(node)
      }
      console.debug('Add - finished, new moveState:', cloneDeep(this.moveState))
      console.timeEnd('Timer: updateAfterAdd')
    },
    validateRemove () {
      console.timeLog('Timer: Drag')
      console.time('Timer: validateRemove')
      this.moveState.removing = true
      const node = this.moveState.node
      const newParentNode = this.moveState.newParent
      const parentNode = this.moveState.oldParent
      const oldIndex = this.moveState.oldIndex
      console.debug('Remove - new moveState:', cloneDeep(this.moveState))
      if (!newParentNode.item) {
        // moving into root, so remove from source
        // issue: it will only remove from the current parent, not all
        this.remove(node, parentNode, oldIndex)
      } else if (parentNode.class !== '' && newParentNode.class !== '') {
        // in general remove from semantic model group, unless moving into non-semantic group
        this.remove(node, parentNode, oldIndex)
      } else if (!parentNode.item && node.class !== '') {
        // always remove semantic item from root level when moving into another group
        this.remove(node, parentNode, oldIndex)
      } else if (parentNode.item?.type === 'Group') {
        this.moveState.moveConfirmed = true
        this.$f7.dialog.create({
          text: 'Item "' + this.itemLabel(node.item) +
            '" dragged from group "' + this.itemLabel(parentNode.item) +
            '" into "' + this.itemLabel(newParentNode.item) +
            '", keep original?',
          buttons: [
            { text: 'Cancel', color: 'gray', keycodes: [27], onClick: () => this.restoreModelUpdate() },
            { text: 'Yes', strong: true, keycodes: [13], onClick: () => this.updateAfterRemove() },
            { text: 'No', onClick: () => this.remove(node, parentNode, oldIndex) }
          ]
        }).open()
      } else {
        this.updateAfterRemove()
      }
      console.timeEnd('Timer: validateRemove')
    },
    remove (node, parentNode, oldIndex) {
      console.time('Timer: remove')
      const groupNameIndex = node.item.groupNames.findIndex(g => g === parentNode.item?.name)
      if (groupNameIndex >= 0) {
        node.item.groupNames.splice(groupNameIndex, 1)
      }
      const newChildren = this.nodeChildren(parentNode)
      newChildren.splice(oldIndex, 1)
      if (parentNode.class === '' && parentNode.item?.type === 'Group') {
        // Moving a semantic item to a non-semantic group, remove semantics
        if (node.item.metadata) {
          node.item.metadata.semantics = null
        }
      }
      this.updateAfterRemove()
      console.debug('Remove - finished, new moveState:', cloneDeep(this.moveState))
      console.timeEnd('Timer: remove')
    },
    updateAfterRemove () {
      console.timeLog('Timer: Drag')
      console.time('Timer: updateAfterRemove')
      this.moveState.canRemove = false
      this.moveState.removing = false
      this.moveState.dragFinished = true
      console.timeEnd('Timer: updateAfterRemove')
    },
    saveUpdate () {
      console.time('Timer: saveUpdate')
      this.moveState.saving = true
      const node = this.moveState.node
      const parentNode = this.moveState.newParent
      if (!this.moveState.moveConfirmed) {
        this.$f7.dialog.confirm(
          'Move "' + this.itemLabel(node.item) + '" into "' + this.itemLabel(parentNode.item) + '"?',
          () => this.saveModelUpdate(),
          () => this.restoreModelUpdate()
        ).open()
      } else {
        this.saveModelUpdate()
      }
      console.timeEnd('Timer: saveUpdate')
    },
    saveModelUpdate () {
      console.time('Timer: saveModelUpdate')
      this.moveState.dragFinished = false
      this.moveState.nodesToUpdate.forEach((n) => {
        const updatedItem = n.item
        console.debug('Save - updatedItem: ', cloneDeep(updatedItem))
        this.saveItem(updatedItem)
      })
      this.moveState.saving = false
      console.timeEnd('Timer: saveModelUpdate')
      console.timeEnd('Timer: Drag')
    },
    restoreModelUpdate () {
      console.time('Timer: restoreModelUpdate')
      this.moveState.cancelled = true
      this.moveState.canRemove = false
      this.moveState.canAdd = false
      this.moveState.adding = false
      this.moveState.removing = false
      this.moveState.saving = false
      this.$emit('reload')
      console.timeEnd('Timer: restoreModelUpdate')
      console.timeEnd('Timer: Drag')
    },
    itemLabel (item) {
      if (!item) return 'model root'
      return (item.label ? (this.includeItemName ? item.label + ' (' + item.name + ')' : item.label) : item.name)
    },
    nodeChildren (node) {
      if (!node) return this.children
      if (!node.children) return []
      return [node.children.locations, node.children.equipment, node.children.points, node.children.groups, node.children.items].flat()
    },
    keyDownHandler (event) {
      if (!event.repeat && event.keyCode === 27) {
        console.debug('escape pressed')
        console.timeEnd('Timer: Drag')
        this.moveState.cancelled = true
      }
    }
  }
}
