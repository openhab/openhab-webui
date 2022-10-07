function writeWidget (widget, indent) {
  let dsl = ' '.repeat(indent)
  dsl += widget.component
  if (widget.config) {
    for (let key in widget.config) {
      if (!widget.config[key]) continue
      if (key === 'switchEnabled') {
        if (widget.config[key]) {
          dsl += ' switchSupport'
        }
      } else if (key === 'frequency') {
        dsl += ' sendFrequency=' + widget.config[key]
      } else if (key === 'forceAsItem') {
        dsl += ' forceasitem=' + widget.config[key]
      } else {
        dsl += ` ${key}=`
        if (key === 'item' || Number.isFinite(widget.config[key])) {
          dsl += widget.config[key]
        } else if (['mappings', 'visibility', 'valuecolor', 'labelcolor', 'iconcolor'].includes(key)) {
          dsl += '['
          const arrayDsl = widget.config[key].map((v) => {
            // Anything after the first comparator that is a string should be in quotes.
            // Also quote string if no comparator (i.e. fixed labelcolor or valuecolor).
            let value = v.substring(0, v.search(/[=<>]/))
            value += v.substring(v.search(/[=<>]/)).replace(/[a-zA-Z][a-zA-Z0-9 _\-]*/, function(x) {return '"' + x + '"'})
            return `${value}`      
          });
          dsl += arrayDsl.join(',')
          dsl += ']'
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
