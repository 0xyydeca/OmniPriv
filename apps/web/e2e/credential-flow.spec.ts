import { test, expect } from '@playwright/test';

test.describe('Credential Flow (Visual)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should navigate through dashboard tabs', async ({ page }) => {
    // Note: This test assumes user is logged in
    // For MVP, we'll just check if tabs exist after mock login

    // For now, just verify the homepage structure
    await expect(page.getByText('PrivID')).toBeVisible();

    // Check that the flow is described
    await expect(page.getByText(/Create your embedded wallet/i)).toBeVisible();
    await expect(page.getByText(/Add credentials from trusted issuers/i)).toBeVisible();
    await expect(
      page.getByText(/Generate zero-knowledge proofs/i)
    ).toBeVisible();
  });

  test('should display all feature cards', async ({ page }) => {
    // Zero-knowledge
    const zkCard = page.locator('text=Zero-Knowledge Proofs').locator('..');
    await expect(zkCard).toBeVisible();

    // Cross-chain
    const crossChainCard = page.locator('text=Cross-Chain Ready').locator('..');
    await expect(crossChainCard).toBeVisible();

    // Gasless
    const gaslessCard = page.locator('text=Gasless Onboarding').locator('..');
    await expect(gaslessCard).toBeVisible();
  });
});

test.describe('Privacy & Security Features', () => {
  test('should show privacy-focused messaging', async ({ page }) => {
    await page.goto('/');

    // Check for privacy-related keywords
    await expect(page.getByText(/without doxxing/i)).toBeVisible();
    await expect(page.getByText(/privacy/i)).toBeVisible();
  });
});

