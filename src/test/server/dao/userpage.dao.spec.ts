import {Db, MongoClient} from "mongodb";
import {MONGO_TEST_OPTIONS, MONGO_TEST_URL} from "./dao.config";
import {COLLECTION_STATS_USERVISITS, UserPageVisit} from "../../../main/server/model/statistic";
import {UserPageVisitDao} from "../../../main/server/dao/userpage.dao";


xdescribe('userpage.dao integration test', () => {

  let mongoClient: MongoClient;
  let mongoDb: Db;
  let userPageVisitDao: UserPageVisitDao;
  let userPageVisit: UserPageVisit;

  /**
   * To execute an integration test we need to open a MongoDB connection
   */
  beforeAll(async () => {
    mongoClient = await new MongoClient(MONGO_TEST_URL, MONGO_TEST_OPTIONS).connect();
    mongoDb = await mongoClient.db();
  }, 1000);

  /**
   * Database as to be closed when all the tests are finished
   */
  afterAll(async () => {
    await mongoClient.close(true);
  });

  afterEach(async () => {
    await mongoDb.collections()
      .then(collections => {
        if (collections && collections.filter(c => c.collectionName === COLLECTION_STATS_USERVISITS).length > 0) {
          mongoDb.dropCollection(COLLECTION_STATS_USERVISITS);
        }
      });
  }, 1000);

  beforeEach(async () => {
    userPageVisit = {
      url: 'https://dev-mind.fr',
      ip: '127.0.0.1'
    };
    await mongoDb.collection(COLLECTION_STATS_USERVISITS).insertOne(userPageVisit);
    userPageVisitDao = new UserPageVisitDao(mongoClient.db());
  });

  test('should find all user visit', async () => {
    const stats = await userPageVisitDao.findAll();
    expect(stats.length).toBe(1);
  });

  test('should not insert a new occurence if user has already visited the site', async () => {
    await userPageVisitDao.addVisitIfNotExist(userPageVisit.ip, userPageVisit.url);
    const stats = await userPageVisitDao.findAll();
    expect(stats.length).toBe(1);
  });

  test('should insert a new occurence if user has not already visited the site', async () => {
    await userPageVisitDao.addVisitIfNotExist('234.567.43.3', userPageVisit.url);
    const stats = await userPageVisitDao.findAll();
    expect(stats.length).toBe(2);
  });
});
