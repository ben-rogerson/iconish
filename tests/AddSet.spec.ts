import type { Page } from '@playwright/test'
import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

const toggleSidebar = (page: Page) =>
  page.getByRole('button', { name: 'View icon sets' }).click()

const addNewSet = (page: Page) =>
  page.getByRole('button', { name: 'New set' }).click()

test('icon sets can be added', async ({ page }) => {
  await toggleSidebar(page)

  await expect(page.getByRole('article', { name: 'Icon set' })).toHaveCount(1)

  await addNewSet(page)
  await expect(page.getByRole('article', { name: 'Icon set' })).toHaveCount(2)
})

test('icons sets can be removed', async ({ page }) => {
  await toggleSidebar(page)

  const iconSet = page.getByRole('article', { name: 'Icon set' })
  await expect(iconSet).toHaveCount(1)

  await iconSet.getByRole('button', { name: 'More options' }).click()
  await page.getByRole('menuitem', { name: /Delete set/i }).click()

  // Verify a new set isn't created (min 1 set)
  await expect(iconSet).toHaveCount(1)

  await expect(page.getByRole('region', { includeHidden: true })).toContainText(
    'Add another set first'
  )
})

test('icons sets can be named', async ({ page }) => {
  await toggleSidebar(page)

  const withinSidebar = page.getByTestId('sidebar')
  const withinHeader = page.getByLabel('Current set')

  const iconSet = withinSidebar.getByRole('article', { name: 'Icon set' })
  await expect(iconSet).toHaveCount(1)

  const input = withinSidebar.getByLabel('Icon set title')
  await expect(input).toHaveCount(1)

  await input.focus()
  await input.fill('New set name')
  await input.press('Enter')

  // Test the name is updated in the sidebar
  await expect(input).toHaveValue('New set name')

  // Test the name is also updated in the header
  await expect(withinHeader.getByLabel('Icon set title')).toHaveValue(
    'New set name'
  )
})
