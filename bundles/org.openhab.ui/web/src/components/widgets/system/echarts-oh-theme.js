import { registerTheme } from 'echarts/core'
import { useThemeStore } from '@/js/stores/useThemeStore';

export function registerCustomTheme() {
    console.log('Registering OH Theme for ECharts');
    const themeStore = useThemeStore();

    var backgroundColor = themeStore.ohVariables.get('--oh-background-color') || '#FFFFFF';
    var axisCommon = function () {
        return {
            axisLabel: {
                color: themeStore.ohVariables.get('--oh-text-color') || '#000000'
            },
            axisLine: {
                lineStyle: {
                    color: themeStore.ohVariables.get('--oh-text-color') || '#000000'
                }
            },
            splitLine: {
                lineStyle: {
                    color: themeStore.ohVariables.get('--oh-text-color') || '#484753'
                }
            },
            splitArea: {
                areaStyle: {
                    color: ['rgba(255,255,255,0.02)', 'rgba(255,255,255,0.05)']
                }
            },
            minorSplitLine: {
                lineStyle: {
                    color: '#20203B'
                }
            }
        };
    };

    function getColorPalette() {
      const colors = []
      for (let i = 1; i <= 10; i++) {
        const color = themeStore.ohVariables.get(`--oh-palette-${i}-color`)
        if (color) {
          colors.push(color.trim())
        }
      }
      return colors
    }

    var theme = {
        dark: true,
        color: getColorPalette(),
        backgroundColor: backgroundColor,
        axisPointer: {
            lineStyle: {
                color: '#817f91'
            },
            crossStyle: {
                color: '#817f91'
            },
            label: {
                color: themeStore.ohVariables.get('--oh-text-color') || '#000000',
                backgroundColor: themeStore.ohVariables.get('--oh-theme-alt-color-shade') || '#AAA'
            }
        },
        legend: {
            textStyle: {
                color: themeStore.ohVariables.get('--oh-text-color') || '#000000'
            }
        },
        textStyle: {
            color: themeStore.ohVariables.get('--oh-text-color') || '#000000'
        },
        title: {
            textStyle: {
                color: themeStore.ohVariables.get('--oh-text-color') || '#000000'
            },
            subtextStyle: {
                color: themeStore.ohVariables.get('--oh-text-alt-color') || '#000000'
            }
        },
        toolbox: {
            iconStyle: {
                borderColor: themeStore.ohVariables.get('--oh-text-color') || '#000000'
            }
        },
        dataZoom: {
            borderColor: '#71708A',
            textStyle: {
                color: themeStore.ohVariables.get('--oh-text-color') || '#000000'
            },
            brushStyle: {
                color: 'rgba(135,163,206,0.3)'
            },
            handleStyle: {
                color: '#353450',
                borderColor: '#C5CBE3'
            },
            moveHandleStyle: {
                color: '#B0B6C3',
                opacity: 0.3
            },
            fillerColor: 'rgba(135,163,206,0.2)',
            emphasis: {
                handleStyle: {
                    borderColor: '#91B7F2',
                    color: '#4D587D'
                },
                moveHandleStyle: {
                    color: '#636D9A',
                    opacity: 0.7
                }
            },
            dataBackground: {
                lineStyle: {
                    color: themeStore.getVar('--oh-text-color') || '#71708A',
                    width: 1
                },
                areaStyle: {
                    color: themeStore.getVar('--oh-text-color') || '#71708A'
                }
            },
            selectedDataBackground: {
                lineStyle: {
                    color: '#87A3CE'
                },
                areaStyle: {
                    color: '#87A3CE'
                }
            }
        },
        visualMap: {
            textStyle: {
                color: themeStore.ohVariables.get('--oh-text-color') || '#000000'
            }
        },
        timeline: {
            lineStyle: {
                color: themeStore.getVar('--oh-text-color') || '#000000'
            },
            label: {
                color: themeStore.getVar('--oh-text-color') || '#000000'
            },
            controlStyle: {
                color: themeStore.getVar('--oh-text-color') || '#000000',
                borderColor: themeStore.getVar('--oh-text-color') || '#71708A'
            }
        },
        calendar: {
            itemStyle: {
                color: backgroundColor
            },
            dayLabel: {
                color: themeStore.ohVariables.get('--oh-text-color') || '#000000'
            },
            monthLabel: {
                color: themeStore.ohVariables.get('--oh-text-color') || '#000000'
            },
            yearLabel: {
                color: themeStore.ohVariables.get('--oh-text-color') || '#000000'
            }
        },
        timeAxis: axisCommon(),
        logAxis: axisCommon(),
        valueAxis: axisCommon(),
        categoryAxis: axisCommon(),

        line: {
            symbol: 'circle'
        },
        graph: {
            color: getColorPalette()
        },
        gauge: {
            title: {
                color: themeStore.ohVariables.get('--oh-text-color') || '#000000'
            }
        },
        candlestick: {
            itemStyle: {
                color: themeStore.ohVariables.get('--oh-red-color') || '#FF0000',
                color0: themeStore.ohVariables.get('--oh-green-color') || '#0CF49B',
                borderColor: themeStore.ohVariables.get('--oh-red-color-shade') || '#FF0000',
                borderColor0: themeStore.ohVariables.get('--oh-green-color-shade') || '#0CF49B'
            }
        }
    };
    theme.categoryAxis.splitLine.show = false;
    registerTheme('oh-theme', theme);
}
