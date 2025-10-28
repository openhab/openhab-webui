<template>
  <f7-chip v-if="type === 'alarms' && reduce > 0"
           class="alarm-badge"
           color="red"
           icon-f7="exclamationmark_triangle_fill">
    {{ reduce }}
  </f7-chip>
  <span v-else
        class="padding-right location-status-badge"
        v-show="reduce || (type === 'lock' && map.length > 0)"
        :class="{ invert: invertColor }">
    <oh-icon v-if="config.icon.indexOf('oh:') === 0 && reduce > 0"
             :key="type"
             :icon="config.icon.replace('oh:', '')"
             :state="config.state"
             class="oh-icon-badge"
             width="20"
             height="20" />
    <f7-icon v-else-if="config.icon.indexOf('f7:') === 0"
             :f7="config.icon.replace('f7:', '')"
             :color="invertColor ? 'black' : 'white'"
             class="f7-icon-badge"
             size="20" />
    <oh-icon v-if="config.icon.indexOf('oh:') === 0 && config.stateOff && reduce < 1"
             :key="type + 'off'"
             :icon="config.icon.replace('oh:', '')"
             :state="config.stateOff"
             class="oh-icon-badge"
             width="20"
             height="20" />
    <span class="glance-label" v-show="reduce > 1">{{ reduce }}</span>
  </span>
</template>

<style lang="stylus">
.alarm-badge
  vertical-align top !important
  margin-right 7px
  margin-top 0
.ios .alarm-badge
  margin-top -2px
.md .alarm-badge
  margin-top -7px
.location-status-badge
  .oh-icon-badge
    filter brightness(100)
  &.invert .oh-icon-badge
    filter brightness(0)
  .f7-icon-badge
    line-height 20px
    margin-top -7px
  .glance-label
    line-height 20px
    vertical-align top
</style>

<script>
import { findEquipment, allEquipmentPoints, findPoints } from '../glance-helpers'
import expr from 'jse-eval'

export default {
  props: {
    element: Object,
    type: String,
    badgeOverrides: Object,
    invertColor: Boolean,
    store: Object
  },
  data () {
    return {
      badgeConfigs: {
        alarms: { icon: 'f7:exclamationmark_triangle_fill' },
        battery: { icon: 'f7:battery_25', state: 'on' },
        lights: { icon: 'oh:lightbulb' },
        windows: { icon: 'oh:window', state: 'open' },
        doors: { icon: 'oh:door', state: 'open' },
        garagedoors: { icon: 'oh:garagedoor', state: 'open' },
        blinds: { icon: 'oh:cinemascreen', state: '100' },
        presence: { icon: 'oh:motion', state: 'on' },
        lock: { icon: 'oh:lock', state: 'open', stateOff: 'closed' },
        climate: { icon: 'oh:climate', state: 'on' },
        screens: { icon: 'f7:tv' },
        projectors: { icon: 'f7:videocam_fill' },
        speakers: { icon: 'f7:speaker_2_fill' }
      },
      exprAst: null
    }
  },
  computed: {
    config () {
      if (this.badgeOverrides) {
        const override = this.badgeOverrides[this.type]
        if (override && override.badge) {
          return Object.assign(this.badgeConfigs[this.type], override.badge)
        }
      }
      return this.badgeConfigs[this.type]
    },
    query () {
      let direct, equipment, allPoints, points
      switch (this.type) {
        case 'battery':
          direct = findPoints(this.element.properties, 'Point', true, 'Property_LowBattery')
          if (direct.length) return direct
          return findPoints(allEquipmentPoints(this.element.equipment), 'Point', true, 'Property_LowBattery')
        case 'lights':
          return this.queryLightPoints
        case 'windows':
          equipment = findEquipment(this.element.equipment, 'Equipment_Window', false)
          if (!equipment.length) return []
          allPoints = allEquipmentPoints(equipment)
          points = findPoints(allPoints, 'Point', true, 'Property_Opening', true)
          if (points.length) return points
          return equipment.filter((e) => e.points.length === 0)
        case 'doors':
          equipment = [
            ...findEquipment(this.element.equipment, 'Equipment_Door', false),
            ...findEquipment(this.element.equipment, 'Equipment_Door_FrontDoor', false),
            ...findEquipment(this.element.equipment, 'Equipment_Door_BackDoor', false),
            ...findEquipment(this.element.equipment, 'Equipment_Door_InnerDoor', false),
            ...findEquipment(this.element.equipment, 'Equipment_Door_CellarDoor', false),
            ...findEquipment(this.element.equipment, 'Equipment_Door_SideDoor', false)
          ]
          if (!equipment.length) return []
          allPoints = allEquipmentPoints(equipment)
          points = findPoints(allPoints, 'Point', true, 'Property_Opening', true)
          if (points.length) return points
          return equipment.filter((e) => e.points.length === 0)
        case 'garagedoors':
          equipment = findEquipment(this.element.equipment, 'Equipment_Door_GarageDoor', false)
          if (!equipment.length) return []
          allPoints = allEquipmentPoints(equipment)
          points = findPoints(allPoints, 'Point', true, 'Property_Opening', true)
          if (points.length) return points
          return equipment.filter((e) => e.points.length === 0)
        case 'blinds':
          equipment = findEquipment(this.element.equipment, 'Equipment_WindowCovering', true)
          if (!equipment.length) return []
          allPoints = allEquipmentPoints(equipment)
          points = findPoints(allPoints, 'Point', true, 'Property_Opening', true)
          if (points.length) return points
          return equipment.filter((e) => e.points.length === 0)
        case 'presence':
          direct = [
            ...findPoints(this.element.properties, 'Point', true, 'Property_Presence'),
            ...findPoints(this.element.properties, 'Point', true, 'Property_Motion')
          ]
          if (direct.length) return direct
          return [
            ...findPoints(allEquipmentPoints(this.element.equipment), 'Point', true, 'Property_Presence'),
            ...findPoints(allEquipmentPoints(this.element.equipment), 'Point', true, 'Property_Motion')
          ]
        case 'lock':
          equipment = findEquipment(this.element.equipment, 'Equipment_Lock', false)
          if (!equipment.length) return []
          allPoints = allEquipmentPoints(equipment)
          points = findPoints(allPoints, 'Point', true, 'Property_Opening', true)
          if (points.length) return points
          return equipment.filter((e) => e.points.length === 0)
        case 'climate':
          equipment = findEquipment(this.element.equipment, 'Equipment_HVAC', true)
          if (!equipment.length) return []
          allPoints = allEquipmentPoints(equipment)
          points = [
            ...findPoints(allPoints, 'Point_Status', false, 'Property_Power'),
            ...findPoints(allPoints, 'Point_Control', true, 'Property_Power')
          ]
          if (points.length) return points
          return equipment.filter((e) => e.points.length === 0)
        case 'screens':
          equipment = [
            ...findEquipment(this.element.equipment, 'Equipment_AudioVisual_Display', false),
            ...findEquipment(this.element.equipment, 'Equipment_AudioVisual_Display_Television', false),
            ...findEquipment(this.element.equipment, 'Equipment_AudioVisual_Screen', true)
          ]
          if (!equipment.length) return []
          allPoints = allEquipmentPoints(equipment)
          points = [
            ...findPoints(allPoints, 'Point_Status', false, 'Property_Power'),
            ...findPoints(allPoints, 'Point_Control', true, 'Property_Power')
          ]
          if (points.length) return points
          return equipment.filter((e) => e.points.length === 0)
        case 'speakers':
          equipment = [
            ...findEquipment(this.element.equipment, 'Equipment_AudioVisual_Receiver', false),
            ...findEquipment(this.element.equipment, 'Equipment_AudioVisual_Speaker', false),
            ...findEquipment(this.element.equipment, 'Equipment_VoiceAssistant', false),
            ...findEquipment(this.element.equipment, 'Equipment_AudioVisual_MediaPlayer', false)
          ]
          if (!equipment.length) return []
          allPoints = allEquipmentPoints(equipment)
          points = [
            ...findPoints(allPoints, 'Point_Status', false, 'Property_Power'),
            ...findPoints(allPoints, 'Point_Control', true, 'Property_Power')
          ]
          if (points.length) return points
          return equipment.filter((e) => e.points.length === 0)
        case 'projectors':
          equipment = findEquipment(this.element.equipment, 'Equipment_AudioVisual_Display_Projector', false)
          if (!equipment.length) return []
          allPoints = allEquipmentPoints(equipment)
          points = [
            ...findPoints(allPoints, 'Point_Status', false, 'Property_Power'),
            ...findPoints(allPoints, 'Point_Control', true, 'Property_Power')
          ]
          if (points.length) return points
          return equipment.filter((e) => e.points.length === 0)
        case 'alarms':
          direct = findPoints(this.element.properties, 'Point_Alarm', true)
          if (direct.length) return direct
          return findPoints(allEquipmentPoints(this.element.equipment), 'Point_Alarm', true)
        default:
          return []
      }
    },
    map () {
      return this.query.map((item) => this.store[item.name].state)
    },
    reduce () {
      const ast = this.overrideExpression()
      if (ast) {
        return this.map.filter((state) => expr.evaluate(ast, { state, Number })).length
      }
      switch (this.type) {
        case 'blinds':
          return this.map.filter((state) => state === 'OPEN' || state === 'ON' || Number.parseInt(state) === 0).length
        case 'lights':
          return this.map.filter((state) => state === 'ON' || (state.split(',').length === 3 && state.split(',')[2] !== '0') || (state.indexOf(',') < 0 && Number.parseInt(state) > 0)).length
        case 'projectors':
        case 'screens':
        case 'speakers':
          return this.map.filter((state) => state === 'ON' || state === 'PLAY' || state === 'FASTFORWARD' || state === 'REWIND').length
        default:
          return this.map.filter((state) => state === 'ON' || state === 'OPEN').length
      }
    },
    queryLightPoints () {
      const lightSourceEquipment = findEquipment(this.element.equipment, 'Equipment_LightSource', true)
      // Look for all control points on the location with light, color and brightness properties.
      // For a user: It is advisable that lights represented as a point on a location are not represented anywhere in the model as a light point in an equipment,
      // or they will be counted twice (possibly in different locations). Therefore only tag one light point for a given physical light.
      const points = []
      points.push(...findPoints(this.element.properties, 'Point_Control', true, 'Property_Color'))
      points.push(...findPoints(this.element.properties, 'Point_Control', true, 'Property_Brightness'))
      points.push(...findPoints(this.element.properties, 'Point_Control', true, 'Property_Light'))
      points.push(...findPoints(this.element.properties, 'Point_Status', true, 'Property_Color'))
      points.push(...findPoints(this.element.properties, 'Point_Status', true, 'Property_Brightness'))
      points.push(...findPoints(this.element.properties, 'Point_Status', true, 'Property_Light'))
      // Repeat this for equipments on the location.
      points.push(...this.element.equipment.map((e) => {
        const isLightSource = lightSourceEquipment.includes(e)
        const allPoints = allEquipmentPoints(e) // consider sub-equipment as well
        const equipmentPoints = []
        equipmentPoints.push(...findPoints(allPoints, 'Point_Control', true, 'Property_Color'))
        equipmentPoints.push(...findPoints(allPoints, 'Point_Control', true, 'Property_Brightness'))
        equipmentPoints.push(...findPoints(allPoints, 'Point_Control', true, 'Property_Light'))
        equipmentPoints.push(...findPoints(allPoints, 'Point_Status', true, 'Property_Color'))
        equipmentPoints.push(...findPoints(allPoints, 'Point_Status', true, 'Property_Brightness'))
        equipmentPoints.push(...findPoints(allPoints, 'Point_Status', true, 'Property_Light'))
        // For light source equipment not yet covered above we look beyond property light, color and brightness,
        // but will only consider one point (first in the list), with priority to switch.
        // We don't look at sub-equipment for this.
        // In summary: assumption is the equipment represents a unique light.
        if (isLightSource && !allPoints.some((p) => equipmentPoints.includes(p))) {
          const lightSourcePoints = [...findPoints(e.points, 'Point_Control_Switch', false), ...findPoints(e.points, 'Point_Control', true), ...findPoints(e.points, 'Point_Status', true)]
          if (lightSourcePoints.length) {
            equipmentPoints.push(lightSourcePoints.slice(0, 1))
          }
        }
        return equipmentPoints
      }).flat())
      // Also include LightSource tagged equipment items that have no points themselves and that have no sub-equipment included already.
      const lightSourceEquipmentNoPoints = lightSourceEquipment.filter((e) => e.points.length === 0).filter((e) => !allEquipmentPoints(e).some((p) => points.includes(p))).map((e) => e.item)
      points.push(...lightSourceEquipmentNoPoints)
      return points
    }
  },
  methods: {
    overrideExpression () {
      if (this.badgeOverrides && !this.exprAst) {
        const override = this.badgeOverrides[this.type]
        if (override && override.expression) {
          this.exprAst = expr.parse(override.expression)
        }
      }
      return this.exprAst
    }
  }
}
</script>
