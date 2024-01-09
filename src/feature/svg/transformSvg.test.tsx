import { initialConfig } from '@/hooks/appState'
import { transformSvg } from './transformSvg'
import { describe, it, expect, vi } from 'vitest'

vi.mock('@/feature/svg/transforms', () => ({
  transforms: [],
}))

describe('transformSvg', () => {
  describe('id', () => {
    it('should keep the svg id attr and identify the id', () => {
      const svg = '<svg id="svgId"></svg>'

      const { output, id } = transformSvg(svg, initialConfig)

      expect(output).toBe('<svg id="svgId"/>')
      expect(id).toBe('svgId')
    })

    it('should return undefined for id when no id attribute and no title', () => {
      const svg = '<svg></svg>'

      const { output, id } = transformSvg(svg, initialConfig)

      expect(output).toBe('<svg/>')
      expect(id).toBeUndefined()
    })

    it('should return undefined for id when no svg tag', () => {
      const svg = '<div></div>'

      const { output, id } = transformSvg(svg, initialConfig, {
        title: 'title',
      })

      expect(output).toBe('')
      expect(id).toBeUndefined()
    })

    it('should add an id when there is no svg id attr', () => {
      const svg = '<svg></svg>'

      const { output, id } = transformSvg(svg, initialConfig, {
        title: 'A title',
      })

      expect(output).toBe('<svg id="a-title"/>')
      expect(id).toBe('a-title')
    })

    it('should override the id when a title is provided', () => {
      const svg = '<svg id="bert"></svg>'

      const { output, id } = transformSvg(svg, initialConfig, {
        title: 'A title',
      })

      expect(output).toBe('<svg id="a-title"/>')
      expect(id).toBe('a-title')
    })

    it('should keep the casing of the svg id attr', () => {
      const svg = '<svg id="Bert"></svg>'

      const { output, id } = transformSvg(svg, initialConfig)

      expect(output).toBe('<svg id="Bert"/>')
      expect(id).toBe('Bert')
    })
  })

  describe('iconType', () => {
    it('sets the icon type log to solid when a solid svg is added', () => {
      const svg = '<svg></svg>'
      const { log } = transformSvg(svg, initialConfig)

      expect(log.some(i => i.type === 'data.type' && i.msg === 'solid')).toBe(
        true
      )
    })

    it('sets the icon type log to outlined when an outlined svg is added', () => {
      const svg = '<svg stroke-width="anything"></svg>'
      const { log } = transformSvg(svg, initialConfig)

      expect(
        log.some(i => i.type === 'data.type' && i.msg === 'outlined')
      ).toBe(true)
    })

    it('doesn’t set the icon type log when no svg is added', () => {
      const svg = '<div></div>'
      const { log } = transformSvg(svg, initialConfig)

      expect(log.some(i => i.type === 'data.type')).toBe(false)
    })
  })

  it('should strip non-svg html elements', () => {
    const svg = '<div>Text<svg/></div><div>Gone</div><header/><em/><img />'

    const { output, id } = transformSvg(svg, initialConfig)

    expect(output).toBe('<svg/>')
    expect(id).toBeUndefined()
  })
})
