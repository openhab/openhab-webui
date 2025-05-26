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
    moveState: {
      handler: function () {
        if (this.canSave) {
          this.saveUpdate()
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
    }
  },
  methods: {
    onDragStart (event) {
      this.moveState.node = this.children[event.oldIndex]
      if (!this.moveState.node.item.editable) return
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
      this.moveState.dragStartTimestamp = Date.now()
      this.moveState.nodesToUpdate.splice(0)
      this.moveState.moveDelayedOpen = null
      this.moveState.moveTarget = null
      console.debug('Drag start - moveState:', cloneDeep(this.moveState))
      console.debug('runtime onDragStart', Date.now() - this.moveState.dragStartTimestamp)
    },
    onDragChange (event) {
      console.debug('runtime onDragChange', Date.now() - this.moveState.dragStartTimestamp)
      console.debug('Drag change - event:', event)
      if (this.moveState.cancelled) {
        console.debug('Drag change - cancelled')
        return
      }
      if (event.added) {
        this.moveState.newParent = this.moveState.moveTarget || this.model
        this.moveState.canAdd = true
      } else if (event.removed) {
        this.moveState.oldParent = this.model
        this.moveState.oldIndex = event.removed.oldIndex
        this.moveState.canRemove = true
      } else if (event.moved) {
        // in theory, this should not happen as sorting within the same list is disabled
        this.moveState.cancelled = true
        return
      }
      console.debug('Drag change - moveState:', cloneDeep(this.moveState))
    },
    onDragMove (event) {
      console.debug('Drag move - event:', event)
      const target = event.relatedContext?.element
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
      this.moveState.moveTarget = target
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
      if (!this.moveState.node.item.editable) {
        return
      }
      console.debug('runtime onDragEnd', Date.now() - this.moveState.dragStartTimestamp)
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
      console.debug('runtime validateAdd start', Date.now() - this.moveState.dragStartTimestamp)
      this.moveState.adding = true
      const node = this.moveState.node
      const parentNode = this.moveState.newParent
      const oldParentNode = this.moveState.oldParent
      if (node.item.name === parentNode?.item?.name) {
        // This should not be possible, but just to make sure to avoid infinite loop
        this.restoreModelUpdate()
        console.debug('runtime validateAdd end', Date.now() - this.moveState.dragStartTimestamp)
        return
      }
      if (parentNode.item && node.item.groupNames?.includes(parentNode.item.name)) {
        const message = 'Group "' + this.itemLabel(parentNode.item) +
          '" already contains item "' + this.itemLabel(node.item) + '"'
        console.debug('Add rejected: ' + message)
        console.debug('runtime dialog open', Date.now() - this.moveState.dragStartTimestamp)
        this.$f7.dialog.alert(message).open()
        this.restoreModelUpdate()
        console.debug('runtime validateAdd end', Date.now() - this.moveState.dragStartTimestamp)
        return
      }
      if (node.item.type === 'Group' && node.class === '') {
        const semanticNode = this.nestedSemanticNode(node)
        if (semanticNode) {
          const message = 'Cannot insert non-semantic group "' + this.itemLabel(node.item) +
            '" with semantic child "' + this.itemLabel(semanticNode.item) +
            '" into semantic group "' + this.itemLabel(parentNode.item) + '"'
          console.debug('Add rejected: ' + message)
          console.debug('runtime dialog open', Date.now() - this.moveState.dragStartTimestamp)
          this.$f7.dialog.alert(message).open()
          this.restoreModelUpdate()
          console.debug('runtime validateAdd end', Date.now() - this.moveState.dragStartTimestamp)
          return
        }
      }
      if (node.class !== '' && parentNode.class !== '' && (oldParentNode.item && oldParentNode?.class === '')) {
        const message = 'Cannot move semantic item "' + this.itemLabel(node.item) +
          '" from non-semantic group "' + this.itemLabel(oldParentNode.item) +
          '" into semantic group "' + this.itemLabel(parentNode.item) + '"'
        console.debug('Add rejected:' + message)
        console.debug('runtime dialog open', Date.now() - this.moveState.dragStartTimestamp)
        this.$f7.dialog.alert(message).open()
        this.restoreModelUpdate()
        console.debug('runtime validateAdd end', Date.now() - this.moveState.dragStartTimestamp)
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
            console.debug('runtime dialog open', Date.now() - this.moveState.dragStartTimestamp)
            this.$f7.dialog.alert(message).open()
            this.restoreModelUpdate()
            console.debug('runtime validateAdd end', Date.now() - this.moveState.dragStartTimestamp)
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
            console.debug('runtime dialog open', Date.now() - this.moveState.dragStartTimestamp)
            this.$f7.dialog.alert(message).open()
            this.restoreModelUpdate()
            console.debug('runtime validateAdd end', Date.now() - this.moveState.dragStartTimestamp)
            return
          }
        }
      }
      if (!this.isValidGroupType(node, parentNode)) {
        this.restoreModelUpdate()
        console.debug('runtime validateAdd end', Date.now() - this.moveState.dragStartTimestamp)
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
      console.debug('runtime validateAdd end', Date.now() - this.moveState.dragStartTimestamp)
    },
    isValidGroupType (node, parentNode) {
      console.debug('runtime isValidGroupType start', Date.now() - this.moveState.dragStartTimestamp)
      const groupTypeDef = parentNode.item?.groupType?.split(':')
      const baseType = groupTypeDef ? groupTypeDef[0] : 'None'
      if (baseType === 'None') return true
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
          console.debug('runtime dialog open', Date.now() - this.moveState.dragStartTimestamp)
          this.$f7.dialog.alert(message).open()
          console.debug('runtime isValidGroupType end', Date.now() - this.moveState.dragStartTimestamp)
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
            console.debug('runtime dialog open', Date.now() - this.moveState.dragStartTimestamp)
            this.$f7.dialog.alert(message).open()
            console.debug('runtime isValidGroupType end', Date.now() - this.moveState.dragStartTimestamp)
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
        console.debug('runtime dialog open', Date.now() - this.moveState.dragStartTimestamp)
        this.$f7.dialog.alert(message).open()
        console.debug('runtime isValidGroupType end', Date.now() - this.moveState.dragStartTimestamp)
        return false
      }
      console.debug('runtime isValidGroupType end', Date.now() - this.moveState.dragStartTimestamp)
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
      console.debug('runtime addIntoLocation start', Date.now() - this.moveState.dragStartTimestamp)
      if (node.class.startsWith('Location')) {
        this.addLocation(node, parentNode)
      } else if (node.class.startsWith('Equipment')) {
        this.addEquipment(node, parentNode)
      } else if (node.class.startsWith('Point')) {
        this.addPoint(node, parentNode)
      } else if (node.item.type === 'Group') {
        this.moveState.moveConfirmed = true
        console.debug('runtime dialog open', Date.now() - this.moveState.dragStartTimestamp)
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
        console.debug('runtime dialog open', Date.now() - this.moveState.dragStartTimestamp)
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
      console.debug('runtime addIntoLocation end', Date.now() - this.moveState.dragStartTimestamp)
    },
    addIntoEquipment (node, parentNode) {
      console.debug('runtime addIntoEquipment start', Date.now() - this.moveState.dragStartTimestamp)
      if (node.class.startsWith('Location')) {
        console.debug('runtime dialog open', Date.now() - this.moveState.dragStartTimestamp)
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
        console.debug('runtime dialog open', Date.now() - this.moveState.dragStartTimestamp)
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
      console.debug('runtime addIntoEquipment end', Date.now() - this.moveState.dragStartTimestamp)
    },
    addIntoGroup (node, parentNode) {
      console.debug('runtime addIntoGroup start', Date.now() - this.moveState.dragStartTimestamp)
      if (node.class.startsWith('Location')) {
        this.addLocation(node, parentNode)
      } else if (node.class.startsWith('Equipment')) {
        this.addEquipment(node, parentNode)
      } else if (node.class.startsWith('Point')) {
        this.addPoint(node, parentNode)
      } else {
        this.addNonSemantic(node, parentNode)
      }
      console.debug('runtime addIntoGroup end', Date.now() - this.moveState.dragStartTimestamp)
    },
    addIntoRoot (node, parentNode) {
      console.debug('runtime addIntoRoot start', Date.now() - this.moveState.dragStartTimestamp)
      if (node.class.startsWith('Location')) {
        this.addLocation(node, parentNode)
      } else if (node.class.startsWith('Equipment')) {
        this.addEquipment(node, parentNode)
      } else if (node.class.startsWith('Point')) {
        this.addPoint(node, parentNode)
      } else if (node.item.type === 'Group') {
        this.moveState.moveConfirmed = true
        console.debug('runtime dialog open', Date.now() - this.moveState.dragStartTimestamp)
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
        console.debug('runtime dialog open', Date.now() - this.moveState.dragStartTimestamp)
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
      console.debug('runtime addIntoRoot end', Date.now() - this.moveState.dragStartTimestamp)
    },
    addLocation (node, parentNode) {
      console.debug('runtime addLocation start', Date.now() - this.moveState.dragStartTimestamp)
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
      console.debug('runtime addLocation end', Date.now() - this.moveState.dragStartTimestamp)
    },
    addEquipment (node, parentNode) {
      console.debug('runtime addEquipment start', Date.now() - this.moveState.dragStartTimestamp)
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
      console.debug('runtime addEquipment end', Date.now() - this.moveState.dragStartTimestamp)
    },
    addPoint (node, parentNode) {
      console.debug('runtime addPoint start', Date.now() - this.moveState.dragStartTimestamp)
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
      console.debug('runtime addPoint end', Date.now() - this.moveState.dragStartTimestamp)
    },
    addNonSemantic (node, parentNode) {
      console.debug('runtime addNonSemantic start', Date.now() - this.moveState.dragStartTimestamp)
      node.class = ''
      this.updateAfterAdd(node, parentNode, null)
      console.debug('runtime addNonSemantic end', Date.now() - this.moveState.dragStartTimestamp)
    },
    updateAfterAdd (node, parentNode, semantics) {
      console.debug('runtime updateAfterAdd start', Date.now() - this.moveState.dragStartTimestamp)
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
      console.debug('runtime updateAfterAdd end', Date.now() - this.moveState.dragStartTimestamp)
    },
    validateRemove () {
      console.debug('runtime validateRemove start', Date.now() - this.moveState.dragStartTimestamp)
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
        console.debug('runtime dialog open', Date.now() - this.moveState.dragStartTimestamp)
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
      console.debug('runtime validateRemove end', Date.now() - this.moveState.dragStartTimestamp)
    },
    remove (node, parentNode, oldIndex) {
      console.debug('runtime remove start', Date.now() - this.moveState.dragStartTimestamp)
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
      console.debug('runtime remove end', Date.now() - this.moveState.dragStartTimestamp)
    },
    updateAfterRemove () {
      console.debug('runtime updateAfterRemove start', Date.now() - this.moveState.dragStartTimestamp)
      this.moveState.canRemove = false
      this.moveState.removing = false
      this.moveState.dragFinished = true
      console.debug('runtime updateAfterRemove end', Date.now() - this.moveState.dragStartTimestamp)
    },
    saveUpdate () {
      console.debug('runtime saveUpdate start', Date.now() - this.moveState.dragStartTimestamp)
      this.moveState.saving = true
      const node = this.moveState.node
      const parentNode = this.moveState.newParent
      if (!this.moveState.moveConfirmed) {
        console.debug('runtime dialog open', Date.now() - this.moveState.dragStartTimestamp)
        this.$f7.dialog.confirm(
          'Move "' + this.itemLabel(node.item) + '" into "' + this.itemLabel(parentNode.item) + '"?',
          () => this.saveModelUpdate(),
          () => this.restoreModelUpdate()
        ).open()
      } else {
        this.saveModelUpdate()
      }
      console.debug('runtime saveUpdate end', Date.now() - this.moveState.dragStartTimestamp)
    },
    saveModelUpdate () {
      console.debug('runtime saveModelUpdate start', Date.now() - this.moveState.dragStartTimestamp)
      this.moveState.dragFinished = false
      this.moveState.nodesToUpdate.forEach((n) => {
        const updatedItem = n.item
        console.debug('Save - updatedItem: ', cloneDeep(updatedItem))
        this.saveItem(updatedItem)
      })
      this.moveState.saving = false
      console.debug('runtime saveModelUpdate end', Date.now() - this.moveState.dragStartTimestamp)
    },
    restoreModelUpdate () {
      console.debug('Restore model')
      console.debug('runtime restoreModelUpdate start', Date.now() - this.moveState.dragStartTimestamp)
      this.moveState.cancelled = true
      this.moveState.canRemove = false
      this.moveState.canAdd = false
      this.moveState.adding = false
      this.moveState.removing = false
      this.moveState.saving = false
      this.$emit('reload')
      console.debug('runtime restoreModelUpdate end', Date.now() - this.moveState.dragStartTimestamp)
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
        console.debug('runtime escape', Date.now() - this.moveState.dragStartTimestamp)
        this.moveState.cancelled = true
      }
    }
  }
}
