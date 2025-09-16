#!/usr/bin/env node
import util from 'node:util'
import { exec } from 'node:child_process'
import fs from 'node:fs'

const promisifiedExec = util.promisify(exec)

const env = process.env.DEV ? 'development' : 'production'

const timestamp = new Date().toISOString().slice(0, 16).replaceAll(/[T:-]/g, '')
let version = process.argv[2] || (env === 'production' ? timestamp : 'development')
if (version.endsWith('SNAPSHOT')) version += '-' + timestamp

promisifiedExec('git rev-parse --short HEAD')
  .then(result => {
    return Promise.resolve(result.stdout.trim())
  })
  .then(commit => {
    if (env === 'development') commit = 'development'
    const content = `export default {
  version: '${version} ', // App version
  commit: '${commit || ''}' // UI commit hash
}
`

    fs.writeFileSync('./src/assets/build-info.js', content, {
      encoding: 'utf-8',
      flag: 'w'
    })
  })
