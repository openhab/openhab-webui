<template>
  <div class="sidebar-admin-submenu">
    <ul v-if="!customizing" class="menu-sublinks">
      <transition-group name="list-expand" tag="div">
        <f7-list-item
          v-for="item in items"
          :key="item.id"
          :link="item.link"
          :title="$t(item.titleKey)"
          view=".view-main"
          panel-close
          :animate="false"
          no-chevron
          :class="{ currentsection: isItemActive(item.id) }"
          @click="emit('navigate', item)">
          <template #media>
            <f7-icon :f7="item.icon" color="gray" />
          </template>
        </f7-list-item>
        <f7-list-item
          v-if="customizeAvailable"
          class="submenu-customize-entry"
          :title="$t('sidebar.submenu.edit-submenu')"
          link="#"
          no-chevron
          data-sidebar-ignore-collapse
          @click="startCustomization">
          <template #media>
            <f7-icon f7="slider_horizontal_3" color="gray" />
          </template>
        </f7-list-item>
        <f7-list-item
          v-if="customizeAvailable"
          class="submenu-customize-entry"
          :title="$t('sidebar.submenu.hide-submenu-editor')"
          link="#"
          no-chevron
          data-sidebar-ignore-collapse
          @click="hideSubmenuEditor">
          <template #media>
            <f7-icon f7="xmark" color="gray" />
          </template>
        </f7-list-item>
        <f7-list-item
          v-else-if="!expanded"
          :title="$t('sidebar.submenu.show-all')"
          class="submenu-expand-entry"
          link="#"
          no-chevron
          data-sidebar-ignore-collapse
          @click="showAllSubmenuEntries">
          <template #media>
            <f7-icon f7="chevron_down" color="gray" />
          </template>
        </f7-list-item>
        <f7-list-item
          v-else
          :title="$t('sidebar.submenu.show-less')"
          class="submenu-collapse-entry"
          link="#"
          no-chevron
          data-sidebar-ignore-collapse
          @click="collapseSubmenuEntries">
          <template #media>
            <f7-icon f7="chevron_up" color="gray" />
          </template>
        </f7-list-item>
      </transition-group>
    </ul>

    <div v-if="customizing" class="submenu-customizer" data-sidebar-ignore-collapse>
      <div class="submenu-customizer-help">Select the entries to show here, then apply, cancel, or reset the draft below.</div>
      <f7-list class="menu-sublinks-customize">
        <f7-list-item
          v-for="item in candidates"
          :key="item.id"
          class="submenu-customizer-item"
          :title="$t(item.titleKey)"
          no-chevron
          @click="toggleDraft(item.id)">
          <template #media>
            <div class="submenu-customizer-media">
              <f7-checkbox :checked="draftSelectedIds.includes(item.id) ? true : null" @click="toggleDraft(item.id)" />
              <f7-icon :f7="item.icon" color="gray" />
            </div>
          </template>
        </f7-list-item>
      </f7-list>
      <div class="submenu-customizer-actions">
        <f7-button small outline color="red" :disabled="!isCustomized" @click="resetCustomization">Reset</f7-button>
        <f7-button small color="gray" @click="cancelCustomization">Cancel</f7-button>
        <f7-button small fill color="blue" @click="applyCustomization">Apply</f7-button>
      </div>
    </div>
  </div>
</template>

<style lang="stylus">
.sidebar-admin-submenu
  .menu-sublinks-customize
    margin-bottom 0
    background-color transparent
    .list-button
      margin 0

  .submenu-customizer
    padding 0 0 8px

  .submenu-customizer-help
    margin 0 16px 8px
    padding 10px 12px
    border-radius 10px
    background rgba(255, 119, 0, 0.12)
    color #8a5a00
    font-size 0.9rem
    line-height 1.35

  .submenu-customizer-item
    cursor pointer
    .item-content
      padding-left 2px
    .item-media
      min-width 0
      margin-right 8px
      display flex
      justify-content center
    .item-inner
      padding-right var(--f7-list-item-padding-horizontal) !important

  .submenu-customizer-media
    width auto
    display flex
    align-items center
    justify-content flex-start
    gap 8px
    padding-left 0

  .submenu-customizer-actions
    display flex
    gap 8px
    padding 8px 16px 0

  .submenu-customize-entry
    opacity 0.8
    .item-title,
    .icon
      color var(--f7-list-item-footer-text-color) !important

  .submenu-expand-entry, .submenu-collapse-entry
    opacity 0.6

  .list-expand-enter-active,
  .list-expand-leave-active
    transition all 0.4s ease
    overflow hidden
    max-height 50px

  .list-expand-enter-from,
  .list-expand-leave-to
    opacity 0
    max-height 0
    transform translateX(20px)

  .list-expand-move
    transition transform 0.4s ease

.dark
  .sidebar-admin-submenu
    .submenu-customizer-help
      background rgba(255, 153, 51, 0.16)
      color #f6c37a
    .submenu-customize-entry
      .item-title,
      .icon
        color var(--f7-list-item-text-color) !important
</style>

<script setup lang="ts">
import type { AdminMenuLinkItemDefinition, AdminMenuSection } from '@/js/admin-menu'
import { useSidebarAdminSubmenu } from '@/js/composables/useSidebarAdminSubmenu'

// --- Defines ---
const props = defineProps<{
  section: AdminMenuSection
  activePath?: Record<string, unknown> | null
}>()

const emit = defineEmits<{
  navigate: [item: AdminMenuLinkItemDefinition]
}>()

// --- Composables ---
const {
  items,
  candidates,
  expanded,
  customizing,
  customizeAvailable,
  draftSelectedIds,
  isCustomized,
  startCustomization,
  hideSubmenuEditor,
  toggleDraft,
  applyCustomization,
  resetCustomization,
  cancelCustomization,
  hasVisibleItem,
  showAllSubmenuEntries,
  collapseSubmenuEntries
} = useSidebarAdminSubmenu(props.section)

// --- Methods ---
function isItemActive(itemId: string) {
  return Boolean(props.activePath?.[itemId])
}

defineExpose({
  hasVisibleItem
})
</script>
