export default {
  uid: 'testwidget',
  component: 'f7-list',
  config: {
    simpleList: true
  },
  slots: {
    default: [
      {
        component: 'f7-list-item',
        config: {
        },
        slots: {
          default: [
            {
              component: 'f7-list-item-cell',
              config: {
                class: ['width-auto', 'flex-shrink-0']
              },
              slots: {
                default: [
                  {
                    component: 'f7-icon',
                    config: {
                      f7: 'speaker_fill'
                    }
                  }
                ]
              }
            },
            {
              component: 'f7-list-item-cell',
              slots: {
                default: [
                  {
                    component: 'f7-range',
                    config: {
                      min: 21.5, max: 33.5, value: 25.5, step: 0.5, label: true
                      // scale: true, scaleSubSteps: 4
                    }
                  }
                ]
              }
            },
            {
              component: 'f7-list-item-cell',
              config: {
                class: ['width-auto', 'flex-shrink-0']
              },
              slots: {
                default: [
                  {
                    component: 'f7-icon',
                    config: {
                      f7: 'speaker_3_fill'
                    }
                  }
                ]
              }
            }
          ]
        }
      }
    ]
  }
}
