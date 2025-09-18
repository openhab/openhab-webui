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
 * @param {Array} arr the array of equipment items & points to search
 * @param {String} value the semantic class (value) to find
 * @param {Boolean} partial match subclasses
 * @param {Boolean} subEquipment include sub-equipment
 */
export function findEquipment (arr, value, partial, subEquipment) {
  const equipment = [...(arr.filter((e) => (partial) ? isChildOf(e.metadata?.semantics?.value, value) : e.metadata?.semantics?.value === value))]
  if (subEquipment) {
    equipment.push(...arr.filter((e) => e.equipment).map((e) => findEquipment(e.equipment, value, partial, subEquipment)).flat())
  }
  return equipment
}

/**
 * Retrieve the flatten list of points from the provided equipment collection
 * @param {Array} equipment the equipment collection
 * @param {Boolean} subEquipment include points on sub-equipment
 */
export function allEquipmentPoints (equipment, subEquipment) {
  const points = [...(equipment.map((e) => e.points || []).flat())]
  if (subEquipment) {
    points.push(...equipment.filter((e) => e.equipment).map((e) => allEquipmentPoints(e.equipment, subEquipment)).flat())
  }
  return points
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
  return arr.filter((e) => !allEquipmentPoints([e], subEquipment).some((p) => points.includes(p)))
}
