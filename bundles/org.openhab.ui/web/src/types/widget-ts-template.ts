/**
 * This module provides utility template functions for validating and narrowing down unknown types to specific component and configuration types.
 * It includes type guard functions that ensure the structure of configuration objects and component objects match expected types, allowing for safer type assertions in TypeScript.
 */

/**
 * Represents a type predicate function used to validate and narrow down
 * an unknown type to a specific target type `T`.
 *
 * @template T - The target type that this guard validates.
 * @param config - An unverified type structure to check.
 * @returns `true` if the input matches type `T`, otherwise `false`.
 */
export type ConfigGuardFn<T> = (config: unknown) => config is T
export type ConfigValidationFn<T> = (config: Record<string, unknown>) => boolean

/**
 * Validates whether an unknown value is a non-null object and optionally
 * runs a custom validation function
 * After validation, the type of `config` is narrowed to `T` if the function returns `true`.
 *
 * @template T - The target type to narrow the configuration object to.
 * @param config - The unknown input structure to be validated.
 * @param validationFn - An optional custom function to perform deeper structural validation.
 * @returns `true` if the input is a valid object and passes validation, narrowing the type to `T`; otherwise `false`.
 */
export function guardConfig<T>(config: unknown, validationFn?: ConfigValidationFn<T>): config is T {
  if (!config || typeof config !== 'object' || Array.isArray(config)) return false
  return validationFn ? validationFn(config as Record<string, unknown>) : true
}

/**
 * Validates a component object's type identifier and its nested configuration,
 * dynamically injecting a default configuration if the field is missing.
 * After validation, the type of `component` narrowed to `TComponent` (with its `config` narrowed to type TConfig)
 * if the function returns `true`.
 *
 * @template TComponent - The structural component type containing a string `component` identifier and an optional `config`.
 * @template TConfig - The expected type of the nested configuration property.
 *
 * @param componentType - The expected string value of the component's type identifier.
 * @param component - The unknown component instance being evaluated.
 * @param isConfig - A type guard function used to structurally validate the component's nested configuration.
 * @param defaultConfig - An optional default configuration object to fall back on if `config` is missing.
 * @returns `true` if the component type matches and the nested config is valid (or successfully defaulted), narrowing the type; otherwise `false`.
 */
export function guardComponent<TComponent extends { component: string; config?: unknown }, TConfig>(
  componentType: string,
  component: unknown,
  isConfig: ConfigGuardFn<TConfig>,
  defaultConfig?: TConfig
): component is TComponent & { config: TConfig } {
  if (!component || typeof component !== 'object' || Array.isArray(component)) return false

  const candidate = component as Record<string, unknown>
  if (candidate.component !== componentType) return false

  if ((!('config' in candidate) || candidate.config === undefined) && defaultConfig) {
    candidate.config = defaultConfig
  }

  return isConfig(candidate.config)
}
