const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

// start the in-memory MongoDB server
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();     
  const uri = mongoServer.getUri();                   
  await mongoose.connect(uri, {                      
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

// clear all data after each test
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

// close the connection and stop the MongoDB server after all the tests
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});
