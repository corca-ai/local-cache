import * as core from '@actions/core'
import * as exec from '@actions/exec'
import * as p from 'path'
import {checkKey, checkPaths, getCachePath, options} from '../utils/cache'

async function run(): Promise<void> {
  try {
    const key = core.getInput('key')
    const path = core.getInput('path')
    const cachePath = getCachePath(key)

    checkKey(key)
    checkPaths([path])

    core.saveState('key', key)
    core.saveState('path', path)
    core.saveState('cache-path', cachePath)

    const status = await exec.exec(`test -d ${cachePath}`, [`; echo "$?"`], {
      ignoreReturnCode: true
    })
    await exec.exec(`check cache ended with status ${status}`)

    const cacheHit = status === 0 ? 'true' : 'false'
    core.setOutput('cache-hit', cacheHit)
    core.saveState('cache-hit', cacheHit)

    if (cacheHit === 'true') {
      const {stdout, stderr, listeners} = options('', '')
      await exec.exec(`ln -s ${p.join(cachePath, path)} ${path}`, [], {
        listeners
      })

      core.debug(stdout)
      if (stderr) core.error(stderr)
      if (!stderr) core.info(`Cache restored with key ${key}`)
    } else {
      core.info(`Cache not found for ${key}`)
    }
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
