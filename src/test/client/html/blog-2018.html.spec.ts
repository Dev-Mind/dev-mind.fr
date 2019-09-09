import {HtmlPage} from "./html.page";

describe('Blog article wrote in 2018', () => {

  const page = new HtmlPage('blog/2018/do_your_blog_yourself.html');

  test('should have a title "Do your Blog yourself"', async () => {
    const title = await page.title();
    expect(title).toBe('Do your Blog yourself');
  });

  test('should have a main section "Do your Blog yourself"', async () => {
    const sections = await page.loadSections();
    expect(sections.length).toBe(1);
    expect(sections[0]).toContain('Do your Blog yourself');
  });

  test('should display the write date"', async () => {
    const element = await page.loadOneBlockByClass('dm-blog--info-date');
    expect(element).toContain('02/01/2018');
  });

  test('should display the keywords"', async () => {
    const element = await page.loadOneBlockByClass('blog-keywords');
    expect(element).toContain('Web');
    expect(element).toContain('Blog');
    expect(element).toContain('Asciidoc');
    expect(element).toContain('Asciidoctor');
    expect(element).toContain('Clever Cloud');

  });

  test('should check common footer', async () => {
    await page.checkCommonFooter();
  });
});
