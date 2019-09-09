import * as fs from 'fs';
import {DIST_DIRECTORY} from "../common";
import * as path from "path";

describe('Static website', () => {

  test('should generate a sitemap.xml file', () => {
    const file = path.resolve(__dirname, DIST_DIRECTORY, `sitemap.xml`);
    const content = fs.readFileSync(file, 'utf-8');
    expect(content).toContain('<loc>https://dev-mind.fr/</loc>');
  });
});
