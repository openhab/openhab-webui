/**
 * Utility functions for wildcard and regex-based search matching.
 * Converts wildcard patterns to regular expressions
 */
function wildcardToRegex(pattern: string, isQuoted = false): string {
  let converted = pattern
    .replace(/[.+^${}()[\]\\]/g, '\\$&')
    .replace(/\*/g, '.*?')
    .replace(/\?/g, '.?')

  if (isQuoted) {
    return `(^|\\s)${converted}(\\s|$)`
  }

  return converted
}

/**
 * Creates cached search helpers for direct regex and wildcard-based matching.
 *
 * Wildcard patterns use `*` for any character sequence and `?` for a single
 * optional character, and are compiled lazily into regular expressions.
 *
 * @returns An object with helpers to build cached regular expressions and
 * clear the cache when compiled patterns should be discarded.
 */
export function useSearchMatch() {
  let cache = new Map<string, RegExp>()

  function getRegex(pattern: string, flags = 'i'): RegExp {
    const key = pattern + '::' + flags
    if (!cache.get(pattern)) {
      cache.set(pattern, new RegExp(pattern, flags))
    }
    return cache.get(pattern)!
  }

  function getWildcardRegex(pattern: string, flags = 'i'): RegExp {
    const key = 'wc::' + pattern + '::' + flags

    if (!cache.get(key)) {
      cache.set(key, new RegExp(wildcardToRegex(pattern), flags))
    }
    return cache.get(key)!
  }

  function clearCache() {
    cache.clear()
  }

  return { getRegex, getWildcardRegex, clearCache }
}
