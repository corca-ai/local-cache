import * as core from '@actions/core'
import * as p from 'path'
import {BASE_CACHE_PATH, shell} from '../utils/shell'

async function run(): Promise<void> {
  try {
    const key = core.getInput('key')
    const cachePath = p.join(BASE_CACHE_PATH, key)

    const checkCache = await shell(`test -d ${cachePath} ; echo "$?"`)
    const cacheHit = checkCache.stdout === '0' ? 'true' : 'false'

    core.setOutput('cache-hit', cacheHit)
    core.saveState('cache-hit', cacheHit)

    if (cacheHit === 'true') {
      const path = core.getInput('path')
      const {stdout, stderr} = await shell(
        `ln -s ${p.join(cachePath, path)} ${path}`
      )

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
