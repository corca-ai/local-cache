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
  output: string
  error: string
  options: {listeners: {}}
} => {
  let output = ''
  let error = ''

  const options = {listeners: {}}
  options.listeners = {
    stdout: (data: Buffer) => {
      output += data.toString()
    },
    stderr: (data: Buffer) => {
      error += data.toString()
    }
  }
  return {output, error, options}
}

export const exec = async (
  command: string
): Promise<{output: string; error: string}> => {
  const {output, error, options} = debugOptions()
  await e.exec(command, [], options)
  return {output, error}
}
