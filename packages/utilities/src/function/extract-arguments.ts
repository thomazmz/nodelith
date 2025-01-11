import { Function } from '@nodelith/types'

const functionArgumentListRegex = new RegExp(
  /(\/\/.*$)|(\/\*[\s\S]*?\*\/)|(\s*=[^,)]*(('(?:\\'|[^'\r\n])*')|("(?:\\"|[^"\r\n])*"))|(\s*=[^,)]*))/gm
)

const functionArgumentIdentifiersRegex = new RegExp(/([^\s,]+)/g)

export function extractArguments(fn: Function<any, any[]>): string[] {
  const functionString = fn.toString().replace(functionArgumentListRegex, '')

  const argumentDeclarationFirstIndex = functionString.indexOf('(') + 1

  const argumentDeclarationLastIndex = functionString.indexOf(')')

  const argumentString = functionString.slice(argumentDeclarationFirstIndex, argumentDeclarationLastIndex)

  const argumentNames = argumentString.match(functionArgumentIdentifiersRegex)

  return argumentNames ?? []
}

