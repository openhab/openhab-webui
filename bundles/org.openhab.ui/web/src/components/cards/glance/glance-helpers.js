/**
 * Check if the given semantic value is a child of the given potential parent semantic value
 * @param {String} semanticValue the vaue to be checked whether it is a child of the parent value
 * @param {String} potentialSemanticParent the potential parent semantic value
 * @returns true if semanticValue is a child of potentialSemanticParent
 */
export function isChildOf (semanticValue, potentialSemanticParent) {
  return (!semanticValue || semanticValue.trim() === '') ? false
    : semanticValue.indexOf(potentialSemanticParent) !== 0 ? false
      : semanticValue.length === potentialSemanticParent.length ? true
        : semanticValue.charAt(potentialSemanticParent.length) === '_'
}

/**
 * Retrieves equipment based on their semantic class
 * @param {Array} arr the array of equipment items & points to search
 * @param {String} value the semantic class (value) to find
 * @param {Boolean} partial match subclasses
 */
export function findEquipment (arr, value, partial) {
  return arr.filter((e) => (partial) ? isChildOf(e.item.metadata.semantics.value, value) : e.item.metadata.semantics.value === value)
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
 * @param {Boolean} children match child properties
 */
export function findPoints (arr, value, partial, property, children) {
  const points = arr.filter((p) => (partial) ? isChildOf(p.metadata.semantics.value, value) : p.metadata.semantics.value === value)
  if (!property) return points
  return points.filter((p) => (children) ? isChildOf(p.metadata.semantics.config.relatesTo, property) : p.metadata.semantics.config.relatesTo === property)
}
