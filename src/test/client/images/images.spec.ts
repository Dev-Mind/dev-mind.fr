import * as fs from 'fs';
import {DIST_DIRECTORY} from "../common";

describe('Images', () => {

  test('should expose logo without cache busting', async () => {
    const file = `${__dirname}/${DIST_DIRECTORY}/img/logo/logo.svg`;
    expect(file.length).toBeGreaterThan(20);
  });

  test('should expose a favicon', async () => {
    const file = `${__dirname}/${DIST_DIRECTORY}/favicon.ico`;
    expect(file.length).toBeGreaterThan(20);
  });

  test('should create webp images', async () => {
    const webFiles = fs.readdirSync(`${__dirname}/${DIST_DIRECTORY}/img/logo/.`)
      .filter(file => file.length > 4)
      .map(file => file.substr(file.length - 4, 4))
      .filter(ext => ext === 'webp');
    expect(webFiles.length).toBeGreaterThan(1);
  });

});
