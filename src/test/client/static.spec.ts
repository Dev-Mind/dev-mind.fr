import * as path from 'path';
import * as fs from 'fs';
//jest.dontMock('fs');

describe('Static website', () => {

  test('should generate a manifest with the main informations', async () => {
    const manifest = require('../../../build/dist/manifest.json');
    expect(manifest.name).toBe('Dev-Mind');
    expect(manifest.icons.length).toBe(5);
    expect(manifest.start_url).toBe('/');
  });

  test('should generate a file for robot indexing', () => {
    const file = path.resolve(__dirname, '../../../build/dist/robots.txt');
    expect(file.length).toBeGreaterThan(20);
  });

  test('should generate a sitemap.xml file', () => {
    const file = path.resolve(__dirname, '../../../build/dist/sitemap.xml');
    const content = fs.readFileSync(file, 'utf-8');
    expect(content).toContain('<loc>https://dev-mind.fr/</loc>');
  });
});
