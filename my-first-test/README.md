# Лаб 1: UI автомат тест — Playwright

F.CSA313 — Программ хангамжийн чанарын баталгаа ба тест (2026)

- Нэр: Г.Эрхэмбаяр
- Оюутны код: B232270055

Дадлагын сайт [saucedemo.com](https://www.saucedemo.com) дээр Playwright (TypeScript)-ээр бичсэн UI тестүүд.

## Орчин

| Зүйл | Хувилбар |
|---|---|
| Node.js | v24.22.0 |
| @playwright/test | 1.65.1 |
| ОС | Windows 11 |
| Хөтөч (тест) | Chromium (headless) |

Төсөл `npm init playwright@latest my-first-test` командаар үүссэн.

## Хавтасны бүтэц

| Зам | Тайлбар |
|---|---|
| `tests/mytest.spec.ts` | Миний бичсэн 3 тест |
| `playwright.config.ts` | `trace: 'on'`, `video: 'on'` тохиргоотой |
| `report/` | HTML report (trace ба видеотой) |
| `.gitignore` | `node_modules`, `test-results`, `playwright-report` |

## Ажиллуулах

```bash
npm install
npx playwright install
npx playwright test tests/mytest.spec.ts --project=chromium
npx playwright show-report
```

Үр дүн: `3 passed`.

## Хэсэг A: Тестүүд

| № | Тест | Хийх үйлдэл | Шалгалт (assertion) |
|---|---|---|---|
| 1 | амжилттай нэвтрэх | `standard_user` / `secret_sauce`-ээр нэвтэрч, logout хийнэ | `toHaveURL(/inventory\.html/)`, `getByText('Products')` `toBeVisible`, logout-ын дараа `toHaveURL` ба Login товч `toBeVisible` |
| 2 | буруу нууц үгээр нэвтрэхэд алдаа гарна | Буруу нууц үг оруулна | `getByTestId('error')` `toContainText('Username and password do not match')`, `not.toHaveURL(/inventory\.html/)` |
| 3 | бараа сагслах | Эхний барааг "Add to cart" дарж, logout хийнэ | Сагсны тоо `toHaveText('1')`, товч "Remove" болсныг `toBeVisible`, logout |

### Locator сонголт

Ашигласан: `getByPlaceholder`, `getByRole`, `getByText`, `getByTestId`. XPath ашиглаагүй: XPath нь DOM-ийн бүтэц (div-ийн давхарга, дараалал)-тэй чанга холбогддог тул хуудасны жижиг өөрчлөлтөөр эвдэрдэг, уншихад хэцүү. Харин role, label, text нь хэрэглэгчийн харж буй зүйлд тулгуурладаг тул тогтвортой, уншигдахуйц, accessibility-тэй уялддаг.

`getByTestId` нь saucedemo-д `data-test` атрибуттай тул `test.use({ testIdAttribute: 'data-test' })` гэж тохируулсан.

### Тест хоорондын хамааралгүй байдал (isolation)

Тест бүр Playwright-ийн шинэ browser context-оор ажилладаг тул cookie, сагс, session хуваалцахгүй. Нэвтэрсэн 2 тест `logout()` helper-ээр төгсөнө (цэс нээх → Logout → нэвтрэх хуудас буцсаныг шалгах). Нэвтрээгүй тест (№2) logout хийх шаардлагагүй.

## Хэсэг B: Codegen

`npx playwright codegen --channel=msedge saucedemo.com`-оор гарсан код (үйлдэл: нэвтрэх, цэс нээх/хаах, бараа сагслах, checkout, logout) ба миний тестийн харьцуулалт:

| Шинж | Codegen | Миний тест |
|---|---|---|
| Locator | `page.locator('[data-test="..."]')` (CSS) | `getByRole`, `getByPlaceholder`, `getByText`, `getByTestId` |
| Assertion | **Байхгүй** | `expect(...)` олон |
| Давтагдал | `[data-test="username"]` 3 удаа | `login()`, `logout()` helper |
| Коммент | Байхгүй | Бүх алхамд |
| Тестийн нэр | `test('test')` | Утга бүхий нэр |
| Илүү алхам | Санамсаргүй `div` дарсан мөр орсон | Зөвхөн хэрэгтэй алхам |

Codegen нь шалгалтгүй тул эвдэрсэн ч өнгөрөх тест үүсгэнэ. Харин шинэ хуудасны элементийн `data-test` нэрийг хурдан олоход тустай.

## Хэсэг C: Trace viewer ба санаатайгаар унагалт

Эхний тестийн `toHaveURL(/inventory\.html/)`-ийг түр `/wrong\.html/` болгож, `--trace on`-оор ажиллуулсан:

```
Error: expect(page).toHaveURL(expected) failed
Expected pattern: /wrong\.html/
Received string:  "https://www.saucedemo.com/inventory.html"
```

| Үр дүн | Тест |
|---|---|
| Унасан | `амжилттай нэвтрэх` (`mytest.spec.ts:31`) |
| Өнгөрсөн | `буруу нууц үгээр...`, `бараа сагслах` |

Trace viewer дээр унасан `toHaveURL` алхам, тухайн мөчийн хуудасны DOM snapshot, хүлээсэн ба бодит утгыг харж болно. Дараа нь assertion-ийг `/inventory\.html/` болгож буцаасан, эцсийн ажиллуулалт `3 passed`.

## Асуудал ба шийдэл

| Асуудал | Шалтгаан | Шийдэл |
|---|---|---|
| `getByRole('link', { name: 'Logout' })` 30 секунд хүлээгээд унасан (2 тест) | Хажуугийн цэсний холбоос нээхээс өмнө aria-hidden тул role-оор олдоогүй | Codegen-ийн олсон `getByTestId('logout-sidebar-link')`-д шилжсэн. Role locator үргэлж хамгийн сайн сонголт биш |
| `npx playwright codegen`, `show-trace` ажиллаагүй: `chrome.dll ... Application Control policy has blocked this file` | Windows-ийн Application Control policy цонхтой Chromium-ийг блоклосон. Headless тест нь өөр binary ашигладаг тул ажилласан | Codegen-ийг `--channel=msedge`-ээр, trace-ийг онлайн viewer-ээр нээсэн |

## Playwright ба Selenium-ийн ажиглалт

Playwright-ийн auto-wait нь элемент бэлэн болтол өөрөө хүлээдэг тул гараар explicit wait бичих хэрэггүй байсан. Суулгалт нэг командаар дуусч, хөтөчид тусдаа driver шаардаагүй. Codegen нь үйлдлийг код болгон бичсэн ч assertion огт бичээгүй, мөн CSS селектор ашигласан тул миний `getByRole` дээр суурилсан тестээс бага уншигдахуйц байсан. Trace viewer нь алхам бүрийн DOM snapshot харуулдаг тул санаатайгаар унагасан `toHaveURL` алдааг (хүлээсэн `wrong.html`, бодит `inventory.html`) шууд олсон нь лог, скриншотоос илүү хялбар. Тест бүр шинэ browser context-оор ажилладаг тул хоорондоо хамааралгүй. Selenium нь илүү олон хэл, хөтөч, хуучин төслийг дэмждэг бол Playwright нь тест бичих, дебаг хийхэд хурдан. Аль аль нь Apache 2.0 лицензтэй, үнэгүй тул сонголт нь техникийн давуу талаас хамаарна.
