import { parseSvg } from '@/feature/svg/parseSvg'
import { type TransformOptions, transforms } from '@/feature/svg/transforms'
import { optimizeAll } from './svgTasks'
import { type Config } from '@/feature/config/types'
import { type SvgLogItem } from '@/utils/types'
import { calculateSizeSavings } from '@/utils/calculateSizeSavings'

export type LogItem = SvgLogItem

export type LogHelper = {
  add: (msg: LogItem['msg'], type?: LogItem['type']) => void
}

export const transformSvg = (
  svg: string,
  config: Config,
  options?: Omit<TransformOptions, 'config' | 'log'>
) => {
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
    return { output: '', log: [...logCache.values()] }
  }

  const type =
    svgDoc.hasAttribute('stroke-width') ||
    svgDoc.hasAttribute('strokeWidth') ||
    svgDoc.hasAttribute('strokewidth')
      ? 'outlined'
      : 'solid'

  // Set the type
  log.add(type, 'data.type')

  if (type === 'outlined' && config.iconSetType === 'solid') {
    log.add(
      'This icon doesn’t match the set, it seems to be an outlined icon',
      'info'
    )
  }
  if (type === 'solid' && config.iconSetType === 'outlined') {
    log.add(
      'This icon doesn’t match the set, it seems to be a solid icon',
      'info'
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
    const output = optimizeAll(svgDoc.toString())
    log.add('compressed with svgo')

    const { savingsPercent } = calculateSizeSavings(svg, output)
    savingsPercent && log.add(savingsPercent, 'success')

    return { output, id, log: [...logCache.values()] }
  } catch (error) {
    log.add(error instanceof Error ? error.message : String(error), 'error')
    return { output: svgDoc.toString(), id, log: [...logCache.values()] }
  }
}
