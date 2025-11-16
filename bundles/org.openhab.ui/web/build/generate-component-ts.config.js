export default {
    defaultExportAs: 'enum',
    _Common: {
        ChartType: {
            modifier: (e) => e.replace('none', 'dynamic')
        },
        Type: {
            modifier: (e) => (e.includes('circle') ? e.replace('Type', 'GaugeType') : e)     // Duplicated Type common options, change for Gauge
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