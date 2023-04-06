import * as core from '@actions/core'
import * as p from 'path'
import {checkKey, checkPaths, exec, getCachePath} from '../utils/cache'

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

    let {stdout, stderr} = await exec(
      `/bin/bash -c "test -d ${cachePath} ; echo $? `
    )

    const cacheHit = stdout === '0' ? true : false
    core.setOutput('cache-hit', String(cacheHit))
    core.saveState('cache-hit', String(cacheHit))

    if (cacheHit === true) {
      ;({stdout, stderr} = await exec(
        `ln -s ${p.join(cachePath, path)} ${path}`
      ))

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
