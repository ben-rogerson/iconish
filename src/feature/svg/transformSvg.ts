import parse from 'html-react-parser'
import { parseSvg } from '@/feature/svg/parseSvg'
import { type TransformOptions, transforms } from '@/feature/svg/transforms'
import { optimizeAll } from '@/feature/svg/svgTasks'
import { type Config } from '@/feature/config/types'
import { type SvgLogItem } from '@/utils/types'
import { calculateSizeSavings } from '@/utils/calculateSizeSavings'
import isObject from 'lodash/isObject'
import { getSvgType } from '@/feature/svg/getSvgType'

export type LogItem = SvgLogItem

export type LogHelper = {
  add: (msg: LogItem['msg'], type?: LogItem['type']) => void
}

const toJSX = (
  element: string | JSX.Element | Array<string | JSX.Element> | undefined
): string => {
  if (element === undefined) return ''

  if (Array.isArray(element)) return element.map(toJSX).join('')

  if (typeof element === 'string') return element

  const props =
    (element.props as
      | (Record<string, unknown> & {
          children?: JSX.Element | Array<string | JSX.Element> | string
        })
      | undefined) ?? {}
  const { children, ...rawProps } = props
  const elementProps = Object.entries(rawProps)
    .map(([key, value]) => {
      if (isObject(value)) return `${key}={${JSON.stringify(value)}}`

      return `${key}="${String(value)}"`
    })
    .join(' ')

  const allChildren = Array.isArray(children) ? children : [children]

  // Deal with self closing tags
  if (allChildren.filter(Boolean).length === 0)
    return `<${element.type} ${elementProps}/>`

  return `<${[element.type, elementProps].join(' ')}>${allChildren
    .map(c => (c ? toJSX(c) : ''))
    .join('')}</${element.type}>`
}

export const transformSvg = (
  svg: string,
  config: Config,
  options?: Omit<TransformOptions, 'config' | 'log'>
): {
  output: string
  outputJsx: string
  savings: number
  id?: string
  log: LogItem[]
} => {
  const logCache = new Set<LogItem>()
  const log: LogHelper = {
    add: (msg, type) => {
      logCache.add({ msg, type: type ?? 'debug' })
    },
  }

  let doc = parseSvg(svg)
  const svgDoc = doc.querySelector('svg')

  if (!svgDoc) {
    // log.add("No svg element found", "error");
    return {
      output: '',
      outputJsx: '',
      savings: 0,
      log: [...logCache.values()],
    }
  }

  const type = getSvgType(svgDoc)

  // Set the type
  log.add(type, 'data.type')

  if (type === 'outlined' && config.iconSetType === 'solid') {
    log.add(
      'This icon seems to be an outlined icon and doesn’t match the set. Recommend moving it to a separate outlined icon set.',
      'error'
    )
  }
  if (type === 'solid' && config.iconSetType === 'outlined') {
    log.add(
      'This icon seems to be a solid icon and doesn’t match the set. Recommend moving it to a separate solid icon set.',
      'error'
    )
  }

  doc = transforms.reduce(
    (d, fn) =>
      fn(d, {
        log,
        config,
        title: options?.title,
        editorId: options?.editorId,
      }),
    doc
  )

  let id = svgDoc.getAttribute('id')

  // When no id on the svg is found, use the title
  if (options?.title) {
    const convertedId = options.title.toLowerCase().trim().replaceAll(' ', '-')
    svgDoc.setAttribute('id', convertedId)
    id = convertedId
  }

  try {
    const output = optimizeAll(svgDoc.toString(), config)
    const outputJsx = config.outputJsx ? toJSX(parse(output)) : ''
    log.add('compressed with svgo')

    const { savingsPercent, savings } = calculateSizeSavings(svg, output)
    log.add(savingsPercent ?? 'attributes applied', 'success')

    return { output, outputJsx, savings, id, log: [...logCache.values()] }
  } catch (error) {
    log.add(error instanceof Error ? error.message : String(error), 'error')
    const output = svgDoc.toString()
    return {
      output,
      outputJsx: output,
      savings: 0,
      id,
      log: [...logCache.values()],
    }
  }
}
