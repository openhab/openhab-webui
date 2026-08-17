<template>
  <f7-chip
    v-for="option in typeof filter.options === 'function' ? filter.options() : filter.options"
    :key="option"
    :text="option"
    :color="isFilterSelected(option) ? 'blue' : 'gray'"
    media-bg-color="blue"
    style="margin-right: 6px; cursor: pointer"
    @click="toggleFilterSelection(option)">
    <template #media>
      <f7-icon
        v-if="isFilterSelected(option)"
        ios="f7:checkmark_circle_fill"
        md="material:check_circle"
        aurora="f7:checkmark_circle_fill" />
    </template>
  </f7-chip>
</template>

<script lang="ts" setup>
import { isFieldValueToken, type FilterDefinition, type Token, type ParsedToken, type FieldValueToken } from '@/components/search-helpers'

const props = defineProps<{
  field: string
  filter: FilterDefinition
  token: FieldValueToken | null
}>()

const emits = defineEmits<{
  (e: 'update:token', token: FieldValueToken): void
  (e: 'add:token', token: FieldValueToken): void
  (e: 'delete:token', token: FieldValueToken): void
}>()

function isFilterSelected(value: string): boolean {
  if (!props.token || !isFieldValueToken(props.token)) return false

  const isSelected = props.token.values?.some((v) => v?.toLowerCase() === value.toLowerCase()) ?? false
  return (props.token.negated && !isSelected) || (!props.token.negated && isSelected)
}

function toggleFilterSelection(value: string): void {
  const selected = !isFilterSelected(value)

  if (!props.token) {
    if (selected) {
      emits('add:token', { type: 'fieldValue', field: props.field, values: [value], negated: false })
    }
    return
  }

  const tokenValue = props.token.values
  const tokenValues: string[] = Array.isArray(tokenValue) ? [...tokenValue] : tokenValue ? [tokenValue] : []
  if (selected) {
    tokenValues.push(value)
  } else {
    tokenValues.splice(
      tokenValues.findIndex((v) => v?.toLowerCase() === value.toLowerCase()),
      1
    )
  }

  if (tokenValues.length === 0) {
    emits('delete:token', props.token)
  } else {
    emits('update:token', { ...props.token, negated: false, values: tokenValues })
  }
}
</script>
