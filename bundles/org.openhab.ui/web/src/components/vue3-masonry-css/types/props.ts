import { type Breakpoint } from './breakpoint'

export type MasonryProps = {
  /**
   * Define static column count or dynamic column count using breakpoints.
   *
   * @example
   * ```vue
   * <!-- Static column count -->
   * <masonry :cols="3">...</masonry>
   * ```
   * @example
   * ```vue
   * <!-- Dynamic column count -->
   * <masonry :cols="{ default: 4, 1920: 3, 1366: 2, 1280: 1 }">...</masonry>
   * ```
   * @default 2
   */
  columns?: Breakpoint<number>;

  /**
   * Define static gutter width or dynamic gutter width using breakpoints.
   *
   * The value can be a number (e.g. `10` for `10px`) or a string value (e.g. `10px` or `2rem`).
   *
   * @example
   * ```vue
   * <!-- Static gutter width -->
   * <masonry :gutter="10">...</masonry>
   * <masonry :gutter="'2rem'">...</masonry>
   * ```
   *
   * @example
   * ```vue
   * <!-- Dynamic gutter width -->
   * <masonry :gutter="{ default: 50, 1920: '30px', 1366: '2rem' }">...</masonry>
   * ```
   */
  gutter?: Breakpoint<string | number>;

  /**
   * Set to `false` if you want to use custom styling.
   * @default true
   */
  css?: boolean;

  /**
   * Wrapper tag name.
   * @default 'div'
   */
  tag?: string;

  /**
   * Custom wrapper class.
   */
  class?: any;

  /**
   * Column tag name.
   * @default 'div'
   */
  columnTag?: string;

  /**
   * Custom column class.
   */
  columnClass?: any;

  /**
   * Custom column attributes.
   */
  columnAttr?: any;

  /**
   * Child tag name.
   * @default 'div'
   */
  childTag?: string;

  /**
   * Custom child class.
   */
  childClass?: any;

  /**
   * Custom child attributes.
   */
  childAttr?: any;
};
