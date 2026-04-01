export default {
    defaultExportAs: 'enum',
    '*': { // global modifier applied to all components
        modifier: (e) => e
          .replace('actionAnalyzerItems: string', 'actionAnalyzerItems?: string | string[]') // Fix array type
          .replace('taphold_actionAnalyzerItems: string', 'taphold_actionAnalyzerItems?: string | string[]') // Fix array type
          .replace('actionPageDefineVars?: string', 'actionPageDefineVars?: Record<string, unknown>[]')
          .replace('taphold_actionPageDefineVars?: string', 'taphold_actionPageDefineVars?: Record<string, unknown>[]')
    },
    // modifiers to apply to all components in common.ts
    _Common: {
        '*': {
            modifier: (e) => e.replace('export enum Period {', 'export type Period = `${number}${PeriodType}` | PeriodType\n\nexport enum PeriodType {')
        },
        ChartType: {
            modifier: (e) => e.replace('none', 'dynamic')
        },
        Type: {
            modifier: (e) => (e.includes('circle') ? e.replace('Type', 'GaugeType') : e)     // Duplicated Type common options, change for Gauge
        }
    },
    // component specific modifiers to apply to component files
    OhValueAxis: {
        _All: {
            modifier: (e) => e.replace('split?: Split', 'split?: Split[]')
        }
    },
    OhAggregateSeries: {
        Dimension1: {
            modifier: (e) => e.replace('Dimension1', 'Dimension')           // Create common Dimension type
        },
        Dimension2: {
            modifier: (e) => ''
        },
        _All: {
            modifier: (e) => e.replace('Dimension1', 'Dimension')
                    .replace('Dimension2', 'Dimension')
                    .replace('markers?: Markers', 'markers?: Markers[]')
        }
    },
    OhTimeSeries: {
        _All: {
            modifier: (e) => e.replace('markers?: Markers', 'markers?: Markers[]')
        }
    },
    OhCalendarSeries: {
        _All: {
            modifier: (e) => e.replace('markers?: Markers', 'markers?: Markers[]')
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
            modifier: (e) => e.replace(/\s+outline\?: boolean/, '')         // OhInputCard has multiple outline params
        }
    },
    OhCategoryAxis: {
        _All: {
            modifier: (e) => e.replace('data?: string', 'data?: string[]') // Fix array type
        }
    }
}
