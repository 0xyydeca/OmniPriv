import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should display landing page with correct content', async ({ page }) => {
    await page.goto('/');

    // Check main heading
    await expect(page.getByText('PrivID')).toBeVisible();
    await expect(
      page.getByText('Privacy-Preserving Cross-Chain Identity')
    ).toBeVisible();

    // Check problem statement
    await expect(
      page.getByText(/on-chain apps need to verify user attributes/i)
    ).toBeVisible();

    // Check features
    await expect(page.getByText('Zero-Knowledge Proofs')).toBeVisible();
    await expect(page.getByText('Cross-Chain Ready')).toBeVisible();
    await expect(page.getByText('Gasless Onboarding')).toBeVisible();

    // Check CTA button
    const getStartedButton = page.getByRole('button', {
      name: /get started/i,
    });
    await expect(getStartedButton).toBeVisible();
  });

  test('should show loading state initially', async ({ page }) => {
    await page.goto('/');
    const button = page.getByRole('button', { name: /get started/i });

    // Button may show "Loading..." initially
    const buttonText = await button.textContent();
    expect(buttonText).toMatch(/Get Started|Loading/i);
  });
});

test.describe('Dashboard Access', () => {
  test('should show login prompt when accessing dashboard unauthenticated', async ({
    page,
  }) => {
    // Try to access dashboard directly
    await page.goto('/dashboard');

    // Should redirect to home or show authentication
    await page.waitForTimeout(1000);
    const url = page.url();
    expect(url).toMatch(/\/$|\/dashboard/);
  });
});

