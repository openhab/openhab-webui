function writeWidget (widget, indent) {
  let dsl = ' '.repeat(indent)
  dsl += widget.component
  if (widget.config) {
    for (let key in widget.config) {
      if (!widget.config[key]) continue
      dsl += ` ${key}=`
      if (key === 'item' || Number.isFinite(widget.config[key])) {
        dsl += widget.config[key]
      } else if (key === 'mappings') {
        dsl += '['
        const mappingsDsl = widget.config.mappings.map((m) =>
          `${m.split('=')[0]}="${m.substring(m.indexOf('=') + 1)}"`
        )
        dsl += mappingsDsl.join(',')
        dsl += ']'
      } else {
        dsl += '"' + widget.config[key] + '"'
      }
    }
  }
  if (widget.slots) {
    dsl += ' {\n'
    widget.slots.widgets.forEach((w) => {
      dsl += writeWidget(w, indent + 4)
    })
    dsl += ' '.repeat(indent) + '}'
  }
  dsl += '\n'

  return dsl
}

export default {
  toDsl (sitemap) {
    let dsl = 'sitemap ' + sitemap.uid
    if (sitemap.config && sitemap.config.label) {
      dsl += ` label="${sitemap.config.label}"`
    }
    dsl += ' {\n'
    if (sitemap.slots && sitemap.slots.widgets) {
      sitemap.slots.widgets.forEach((w) => {
        dsl += writeWidget(w, 4)
      })
    }
    dsl += '}\n'

    return dsl
  }
}
