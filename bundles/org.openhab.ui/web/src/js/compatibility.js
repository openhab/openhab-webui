if (!Array.prototype.flat) {
  Array.prototype.flat = function (depth = 1) {
    return this.reduce(function (flat, toFlatten) {
      return flat.concat((Array.isArray(toFlatten) && (depth > 1)) ? toFlatten.flat(depth - 1) : toFlatten)
    }, [])
  }
}
