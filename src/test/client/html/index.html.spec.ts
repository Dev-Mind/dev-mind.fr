import {HtmlPage} from "./HtmlPage";
//jest.dontMock('fs');

describe('Page index.html', () => {

  const page = new HtmlPage('index.html');

  test('should have a title Dev-Mind', async () => {
    const title = await page.title();
    expect(title).toBe('Dev-Mind');
  });

  test('should have a main section "Dev and formation"', async () => {
    const sections = await page.loadSections();
    expect(sections).toEqual(['Développement &amp; Formation']);
  });

  test('should have sub sections to explain activity', async () => {
    const sections = await page.loadSubSections();
    expect(sections).toEqual([
      'Derniers articles de blog',
      'Actualités',
      'Contact'
    ]);
  });

  test('should check common footer', async () => {
    await page.checkCommonFooter();
  });
});
