import { expect, test } from '@playwright/test'

test('landing page communicates the product and opens authentication', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: /Know what your resume signals/i })).toBeVisible()
  await page.getByRole('button', { name: /Get your free analysis/i }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(page.getByRole('heading', { name: /Welcome back/i })).toBeVisible()
})

test('protected analyzer shows a sign-in state', async ({ page }) => {
  await page.goto('/analyze')
  await expect(page.getByRole('heading', { name: /Sign in to continue/i })).toBeVisible()
})

test('resources page renders ATS guidance', async ({ page }) => {
  await page.goto('/resources')
  await expect(page.getByRole('heading', { name: /Write for people/i })).toBeVisible()
  await expect(page.getByText('Use standard section headings')).toBeVisible()
})
