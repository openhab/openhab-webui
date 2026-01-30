#!/usr/bin/env node

import fetch from 'node-fetch'
import fs from 'node:fs'
import { createClient } from '@hey-api/openapi-ts'

// const url = `https://api.swaggerhub.com/apis/wborn/openhab-rest-api/8/swagger.json`
// const url = `https://demo.openhab.org/rest/spec`
const url = null
const file = './build/openhab-api-spec.json'

const outpath = './src/api'

let openApi = null

if (url) {
  console.log('Fetching OpenAPI spec from URL:', url)
  try {
    openApi = await fetch(url).then((res) => res.json())
  } catch (error) {
    console.error('Error fetching OpenAPI spec:', error)
  }
}

if (file) {
  console.log('Reading OpenAPI spec from file:', file)
  try {
    const data = fs.readFileSync(file, 'utf8')
    openApi = JSON.parse(data)
  } catch (error) {
    console.error('Error reading OpenAPI spec from file:', error)
  }
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
