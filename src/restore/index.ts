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
    const restoreKeys = core.getMultilineInput('restore-keys')
    const base = core.getInput('base')
    const path = core.getInput('path')
    const cacheBase = getCacheBase(base)
    const cachePath = getCachePath(key, base)

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
      ;({stdout, stderr} = await exec(
        `ln -s ${p.join(cachePath, path)} ${path}`
      ))

      core.debug(stdout)
      if (stderr) core.error(stderr)
      if (!stderr) core.info(`Cache restored with key ${key}`)
    } else {
      core.info(`Cache not found for ${key}`)

      if (restoreKeys.length > 0) {
        for (const restoreKey of restoreKeys) {
          ;({stdout, stderr} = await exec(
            `/bin/bash -c "find ${cacheBase} -name '${restoreKey}*' -type d -printf "%Tc %p\n" | sort -n | tail -1 | rev | cut -d ' ' -f -1 | rev"`
          ))
          if (stdout) {
            await exec(
              `(cd ${p.join(
                stdout,
                path
              )}; tar cvf - .) | (cd ${path}; tar xvfp -)`
            )
            if (!stderr)
              core.info(`Cache restored with restore-key ${restoreKey}`)
            break
          }
        }
      }
    }
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
