import fs from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const dir = path.join(__dirname, '../src/assets')

const files = fs.readdirSync(dir)

files
  .filter((file) => file.endsWith('.nearley'))
  .forEach((file) => {
    const input = path.join(dir, file)
    const output = input + '.js'
    console.log(`Compiling ${file} -> ${path.basename(output)}`)
    execSync(`npx nearleyc "${input}" -o "${output}"`, { stdio: 'inherit' })
  })

files
  .filter((file) => file.endsWith('.grammar'))
  .forEach((file) => {
    const input = path.join(dir, file)
    const output = input.replace(/\.grammar$/, '.parser.js')
    console.log(`Compiling ${file} -> ${path.basename(output)}`)
    execSync(`npx lezer-generator "${input}" -o "${output}"`, { stdio: 'inherit' })
  })
