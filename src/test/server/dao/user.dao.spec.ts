import {Db, MongoClient} from "mongodb";
import {MONGO_TEST_OPTIONS, MONGO_TEST_URL} from "./dao.config";
import {COLLECTION_USERS, UserDao} from "../../../main/server/dao/user.dao";
import {User} from "../../../main/server/model/user";


describe('user.dao integration test', () => {

  let mongoClient: MongoClient;
  let mongoDb: Db;
  let userDao: UserDao;
  let user: User;

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
    await mongoDb.dropCollection(COLLECTION_USERS);
  });

  beforeEach(async() => {
    user = {
      firstname: "Guillaume",
      lastname: "EHRET",
      email: "test@dev-mind.fr",
      rights: []
    };
    await mongoDb.collection(COLLECTION_USERS).insertOne(user);
    userDao = new UserDao(mongoClient.db());
  });


  test('should find a user with a valid email',  async() => {
    const userRead = await userDao.findByEmail('test@dev-mind.fr');
    expect(userRead).toEqual(user);
  });

  test('should find null on an unknown email search',  async() => {
    const userRead = await userDao.findByEmail('unknown@dev-mind.fr');
    expect(userRead).toBeNull();
  });

  test('should update a user',  async() => {
    user.lastname = 'Dev-Mind';
    const userRead = await userDao.upsert(user);
    expect(userRead.lastname).toBe('Dev-Mind');
  });

  test('should insert a new user',  async() => {
    let nbUser = await userDao.findAll()
    expect(nbUser.length).toBe(1);

    const newuser = {
      firstname: "Dev-Mind",
      lastname: "Dev-Mind",
      email: "devmind@dev-mind.fr",
      rights: []
    };

    const userRead = await userDao.upsert(newuser);
    expect(userRead.lastname).toBe('Dev-Mind');

    nbUser = await userDao.findAll()
    expect(nbUser.length).toBe(2);
  });

  test('should update a user token',  async() => {
    expect(user.token).toBeUndefined();
    expect(user.lastTokenGeneration).toBeUndefined();

    const userRead = await userDao.updateToken(user);

    expect(userRead.token).toBeDefined();
    expect(userRead.lastTokenGeneration).toBeDefined();
  });
});
