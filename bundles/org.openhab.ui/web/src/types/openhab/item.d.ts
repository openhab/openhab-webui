export interface StateDescriptionOption {
  value: string
  label: string
}

export interface StateDescription {
  minimum?: number
  maximum?: number
  step?: number
  pattern?: string
  readOnly: boolean
  options: StateDescriptionOption[]
}

export interface CommandDescriptionOption {
  command: string
  label: string
}

export interface CommandDescription {
  commandOptions: CommandDescriptionOption[]
}

export interface MetadataValue {
  value?: string
  config?: { [key: string]: any }
  editable?: boolean
}

export interface Metadata {
  [key: string]: MetadataValue
}

export interface FunctionDescription {
  name: string
  params?: string[]
}

export interface Item {
  link: string
  editable: boolean
  type: string
  name: string
  label?: string
  category?: string
  tags: string[]
  groupNames: string[]
  stateDescription?: StateDescription
  commandDescription?: CommandDescription
  metadata?: Metadata
  groupType?: string
  function?: FunctionDescription
}