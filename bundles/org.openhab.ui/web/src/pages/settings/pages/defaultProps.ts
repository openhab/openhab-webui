import type { ConfigDescriptionParameter, ConfigDescriptionParameterGroup } from '@/api'

export type UIProps = {
  parameters: Array<ConfigDescriptionParameter>
  parameterGroups: Array<ConfigDescriptionParameterGroup>
}

export const createDefaultProps = (): UIProps => ({
  parameters: [],
  parameterGroups: []
})

export const resolveDefaultProps = (props: Record<string, unknown> | null | undefined): Record<string, unknown> => {
  return props && Object.keys(props).length ? props : createDefaultProps()
}
