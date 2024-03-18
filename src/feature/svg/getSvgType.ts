import { type HTMLElement } from 'node-html-parser'

export const getSvgType = (svgDoc: HTMLElement): 'outlined' | 'solid' => {
  // If the svg has a `fill` of `none` or `0`, it's an outlined icon
  const hasNoFillOnSvg =
    svgDoc.getAttribute('fill') &&
    ['none', '0'].includes(svgDoc.getAttribute('fill') || '')
  if (hasNoFillOnSvg) return 'outlined'

  const svgInnerElements = svgDoc.querySelectorAll('*')

  // If the svg has a `fill` of `none` or `0` on any of its children, it's an outlined icon
  const hasNoFillChildren = [...svgInnerElements].some(path => {
    if (!path.getAttribute('fill')) return
    const hasNoFillOnChildren = ['none', '0'].includes(
      path.getAttribute('fill') || ''
    )
    return hasNoFillOnChildren
  })
  if (hasNoFillChildren) return 'outlined'

  return 'solid'
}
