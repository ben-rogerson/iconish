import { describe, it, expect, vi } from 'vitest'
import {
  type Transform,
  fillColorTransform,
  strokeColorTransform,
  strokeLineCapTransform,
  strokeLineJoinTransform,
  strokeWidthTransform,
  svgAttributesTransform,
  vectorEffectTransform,
} from '@/feature/svg/transforms'
import { type HTMLElement } from 'node-html-parser'
import { type Config } from '@/feature/config/types'
import { initialConfig } from '@/feature/config/initialConfig'

const transform = (
  fn: Transform,
  svg: string,
  config?: Partial<Record<keyof Config, string>>
) => {
  const doc = document.createElement('div') as unknown as HTMLElement
  doc.innerHTML = svg
  return (
    fn(doc, {
      config: config
        ? ({ ...initialConfig, ...config } as Config)
        : initialConfig,
      log: { add: vi.fn() },
    }).querySelector('svg') ?? doc
  )
}

describe('svgAttributesTransform', () => {
  it('should convert the width and height to a viewBox', () => {
    // TODO: Add outputSolid / outputOutlined tests for this
    const output = transform(
      svgAttributesTransform,
      '<svg width="50" height="25"></svg>'
    )
    expect(output.getAttribute('viewBox')).toBe('0 0 50 25')
  })

  it('should ignore adding a viewbox when a width or height is missing', () => {
    // TODO: Add outputSolid / outputOutlined tests for this
    const output = transform(svgAttributesTransform, "<svg height='20'></svg>")
    const output2 = transform(svgAttributesTransform, "<svg width='20'></svg>")

    expect(output.hasAttribute('width')).toBe(false)
    expect(output.hasAttribute('height')).toBe(false)
    expect(output.getAttribute('viewBox')).toBe('0 0 1 1')

    expect(output2.hasAttribute('width')).toBe(false)
    expect(output2.hasAttribute('height')).toBe(false)
    expect(output2.getAttribute('viewBox')).toBe('0 0 1 1')
  })

  it('should remove fill attribute when not none', () => {
    // TODO: Add outputSolid / outputOutlined tests for this
    const output = transform(svgAttributesTransform, '<svg fill="red"></svg>')
    expect(output.hasAttribute('fill')).toBe(false)
  })

  it('should not remove fill attribute when none', () => {
    // TODO: Add outputSolid / outputOutlined tests for this
    const output = transform(svgAttributesTransform, '<svg fill="none"></svg>')
    expect(output.getAttribute('fill')).toBe('none')
  })
})

describe('strokeWidthTransform', () => {
  it('should update the stroke-width on common svg element types', () => {
    // TODO: Add outputSolid / outputOutlined tests for this
    const output = transform(
      strokeWidthTransform,
      '<svg stroke-width="3"><path stroke-width="3"/><line stroke-width="3"/><polygon stroke-width="3"/><polyline stroke-width="3"/><ellipse stroke-width="3"/><rect stroke-width="3"/><circle stroke-width="3"/></svg>'
    )
    expect(output.getAttribute('stroke-width')).toBe(initialConfig.strokeWidth)
    expect(output.querySelector('path')?.getAttribute('stroke-width')).toBe(
      initialConfig.strokeWidth
    )
    expect(output.querySelector('line')?.getAttribute('stroke-width')).toBe(
      initialConfig.strokeWidth
    )
    expect(output.querySelector('polygon')?.getAttribute('stroke-width')).toBe(
      initialConfig.strokeWidth
    )
    expect(output.querySelector('polyline')?.getAttribute('stroke-width')).toBe(
      initialConfig.strokeWidth
    )
    expect(output.querySelector('ellipse')?.getAttribute('stroke-width')).toBe(
      initialConfig.strokeWidth
    )
    expect(output.querySelector('rect')?.getAttribute('stroke-width')).toBe(
      initialConfig.strokeWidth
    )
    expect(output.querySelector('circle')?.getAttribute('stroke-width')).toBe(
      initialConfig.strokeWidth
    )
  })

  it('should update strokewidth attribute', () => {
    // TODO: Add outputSolid / outputOutlined tests for this
    const output = transform(
      strokeWidthTransform,
      '<svg strokewidth="3"></svg>'
    )
    expect(output.getAttribute('stroke-width')).toBe(initialConfig.strokeWidth)
  })

  it('should update strokeWidth attribute', () => {
    // TODO: Add outputSolid / outputOutlined tests for this
    const output = transform(
      strokeWidthTransform,
      '<svg strokeWidth="3"></svg>'
    )
    expect(output.getAttribute('stroke-width')).toBe(initialConfig.strokeWidth)
  })

  it('should not change stroke-width attribute when already set as the default', () => {
    // TODO: Add outputSolid / outputOutlined tests for this
    const output = transform(
      strokeWidthTransform,
      `<svg stroke-width="${initialConfig.strokeWidth}"></svg>`
    )
    expect(output.getAttribute('stroke-width')).toBe(initialConfig.strokeWidth)
  })

  it('should update stroke-width attribute when empty', () => {
    // TODO: Add outputSolid / outputOutlined tests for this
    const output = transform(
      strokeWidthTransform,
      '<svg stroke-width=""></svg>'
    )
    expect(output.getAttribute('stroke-width')).toBe('2')
  })

  it('should not update stroke-width attribute when missing', () => {
    // TODO: Add outputSolid / outputOutlined tests for this
    const output = transform(strokeWidthTransform, '<svg></svg>')
    expect(output.getAttribute('stroke-width')).toBeNull()
  })

  it('should update the stroke-width attribute when invalid', () => {
    // TODO: Add outputSolid / outputOutlined tests for this
    const output = transform(
      strokeWidthTransform,
      '<svg stroke-width="invalid"></svg>'
    )
    expect(output.getAttribute('stroke-width')).toBe('2')
  })
})

describe('vectorEffectTransform', () => {
  it('should add the vector-effect attribute to elements when missing', () => {
    // TODO: Add outputSolid / outputOutlined tests for this
    const output = transform(
      vectorEffectTransform,
      '<svg stroke-width="3"><path /><line /><polygon /><polyline /><ellipse /><rect /><circle /></svg>'
    )
    expect(output.querySelector('path')?.getAttribute('vector-effect')).toBe(
      'non-scaling-stroke'
    )
    expect(output.querySelector('line')?.getAttribute('vector-effect')).toBe(
      'non-scaling-stroke'
    )
    expect(output.querySelector('polygon')?.getAttribute('vector-effect')).toBe(
      'non-scaling-stroke'
    )
    expect(
      output.querySelector('polyline')?.getAttribute('vector-effect')
    ).toBe('non-scaling-stroke')
    expect(output.querySelector('ellipse')?.getAttribute('vector-effect')).toBe(
      'non-scaling-stroke'
    )
    expect(output.querySelector('rect')?.getAttribute('vector-effect')).toBe(
      'non-scaling-stroke'
    )
    expect(output.querySelector('circle')?.getAttribute('vector-effect')).toBe(
      'non-scaling-stroke'
    )
  })

  it('should leave the vector-effect attribute when present', () => {
    // TODO: Add outputSolid / outputOutlined tests for this
    const output = transform(
      vectorEffectTransform,
      '<svg><path vector-effect="non-scaling-stroke" /></svg>'
    )
    expect(output.querySelector('path')?.getAttribute('vector-effect')).toBe(
      'non-scaling-stroke'
    )
  })

  it('should not change the value of the vector-effect attribute', () => {
    // TODO: Add outputSolid / outputOutlined tests for this
    const output = transform(
      vectorEffectTransform,
      '<svg><path vector-effect="a-value" /></svg>'
    )
    expect(output.querySelector('path')?.getAttribute('vector-effect')).toBe(
      'a-value'
    )
  })
})

describe('strokeLineCapTransform', () => {
  it('should replace any stroke-linecap attribute on all elements', () => {
    // TODO: Add outputSolid / outputOutlined tests for this
    const output = transform(
      strokeLineCapTransform,
      '<svg stroke-linecap="hi"><path stroke-linecap="hi" /><line stroke-linecap="hi" /><polygon stroke-linecap="hi" /><polyline stroke-linecap="hi" /><ellipse stroke-linecap="hi" /><rect stroke-linecap="hi" /><circle stroke-linecap="hi" /></svg>'
    )
    expect(output.getAttribute('stroke-linecap')).toBe('round')
    expect(output.querySelector('path')?.getAttribute('stroke-linecap')).toBe(
      'round'
    )
    expect(output.querySelector('line')?.getAttribute('stroke-linecap')).toBe(
      'round'
    )
    expect(
      output.querySelector('polygon')?.getAttribute('stroke-linecap')
    ).toBe('round')
    expect(
      output.querySelector('polyline')?.getAttribute('stroke-linecap')
    ).toBe('round')
    expect(
      output.querySelector('ellipse')?.getAttribute('stroke-linecap')
    ).toBe('round')
    expect(output.querySelector('rect')?.getAttribute('stroke-linecap')).toBe(
      'round'
    )
    expect(output.querySelector('circle')?.getAttribute('stroke-linecap')).toBe(
      'round'
    )
  })

  it('should use the custom config value when replacing', () => {
    // TODO: Add outputSolid / outputOutlined tests for this
    const output = transform(
      strokeLineCapTransform,
      '<svg stroke-linecap="hi"></svg>',
      { strokeLinecap: 'butt' }
    )
    expect(output.getAttribute('stroke-linecap')).toBe('butt')
  })

  it('should not change the value of the stroke-linecap attribute when already set as the default', () => {
    // TODO: Add outputSolid / outputOutlined tests for this
    const output = transform(
      strokeLineCapTransform,
      `<svg stroke-linecap="${initialConfig.strokeLinecap}"></svg>`
    )
    expect(output.getAttribute('stroke-linecap')).toBe(
      initialConfig.strokeLinecap
    )
  })
})

describe('strokeLineJoinTransform', () => {
  it('should replace any stroke-linejoin attribute on all elements', () => {
    // TODO: Add outputSolid / outputOutlined tests for this
    const output = transform(
      strokeLineJoinTransform,
      '<svg stroke-linejoin="hi"><path stroke-linejoin="hi" /><line stroke-linejoin="hi" /><polygon stroke-linejoin="hi" /><polyline stroke-linejoin="hi" /><ellipse stroke-linejoin="hi" /><rect stroke-linejoin="hi" /><circle stroke-linejoin="hi" /></svg>'
    )
    expect(output.getAttribute('stroke-linejoin')).toBe('round')
    expect(output.querySelector('path')?.getAttribute('stroke-linejoin')).toBe(
      'round'
    )
    expect(output.querySelector('line')?.getAttribute('stroke-linejoin')).toBe(
      'round'
    )
    expect(
      output.querySelector('polygon')?.getAttribute('stroke-linejoin')
    ).toBe('round')
    expect(
      output.querySelector('polyline')?.getAttribute('stroke-linejoin')
    ).toBe('round')
    expect(
      output.querySelector('ellipse')?.getAttribute('stroke-linejoin')
    ).toBe('round')
    expect(output.querySelector('rect')?.getAttribute('stroke-linejoin')).toBe(
      'round'
    )
    expect(
      output.querySelector('circle')?.getAttribute('stroke-linejoin')
    ).toBe('round')
  })

  it('should use the custom config value when replacing', () => {
    // TODO: Add outputSolid / outputOutlined tests for this
    const output = transform(
      strokeLineJoinTransform,
      '<svg stroke-linejoin="hi"></svg>',
      { strokeLinejoin: 'miter' }
    )
    expect(output.getAttribute('stroke-linejoin')).toBe('miter')
  })

  it('should not change the value of the stroke-linejoin attribute when already set as the default', () => {
    // TODO: Add outputSolid / outputOutlined tests for this
    const output = transform(
      strokeLineJoinTransform,
      `<svg stroke-linejoin="${initialConfig.strokeLinejoin}"></svg>`
    )
    expect(output.getAttribute('stroke-linejoin')).toBe(
      initialConfig.strokeLinejoin
    )
  })
})

describe('strokeColorTransform', () => {
  it('should change the stroke color', () => {
    // TODO: Add outputSolid / outputOutlined tests for this
    const output = transform(
      strokeColorTransform,
      '<svg><path stroke="green" /></svg>',
      { stroke: 'blue' }
    )
    expect(output.querySelector('path')?.getAttribute('stroke')).toBe('blue')
  })

  it('should not change the stroke color when already set to the default', () => {
    // TODO: Add outputSolid / outputOutlined tests for this
    const output = transform(
      strokeColorTransform,
      `<svg><path stroke="${initialConfig.stroke}" /></svg>`
    )
    expect(output.querySelector('path')?.getAttribute('stroke')).toBe(
      initialConfig.stroke
    )
  })

  it('should not add a stroke color when not already set', () => {
    // TODO: Add outputSolid / outputOutlined tests for this
    const output = transform(svgAttributesTransform, '<svg><path /></svg>')
    expect(output.querySelector('path')?.getAttribute('stroke')).toBeNull()
  })

  it('should avoid updates if there are elements with different stroke values', () => {
    // TODO: Add outputSolid / outputOutlined tests for this
    const output = transform(
      strokeColorTransform,
      '<svg><path stroke="blue" /><path stroke="red" /></svg>'
    )
    expect(output.outerHTML).toMatchInlineSnapshot(
      `"<svg><path stroke="blue"></path><path stroke="red"></path></svg>"`
    )
  })

  it('should make updates if there are elements with different stroke values but they fall under "currentColor, inherit, initial, transparent, unset, 0"', () => {
    // TODO: Add outputSolid / outputOutlined tests for this
    const output = transform(
      strokeColorTransform,
      '<svg><path stroke="currentColor" /><path stroke="inherit" /><path stroke="initial" /><path stroke="transparent" /><path stroke="unset" /><path stroke="0" /><path stroke="blue"></svg>'
    )
    expect(output.outerHTML).toMatchInlineSnapshot(
      `"<svg><path stroke="currentColor"></path><path stroke="currentColor"></path><path stroke="currentColor"></path><path stroke="currentColor"></path><path stroke="currentColor"></path><path stroke="currentColor"></path><path stroke="currentColor"></path></svg>"`
    )
  })

  it('should update stroke attribute', () => {
    const outputSolid = transform(
      strokeColorTransform,
      '<svg stroke="red"><path stroke="red"/></svg>',
      { iconSetType: 'solid' }
    )
    const outputOutlined = transform(
      strokeColorTransform,
      '<svg stroke="red"><path stroke="red"/></svg>',
      { iconSetType: 'outlined' }
    )

    expect(
      outputSolid.querySelector('svg')?.getAttribute('stroke')
    ).toBeUndefined()
    expect(
      outputOutlined.querySelector('svg')?.getAttribute('stroke')
    ).toBeUndefined()

    expect(outputSolid.querySelector('path')?.getAttribute('stroke')).toBe(
      'red'
    )
    expect(outputOutlined.querySelector('path')?.getAttribute('stroke')).toBe(
      'currentColor'
    )
  })

  it('should not update stroke attribute when already set to the initial value', () => {
    const outputSolid = transform(
      strokeColorTransform,
      '<svg stroke="currentColor"><path stroke="currentColor"/></svg>',
      { iconSetType: 'solid' }
    )
    const outputOutlined = transform(
      strokeColorTransform,
      '<svg stroke="currentColor"><path stroke="currentColor"/></svg>',
      { iconSetType: 'outlined' }
    )

    expect(
      outputSolid.querySelector('svg')?.getAttribute('stroke')
    ).toBeUndefined()
    expect(
      outputOutlined.querySelector('svg')?.getAttribute('stroke')
    ).toBeUndefined()

    expect(outputSolid.querySelector('path')?.getAttribute('stroke')).toBe(
      'currentColor'
    )
    expect(outputOutlined.querySelector('path')?.getAttribute('stroke')).toBe(
      'currentColor'
    )
  })

  it('should not update stroke attribute when empty', () => {
    const outputSolid = transform(
      fillColorTransform,
      '<svg stroke=""><path stroke="" /></svg>',
      { iconSetType: 'solid' }
    )
    const outputOutlined = transform(
      fillColorTransform,
      '<svg stroke=""><path stroke="" /></svg>',
      { iconSetType: 'outlined' }
    )

    expect(
      outputSolid.querySelector('svg')?.getAttribute('stroke')
    ).toBeUndefined()
    expect(
      outputOutlined.querySelector('svg')?.getAttribute('stroke')
    ).toBeUndefined()

    expect(outputSolid.querySelector('path')?.getAttribute('stroke')).toBe('')
    expect(outputOutlined.querySelector('path')?.getAttribute('stroke')).toBe(
      ''
    )
  })
})

describe('fillColorTransform', () => {
  it('should change the fill color', () => {
    const outputSolid = transform(
      fillColorTransform,
      '<svg fill="green"><path fill="green" /></svg>',
      { fill: 'blue', iconSetType: 'solid' }
    )
    const outputOutlined = transform(
      fillColorTransform,
      '<svg fill="green"><path fill="green" /></svg>',
      { fill: 'blue', iconSetType: 'outlined' }
    )

    expect(
      outputSolid.querySelector('svg')?.getAttribute('fill')
    ).toBeUndefined()
    expect(
      outputOutlined.querySelector('svg')?.getAttribute('fill')
    ).toBeUndefined()

    expect(outputSolid.querySelector('path')?.getAttribute('fill')).toBe('blue')
    expect(outputOutlined.querySelector('path')?.getAttribute('fill')).toBe(
      'green'
    )
  })

  it('should not change the fill color when already set to the default', () => {
    const outputSolid = transform(
      fillColorTransform,
      `<svg fill="currentColor"><path fill="currentColor" /></svg>`,
      { iconSetType: 'solid' }
    )
    const outputOutlined = transform(
      fillColorTransform,
      `<svg fill="currentColor"><path fill="currentColor" /></svg>`,
      { iconSetType: 'outlined' }
    )

    expect(
      outputSolid.querySelector('svg')?.getAttribute('fill')
    ).toBeUndefined()
    expect(
      outputOutlined.querySelector('svg')?.getAttribute('fill')
    ).toBeUndefined()

    expect(outputSolid.querySelector('path')?.getAttribute('fill')).toBe(
      'currentColor'
    )
    expect(outputOutlined.querySelector('path')?.getAttribute('fill')).toBe(
      'currentColor'
    )
  })

  it('should not add a fill color when not already set', () => {
    const outputSolid = transform(fillColorTransform, '<svg><path /></svg>', {
      iconSetType: 'solid',
    })
    const outputOutlined = transform(
      fillColorTransform,
      '<svg><path /></svg>',
      {
        iconSetType: 'outlined',
      }
    )

    expect(
      outputSolid.querySelector('svg')?.getAttribute('fill')
    ).toBeUndefined()
    expect(
      outputOutlined.querySelector('svg')?.getAttribute('fill')
    ).toBeUndefined()

    expect(outputSolid.querySelector('path')?.getAttribute('fill')).toBeNull()
    expect(
      outputOutlined.querySelector('path')?.getAttribute('fill')
    ).toBeNull()
  })

  it('should avoid updates if there are elements with different fill values', () => {
    const outputSolid = transform(
      fillColorTransform,
      '<svg fill="orange"><path fill="blue" /><path fill="red" /></svg>',
      { iconSetType: 'solid' }
    )
    const outputOutlined = transform(
      fillColorTransform,
      '<svg fill="orange"><path fill="blue" /><path fill="red" /></svg>',
      { iconSetType: 'outlined' }
    )

    expect(outputSolid.outerHTML).toMatchInlineSnapshot(
      `"<svg fill="orange"><path fill="blue"></path><path fill="red"></path></svg>"`
    )
    expect(outputOutlined.outerHTML).toMatchInlineSnapshot(
      `"<svg fill="orange"><path fill="blue"></path><path fill="red"></path></svg>"`
    )
  })

  it('should make updates if there are elements with different fill values but not when they fall under "currentColor, inherit, initial, transparent, unset, 0"', () => {
    const outputSolid = transform(
      fillColorTransform,
      '<svg fill="unset"><path fill="currentColor" /><path fill="inherit" /><path fill="initial" /><path fill="transparent" /><path fill="unset" /><path fill="0" /><path fill="blue" /></svg>',
      { iconSetType: 'solid', fill: 'new-color' }
    )
    const outputOutlined = transform(
      fillColorTransform,
      '<svg fill="unset"><path fill="currentColor" /><path fill="inherit" /><path fill="initial" /><path fill="transparent" /><path fill="unset" /><path fill="0" /><path fill="blue" /></svg>',
      { iconSetType: 'outlined', fill: 'new-color' }
    )

    expect(outputSolid.outerHTML).toMatchInlineSnapshot(
      `"<svg fill="unset"><path fill="currentColor"></path><path fill="inherit"></path><path fill="initial"></path><path fill="transparent"></path><path fill="unset"></path><path fill="0"></path><path fill="new-color"></path></svg>"`
    )
    expect(outputOutlined.outerHTML).toMatchInlineSnapshot(
      `"<svg fill="unset"><path fill="currentColor"></path><path fill="inherit"></path><path fill="initial"></path><path fill="transparent"></path><path fill="unset"></path><path fill="0"></path><path fill="blue"></path></svg>"`
    )
  })
})
