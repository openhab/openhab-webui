export default {
  defaultExportAs: 'enum',
  '*': {
    // global modifier applied to all components
    modifier: (e) =>
      e
        .replace('actionPageDefineVars?: string', 'actionPageDefineVars?: Record<string, unknown>[]')
        .replace('taphold_actionPageDefineVars?: string', 'taphold_actionPageDefineVars?: Record<string, unknown>[]')
  },
  // modifiers to apply to all components in common.ts
  _Common: {
    '*': {
      modifier: (e) =>
        e.replace('export enum Period {', 'export type Period = `${number}${PeriodType}` | PeriodType\n\nexport enum PeriodType {')
    },
    ChartType: {
      modifier: (e) => e.replace('none', 'dynamic')
    },
    Type: {
      modifier: (e) => (e.includes('circle') ? e.replace('Type', 'GaugeType') : e) // Duplicated Type common options, change for Gauge
    }
  },
  // component specific modifiers to apply to component files
  OhAggregateSeries: {
    Dimension1: {
      modifier: (e) => e.replace('Dimension1', 'Dimension') // Create common Dimension type
    },
    Dimension2: {
      modifier: (e) => ''
    },
    _All: {
      modifier: (e) =>
        e.replace('Dimension1', 'Dimension').replace('Dimension2', 'Dimension').replace('markers?: Markers', 'markers?: Markers[]')
    }
  },
  OhGauge: {
    _All: {
      modifier: (e) => e.replaceAll(' Type', ' GaugeType')
    }
  },
  OhGaugeCard: {
    _All: {
      modifier: (e) => e.replaceAll(' Type', ' GaugeType')
    }
  },
  OhInputCard: {
    _All: {
      modifier: (e) => e.replace(/\s+outline\?: boolean/, '') // OhInputCard has multiple outline params
    }
  },
  OhCanvasLayout: {
    _All: {
      modifier: (e) =>
        `import { OhSvgElement } from '@/types/components/widgets'\n\n${e}`.replace(
          'embedSvgFlashing?: boolean',
          'embedSvgFlashing?: boolean\n' + '  embeddedSvgActions?: Record<string, OhSvgElement.Config>\n'
        ) // add embeddedSvgActions to type
    }
  },
  OhPlanPage: {
    _All: {
      modifier: (e) =>
        `import { OhSvgElement } from '@/types/components/widgets'\n\n${e}`.replace(
          'embedSvgFlashing?: boolean',
          'embedSvgFlashing?: boolean\n' + '  embeddedSvgActions?: Record<string, OhSvgElement.Config>'
        ) // add embeddedSvgActions to type
    }
  },
  OhCanvasItem: {
    _All: {
      modifier: (e) => e.replace('w\?: number', "w?: number | 'auto'").replace('h\?: number', "h?: number | 'auto'") // Fix auto type
    }
  }
}
