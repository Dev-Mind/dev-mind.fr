import {Db, MongoClient} from "mongodb";
import {MONGO_TEST_OPTIONS, MONGO_TEST_URL} from "./dao.config";
import {COLLECTION_STATS_PAGEVISITS, UniquePageVisitDao} from "../../../main/server/dao/statistic.dao";
import {UniquePageVisit} from "../../../main/server/model/statistic";


describe('uniquepage.dao integration test', () => {

  let mongoClient: MongoClient;
  let mongoDb: Db;
  let uniquepageDao: UniquePageVisitDao;
  let uniquePageVisit: UniquePageVisit;

  /**
   * To execute an integration test we need to open a MongoDB connection
   */
  beforeAll(async() => {
    mongoClient = await new MongoClient(MONGO_TEST_URL, MONGO_TEST_OPTIONS).connect();
    mongoDb = await mongoClient.db();
  }, 1000);

  /**
   * Database as to be closed when all the tests are finished
   */
  afterAll(async() => {
    await mongoClient.close(true);
  });

  afterEach(async() => {
    await mongoDb.dropCollection(COLLECTION_STATS_PAGEVISITS);
  });

  beforeEach(async() => {
    uniquePageVisit = {
      url: 'https://dev-mind.fr',
      count: 3
    };
    await mongoDb.collection(COLLECTION_STATS_PAGEVISITS).insertOne(uniquePageVisit);
    uniquepageDao = new UniquePageVisitDao(mongoClient.db());
  });


  test('should insert a new url',  async() => {
    const url = 'https://dev-mind.fr/blog';
    await uniquepageDao.initVisit(url, 1);

    const stats = await uniquepageDao.findAll()
    const newVisit = stats.filter(stat => stat.url === url)[0];

    expect(newVisit.url).toBe(url);
    expect(newVisit.count).toBe(1);
  });

  test('should update an existing url count vist',  async() => {
    await uniquepageDao.updateVisit(uniquePageVisit.url);

    const stats = await uniquepageDao.findAll();
    const updatedVisit = stats.filter(stat => stat.url === uniquePageVisit.url)[0];

    expect(updatedVisit.count).toBe(4);
  });

  test('should insert a new url count vist',  async() => {
    const url = 'https://dev-mind.fr/blog';
    await uniquepageDao.updateVisit(url);

    const stats = await uniquepageDao.findAll();
    const newVisit = stats.filter(stat => stat.url === url)[0];

    expect(newVisit.url).toBe(url);
    expect(newVisit.count).toBe(1);
  });
});
