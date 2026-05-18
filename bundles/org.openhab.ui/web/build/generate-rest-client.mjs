#!/usr/bin/env node

import fetch from 'node-fetch'
import fs from 'node:fs'
import { parseArgs } from 'node:util'
import { createClient } from '@hey-api/openapi-ts'
import { execSync } from 'node:child_process'

const options = {
  url: { type: 'string' },
  file: { type: 'string' }
}

const { values } = parseArgs({ options })

const url = values.url ? new URL(values.url) : null
const file = values.file || './build/openhab-api-spec.json'

const outpath = './src/api'

let openApi = null

if (url) {
  process.stdout.write(`Fetching OpenAPI spec from URL ${url.href} ... `)

  try {
    openApi = await fetch(url).then((res) => res.json())
  } catch (error) {
    process.stderr.write('ERROR fetching/saving OpenAPI spec:', error)
    process.exit(1)
  }
  process.stdout.write('DONE\n')

  process.stdout.write(`Saving OpenAPI spec to file ${file} ... `)
  fs.writeFileSync(file, JSON.stringify(openApi, null, 2))
  process.stdout.write('DONE\n')

  try {
    process.stdout.write(`Applying oxfmt to ${file} ... `)
    execSync(`oxfmt ${file}`, { stdio: 'ignore' })
    process.stdout.write('DONE\n')
  } catch (fmtError) {
    process.stdout.write('WARN: oxfmt failed or is not installed. Continuing with client generation.\n')
  }
}

if (file && !openApi) {
  process.stdout.write(`Reading OpenAPI spec from file ${file} ... `)
  try {
    const data = fs.readFileSync(file, 'utf8')
    openApi = JSON.parse(data)
  } catch (error) {
    process.stderr.write('ERROR reading OpenAPI spec from file:', error)
    process.exit(1)
  }
  process.stdout.write('DONE\n')
}

try {
  await createClient({
    client: '@hey-api/client-fetch',
    input: openApi,
    output: outpath,
    parser: {
      transforms: {
        propertiesRequiredByDefault: true
      }
    },
    plugins: [
      {
        name: '@hey-api/sdk',
        responseStyle: 'data',
        paramsStructure: 'flat'
      }
    ]
  })
} catch (error) {
  console.error('Error creating client:', error)
}
