<template>
  <f7-stepper
    ref="stepper"
    v-bind="stepperConfig"
    :value="value"
    :input="config.enableInput === true"
    :format-value="formatValue"
    @stepper:plusclick="onPlusMinusClick"
    @stepper:minusclick="onPlusMinusClick"
    @input="onInput" />
</template>

<style lang="stylus">
.stepper-value
  margin-top 0
</style>

<script setup lang="ts">
import { useWidgetContext } from '@/components/widgets/useWidgetContext'
import { OhStepperDefinition } from '@/assets/definitions/widgets/system'
import { getVariableScope, getLastVariableKeyValue, setVariableKeyValues } from '@/components/widgets/variable'

import { useStatesStore } from '@/js/stores/useStatesStore'
import type { WidgetContext } from '@/components/widgets/types'
import { computed, useTemplateRef } from 'vue'
import type { Stepper } from 'framework7'
import type { OhStepper } from '@/types/components/widgets'

defineOptions({
  widget: OhStepperDefinition
})

const stepper = useTemplateRef<Stepper.Stepper>('stepper')

// props
const props = defineProps<{
  context: WidgetContext
}>()

// composables
const { config } = useWidgetContext(props.context)

// computed
const stepperConfig = computed<OhStepper.Config>(() => {
  const cfg = { ...config.value }
  delete cfg.value
  return cfg
})

const value = computed<number>(() => {
  const applyOffset = (num: number): number =>
    !isNaN(stepperConfig.value.offset as number) ? Number(toStepFixed(num + Number(stepperConfig.value.offset))) : num
  if (stepperConfig.value.variable) {
    const variableScope = getVariableScope(props.context.ctxVars ?? {}, props.context.varScope, stepperConfig.value.variable)
    const variableLocation = variableScope ? props.context.ctxVars![variableScope] : props.context.vars
    if (!variableLocation) return 0
    if (stepperConfig.value.variableKey) {
      return applyOffset(
        getLastVariableKeyValue(variableLocation[stepperConfig.value.variable]!, stepperConfig.value.variableKey) as number
      )
    }
    return applyOffset(variableLocation[stepperConfig.value.variable] as number)
  }
  let value = stepperConfig.value.item ? applyOffset(parseFloat(props.context.store![stepperConfig.value.item]!.state)) : 0
  if (stepperConfig.value.min !== undefined) value = Math.max(value, stepperConfig.value.min)
  if (stepperConfig.value.max !== undefined) value = Math.min(value, stepperConfig.value.max)
  return value
})

// methods
const formatValue = (value: number | string) => {
  return toStepFixed(value)
}
const toStepFixed = (value: number | string): string => {
  // uses the number of decimals in the step config to round the provided number
  if (!stepperConfig.value.step) return value.toString()
  const nbDecimals = Number(stepperConfig.value.step).toString().replace(',', '.').split('.')[1]
  // do NOT convert to number, instead return string, otherwise formatting wouldn't work
  return parseFloat(value as string).toFixed(nbDecimals ? nbDecimals.length : 0)
}
const onPlusMinusClick = () => {
  setTimeout(() => {
    sendCommand(stepper.value!.getValue())
  }, 10)
}
const onInput = () => {
  if (!stepperConfig.value.enableInput) return
  setTimeout(() => {
    const newValue = stepper.value!.getValue()
    // the check in the next line ensures that rounding does not cause the stepper to send commands on load
    if (value.value !== undefined && Math.abs(newValue - value.value) < (stepperConfig.value.step || 1)) return
    sendCommand(newValue)
  }, 1500)
}
const sendCommand = (cmd: number) => {
  const applyOffset = (num: number) =>
    !isNaN(stepperConfig.value.offset as number) ? Number(toStepFixed(num - Number(stepperConfig.value.offset))) : num
  let newValue = applyOffset(Number(toStepFixed(cmd)))
  if (isNaN(newValue)) newValue = stepperConfig.value.min ?? stepperConfig.value.max ?? 0
  if (newValue === value.value) return
  if (stepperConfig.value.variable) {
    const variableScope = getVariableScope(props.context.ctxVars ?? {}, props.context.varScope, stepperConfig.value.variable)
    const variableLocation = variableScope ? props.context.ctxVars![variableScope] : props.context.vars
    if (!variableLocation) return
    if (stepperConfig.value.variableKey) {
      newValue = applyOffset(
        setVariableKeyValues(variableLocation[stepperConfig.value.variable]!, stepperConfig.value.variableKey, cmd) as number
      )
    }
    variableLocation[stepperConfig.value.variable] = newValue
  } else if (stepperConfig.value.item) {
    useStatesStore().sendCommand(stepperConfig.value.item, newValue.toString())
  }
}
</script>
