import {HtmlPage} from "./html.page";

describe('Blog article wrote in 2017', () => {

  const page = new HtmlPage('blog/2017/creer_service_worker.html');

  test('should have a title "Créer un Service Worker"', async () => {
    const title = await page.title();
    expect(title).toBe('Créer un Service Worker');
  });

  test('should have a main section "Créer un Service Worker"', async () => {
    const sections = await page.loadSections();
    expect(sections.length).toBe(1);
    expect(sections[0]).toContain('Créer un Service Worker');
  });

  test('should display the write date"', async () => {
    const element = await page.loadOneBlockByClass('dm-blog--info-date');
    expect(element).toContain('28/06/2017');
  });

  test('should display the keywords"', async () => {
    const element = await page.loadOneBlockByClass('blog-keywords');
    expect(element).toContain('Web');
    expect(element).toContain('PWA');
    expect(element).toContain('ServiceWorker');

  });

  test('should check common footer', async () => {
    await page.checkCommonFooter();
  });
});
