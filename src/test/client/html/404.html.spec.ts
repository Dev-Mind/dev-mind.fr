import {HtmlPage} from "./html.page";

describe('Page 404.html', () => {

  const page = new HtmlPage('404.html');

  test('should have a title Dev-Mind 404', async () => {
    const title = await page.title();
    expect(title).toBe('Dev-Mind 404');
  });

  test('should have a main section "Are you lost in the clouds ?? :("', async () => {
    const sections = await page.loadSections();
    expect(sections.length).toBe(1);
    expect(sections[0]).toContain(['Are you lost in the clouds ??']);
  });

  test('should check common footer', async () => {
    await page.checkCommonFooter();
  });
});
