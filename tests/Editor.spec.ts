import type { Page } from '@playwright/test'
import { test, expect } from '@playwright/test'

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// https://github.com/microsoft/playwright/issues/4302#issuecomment-1165404704
const scroll = async ({
  direction,
  speed,
}: {
  direction: 'down' | 'up'
  speed: 'slow' | 'fast'
}) => {
  const scrollHeight = () => document.body.scrollHeight
  const start = direction === 'down' ? 0 : scrollHeight()
  const shouldStop = (position: number) =>
    direction === 'down' ? position > scrollHeight() : position < 0
  const increment = direction === 'down' ? 100 : -100
  const delayTime = speed === 'slow' ? 50 : 10
  for (let i = start; !shouldStop(i); i += increment) {
    window.scrollTo(0, i)
    await new Promise(resolve => setTimeout(resolve, delayTime))
  }
}

const setupFirstEditor = async (page: Page) => {
  // Assert no add button when starting
  const addButton = page.getByRole('button', { name: /Add SVG/i })
  await expect(addButton).toHaveCount(0)

  // Add an editor to enable the add buttons
  const addSvgButton = page.getByRole('button', {
    name: 'Random SVG',
  })
  await addSvgButton.click()
  await expect(page.getByRole('article', { name: 'editor' })).toHaveCount(1)
}

const insertCustomIcon = async (svgCode: string, page: Page) => {
  const item = page
    .locator('[data-test-id=virtuoso-item-list]')
    .getByRole('article')

  const input = item.getByPlaceholder(/Paste svg/i)
  await expect(input).toHaveCount(1)

  await input.fill(svgCode)
  await input.press('Enter')

  await expect(item).toContainText(svgCode)
}

test.beforeEach(async ({ page }) => {
  await page.goto('http://localhost:3000/')
})

test('should have a preview area and not a code editor by default', async ({
  page,
}) => {
  await expect(page.getByRole('article', { name: 'preview' })).toHaveCount(1)
  await expect(page.getByRole('article', { name: 'editor' })).toHaveCount(0)
})

const getEditorTypes = async (page: Page) => {
  type EditorType = ['editor', 'preview'][number]
  const editors: EditorType[] = []
  for (const listItem of await page
    .locator('[data-test-id=virtuoso-item-list]')
    .getByRole('article')
    .all()) {
    const value = (await listItem.getAttribute(
      'aria-label'
    )) as EditorType | null
    value && editors.push(value)
  }
  return editors
}

test('should add an editor after clicking the add buttons', async ({
  page,
}) => {
  await setupFirstEditor(page)

  const initialItems = await getEditorTypes(page)
  expect(initialItems).toEqual(['editor'])

  // Virtuoso uses data-test-id and the project uses data-testid so we need to use this custom locator
  const contentList = page.locator('[data-test-id=virtuoso-item-list]')
  await contentList
    .getByRole('button', { name: /Add SVG/i })
    .first()
    .click()

  const itemsAfterAdd = await getEditorTypes(page)
  expect(itemsAfterAdd).toEqual(['preview', 'editor'])

  await contentList
    .getByRole('button', { name: /Add SVG/i })
    .last()
    .click()

  await page.evaluate(scroll, { direction: 'up', speed: 'fast' } as const)

  const itemsAfterSecondAdd = await getEditorTypes(page)
  expect(itemsAfterSecondAdd).toEqual(['preview', 'editor', 'preview'])
})

test('should remove an editor after clicking the remove button', async ({
  page,
}) => {
  await setupFirstEditor(page)

  const editor = page.getByRole('article', { name: 'editor' }).first()

  await editor.hover() // Hover to reveal the remove button
  await editor.getByLabel('Remove editor').click()

  await expect(page.getByRole('article', { name: 'editor' })).toHaveCount(0)
})

test('a svg can be added via paste', async ({ page }) => {
  const icon = '<svg><circle cx="50" cy="50" r="40"/></svg>'

  await insertCustomIcon(icon, page)

  const itemsAfter = await getEditorTypes(page)
  expect(itemsAfter).toEqual(['editor'])
})

test('a svg can be added via upload', async ({ page }) => {
  const icon = '<svg><circle cx="50" cy="50" r="80"/></svg>'

  const input = page.getByLabel('Upload SVGs')
  await input.setInputFiles({
    name: 'icon.svg',
    mimeType: 'image/svg+xml',
    buffer: Buffer.from(icon),
  })

  const itemsAfter = await getEditorTypes(page)
  expect(itemsAfter).toEqual(['editor'])
})

test('multiple svgs can be added via upload', async ({ page }) => {
  const icon = '<svg><circle cx="50" cy="50" r="10"/></svg>'
  const icon2 = '<svg><circle cx="50" cy="50" r="20"/></svg>'
  const icon3 = '<svg><circle cx="50" cy="50" r="30"/></svg>'
  const icon4 = '<svg><circle cx="50" cy="50" r="40"/></svg>'
  const iconTemplate = (iconContent: string, fileName: string) => ({
    name: `${fileName}.svg`,
    mimeType: 'image/svg+xml',
    buffer: Buffer.from(iconContent),
  })

  const input = page.getByLabel('Upload SVGs')
  await input.setInputFiles([iconTemplate(icon, 'a'), iconTemplate(icon2, 'b')])

  // TODO: Delay is required or test is spotty - Fix this
  await delay(500)

  expect(await getEditorTypes(page)).toStrictEqual(['editor', 'editor'])

  // Add a preview panel in the middle
  const contentList = page.locator('[data-test-id=virtuoso-item-list]')
  await contentList
    .getByRole('button', { name: /Add SVG/i })
    .nth(1)
    .click()

  expect(await getEditorTypes(page)).toEqual(['editor', 'preview', 'editor'])

  // Upload another two svgs in the middle (TODO: check the actual content is correct)
  const uploadInput = page.getByLabel('Upload SVGs')
  await uploadInput.setInputFiles([
    iconTemplate(icon3, 'c'),
    iconTemplate(icon4, 'd'),
  ])

  expect(await getEditorTypes(page)).toEqual([
    'editor',
    'editor',
    'editor',
    'editor',
  ])
})

test('a svg can be added via the test buttons', async ({ page }) => {
  await page
    .getByRole('article', { name: 'preview' })
    .first()
    .getByRole('button', { name: 'Random SVG' })
    .first()
    .click()

  await expect(page.getByRole('article', { name: 'editor' })).toHaveCount(1)
})

test('the output is jsx when "output jsx" is selected', async ({
  page,
  context,
}) => {
  const icon =
    '<svg stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="test"><path d="M12 12v.01"/></svg>'
  await insertCustomIcon(icon, page)

  const expectedJsxOutput =
    '<svg strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="test" viewBox="0 0 1 1"><path d="M12 12v.01" vectorEffect="non-scaling-stroke"/></svg>'

  await expect(page.getByRole('article', { name: 'editor' })).toContainText(
    expectedJsxOutput
  )

  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.getByRole('button', { name: 'Copy svg code to clipboard' }).click()
  const copiedText = await page.evaluate(() => navigator.clipboard.readText())
  expect(copiedText).toBe(expectedJsxOutput)
})

test('the output is svg when "output jsx" is not selected', async ({
  page,
  context,
}) => {
  const icon =
    '<svg stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="test"><path d="M12 12v.01"/></svg>'
  await insertCustomIcon(icon, page)

  await page.getByRole('checkbox', { name: 'output JSX' }).uncheck()

  const expectedSvgOutput =
    '<svg stroke-linecap="round" stroke-linejoin="round" stroke-width="2" class="test" viewBox="0 0 1 1"><path d="M12 12v.01" vector-effect="non-scaling-stroke"/></svg>'

  await expect(page.getByRole('article', { name: 'editor' })).toContainText(
    expectedSvgOutput
  )

  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.getByRole('button', { name: 'Copy svg code to clipboard' }).click()
  const copiedText = await page.evaluate(() => navigator.clipboard.readText())
  expect(copiedText).toBe(expectedSvgOutput)
})
