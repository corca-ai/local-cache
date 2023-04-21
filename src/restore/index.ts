import * as core from '@actions/core'
import * as p from 'path'
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
    const cachePath = getCachePath(key, base)

    checkKey(key)
    checkPaths([path])

    core.saveState('key', key)
    core.saveState('path', path)
    core.saveState('cache-base', cacheBase)
    core.saveState('cache-path', cachePath)

    await exec(`mkdir -p ${cacheBase}`)
    const find = await exec(`find ${cacheBase} -name ${key} -type d`)

    const cacheHit = find.stdout ? true : false
    core.saveState('cache-hit', String(cacheHit))
    core.setOutput('cache-hit', String(cacheHit))

    if (cacheHit === true) {
      const ln = await exec(
        `ln -s ${p.join(cachePath, path.split('/').slice(-1)[0])} ./${path}`
      )

      core.debug(ln.stdout)
      if (ln.stderr) core.error(ln.stderr)
      if (!ln.stderr) core.info(`Cache restored with key ${key}`)
    } else {
      core.info(`Cache not found for ${key}`)
    }
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
