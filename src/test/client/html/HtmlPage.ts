import {JSDOM} from "jsdom";
import * as path from "path";

export class HtmlPage{

  jsdom: Promise<JSDOM>;

  constructor(private url: string){
    this.jsdom = JSDOM.fromFile(path.resolve(__dirname, `../../../../build/dist/${this.url}`));
  }

  async document(): Promise<Document>{
    return (await this.jsdom).window.document;
  }

  async title(): Promise<string>{
    return (await this.document()).title;
  }

  private async loadHeadings(type): Promise<HTMLCollectionOf<HTMLElementTagNameMap['h1']>>{
    return (await this.document()).getElementsByTagName(type);
  }

  async loadSections(): Promise<Array<string>>{
    const sections = await this.loadHeadings('h1');
    return Array.from(sections).map(e => e.innerHTML);
  }

  async loadSubSections(): Promise<Array<string>>{
    const sections = await this.loadHeadings('h2');
    return Array.from(sections).map(e => e.innerHTML);
  }

  async checkCommonFooter(){
    const footer = (await this.document()).getElementById('footer-dm_society');
    expect(footer.textContent).toContain('SARL au capital de 5000');
    expect(footer.textContent).toContain('SIREN : 808 720 759, au RCS de Saint-Etienne');
    expect(footer.textContent).toContain('@2019 Guillaume EHRET');
  }
}
