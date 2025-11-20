/**
 * Check if the given semantic value is a child of the given potential parent semantic value
 * @param {String} semanticValue the value to be checked whether it is a child of the parent value
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
 * @param {Array} arr the array of equipment items and points to search
 * @param {String} value the semantic class (value) to find
 * @param {Boolean} partial match subclasses
 * @param {Boolean} subEquipment include sub-equipment
 */
export function findEquipment (arr, value, partial, subEquipment) {
  const equipment = arr.filter((e) => (partial) ? isChildOf(e.metadata?.semantics?.value, value) : e.metadata?.semantics?.value === value)
  if (subEquipment) {
    equipment.push(
      ...arr
        .filter((e) => e.equipment)
        .map((e) => findEquipment(e.equipment, value, partial, subEquipment))
        .flat()
    )
  }
  return equipment
}

/**
 * Retrieve the flattened list of points from the provided equipment collection
 * @param {Array} equipment the equipment collection
 * @param {boolean} subEquipment include points on sub-equipment
 * @return {Array} the flattened list of points
 */
export function allEquipmentPoints (equipment, subEquipment) {
  const points = equipment.flatMap((e) => e.points || [])
  if (subEquipment) {
    points.push(
      ...equipment
        .filter((e) => e.equipment)
        .map((e) => allEquipmentPoints(e.equipment, subEquipment))
        .flat()
    )
  }
  return points
}

/**
 * Checks whether the provided equipment collection has any of the provided points.
 * @param {Array} equipment the equipment collection
 * @param {boolean} subEquipment include points on sub-equipment
 * @param {Array|Set} points points to check for
 * @return {boolean}
 */
export function equipmentHasPoint (equipment, subEquipment, points) {
  if (Array.isArray(points)) points = new Set(points)
  if (equipment.points && equipment.points.some((p) => points.has(p))) {
    return true
  }

  if (subEquipment && equipment.equipment) {
    return equipment.equipment.some((child) => equipmentHasPoint(child, subEquipment, points))
  }

  return false
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
  if (!arr) return []
  const points = arr.filter((p) => (partial) ? isChildOf(p.metadata?.semantics?.value, value) : p.metadata?.semantics?.value === value)
  if (!property) return points
  return points.filter((p) => (children) ? isChildOf(p.metadata?.semantics?.config?.relatesTo, property) : p.metadata?.semantics?.config?.relatesTo === property)
}

/**
 * Returns a filtered list of equipment that has no points in the list of points
 * @param {Array} arr the array of equipment
 * @param {Array} points an array of points to check against
 * @param {Boolean} subEquipment also check points on sub-equipment
 */
export function equipmentNoPointsSelected (arr, points, subEquipment) {
  // use Set for lookup in O(1) time
  const pointsSet = new Set(points)

  return arr.filter((e) => !equipmentHasPoint(e, subEquipment, pointsSet))
}
