const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app'); 
const Bug = require('../../src/models/Bug');

describe('Bug Tracker API Integration Tests (CRUD)', () => {
  // Connect to the test database before all tests
  beforeAll(async () => {
    const mongoURI = 'mongodb://127.0.0.1:27017/bugTrackerTestDB';
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  // clear data before each test
  beforeEach(async () => {
    await Bug.deleteMany();
  });

  // disconnect after all tests
  afterAll(async () => {
    await mongoose.connection.close();
  });

  const createBug = async (data) => {
    const bug = new Bug(data);
    return await bug.save();
  };


  test('GET /api/bugs should return a list of all reported bugs', async () => {
    await createBug({
      title: 'Bug A',
      description: 'This is a description for Bug A',
      priority: 'Low',
    });

    await createBug({
      title: 'Bug B',
      description: 'This is a description for Bug B',
      priority: 'High',
    });

    const res = await request(app).get('/api/bugs');

    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(2);
    expect(res.body[0]).toHaveProperty('title');
    expect(res.body[0]).toHaveProperty('priority');
  });

  test('POST /api/bugs should create a new bug', async () => {
    const newBug = {
      title: 'Login Issue',
      description: 'Users cannot log in with correct credentials',
      priority: 'Medium',
    };

    const res = await request(app)
      .post('/api/bugs')
      .send(newBug);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.title).toBe('Login Issue');
  });

  test('PUT /api/bugs/:id should update a bug', async () => {
    const bug = await createBug({
      title: 'UI Bug',
      description: 'The button alignment is off on mobile devices',
      priority: 'Low',
    });

    const res = await request(app)
      .put(`/api/bugs/${bug._id}`)
      .send({ priority: 'High' });

    expect(res.statusCode).toBe(200);
    expect(res.body.priority).toBe('High');
  });


  test('DELETE /api/bugs/:id should delete a bug', async () => {
    const bug = await createBug({
      title: 'Crash Bug',
      description: 'App crashes when user clicks on profile picture',
      priority: 'High',
    });

    const res = await request(app).delete(`/api/bugs/${bug._id}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Bug deleted successfully');
  });
});
