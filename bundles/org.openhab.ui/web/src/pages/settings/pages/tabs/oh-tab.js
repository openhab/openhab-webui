// This component has no template, due to its special nature (has to add a tabbar to
// the host page) it'll simply be handled in the page renderers themselves

export default {
  widget: {
    name: 'oh-tab',
    title: 'Tab',
    description: 'Displays a page in a tab',
    props: {
      parameters: [
        {
          name: 'title',
          label: 'Title',
          type: 'TEXT',
          description: 'The title of the tab'
        },
        {
          name: 'icon',
          label: 'Icon',
          type: 'TEXT',
          description: 'The icon on the tab: use <code>f7:iconName</code> (<a class="external text-color-blue" target="_blank" href="https://framework7.io/icons/">Framework7 icon</a>)'
        },
        {
          name: 'page',
          label: 'Page',
          type: 'TEXT',
          context: 'page',
          description: 'The page to display'
        },
        {
          name: 'pageConfig',
          label: 'Page Configuration',
          type: 'TEXT',
          context: 'props',
          description: 'The parameters (props) to configure the page, if any'
        }
      ]
    }
  }
}
