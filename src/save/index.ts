import * as core from '@actions/core'
import {exec} from '../utils/cache'

async function run(): Promise<void> {
  try {
    const cacheHit = core.getState('cache-hit')
    const key = core.getState('key')

    if (cacheHit === 'false') {
      const cachePath = core.getState('cache-path')
      const path = core.getState('path')

      await exec(`mkdir -p ${cachePath}`)
      const mv = await exec(`mv ./${path} ${cachePath}`)

      core.debug(mv.stdout)
      if (mv.stderr) core.error(mv.stderr)
      if (!mv.stderr) core.info(`Cache saved with key ${key}`)
    } else {
      core.info(`Cache hit on the key ${key}`)
      core.info(`,not saving cache`)
    }

    /* 
      clean up caches
    */
    const cacheBase = core.getState('cache-base')
    const cleanKey = core.getInput('clean-key')
    const SOFT_CLEAN_TIME = 7
    const HARD_CLEAN_TIME = 30
    if (cleanKey) {
      const cacheCount = await exec(
        `/bin/bash -c "find ${cacheBase} -maxdepth 1 -name '${cleanKey}*' -type d -atime -${SOFT_CLEAN_TIME} | wc -l"`
      )
      const softCleanCacheCount = await exec(
        `/bin/bash -c "find ${cacheBase} -maxdepth 1 -name '${cleanKey}*' -type d -atime +${SOFT_CLEAN_TIME} | wc -l"`
      )
      const hardCleanCacheCount = await exec(
        `/bin/bash -c "find ${cacheBase} -maxdepth 1 -name '${cleanKey}*' -type d -atime +${HARD_CLEAN_TIME} | wc -l"`
      )
      // hard clean over 30 days
      if (Number(hardCleanCacheCount.stdout) >= 1) {
        await exec(
          `/bin/bash -c "find ${cacheBase} -maxdepth 1 -name '${cleanKey}*' -type d -atime +${HARD_CLEAN_TIME} -delete"`
        )
      }
      // soft clean over 7 days
      if (Number(cacheCount.stdout) >= 1) {
        await exec(
          `/bin/bash -c "find ${cacheBase} -maxdepth 1 -name '${cleanKey}*' -type d -atime +${SOFT_CLEAN_TIME} -delete"`
        )
      } else {
        if (Number(softCleanCacheCount.stdout) > 1) {
          await exec(
            `/bin/bash -c "find ${cacheBase} -maxdepth 1 -name '${cleanKey}*' -type d -atime +${SOFT_CLEAN_TIME} -printf '%TF %p\n' | sort -k 1 -r | tail -n +2 | xargs rm -rf"`
          )
        }
      }
    }
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
