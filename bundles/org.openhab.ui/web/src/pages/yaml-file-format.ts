import YAML from 'yaml'

type YamlObject = Record<string, unknown> & { uid: string; editable?: boolean }

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function createYamlStructureError(yamlElement: string, uid: string | null): Error {
  const singularElement = yamlElement.endsWith('s') ? yamlElement.slice(0, -1) : yamlElement
  const message = uid
    ? `The YAML must contain a single ${singularElement} with the uid "${uid}" under the "${yamlElement}" key.`
    : `The YAML must contain a single ${singularElement} under the "${yamlElement}" key with a "uid" property.`
  return new Error(message)
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
 * @param yamlElement - The top-level key under which the object should be wrapped (e.g., "pages", "widgets").
 * @param obj - The JavaScript object or array of objects to convert, each must include a "uid" property.
 * @returns A YAML string representing the object in the expected file format.
 */
export function toFileYAMLSyntax(yamlElement: string, obj: YamlObject | YamlObject[]): string {
  const fileObject: Record<string, unknown> = {
    version: 1,
    [yamlElement]: toYamlEntries(obj).reduce(
      (acc, yamlObject) => {
        const { uid, editable, ...objWithoutUidEditable } = yamlObject
        acc[uid] = objWithoutUidEditable
        return acc
      },
      {} as Record<string, unknown>
    )
  }

  return YAML.stringify(fileObject)
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
 * @param yamlElement - The top-level key under which the object is wrapped (e.g., "pages", "widgets").
 * @param yamlString - The YAML string to parse.
 * @param uid - The unique identifier of the object to extract.
 * @returns The JavaScript object corresponding to the specified `yamlElement` and `uid`.
 * @throws An error if the YAML structure does not match the expected format or if the specified `yamlElement` and `uid` are not found.
 */

export function fromFileYAMLSyntax(yamlElement: string, yamlString: string, uid: string | null): unknown {
  const obj = YAML.parse(yamlString) as unknown

  if (!isRecord(obj)) {
    throw createYamlStructureError(yamlElement, uid)
  }

  // Allow ingesting old syntax with uid at root level
  if ('config' in obj || 'slots' in obj) {
    return obj
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
    const extractedUid = entries[0][0]
    uid = extractedUid
  }

  const entry = isRecord(wrappedObj) ? wrappedObj[uid] : null

  if (!isRecord(entry)) {
    throw createYamlStructureError(yamlElement, uid)
  }

  return { uid, ...entry }
}
