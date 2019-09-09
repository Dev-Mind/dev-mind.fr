import * as path from 'path';
import {DIST_DIRECTORY} from "../common";
import * as fs from "fs";

describe('Static website', () => {

  test('should generate a file for robot indexing', () => {
    const file = path.resolve(__dirname, DIST_DIRECTORY, 'robots.txt');
    const content = fs.readFileSync(file, 'utf-8');
    expect(content.length).toBeGreaterThan(20);
  });
});
