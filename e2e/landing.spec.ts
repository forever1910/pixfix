import { test, expect } from '@playwright/test'

test.describe('Landing page', () => {
  test('renders brand title without wrapping (desktop)', async ({ page }) => {
    await page.goto('/')
    // Brand must be visible
    await expect(page.locator('text=片场修狗').first()).toBeVisible()
    // No character-level line break: the entire brand block stays unbroken
    const brandEl = page.locator('text=片场修狗').first()
    const box = await brandEl.boundingBox()
    expect(box).not.toBeNull()
    // On desktop (1280px), the text should be wider than ~200px — not wrapped
    expect(box!.width).toBeGreaterThan(200)
  })

  test('renders on mobile without horizontal overflow', async ({ page }) => {
    // Pixel 7 viewport
    await page.goto('/')
    await expect(page.locator('text=片场修狗').first()).toBeVisible()

    // Check no horizontal scrollbar
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth)
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1) // ±1px rounding tolerance
  })

  test('body has no default margin (full bleed)', async ({ page }) => {
    await page.goto('/')
    const margin = await page.evaluate(() => {
      const style = getComputedStyle(document.body)
      return { margin: style.margin, padding: style.padding }
    })
    expect(margin.margin).toBe('0px')
    expect(margin.padding).toBe('0px')
  })

  test('CTA buttons are visible', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('进片场')).toBeVisible()
    await expect(page.getByText('已有账号')).toBeVisible()
  })

  test('submit link navigates to /submit', async ({ page }) => {
    await page.goto('/')
    await page.click('a[href="/submit"]')
    await expect(page).toHaveURL(/\/submit/)
    await expect(page.getByPlaceholder(/网盘/)).toBeVisible()
  })
})

test.describe('Submit flow', () => {
  test('shows validation error for empty link', async ({ page }) => {
    await page.goto('/submit')
    await page.click('button:has-text("送入片场")')
    await expect(page.getByText('请粘贴网盘链接')).toBeVisible()
  })

  test('shows error for invalid URL format', async ({ page }) => {
    await page.goto('/submit')
    await page.fill('input[type="url"]', 'not-a-url')
    await page.click('button:has-text("送入片场")')
    // HTML5 url validation blocks submit; form won't fire
    await expect(page.locator('input[type="url"]:invalid')).toBeVisible()
  })
})

test.describe('Task progress page', () => {
  test('shows error for non-existent task', async ({ page }) => {
    await page.goto('/task/nonexist')
    await expect(page.getByText(/找不到/)).toBeVisible({ timeout: 5000 })
  })
})
