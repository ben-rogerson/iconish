import type { Page } from '@playwright/test'
import { test, expect } from '@playwright/test'

const setupFirstEditor = async (page: Page) => {
  // Set a large height to avoid the windowing removing the editor/preview from the DOM
  await page.setViewportSize({ width: 1200, height: 1200 })

  // Assert no add button when starting
  const addButton = page.getByRole('button', { name: /Add SVG/i })
  await expect(addButton).toHaveCount(0)

  // Add an editor to enable the add buttons
  const addSvgButton = page.getByRole('button', { name: 'Bug' })
  await addSvgButton.click()
  await expect(page.getByRole('article', { name: 'editor' })).toHaveCount(1)
}

test.beforeEach(async ({ page }) => {
  await page.goto('/')
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
    .getByRole('button', { name: 'Bug' })
    .first()
    .click()

  await expect(page.getByRole('article', { name: 'editor' })).toHaveCount(1)
})
