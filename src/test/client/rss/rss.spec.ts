import {DIST_DIRECTORY} from "../common";

describe('Rss', () => {

  test('should generate a rss flow file', async () => {
    const file = `${__dirname}/${DIST_DIRECTORY}/rss/blog.xml`;
    expect(file.length).toBeGreaterThan(20);
  });

});
