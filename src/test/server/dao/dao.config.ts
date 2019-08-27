import {MongoClientOptions} from "mongodb";

export const MONGO_TEST_OPTIONS: MongoClientOptions = {
  auth: {
    user: 'devmind',
    password: 'pass'
  },
  autoReconnect: true,
  useNewUrlParser: true,
  useUnifiedTopology: true
};

export const MONGO_TEST_URL = 'mongodb://localhost:27017/devminddbtest';
