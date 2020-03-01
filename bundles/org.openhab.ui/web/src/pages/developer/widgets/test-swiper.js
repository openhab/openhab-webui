export default {
  uid: 'testswiper',
  component: 'f7-swiper',
  config: {
    pagination: true,
    navigation: true,
    scrollbar: true,
    params: {
      // freeMode: true,
      grabCursor: true,
      // effect: 'cube',
      speed: 600,
      // slidesPerView: 3,
      spaceBetween: 20,
      mousewheel: true,
      pagination: {
        clickable: true
      },
      scrollbar: {
        draggable: true
      },
      fadeEffect: {
        crossFade: true
      },
      keyboard: {
        enabled: true,
        onlyInViewport: false
      }      
    }
  },
  slots: {
    default: [
      {
        component: 'f7-swiper-slide',
        slots: {
          default: [
            {
              component: 'Label',
              config: {
                text: '=items.Switch1.state',
                style: {
                  'line-height': '200px',
                  'background': 'white',
                  'text-align': 'center'
                }
              }
            }
          ]
        }
      },
      {
        component: 'f7-swiper-slide',
        slots: {
          default: [
            {
              component: 'Label',
              config: {
                text: 'Slide2',
                style: {
                  'line-height': '200px',
                  'background': 'white',
                  'text-align': 'center'
                }
              }
            }
          ]
        }
      },
      {
        component: 'f7-swiper-slide',
        slots: {
          default: [
            {
              component: 'Label',
              config: {
                text: 'Slide3',
                style: {
                  'line-height': '200px',
                  'background': 'white',
                  'text-align': 'center'
                }
              }
            }
          ]
        }
      },
      {
        component: 'f7-swiper-slide',
        slots: {
          default: [
            {
              component: 'Label',
              config: {
                text: 'Slide4',
                style: {
                  'line-height': '200px',
                  'background': 'white',
                  'text-align': 'center'
                }
              }
            }
          ]
        }
      },
      {
        component: 'f7-swiper-slide',
        slots: {
          default: [
            {
              component: 'Label',
              config: {
                text: 'Slide5',
                style: {
                  'line-height': '200px',
                  'background': 'white',
                  'text-align': 'center'
                }
              }
            }
          ]
        }
      },
      {
        component: 'f7-swiper-slide',
        slots: {
          default: [
            {
              component: 'Label',
              config: {
                text: 'Slide6',
                style: {
                  'line-height': '200px',
                  'background': 'white',
                  'text-align': 'center'
                }
              }
            }
          ]
        }
      }
    ]
  }
}
