const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');
const User = require('../../src/models/User');
const Post = require('../../src/models/Post');
const { generateToken } = require('../../utils/auth');

describe('Authentication Flows Integration Tests', () => {
  let testUser;
  let authToken;

  beforeAll(async () => {
    const mongoURI = 'mongodb://127.0.0.1:27017/authFlowsTestDB';
    await mongoose.connect(mongoURI);
  });

  beforeEach(async () => {
    // Clear collections
    await User.deleteMany();
    await Post.deleteMany();

    // Create a test user
    testUser = await User.create({
      username: 'authuser',
      email: 'auth@example.com',
      password: 'password123',
    });

    // generate a stoken for the user
    authToken = generateToken(testUser);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('JWT Authentication Flow for Posts', () => {
    let categoryId;

    beforeEach(() => {
      categoryId = new mongoose.Types.ObjectId();
    });

    it('should allow authenticated user to create a post', async () => {
      const newPost = {
        title: 'Authenticated Post',
        content: 'This post is created by an authenticated user',
        category: categoryId,
      };

      const res = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newPost);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.title).toBe(newPost.title);
      expect(res.body.author).toBe(testUser._id.toString());
    });

    it('should deny unauthenticated user from creating a post', async () => {
      const newPost = {
        title: 'Unauthenticated Post',
        content: 'This should fail',
        category: categoryId,
      };

      const res = await request(app)
        .post('/api/posts')
        .send(newPost);

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('message');
      expect(res.body.message).toContain('Not authenticated');
    });

    it('should deny user with invalid token from creating a post', async () => {
      const newPost = {
        title: 'Invalid Token Post',
        content: 'This should fail',
        category: categoryId,
      };

      const res = await request(app)
        .post('/api/posts')
        .set('Authorization', 'Bearer invalid-token-123')
        .send(newPost);

      expect(res.status).toBe(401);
      expect(res.body.message).toContain('Not authenticated');
    });

    it('should allow authenticated user to update their own post', async () => {
      // Create a post
      const post = await Post.create({
        title: 'My Post',
        content: 'Original content',
        category: categoryId,
        author: testUser._id,
        slug: 'my-post',
      });

      // update the post
      const res = await request(app)
        .put(`/api/posts/${post._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Updated Post Title' });

      expect(res.status).toBe(200);
      expect(res.body.title).toBe('Updated Post Title');
    });

    it('should deny user from updating another user\'s post', async () => {
      // Create another user
      const otherUser = await User.create({
        username: 'otheruser',
        email: 'other@example.com',
        password: 'password',
      });

      // create a post by other user
      const post = await Post.create({
        title: 'Other User Post',
        content: 'This belongs to another user',
        category: categoryId,
        author: otherUser._id,
        slug: 'other-user-post',
      });

      
      const res = await request(app)
        .put(`/api/posts/${post._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Hacked Title' });

      expect(res.status).toBe(403);
      expect(res.body.message).toContain('Not authorized');
    });

    it('should allow authenticated user to delete their own post', async () => {
      // Create a post
      const post = await Post.create({
        title: 'Delete Me',
        content: 'This will be deleted',
        category: categoryId,
        author: testUser._id,
        slug: 'delete-me',
      });

      
      const res = await request(app)
        .delete(`/api/posts/${post._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('deleted successfully');

      
      const deletedPost = await Post.findById(post._id);
      expect(deletedPost).toBeNull();
    });

    it('should deny user from deleting another user\'s post', async () => {
      // Create another user
      const otherUser = await User.create({
        username: 'otheruser2',
        email: 'other2@example.com',
        password: 'password',
      });

      
      const post = await Post.create({
        title: 'Protected Post',
        content: 'This should not be deleted',
        category: categoryId,
        author: otherUser._id,
        slug: 'protected-post',
      });

      
      const res = await request(app)
        .delete(`/api/posts/${post._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(403);
      expect(res.body.message).toContain('Not authorized');

      
      const existingPost = await Post.findById(post._id);
      expect(existingPost).not.toBeNull();
    });
  });

  describe('User Registration and Authentication Flow', () => {
    it('should create a new user with unique username and email', async () => {
      const newUser = {
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'securepassword',
      };

      const user = await User.create(newUser);

      expect(user._id).toBeDefined();
      expect(user.username).toBe(newUser.username);
      expect(user.email).toBe(newUser.email);
    });

    it('should prevent duplicate username registration', async () => {
      const userData = {
        username: 'duplicateuser',
        email: 'unique@example.com',
        password: 'password',
      };

      await User.create(userData);

      
      await expect(
        User.create({
          username: 'duplicateuser',
          email: 'another@example.com',
          password: 'password',
        })
      ).rejects.toThrow();
    });

    it('should prevent duplicate email registration', async () => {
      const userData = {
        username: 'user1',
        email: 'duplicate@example.com',
        password: 'password',
      };

      await User.create(userData);

      
      await expect(
        User.create({
          username: 'user2',
          email: 'duplicate@example.com',
          password: 'password',
        })
      ).rejects.toThrow();
    });

    it('should generate valid token for existing user', () => {
      const token = generateToken(testUser);
      
      expect(token).toBeDefined();
      expect(token).toBe(`mock-jwt-for-user-${testUser._id.toString()}`);
    });

    it('should allow token to be used for authentication', async () => {
      const categoryId = new mongoose.Types.ObjectId();
      const token = generateToken(testUser);

      const res = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Token Test Post',
          content: 'Testing token authentication',
          category: categoryId,
        });

      expect(res.status).toBe(201);
      expect(res.body.author).toBe(testUser._id.toString());
    });
  });

  describe('Authentication Error Handling', () => {
    it('should handle missing Authorization header gracefully', async () => {
      const categoryId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .post('/api/posts')
        .send({
          title: 'No Auth Header',
          content: 'This should fail',
          category: categoryId,
        });

      expect(res.status).toBe(401);
      expect(res.body.message).toContain('Not authenticated');
    });

    it('should handle malformed Authorization header', async () => {
      const categoryId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .post('/api/posts')
        .set('Authorization', 'InvalidFormat token-123')
        .send({
          title: 'Malformed Auth',
          content: 'This should fail',
          category: categoryId,
        });

      expect(res.status).toBe(401);
    });

    it('should handle token for non-existent user', async () => {
      const nonExistentUserId = new mongoose.Types.ObjectId();
      const fakeToken = `mock-jwt-for-user-${nonExistentUserId}`;
      const categoryId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${fakeToken}`)
        .send({
          title: 'Non-existent User',
          content: 'This should fail',
          category: categoryId,
        });

      expect(res.status).toBe(401);
      expect(res.body.message).toContain('User not found');
    });
  });

  describe('Session Management', () => {
    it('should allow multiple requests with same token', async () => {
      const categoryId = new mongoose.Types.ObjectId();

      // first request
      const res1 = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'First Post',
          content: 'First request',
          category: categoryId,
        });

      expect(res1.status).toBe(201);

      const res2 = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Second Post',
          content: 'Second request',
          category: categoryId,
        });

      expect(res2.status).toBe(201);
    });

    it('should handle concurrent authenticated requests', async () => {
      const categoryId = new mongoose.Types.ObjectId();
      const requests = [];

      // Create multiple concurrent requests
      for (let i = 0; i < 5; i++) {
        requests.push(
          request(app)
            .post('/api/posts')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
              title: `Concurrent Post ${i}`,
              content: `Content ${i}`,
              category: categoryId,
            })
        );
      }

      const responses = await Promise.all(requests);
      responses.forEach((res) => {
        expect(res.status).toBe(201);
      });
    });
  });
});
