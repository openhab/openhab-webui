// type definitions for DTOs returned from /rest/config-descriptions endpoints

/**
 * The supported data types a configuration parameter can take (From ConfigDescriptionParameter.java).
 */
export type Type = 'TEXT' | 'INTEGER' | 'DECIMAL' | 'BOOLEAN';

/**
 * Data transfer object for a static selection list option. (From ParameterOption.java structure)
 */
export interface ParameterOption {
  /** The value of the option. */
  value: string;
  /** A human-readable label for the option. */
  label: string;
}

/**
 * Data transfer object for filter criteria for a dynamic selection list.
 * (Inferred structure based on usage of FilterCriteria in the core model)
 */
export interface FilterCriteria {
  /** The name of the criterion. */
  name: string;
  /** The value of the criterion. */
  value: string;
}

/**
 * Data transfer object used to serialize a parameter of a configuration description.
 * Based on org.openhab.core.config.core.dto.ConfigDescriptionParameterDTO.java.
 */
export interface ConfigDescriptionParameter {
  /** The name of the configuration parameter (must not be null or empty). */
  name: string;
  /** The data type of the configuration parameter (must not be null). */
  type: Type;
  /** The context of the configuration parameter, a hint for user interfaces and input validators. */
  context?: string;
  /** The default value of the configuration parameter (JSON field 'default' or 'defaultValue'). */
  default?: string;
  /** The default value of the configuration parameter (JSON field 'default' or 'defaultValue'). */
  defaultValue?: string;
  /** A human-readable description for the configuration parameter. */
  description?: string;
  /** A human-readable label for the configuration parameter. */
  label?: string;
  /** The minimal value for numeric types, minimal length for strings, or minimal number of selected options. */
  min?: number | string;
  /** The maximal value for numeric types, maximal length for strings, or maximal number of selected options. */
  max?: number | string;
  /** The value granularity for a numeric value. By setting the step size to 0, any granularity is allowed. */
  stepsize?: number | string;
  /** The regular expression pattern for a text type. */
  pattern?: string;
  /** Specifies whether the value is required. */
  required?: boolean;
  /** Specifies whether the value is read-only. */
  readOnly?: boolean;
  /** Specifies whether multiple selections of options are allowed. */
  multiple?: boolean;
  /** The maximum number of options that can be selected when multiple is true. */
  multipleLimit?: number;
  /** A string used to group parameters together into logical blocks so that the UI can display them together. */
  groupName?: string;
  /** Specifies if this is an advanced parameter. An advanced parameter can be hidden in the UI. */
  advanced?: boolean;
  /** Specifies whether the parameter should be considered dangerous and alert the user. */
  verify?: boolean;
  /** Specifies that the user's input is limited to the provided options). */
  limitToOptions?: boolean;
  /** Specifies the unit of measurements for the configuration parameter. */
  unit?: string;
  /** Specifies the unit label for the configuration parameter. */
  unitLabel?: string;
  /** A list of element definitions of a static selection list. */
  options?: ParameterOption[];
  /** A list of filter criteria for a dynamically created selection list. */
  filterCriteria?: FilterCriteria[];
}
