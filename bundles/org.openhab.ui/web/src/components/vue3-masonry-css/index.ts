// import { Plugin } from 'vue';
// import { type MasonryPluginOptions } from './types/plugin-options';
import MasonryGrid from './core/masonry-grid.vue'
import MasonryGridItem from './core/masonry-grid-item.vue'

/*
const Vue3Masonry: Plugin = {
  install(app, options?: MasonryPluginOptions) {
    app.component(options?.name ?? 'masonry-grid', MasonryGrid);
  },
};

// CDN compatibility
if (typeof window !== 'undefined') {
  (window as any).Vue3Masonry = Vue3Masonry;
}
*/

// export default Vue3Masonry;
export * from './types'
export * from './core'
