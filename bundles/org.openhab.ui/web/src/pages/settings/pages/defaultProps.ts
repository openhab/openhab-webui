export type UIProps = {
  parameters: unknown[]
  parameterGroups: unknown[]
}

export const createDefaultProps = (): UIProps => ({
  parameters: [],
  parameterGroups: []
})

export const resolveDefaultProps = (props: Record<string, unknown> | null | undefined): Record<string, unknown> => {
  return props && Object.keys(props).length ? props : createDefaultProps()
}
