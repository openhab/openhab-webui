import YAML from 'yaml'

type YamlObject = Record<string, unknown> & {
  uid: string
  editable?: boolean
  timestamp?: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * Error thrown when the YAML structure does not match the expected format.
 */
export class YamlStructureError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'YamlStructureError'
  }
}

function createYamlStructureError(yamlElement: string, uid: string | null): YamlStructureError {
  const singularElement = yamlElement.endsWith('s') ? yamlElement.slice(0, -1) : yamlElement
  const message = uid
    ? `The YAML must contain a single ${singularElement} with the uid "${uid}" under the "${yamlElement}" key.`
    : `The YAML must contain a single ${singularElement} under the "${yamlElement}" key, with the entry key used as the uid.`
  return new YamlStructureError(message)
}

function toYamlEntries(obj: YamlObject | YamlObject[]): YamlObject[] {
  return Array.isArray(obj) ? obj : [obj]
}

/**
 * Converts one or more JavaScript objects to a YAML string in the file format expected by openHAB.
 * Each object is wrapped inside the `yamlElement` key, and its `uid` property is used as the key within that element.
 *
 * The expected YAML structure looks like this:
 *
 * ```yaml
 * version: 1
 * <yamlElement>:
 *  <uid>:
 *   <object properties>
 * ```
 *
 * Multiple objects can be wrapped under the same `yamlElement` when an array of objects is provided, each with its own `uid`.
 *
 * @param yamlElement The top-level key under which the object should be wrapped (e.g., "pages", "widgets").
 * @param obj The JavaScript object or array of objects to convert, each must include an `uid` property.
 * @returns A YAML string representing the object in the expected file format.
 */
export function toFileYAMLSyntax(yamlElement: string, obj: YamlObject | YamlObject[]): string {
  const fileObject: Record<string, unknown> = {
    version: 1,
    [yamlElement]: toYamlEntries(obj).reduce(
      (acc, yamlObject) => {
        const { uid, editable, timestamp, ...strippedObj } = yamlObject
        acc[uid] = strippedObj
        return acc
      },
      {} as Record<string, unknown>
    )
  }

  return YAML.stringify(fileObject, { lineWidth: 0 })
}

/**
 * Parses a YAML string in the expected file format and extracts the JavaScript object for a specific `yamlElement` and `uid`.
 *
 * The expected YAML structure is:
 *
 * ```yaml
 * version: 1
 * <yamlElement>:
 *  <uid>:
 *   <object properties>
 * ```
 *
 * It also supports the old syntax that does not have the `yamlElement` wrapping, allowing ingestion of old YAML syntax.
 *
 * @typeParam T The type of the JavaScript object to return. Defaults to `unknown`.
 * @param yamlElement The top-level key under which the object is wrapped (e.g., "pages", "widgets").
 * @param yamlString The YAML string to parse.
 * @param uid The unique identifier of the object to extract.
 * @returns The JavaScript object corresponding to the specified `yamlElement` and `uid`.
 * @throws YamlStructureError if the YAML structure does not match the expected format, or if the specified `yamlElement` and `uid` are not found.
 */
export function fromFileYAMLSyntax<T = unknown>(yamlElement: string, yamlString: string, uid: string | null): T {
  const obj = YAML.parse(yamlString, { prettyErrors: true }) as unknown

  if (!isRecord(obj)) {
    throw createYamlStructureError(yamlElement, uid)
  }

  // Allow ingesting old syntax with uid at root-level
  if ('config' in obj || 'slots' in obj) {
    return obj as T
  }

  const wrappedObj = obj[yamlElement]
  if (uid === null) {
    // create mode - extract uid from YAML
    if (!isRecord(wrappedObj)) {
      throw createYamlStructureError(yamlElement, uid)
    }
    const entries = Object.entries(wrappedObj)
    if (entries.length !== 1) {
      throw new Error(`Expected exactly one entry under "${yamlElement}", but found ${entries.length}.`)
    }
    uid = entries[0][0]
  }

  const entry = isRecord(wrappedObj) ? wrappedObj[uid] : null

  if (!isRecord(entry)) {
    throw createYamlStructureError(yamlElement, uid)
  }

  return { uid, ...entry } as T
}
