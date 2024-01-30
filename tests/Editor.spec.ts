import type { Page } from '@playwright/test'
import { test, expect } from '@playwright/test'

// https://github.com/microsoft/playwright/issues/4302#issuecomment-1165404704
const scroll = async ({
  direction,
  speed,
}: {
  direction: 'down' | 'up'
  speed: 'slow' | 'fast'
}) => {
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
  const scrollHeight = () => document.body.scrollHeight
  const start = direction === 'down' ? 0 : scrollHeight()
  const shouldStop = (position: number) =>
    direction === 'down' ? position > scrollHeight() : position < 0
  const increment = direction === 'down' ? 100 : -100
  const delayTime = speed === 'slow' ? 50 : 10
  for (let i = start; !shouldStop(i); i += increment) {
    window.scrollTo(0, i)
    await delay(delayTime)
  }
}

const setupFirstEditor = async (page: Page) => {
  // Set a large height to avoid the windowing removing the editor/preview from the DOM
  await page.setViewportSize({ width: 1200, height: 1200 })

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

  const item = page
    .locator('[data-test-id=virtuoso-item-list]')
    .getByRole('article')

  const input = item.getByPlaceholder(/Paste svg/i)
  await expect(input).toHaveCount(1)

  await input.fill(icon)
  await input.press('Enter')

  const itemsAfter = await getEditorTypes(page)
  expect(itemsAfter).toEqual(['editor'])

  await expect(item).toContainText(icon)
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
