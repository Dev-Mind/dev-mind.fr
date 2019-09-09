import {HtmlPage} from "./html.page";

describe('Blog article wrote in 2019', () => {

  const page = new HtmlPage('blog/2019/application_android_score.html');

  test('should have a title "Application pour saisir les scores"', async () => {
    const title = await page.title();
    expect(title).toBe('Application pour saisir les scores');
  });

  test('should have a main section "Application pour saisir les scores"', async () => {
    const sections = await page.loadSections();
    expect(sections.length).toBe(1);
    expect(sections[0]).toContain('Application pour saisir les scores');
  });

  test('should display the write date"', async () => {
    const element = await page.loadOneBlockByClass('dm-blog--info-date');
    expect(element).toContain('01/01/2019');
  });

  test('should display the keywords"', async () => {
    const element = await page.loadOneBlockByClass('blog-keywords');
    expect(element).toContain('Android');
  });

  test('should check common footer', async () => {
    await page.checkCommonFooter();
  });
});
