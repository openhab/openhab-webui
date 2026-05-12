<template>
  <div class="sidebar-admin-submenu">
    <ul v-if="!customizing" class="menu-sublinks">
      <f7-list-item
        v-for="item in items"
        :key="item.id"
        :link="item.link"
        :title="item.title"
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
        title="Edit submenu"
        link="#"
        no-chevron
        @click.prevent="startCustomization">
        <template #media>
          <f7-icon f7="slider_horizontal_3" color="gray" />
        </template>
      </f7-list-item>
    </ul>

    <div v-if="customizing" class="submenu-customizer">
      <div class="submenu-customizer-help">Select the entries to show here, then apply, cancel, or reset the draft below.</div>
      <f7-list class="menu-sublinks-customize">
        <f7-list-item
          v-for="item in candidates"
          :key="item.id"
          class="submenu-customizer-item"
          :title="item.title"
          no-chevron
          @click="toggleDraft(item.id)">
          <template #media>
            <div class="submenu-customizer-media">
              <f7-checkbox :checked="draftSelectedIds.includes(item.id) ? true : null" @click.stop @change.stop="toggleDraft(item.id)" />
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

<script setup lang="ts">
import { computed } from 'vue'
import type { AdminMenuLinkItemDefinition, AdminMenuSection } from '@/js/admin-menu'
import { useSidebarAdminSubmenu } from '@/js/composables/useSidebarAdminSubmenu'
import { useUIOptionsStore } from '@/js/stores/useUIOptionsStore'

// --- Defines ---
const props = defineProps<{
  section: AdminMenuSection
  activePath?: Record<string, unknown> | null
}>()

const emit = defineEmits<{
  navigate: [item: AdminMenuLinkItemDefinition]
}>()

// --- Composables ---
const uiOptionsStore = useUIOptionsStore()
const {
  items,
  candidates,
  customizing,
  draftSelectedIds,
  isCustomized,
  startCustomization,
  toggleDraft,
  applyCustomization,
  resetCustomization,
  cancelCustomization
} = useSidebarAdminSubmenu(props.section)

// --- Computed ---
const customizeAvailable = computed(() => uiOptionsStore.showSidebarSubmenuEditor)

// --- Methods ---
function isItemActive(itemId: string) {
  return Boolean(props.activePath?.[itemId])
}
</script>

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
