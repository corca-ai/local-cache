import * as e from '@actions/exec'
import * as p from 'path'

export const getCacheBase = (base: string): string => {
  if (base && !base.endsWith('/')) {
    base += '/'
  }
  return base
}

export const getCachePath = (
  key: string,
  path: string,
  base: string
): string => {
  return p.join(getCacheBase(base), key, path)
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

const debugOptions = (): {
  stdout: string
  stderr: string
  options: {listeners: {}}
} => {
  let stdout = ''
  let stderr = ''

  const options = {listeners: {}}
  options.listeners = {
    stdout: (data: Buffer) => {
      stdout += data.toString()
    },
    stderr: (data: Buffer) => {
      stderr += data.toString()
    }
  }
  return {stdout, stderr, options}
}

export const exec = async (
  command: string
): Promise<{stdout: string; stderr: string}> => {
  const {stdout, stderr, options} = debugOptions()
  await e.exec(command, [], options)
  return {stdout, stderr}
}
