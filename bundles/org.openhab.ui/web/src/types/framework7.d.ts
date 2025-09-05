declare module 'framework7/lite-bundle' {
  export * from 'framework7/types'

  export function use (Framework7Vue: typeof import('framework7-vue/bundle')) {
    throw new Error('Function not implemented.')
  }
}

declare module 'framework7' {
  export * from 'framework7/types'
}