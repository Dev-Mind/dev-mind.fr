import {DIST_DIRECTORY} from "../common";
import * as path from "path";
import * as fs from "fs";

describe('Static website', () => {

  test('should generate a manifest with the main informations', async () => {
    const file = path.resolve(__dirname, DIST_DIRECTORY, 'manifest.json');
    const manifest = JSON.parse(fs.readFileSync(file, 'utf-8'));
    expect(manifest.name).toBe('Dev-Mind');
    expect(manifest.icons.length).toBe(5);
    expect(manifest.start_url).toBe('/');
  });
});
