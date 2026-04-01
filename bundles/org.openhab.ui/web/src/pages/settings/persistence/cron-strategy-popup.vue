<template>
  <f7-popup :opened="opened" @popup:opened="onOpened" class="cron-strategy-popup moduleconfig-popup">
    <f7-page v-if="opened">
      <f7-navbar>
        <f7-nav-left>
          <f7-link icon-ios="f7:arrow_left" icon-md="material:arrow_back" icon-aurora="f7:arrow_left" @click="closePopup" />
        </f7-nav-left>
        <f7-nav-title> {{ createMode ? 'Add Cron Strategy' : 'Edit Cron Strategy' }} </f7-nav-title>
        <f7-nav-right>
          <f7-link v-show="localCronStrategy.name && localCronStrategy.cronExpression" @click="onDone">
            {{ createMode ? 'Add' : 'Done' }}
          </f7-link>
        </f7-nav-right>
      </f7-navbar>
      <f7-block class="no-margin no-padding">
        <f7-col>
          <f7-list>
            <f7-list-input
              ref="name"
              label="Name"
              type="text"
              placeholder="Required"
              v-model:value="localCronStrategy.name"
              :disabled="!createMode ? true : null"
              :info="createMode ? 'Note: cannot be changed after the creation' : ''"
              required
              validate
              pattern="[A-Za-z0-9_]+"
              error-message="Required. Use only letters, numbers, and _." />
          </f7-list>
        </f7-col>
        <f7-col>
          <f7-block-title medium class="padding-bottom"> Configuration </f7-block-title>
          <f7-list>
            <f7-list-group>
              <parameter-cronexpression
                ref="cronExpression"
                :configDescription="cronExpressionConfigDescription"
                v-model:value="localCronStrategy.cronExpression" />
            </f7-list-group>
          </f7-list>
        </f7-col>
      </f7-block>
    </f7-page>
  </f7-popup>
</template>

<script setup lang="ts">
import { ref, computed, useTemplateRef, inject } from 'vue'
import { f7 } from 'framework7-vue'
import ParameterCronexpression from '@/components/config/controls/parameter-cronexpression.vue'

import * as api from '@/api'
import { persistenceKey } from '@/assets/definitions/persistence'

const nameRef = useTemplateRef('name')
const cronExpressionRef = useTemplateRef('cronExpression')
// Non-null assertion: this popup is only rendered within persistence-edit which always provides the key
const persistence = inject(persistenceKey)!

// Props and emits
const opened = defineModel<boolean>('opened')
const cronStrategy = defineModel<api.PersistenceCronStrategy | null>('cronStrategy', { required: true })
const emits = defineEmits<{
  (e: 'add:cronStrategy', cronStrategy: api.PersistenceCronStrategy): void
}>()

const newCronStrategy = {
  name: '',
  cronExpression: ''
} satisfies api.PersistenceCronStrategy

const localCronStrategy = ref<api.PersistenceCronStrategy>({} as api.PersistenceCronStrategy)

const cronExpressionConfigDescription = {
  label: 'Cron Expression',
  name: 'cronExpression',
  required: true
}

const createMode = computed(() => {
  return !cronStrategy.value
})

function onOpened() {
  localCronStrategy.value = cronStrategy.value ? { ...cronStrategy.value } : { ...newCronStrategy }
}

function closePopup() {
  opened.value = false
}

function onDone() {
  if (!f7.input.validateInputs(nameRef.value.$el) || !f7.input.validateInputs(cronExpressionRef.value.$el)) {
    f7.dialog.alert('Please review the configuration and correct validation errors')
    return
  }

  // Check for duplicates (unless editing existing)
  const existingIndex = persistence.value.cronStrategies.findIndex((cs) => cs.name === localCronStrategy.value.name)
  if (createMode.value && existingIndex !== -1) {
    f7.dialog.alert('A (cron) strategy with the same name already exists!')
    return
  }

  if (createMode.value) {
    emits('add:cronStrategy', { ...localCronStrategy.value })
  } else {
    cronStrategy.value = { ...localCronStrategy.value }
  }
  closePopup()
}
</script>
