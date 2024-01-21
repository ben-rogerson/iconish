import { optimize } from 'svgo'
import { sanitizeTransforms } from '@/feature/svg/transforms'
import { parseSvg } from '@/feature/svg/parseSvg'

export const optimizeAll = (svg: string) => {
  try {
    const result = optimize(svg, {
      multipass: true,
      plugins: [
        { name: 'preset-default' },
        {
          name: 'removeAttributesBySelector',
          params: {
            selector: 'svg',
            attributes: ['xml:space', 'width', 'height'],
          },
        },
        { name: 'sortAttrs', params: { xmlnsOrder: 'alphabetical' } },
        { name: 'removeAttrs', params: { attrs: ['data-*', 'data.*'] } },
        // { name: "removeDimensions" }, // Remove width/height and add viewBox if it's missing
        { name: 'convertStyleToAttrs', params: { keepImportant: true } },
      ],
    })

    if ((result.data.match(/</g)?.length ?? 0) <= 1) {
      throw new Error('This SVG doesn’t seem to be valid')
    }

    return result.data
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    throw new Error(msg)
  }
}

export const doSanitizeSvg = (svgInput: string) =>
  sanitizeTransforms.reduce((a, t) => t(a), parseSvg(svgInput)).toString()
