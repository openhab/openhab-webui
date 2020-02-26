export default {
  uid: 'testwidget',
  component: 'f7-card',
  config: {
  },
  slots: {
    default: [
      {
        component: 'f7-card-header',
        slots: {
          default: [
            {
              component: 'Label',
              config: {
                text: '="Min: " + Math.floor(Math.min(items.Dimmer1.state, items.Dimmer2.state, items.Dimmer3.state, items.Dimmer4.state))'
              }
            },
            {
              component: 'Label',
              config: {
                text: '="Max: " + Math.floor(Math.max(items.Dimmer1.state, items.Dimmer2.state, items.Dimmer3.state, items.Dimmer4.state))'
              }
            }
          ]
        }
      },
      {
        component: 'f7-card-content',
        slots: {
          default: [
            // {
            //   component: 'f7-chip',
            //   config: {
            //     text: 'My chip!'
            //   }
            // },
            {
              component: 'f7-block',
              config: {
                class: ['text-align-center', 'margin']
              },
              slots: {
                default: [
                  {
                    component: 'f7-row',
                    config: {
                      class: ['display-flex', 'margin-bottom']
                    },
                    slots: {
                      default: [
                        { component: 'oh-slider', config: { item: 'MasterDimmer', class: ['padding', 'col'], label: true, scale: true, scaleSteps: 10, scaleSubSteps: 5 } }
                      ]
                    }
                  },
                  {
                    component: 'f7-row',
                    config: {
                      class: ['display-flex', 'margin-bottom']
                    },
                    slots: {
                      default: [
                        { component: 'Label', config: { class: "=['col', 'text-color-' + (items.Dimmer1 > 50 ? 'green' : 'red')]", text: 'Dimmer1' } },
                        { component: 'Label', config: { class: ['col'], text: 'Dimmer2' } },
                        { component: 'Label', config: { class: ['col'], text: 'Dimmer3' } },
                        { component: 'Label', config: { class: ['col'], text: 'Dimmer4' } }
                      ]
                    }
                  },
                  {
                    component: 'f7-row',
                    config: {
                      class: ['display-flex', 'margin-bottom']
                    },
                    slots: {
                      default: [
                        { component: 'oh-slider', config: { item: 'Dimmer1', color: "=(items.Dimmer1.state > 50) ? 'green' : 'red'", class: ['padding', 'col'], style: { height: '160px' }, vertical: true, label: true, scale: true } },
                        { component: 'oh-slider', config: { item: 'Dimmer2', color: "=(items.Dimmer2.state > 50) ? 'green' : 'red'", class: ['padding', 'col'], style: { height: '160px' }, vertical: true, label: true, scale: true } },
                        { component: 'oh-slider', config: { item: 'Dimmer3', color: "=(items.Dimmer3.state > 50) ? 'green' : 'red'", class: ['padding', 'col'], style: { height: '160px' }, vertical: true, label: true, scale: true } },
                        { component: 'oh-slider', config: { item: 'Dimmer4', color: "=(items.Dimmer4.state > 50) ? 'green' : 'red'", class: ['padding', 'col'], style: { height: '160px' }, vertical: true, label: true, scale: true } },
                      ]
                    }
                  }
                ]
              }
            }
            // {
            //   component: 'f7-block',
            //   config: {
            //     class: ['display-flex', 'justify-content-center', 'margin-bottom', 'margin-top']
            //   },
            //   slots: {
            //     default: [
            //       { component: 'oh-slider', config: { item: 'Dimmer1', color: "=(items.Dimmer1 > 50) ? 'green' : 'red'", class: ['margin-horizontal'], style: { height: '160px' }, vertical: true, label: true, scale: true } },
            //       { component: 'oh-slider', config: { item: 'Dimmer2', color: "=(items.Dimmer2 > 50) ? 'green' : 'red'", class: ['margin-horizontal'], style: { height: '160px' }, vertical: true } },
            //       { component: 'oh-slider', config: { item: 'Dimmer3', color: "=(items.Dimmer3 > 50) ? 'blue' : 'teal'", class: ['margin-horizontal'], style: { height: '160px' }, vertical: true } },
            //       { component: 'oh-slider', config: { item: 'Dimmer4', color: "=(items.Dimmer4 > 50) ? 'blue' : 'teal'", class: ['margin-horizontal'], style: { height: '160px' }, vertical: true } },
            //       { component: 'oh-slider', config: { item: 'Dimmer5', color: "=(items.Dimmer5 > 50) ? 'green' : 'red'", class: ['margin-horizontal'], style: { height: '160px' }, vertical: true } },
            //       { component: 'oh-slider', config: { item: 'Dimmer6', color: "=(items.Dimmer6 > 50) ? 'green' : 'red'", class: ['margin-horizontal'], style: { height: '160px' }, vertical: true } }
            //     ]
            //   }
            // }
          ]
        }
      },
      {
        component: 'f7-card-footer',
        config: {
        },
        slots: {
          default: [
            {
              component: 'f7-button',
              config: {
                disabled: '=items.Dimmer1.state > 50',
                fill: true,
                color: 'blue',
                text: '="Dimmer1 is " + ((items.Dimmer1.state > 50) ? "OK" : "too low")'
              }
            },
            {
              component: 'f7-link',
              config: {
                text: 'My other button',
                iconF7: 'calendar',
                iconSize: 24
              }
            },
            {
              component: 'oh-toggle',
              config: {
                item: 'TestSwitch'
              }
            }
            // {
            //   component: 'f7-link',
            //   config: {
            //     text: 'My third button',
            //     iconF7: 'tv',
            //     iconSize: 24
            //   }
            // }
          ]
        }
      }
    ]
  }
}
