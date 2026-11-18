import { test, expect, Page } from '@playwright/test';

// saucedemo-ийн элементүүд data-testid биш data-test атрибуттай тул getByTestId үүнийг хайна.
test.use({ testIdAttribute: 'data-test' });

const URL = 'https://www.saucedemo.com';

// Нэвтрэх алхмыг давтахгүйн тулд нэг туслах функц болгов.
async function login(page: Page, user: string, pass: string) {
  await page.goto(URL);
  await page.getByPlaceholder('Username').fill(user);
  await page.getByPlaceholder('Password').fill(pass);
  await page.getByRole('button', { name: 'Login' }).click();
}

// Гарах үйлдэл: цэс нээгээд Logout дарж, нэвтрэх хуудас руу буцсаныг шалгана.
async function logout(page: Page) {
  await page.getByRole('button', { name: 'Open Menu' }).click();
    // Цэсний холбоос aria-hidden тул role-оор олдохгүй байсан, тиймээс testid ашиглав.
  await page.getByTestId('logout-sidebar-link').click();
  await expect(page).toHaveURL(URL + '/');
  await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
}

// Тест бүр шинэ browser context-той эхэлдэг тул хоорондоо хамааралгүй (test isolation).

test('амжилттай нэвтрэх', async ({ page }) => {
  await login(page, 'standard_user', 'secret_sauce');

  // Нэвтэрсний дараа бүтээгдэхүүний хуудас руу шилжсэнийг URL болон гарчигаар шалгана.
  await expect(page).toHaveURL(/inventory\.html/);
  await expect(page.getByText('Products')).toBeVisible();

  await logout(page);
});

test('буруу нууц үгээр нэвтрэхэд алдаа гарна', async ({ page }) => {
  await login(page, 'standard_user', 'wrong_password');

  // Алдааны мессеж гарч, нэвтрэх хуудсанд үлдсэнийг шалгана.
  await expect(page.getByTestId('error')).toContainText(
    'Username and password do not match'
  );
  await expect(page).not.toHaveURL(/inventory\.html/);
});

test('бараа сагслах', async ({ page }) => {
  await login(page, 'standard_user', 'secret_sauce');

  // Эхний барааг сагсанд нэмнэ. Олон "Add to cart" товч байгаа тул first() ашиглав.
  await page.getByRole('button', { name: 'Add to cart' }).first().click();

  // Сагсны тоо 1 болсон ба товч "Remove" болж өөрчлөгдсөнийг шалгана.
  await expect(page.getByTestId('shopping-cart-badge')).toHaveText('1');
  await expect(page.getByRole('button', { name: 'Remove' }).first()).toBeVisible();

  await logout(page);
});