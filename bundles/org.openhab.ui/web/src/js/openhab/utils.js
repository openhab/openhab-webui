import diacritic from 'diacritic'

export default {
  normalizeLabel: (label) => {
    return diacritic.clean(label.normalize('NFKD')).replace(/\s+/g, '_').replace(/[^0-9a-z_]/gi, '')
  }
}
