import * as e from '@actions/exec'
import * as p from 'path'

export const getCacheBase = (base: string): string => {
  if (base && !base.endsWith('/')) {
    base += '/'
  }
  return base
}

export const getCachePath = (key: string, base: string): string => {
  return p.join(getCacheBase(base), key)
}

class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
    Object.setPrototypeOf(this, ValidationError.prototype)
  }
}

export const checkPaths = (paths: string[]): void => {
  if (!paths || paths.length === 0) {
    throw new ValidationError(
      `Path Validation Error: At least one directory or file path is required`
    )
  }
}

export const checkKey = (key: string): void => {
  if (key.length > 512) {
    throw new ValidationError(
      `Key Validation Error: ${key} cannot be larger than 512 characters.`
    )
  }
  const regex = /^[^,]*$/
  if (!regex.test(key)) {
    throw new ValidationError(
      `Key Validation Error: ${key} cannot contain commas.`
    )
  }
}

export const exec = async (
  command: string
): Promise<{stdout: string; stderr: string}> => {
  const {stdout, stderr} = await e.getExecOutput(command)
  return {stdout, stderr}
}
