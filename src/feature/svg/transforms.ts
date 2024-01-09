import { type Config } from '@/feature/config/types'
import { type LogHelper } from '@/feature/svg/transformSvg'
import { run } from '@/utils/run'
import { type HTMLElement } from 'node-html-parser'

export type Transform = (
  doc: HTMLElement,
  options: TransformOptions
) => HTMLElement

export type TransformOptions = {
  config: Config
  log: LogHelper
  title?: string
  editorId?: string
}

// const viewBoxTransform = (doc: HTMLElement) => {
//   const svg = doc.querySelector("svg");
//   if (!svg) return doc;
//   if (svg.hasAttribute("viewBox")) return doc;
//   svg.setAttribute("viewBox", "0 0 24 24"); // TODO: Make customizable
//   return doc;
// };

const ELEMENT_COMMON_IGNORE_VALUES = [
  'none',
  'currentColor',
  'inherit',
  'initial',
  'transparent',
  'unset',
  '0',
]

export const fillColorTransform: Transform = (doc, options) => {
  if (options.config.iconSetType === 'outlined') return doc

  const paths = doc.querySelectorAll(
    'path[fill], line[fill], polygon[fill], polyline[fill], ellipse[fill], rect[fill], circle[fill]'
  )

  const fillPaths = new Set<HTMLElement>()
  const tagNames: Array<HTMLElement['tagName']> = []

  for (const path of paths) {
    if (!path.hasAttribute('fill')) continue

    const value = path.getAttribute('fill') ?? ''
    if (ELEMENT_COMMON_IGNORE_VALUES.includes(value)) continue

    fillPaths.add(path)
    tagNames.push(path.tagName.toLowerCase())

    if (fillPaths.size > 1) {
      options.log.add(
        `fill: “${options.config.fill}” wasn’t applied as ${
          fillPaths.size
        } colors were found (${getCounts(
          [...fillPaths].map(p => p.getAttribute('fill') ?? '')
        )})`,
        'info'
      )
      return doc
    }
  }

  // Split into two loops to avoid modifying the DOM while performing the color checks
  for (const path of fillPaths) {
    path.setAttribute('fill', options.config.fill)
  }

  fillPaths.size > 0 &&
    options.log.add(
      `updated fill to “${options.config.fill}” on ${getCounts(
        [...fillPaths].map(p => p.tagName.toLowerCase())
      )}`
    )

  run(() => {
    if (fillPaths.size > 0) return
    const svg = doc.querySelector('svg')
    if (!svg) return

    const value = svg.getAttribute('fill') ?? ''

    svg.setAttribute('fill', options.config.fill)
    options.log.add(
      `svg fill=“${options.config.fill}” was ${
        value.length === 0 ? 'added' : 'updated'
      }`
    )
  })

  return doc
}

export const strokeLineCapTransform: Transform = (doc, options) => {
  const paths = doc.querySelectorAll('*[stroke-linecap]')
  if (paths.length === 0) return doc

  const tagNames: Array<HTMLElement['tagName']> = []
  for (const path of paths) {
    if (path.getAttribute('stroke-linecap') === options.config.strokeLinecap)
      continue
    path.setAttribute('stroke-linecap', options.config.strokeLinecap)
    tagNames.push(path.tagName.toLowerCase())
  }

  tagNames.length > 0 &&
    options.log.add(
      `set stroke-linecap="${options.config.strokeLinecap}" on ${getCounts(
        tagNames
      )}`
    )

  return doc
}

export const strokeLineJoinTransform: Transform = (doc, options) => {
  const paths = doc.querySelectorAll('*[stroke-linejoin]')
  if (paths.length === 0) return doc

  const tagNames: Array<HTMLElement['tagName']> = []
  for (const path of paths) {
    if (path.getAttribute('stroke-linejoin') === options.config.strokeLinejoin)
      continue
    path.setAttribute('stroke-linejoin', options.config.strokeLinejoin)
    tagNames.push(path.tagName.toLowerCase())
  }

  tagNames.length > 0 &&
    options.log.add(
      `set stroke-linejoin="${options.config.strokeLinejoin}" on ${getCounts(
        tagNames
      )}`
    )

  return doc
}

const getCounts = (tagNames: Array<HTMLElement['tagName']>) =>
  Object.entries(
    tagNames.reduce<Record<string, number>>((acc, name) => {
      acc[name] = (acc[name] || 0) + 1
      return acc
    }, {})
  )
    .map(([key, value]) => `${key}${value > 1 ? ` (${value}x)` : ''}`)
    .join(', ')

export const strokeWidthTransform: Transform = (doc, options) => {
  // Avoid applying stroke width to solid icons
  if (options.config.iconSetType === 'solid') return doc

  const elementTargets = [
    'svg',
    'path',
    'line',
    'polygon',
    'polyline',
    'ellipse',
    'rect',
    'circle',
  ]
  const elementTargetsString = elementTargets
    .map(e => `${e}[strokewidth], ${e}[strokeWidth], ${e}[stroke-width]`)
    .join(', ')
  const paths = doc.querySelectorAll(elementTargetsString)

  if (paths.length === 0) return doc

  const tagNames: Array<HTMLElement['tagName']> = []
  for (const path of paths) {
    path.removeAttribute('strokewidth')
    path.removeAttribute('strokeWidth')
    path.removeAttribute('stroke-width')

    path.setAttribute('stroke-width', options.config.strokeWidth)
    tagNames.push(path.tagName.toLowerCase())
  }

  options.log.add(
    `set stroke-width=“${options.config.strokeWidth}” on ${getCounts(tagNames)}`
  )

  return doc
}

export const strokeColorTransform: Transform = (doc, options) => {
  // Avoid applying stroke color to solid icons
  if (options.config.iconSetType === 'solid') return doc

  const paths = doc.querySelectorAll(
    'path[stroke], line[stroke], polygon[stroke], polyline[stroke], ellipse[stroke], rect[stroke], circle[stroke]'
  )

  // Check for a colored svg to avoid applying stroke color
  const valueSet = new Set()
  for (const path of paths) {
    if (!path.hasAttribute('stroke')) continue

    const value = path.getAttribute('stroke') ?? ''
    if (ELEMENT_COMMON_IGNORE_VALUES.includes(value)) continue
    valueSet.add(value)
  }

  if (valueSet.size > 1) {
    options.log.add(
      `multiple stroke colors found (${[...valueSet].join(
        ', '
      )}) so not applying stroke color`,
      'error'
    )
    return doc
  }

  const tagNames: Array<HTMLElement['tagName']> = []
  for (const path of paths) {
    if (!path.hasAttribute('stroke')) continue

    path.setAttribute('stroke', options.config.stroke)
    tagNames.push(path.tagName.toLowerCase())
  }

  tagNames.length > 0 &&
    options.log.add(
      `set stroke=“${options.config.stroke}” on ${getCounts(tagNames)}`
    )

  run(() => {
    const svg = doc.querySelector('svg')
    if (!svg) return

    const value = svg.getAttribute('stroke') ?? ''
    if (value.length === 0) return

    svg.setAttribute('stroke', options.config.stroke)
    options.log.add(`set stroke=“${options.config.stroke}” on svg`)
  })

  return doc
}

export const vectorEffectTransform: Transform = (doc, options) => {
  // Avoid applying the stroke changes to solid icons
  if (options.config.iconSetType === 'solid') return doc

  const svg = doc.querySelector('svg')
  const hasSvgStrokeWidth =
    svg?.getAttribute('stroke-width') ??
    svg?.getAttribute('strokewidth') ??
    svg?.getAttribute('strokeWidth')

  if (!hasSvgStrokeWidth) return doc

  const paths = doc.querySelectorAll(
    'path, line, polygon, polyline, ellipse, rect, circle'
  )

  const tagNames: Array<HTMLElement['tagName']> = []
  const tagNamesRemoved: Array<HTMLElement['tagName']> = []
  paths.forEach(path => {
    if (!options.config.nonScalingStroke) {
      if (path.getAttribute('vector-effect') === 'non-scaling-stroke') {
        tagNamesRemoved.push(path.tagName.toLowerCase())
        path.removeAttribute('vector-effect')
      }
      if (path.getAttribute('vectoreffect') === 'non-scaling-stroke') {
        tagNamesRemoved.push(path.tagName.toLowerCase())
        path.removeAttribute('vectoreffect')
      }
      if (path.getAttribute('vectorEffect') === 'non-scaling-stroke') {
        tagNamesRemoved.push(path.tagName.toLowerCase())
        path.removeAttribute('vectorEffect')
      }

      tagNamesRemoved.push(path.tagName.toLowerCase())
      return
    }

    if (
      path.hasAttribute('vector-effect') ||
      path.hasAttribute('vectoreffect') ||
      path.hasAttribute('vectorEffect')
    )
      return

    path.removeAttribute('vectoreffect')
    path.removeAttribute('vectorEffect')

    path.setAttribute('vector-effect', 'non-scaling-stroke')
    tagNames.push(path.tagName.toLowerCase())
  })

  if (options.config.nonScalingStroke && tagNames.length > 0) {
    options.log.add(
      `updated vector-effect to “non-scaling-stroke” on ${getCounts(tagNames)}`
    )
    // Finish by making sure there's no value set on the svg tag
    if (svg?.getAttribute('vector-effect')) {
      svg.removeAttribute('vector-effect')
      options.log.add(
        `removed vector-effect from svg (added on inner elements)`
      )
    }
  }

  tagNamesRemoved.length > 0 &&
    options.log.add(
      `removed vector-effect attribute from ${getCounts(tagNamesRemoved)}`
    )

  return doc
}

export const svgAttributesTransform: Transform = (doc, options) => {
  const svg = doc.querySelector('svg')
  if (!svg) return doc

  run(() => {
    if (svg.hasAttribute('viewBox')) return

    const width = svg.getAttribute('width')
    const height = svg.getAttribute('height')

    if (
      width &&
      height &&
      Number.isInteger(Number(width)) &&
      Number.isInteger(Number(height))
    ) {
      options.log.add(
        'created and added the "viewBox" attribute from the svg width and height attributes'
      )
      svg.setAttribute('viewBox', `0 0 ${width} ${height}`)
      return
    }

    if (!width || !height) {
      options.log.add(
        `input svg has none of the following attributes: viewBox, width, height`,
        'error'
      )
      svg.setAttribute('viewBox', `0 0 1 1`)
    }
  })

  run(() => {
    if (!svg.getAttribute('width')) return

    options.log.add(`svg width=“${svg.getAttribute('width')}” was removed`)

    svg.removeAttribute('width')
  })

  if (svg.hasAttribute('height')) {
    options.log.add(`svg height=“${svg.getAttribute('height')}” was removed`)
    // console.warn(
    //   `Height found on the svg element. Found: ${svg.getAttribute(
    //     "height"
    //   )}, Removed height attribute`
    // );
    svg.removeAttribute('height')
  }

  if (svg.hasAttribute('fill') && options.config.iconSetType === 'outlined') {
    const value = svg.getAttribute('fill')
    if (value !== 'none') {
      options.log.add(
        `fill on <svg>: “${value}” was removed (set it to 'none' to keep it)`
      )

      svg.removeAttribute('fill')
    }
  }

  return doc
}

// Run for the output
const svgAttributesSanitizeTransform = (doc: HTMLElement) => {
  const svg = doc.querySelector('svg')
  if (!svg) return doc

  if (svg.getAttribute('width')) {
    svg.removeAttribute('width')
  }

  if (svg.hasAttribute('height')) {
    svg.removeAttribute('height')
  }

  return doc
}

export const addId: Transform = (doc, options) => {
  if (!options.title) return doc

  const svg = doc.querySelector('svg')
  if (!svg) return doc

  svg.setAttribute('id', options.title)

  return doc

  // if (svg.hasAttribute("id")) return doc;
  // const ID = Math.random().toString(36).slice(2);
  // console.warn(`No ID found on the svg element - generating a new one: ${ID}`);
  // svg.setAttribute("id", ID);
  // return doc;
}

export const transforms: Transform[] = [
  // addId,
  svgAttributesTransform,
  // viewBoxTransform,
  strokeWidthTransform,
  vectorEffectTransform,
  strokeLineCapTransform,
  strokeLineJoinTransform,
  strokeColorTransform,
  fillColorTransform,
] satisfies Transform[]

export const sanitizeTransforms: Array<(doc: HTMLElement) => HTMLElement> = [
  svgAttributesSanitizeTransform,
]
