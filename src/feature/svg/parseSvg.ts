import parser, { type HTMLElement } from 'node-html-parser'

export const parseSvg = (svg: string): HTMLElement => {
  const doc = parser.parse(svg)
  return doc
}
