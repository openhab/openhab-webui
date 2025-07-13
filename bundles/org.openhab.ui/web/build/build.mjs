#!/usr/bin/env node
import util from 'node:util'
import { resolve } from 'path'
const exec = util.promisify(execCallback)

const __dirname = import.meta.dirname

import { build } from 'vite'
import ora from 'ora'
import { rimraf as rm } from 'rimraf'
import chalk from 'chalk'
import { exec as execCallback } from 'node:child_process'

const env = process.env.DEV ? 'development' : 'production'
const target = process.env.TARGET || 'web'
const maven = process.env.MAVEN || false
const outPath = maven ? '../target/classes/app' : 'www'

const spinner = ora(chalk.cyan(`Building for ${env} (target: ${target}, outPath: ${outPath})...\n`))
spinner.start()

exec(`npm run generate-build-info ${process.argv[2]}`)
  .then(() => {
    return rm(outPath)
  })
  .then(() => {
    build({
      root: resolve(__dirname, '..')
    })
      .then(rollupOutput => {
        spinner.stop()

        process.stdout.write(rollupOutput.toString())

        console.log(chalk.cyan('Build complete.\n'))
      })
      .catch(err => {
        spinner.stop()
        console.error(chalk.red('Build failed with errors.\n'))
        console.error(err)
        process.exit(1)
      })
  })
  .catch(e => {
    throw e
  })
