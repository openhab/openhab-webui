import { pb } from '../helpers'

// omitted "params" accepting most parameters from https://swiperjs.com/

export default () => [
  pb('pagination', 'Pagination', 'Enable pagination'),
  pb('navigation', 'Navigation', 'Enable navigation'),
  pb('scrollbar', 'Scrollbar', 'Enable scrollbar')
]
