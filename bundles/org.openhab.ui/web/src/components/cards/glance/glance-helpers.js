/**
 * Retrieves equipment based on their semantic class
 * @param {Array} arr the array of equipment items & points to search
 * @param {String} value the semantic class (value) to find
 * @param {Boolean} partial match subclasses
 */
export function findEquipment (arr, value, partial) {
  return arr.filter((e) => (partial) ? e.item.metadata.semantics.value.indexOf(value) === 0 : e.item.metadata.semantics.value === value)
}

/**
 * Retrieve the flatten list of points from the provided equipment collection
 * @param {Array} equipment the equipment collection
 */
export function allEquipmentPoints (equipment) {
  return equipment.map((e) => e.points || []).flat()
}

/**
 * Retrieves points based on their semantic class and eventual related property
 * @param {Array} arr the array of source points
 * @param {String} value the semantic class (value) to find
 * @param {Boolean} partial match subclasses
 * @param {String} property return only points also related to this property
 */
export function findPoints (arr, value, partial, property) {
  const points = arr.filter((p) => (partial) ? p.metadata.semantics.value.indexOf(value) === 0 : p.metadata.semantics.value === value)
  if (!property) return points
  return points.filter((p) => p.metadata.semantics.config.relatesTo === property)
}
