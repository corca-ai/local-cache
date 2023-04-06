import * as core from '@actions/core'
import * as p from 'path'
import {exec} from '../utils/cache'

async function run(): Promise<void> {
  try {
    const cacheHit = core.getState('cache-hit')
    const key = core.getState('key')

    if (cacheHit === 'false') {
      const cachePath = core.getState('cache-path')
      const path = core.getState('path')

      const {stdout, stderr} = await exec(
        `/bin/bash -c "mkdir -p ${cachePath} && mv ${path} ${p.join(
          cachePath,
          path
        )}"`
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
