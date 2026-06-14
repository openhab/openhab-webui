<template>
  <div class="welcome-container">
    <h1 class="gradient-title">{{ title }}</h1>
    <p class="subtitle">{{ subtitle }}</p>

    <div class="suggestions-header">{{ suggestionHeader }}</div>
    <div class="suggestions-grid">
      <div v-for="(suggestion, idx) in suggestions" :key="idx" class="suggestion-card" @click="emit('select', suggestion.text)">
        <div class="card-icon-wrapper">
          <f7-icon :f7="suggestion.icon" :color="suggestion.color" />
        </div>
        <span class="card-text">{{ suggestion.text }}</span>
      </div>
    </div>
  </div>
</template>

<style lang="stylus" scoped>
.gradient-title
  font-size 32px
  font-weight 800
  margin 0 0 12px 0
  background linear-gradient(135deg, var(--f7-theme-color) 0%, #ff5500 100%)
  -webkit-background-clip text
  -webkit-text-fill-color transparent
  letter-spacing -0.5px

.subtitle
  font-size 15px
  line-height 1.5
  color var(--f7-list-item-after-text-color)
  margin 0 0 32px 0
  max-width 420px

.suggestions-header
  font-size 12px
  text-transform uppercase
  font-weight 600
  letter-spacing 1px
  color var(--f7-theme-color)
  margin-bottom 16px

.suggestions-grid
  display grid
  grid-template-columns 1fr 1fr
  gap 12px
  width 100%
  margin-bottom 24px

@media (max-width: 480px)
  .suggestions-grid
    grid-template-columns 1fr

.suggestion-card
  background var(--f7-card-bg-color, var(--f7-block-strong-bg-color, rgba(255,255,255,0.05)))
  border 1px solid var(--f7-card-outline-border-color, rgba(255, 255, 255, 0.1))
  border-radius 12px
  padding 14px 16px
  display flex
  align-items center
  gap 12px
  cursor pointer
  transition all 0.25s ease
  box-shadow var(--f7-card-box-shadow, 0 4px 12px rgba(0, 0, 0, 0.05))
  text-align left

  &:hover
    transform translateY(-2px)
    background var(--f7-list-link-hover-bg-color, rgba(255, 119, 0, 0.08))
    border-color var(--f7-theme-color)
    box-shadow 0 6px 16px rgba(255, 119, 0, 0.15)

  .card-icon-wrapper
    display flex
    align-items center
    justify-content center
    font-size 20px

  .card-text
    font-size 13px
    font-weight 500
    color var(--f7-text-color)
    line-height 1.3
</style>

<script setup lang="ts">
export interface Suggestion {
  text: string
  icon: string
  color: string
}

defineProps<{
  title: string
  subtitle: string
  suggestionHeader: string
  suggestions: Suggestion[]
}>()

const emit = defineEmits<{
  (e: 'select', text: string): void
}>()
</script>
