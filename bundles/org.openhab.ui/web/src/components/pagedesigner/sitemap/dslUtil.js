function writeWidget (widget, indent) {
  let dsl = ' '.repeat(indent)
  dsl += widget.component
  if (widget.config) {
    for (let key in widget.config) {
      if (!widget.config[key] && widget.config[key] !== 0) continue
      if ((Array.isArray(widget.config[key]) && widget.config[key].filter(Boolean).length <= 0)) continue
      if (key === 'switchEnabled') {
        dsl += ' switchSupport'
      } else if (key === 'frequency') {
        dsl += ' sendFrequency=' + widget.config[key]
      } else if (key === 'forceAsItem') {
        dsl += ' forceasitem=' + widget.config[key]
      } else {
        dsl += ` ${key}=`
        if (key === 'item' || key === 'period' || Number.isFinite(widget.config[key])) {
          dsl += widget.config[key]
        } else if (key === 'mappings') {
          dsl += '['
          dsl += widget.config[key].filter(Boolean).map(mapping => {
            return mapping.split('=').map(value => {
              if (/^[^"'].*\W.*[^"']$/.test(value)) {
                return '"' + value + '"'
              }
              return value
            }).join('=')
          }).join(',')
          dsl += ']'
        } else if (key === 'visibility') {
          dsl += '['
          dsl += widget.config[key].filter(Boolean).map(visibility => {
            let index = Math.max(visibility.lastIndexOf('='), visibility.lastIndexOf('>'), visibility.lastIndexOf('<')) + 1
            let value = visibility.substring(index)
            if (/^[^"'].*\W.*[^"']$/.test(value)) {
              value = '"' + value + '"'
            }
            return visibility.substring(0, index) + value
          }).join(',')
          dsl += ']'
        } else if (['valuecolor', 'labelcolor', 'iconcolor'].includes(key)) {
          dsl += '['
          dsl += widget.config[key].filter(Boolean).map(color => {
            let index = color.lastIndexOf('=') + 1
            let colorvalue = color.substring(index)
            if (/^[^"'].*\W.*[^"']$/.test(colorvalue)) {
              colorvalue = '"' + colorvalue + '"'
            }
            colorvalue = (index > 0 ? '=' + colorvalue : colorvalue)
            let value = color.substring(0, index - 1)
            index = Math.max(value.lastIndexOf('='), value.lastIndexOf('>'), value.lastIndexOf('<')) + 1
            let condition = value.substring(index)
            if (/^[^"'].*\W.*[^"']$/.test(condition)) {
              condition = '"' + condition + '"'
            }
            return color.substring(0, index) + condition + colorvalue
          }).join(',')
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
