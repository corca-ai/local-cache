import * as core from '@actions/core'
import {
  checkKey,
  checkPaths,
  exec,
  getCacheBase,
  getCachePath
} from '../utils/cache'

async function run(): Promise<void> {
  try {
    const key = core.getInput('key')
    const base = core.getInput('base')
    const path = core.getInput('path')
    const cacheBase = getCacheBase(base)
    const cachePath = getCachePath(key, path, base)

    checkKey(key)
    checkPaths([path])

    core.saveState('key', key)
    core.saveState('path', path)
    core.saveState('cache-path', cachePath)

    await exec(`mkdir -p ${cacheBase}`)
    let {stdout, stderr} = await exec(
      `/bin/bash -c "find ${cacheBase} -name ${key} -type d"`
    )
    if (stdout) await exec(`echo "found ${stdout}"`)

    const cacheHit = stdout ? true : false
    core.setOutput('cache-hit', String(cacheHit))
    core.saveState('cache-hit', String(cacheHit))

    if (cacheHit === true) {
      ;({stdout, stderr} = await exec(`ln -s ${cachePath} ${path}`))

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
