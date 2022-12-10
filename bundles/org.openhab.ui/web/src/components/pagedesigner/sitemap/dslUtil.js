function writeWidget (widget, indent) {
  let dsl = ' '.repeat(indent)
  dsl += widget.component
  if (widget.config) {
    for (let key in widget.config) {
      if (!widget.config[key]) continue
      if ((Array.isArray(widget.config[key]) && widget.config[key].filter(Boolean).length <= 0)) continue
      if (key === 'switchEnabled') {
        dsl += ' switchSupport'
      } else if (key === 'frequency') {
        dsl += ' sendFrequency=' + widget.config[key]
      } else if (key === 'forceAsItem') {
        dsl += ' forceasitem=' + widget.config[key]
      } else {
        dsl += ` ${key}=`
        if (key === 'item' || Number.isFinite(widget.config[key])) {
          dsl += widget.config[key]
        } else if (['mappings', 'visibility', 'valuecolor', 'labelcolor', 'iconcolor'].includes(key)) {
          dsl += '[' + widget.config[key].filter(Boolean).join(',') + ']'
        } else {
          dsl += '"' + widget.config[key] + '"'
        }
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
