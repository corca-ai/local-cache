import * as core from '@actions/core'
import * as p from 'path'
import {BASE_CACHE_PATH, shell} from '../utils/shell'

async function run(): Promise<void> {
  try {
    const cacheHit = core.getState('cache-hit')
    const key = core.getInput('key')

    if (cacheHit === 'false') {
      const path = core.getInput('path')
      const cachePath = p.join(BASE_CACHE_PATH, key)
      const {stdout, stderr} = await shell(
        `mkdir -p ${cachePath} && mv ${path} ${cachePath}`
      )

      core.debug(stdout)
      if (stderr) core.error(stderr)
      if (!stderr) core.info(`Cache saved with key ${key}`)
    } else {
      core.info(`Cache hit on the key ${key}`)
      core.info(`,not saving cache`)
    }
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
