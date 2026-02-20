/**
 * ScopeCSS - Scope CSS selectors to a parent element
 */

declare module 'scope-css' {

    export interface ScopeCSSOptions {
    /**
     * Prefix for keyframe animations.
     * - `true`: Use parent class name as prefix
     * - `string`: Use the provided string as prefix
     * - `undefined`: Skip keyframe scoping
     */
    keyframes?: boolean | string
    }

    /**
     * Scopes CSS selectors to a parent element, allowing isolated style application.
     *
     * @param css - The CSS content to scope
     * @param parent - The parent selector to scope under
     * @param options - Configuration options for scoping behavior
     * @returns The scoped CSS string, or the original CSS if css or parent is falsy
     */
    export default function scope(
    css: string | null | undefined,
    parent: string | null | undefined,
    options?: ScopeCSSOptions | string
    ): string

    /**
     * Internal helper function that applies a replacer pattern to CSS selectors.
     * Handles string literals and comments correctly during replacement.
     *
     * @param css - The CSS content to process
     * @param replacer - The replacement pattern where `$1` is the selector and `$2` is the suffix
     * @returns The processed CSS string
     */
    export function replace(css: string, replacer: string): string

    /**
     * Alias for the replace function on the scope object
     */
    export namespace scope {
    function replace(css: string, replacer: string): string
    }
}
