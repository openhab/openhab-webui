function writeWidget (widget, indent) {
  let dsl = ' '.repeat(indent)
  dsl += widget.component
  if (widget.config) {
    for (let key in widget.config) {
      if (!widget.config[key] && widget.config[key] !== 0) continue
      if ((Array.isArray(widget.config[key]) && widget.config[key].filter(Boolean).length <= 0)) continue
      if (key === 'switchEnabled') {
        dsl += ' switchSupport'
      } else if (key === 'releaseOnly') {
        dsl += ' releaseOnly'
      } else if (key === 'forceAsItem') {
        dsl += ' forceasitem=' + widget.config[key]
      } else if (key === 'icon') {
        if (widget.config.staticIcon) {
          dsl += ' staticIcon=' + widget.config[key]
        } else if (!widget.config['iconrules'] || widget.config['iconrules'].length === 0) {
          dsl += ' icon=' + widget.config[key]
        }
      } else if (key !== 'staticIcon') {
        if (key === 'iconrules') {
          dsl += ' icon='
        } else {
          dsl += ` ${key}=`
        }
        if (key === 'item' || key === 'period' || key === 'legend' || Number.isFinite(widget.config[key])) {
          dsl += widget.config[key]
        } else if (key === 'mappings') {
          dsl += '[' + widget.config[key].filter(Boolean).map(mapping => {
            return mapping
          }).join(', ') + ']'
        } else if (key === 'buttons') {
          dsl += '[' + widget.config[key].filter(Boolean).map(button => {
            return button.row + ':' + button.column + ':' + button.command
          }).join(', ') + ']'
        } else if (key === 'visibility') {
          dsl += '[' + widget.config[key].filter(Boolean).map(rule => {
            return writeCondition(rule)
          }).join(', ') + ']'
        } else if (['valuecolor', 'labelcolor', 'iconcolor', 'iconrules'].includes(key)) {
          dsl += '[' + widget.config[key].filter(Boolean).map(rule => {
            return writeCondition(rule, true)
          }).join(', ') + ']'
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

function writeCondition (rule, hasArgument = false) {
  let argument = ''
  let conditions = rule
  if (hasArgument) {
    let index = rule.lastIndexOf('=') + 1
    argument = rule.substring(index).trim()
    if (!/^(".*")|('.*')$/.test(argument)) {
      argument = '"' + argument + '"'
    }
    argument = (index > 0 ? '=' + argument : argument)
    conditions = rule.substring(0, index - 1)
  }
  return conditions.split(' AND ').map(condition => {
    let index = Math.max(condition.lastIndexOf('='), condition.lastIndexOf('>'), condition.lastIndexOf('<')) + 1
    let conditionValue = condition.substring(index).trim()
    if (/^.*\W.*$/.test(conditionValue) && /^[^"'].*[^"']$/.test(conditionValue)) {
      conditionValue = '"' + conditionValue + '"'
    }
    return condition.substring(0, index) + conditionValue
  }).join(' AND ') + argument
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
