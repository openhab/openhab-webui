import { pb, pt } from '../helpers.js'

export default () => [
  pb('simpleList', 'Simple List', 'Use for simple lists'),
  pb('mediaList', 'Media List', 'Use for list with rich list items with icons'),
  pb('accordionList', 'Accordion List', 'Use for lists with accordion (collapsible) items'),
  pt('background', 'Background', 'Set background of the card'),
  pt('headline', 'Headline', 'Set headline'),
  pt('subheadline', 'Subheadline', 'Set subheadline')
]
