const mongoose = require('mongoose');
const Bug = require('../../src/models/Bug');
const Post = require('../../src/models/Post');
const User = require('../../src/models/User');

describe('Database Operations Integration Tests', () => {
  // Connect to the test database before all tests
  beforeAll(async () => {
    const mongoURI = 'mongodb://127.0.0.1:27017/dbOperationsTestDB';
    await mongoose.connect(mongoURI);
  });

  // clear data before each test
  beforeEach(async () => {
    await Bug.deleteMany();
    await Post.deleteMany();
    await User.deleteMany();
  });

  // disconnect after all tests
  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('Bug Model Database Operations', () => {
    test('should create a bug with all required fields', async () => {
      const bugData = {
        title: 'Test Bug Title',
        description: 'This is a test bug description that meets the minimum length requirement',
        priority: 'High',
        status: 'Open',
      };

      const bug = await Bug.create(bugData);
      
      expect(bug._id).toBeDefined();
      expect(bug.title).toBe(bugData.title);
      expect(bug.description).toBe(bugData.description);
      expect(bug.priority).toBe(bugData.priority);
      expect(bug.status).toBe(bugData.status);
      expect(bug.createdAt).toBeInstanceOf(Date);
    });

    test('should fail to create a bug without required fields', async () => {
      const invalidBug = {
        title: 'Short',
        description: 'Short',
      };

      await expect(Bug.create(invalidBug)).rejects.toThrow();
    });

    test('should find bugs by priority', async () => {
      await Bug.create({
        title: 'High Priority Bug',
        description: 'This is a high priority bug description',
        priority: 'High',
      });

      await Bug.create({
        title: 'Low Priority Bug',
        description: 'This is a low priority bug description',
        priority: 'Low',
      });

      const highPriorityBugs = await Bug.find({ priority: 'High' });
      expect(highPriorityBugs.length).toBe(1);
      expect(highPriorityBugs[0].priority).toBe('High');
    });

    test('should update bug status', async () => {
      const bug = await Bug.create({
        title: 'Update Test Bug',
        description: 'This bug will be updated',
        status: 'Open',
      });

      bug.status = 'In-Progress';
      await bug.save();

      const updatedBug = await Bug.findById(bug._id);
      expect(updatedBug.status).toBe('In-Progress');
    });

    test('should delete a bug from database', async () => {
      const bug = await Bug.create({
        title: 'Delete Test Bug',
        description: 'This bug will be deleted',
      });

      const bugId = bug._id;
      await Bug.findByIdAndDelete(bugId);

      const deletedBug = await Bug.findById(bugId);
      expect(deletedBug).toBeNull();
    });

    test('should query bugs sorted by creation date', async () => {
      const bug1 = await Bug.create({
        title: 'First Bug',
        description: 'This is the first bug description',
      });


      await new Promise(resolve => setTimeout(resolve, 10));

      const bug2 = await Bug.create({
        title: 'Second Bug',
        description: 'This is the second bug description',
      });

      const bugs = await Bug.find().sort({ createdAt: -1 });
      expect(bugs.length).toBe(2);
      expect(bugs[0]._id.toString()).toBe(bug2._id.toString());
      expect(bugs[1]._id.toString()).toBe(bug1._id.toString());
    });
  });

  describe('User Model Database Operations', () => {
    test('should create a user with all required fields', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };

      const user = await User.create(userData);
      
      expect(user._id).toBeDefined();
      expect(user.username).toBe(userData.username);
      expect(user.email).toBe(userData.email);
      expect(user.password).toBe(userData.password);
    });

    test('should enforce unique username constraint', async () => {
      await User.create({
        username: 'uniqueuser',
        email: 'user1@example.com',
        password: 'pass1',
      });

      await expect(
        User.create({
          username: 'uniqueuser',
          email: 'user2@example.com',
          password: 'pass2',
        })
      ).rejects.toThrow();
    });

    test('should enforce unique email constraint', async () => {
      await User.create({
        username: 'user1',
        email: 'unique@example.com',
        password: 'pass1',
      });

      await expect(
        User.create({
          username: 'user2',
          email: 'unique@example.com',
          password: 'pass2',
        })
      ).rejects.toThrow();
    });

    test('should find user by username', async () => {
      await User.create({
        username: 'findme',
        email: 'findme@example.com',
        password: 'password',
      });

      const user = await User.findOne({ username: 'findme' });
      expect(user).not.toBeNull();
      expect(user.username).toBe('findme');
    });
  });

  describe('Post Model Database Operations', () => {
    test('should create a post with author reference', async () => {
      const user = await User.create({
        username: 'author',
        email: 'author@example.com',
        password: 'password',
      });

      const categoryId = new mongoose.Types.ObjectId();
      const post = await Post.create({
        title: 'Test Post Title',
        content: 'This is the post content',
        author: user._id,
        category: categoryId,
        slug: 'test-post-title',
      });

      expect(post._id).toBeDefined();
      expect(post.author.toString()).toBe(user._id.toString());
      expect(post.title).toBe('Test Post Title');
    });

    test('should populate author information', async () => {
      const user = await User.create({
        username: 'populateuser',
        email: 'populate@example.com',
        password: 'password',
      });

      const categoryId = new mongoose.Types.ObjectId();
      const post = await Post.create({
        title: 'Populate Test',
        content: 'Content',
        author: user._id,
        category: categoryId,
        slug: 'populate-test',
      });

      const populatedPost = await Post.findById(post._id).populate('author');
      expect(populatedPost.author.username).toBe('populateuser');
    });

    test('should enforce unique slug constraint', async () => {
      const user = await User.create({
        username: 'sluguser',
        email: 'slug@example.com',
        password: 'password',
      });

      const categoryId = new mongoose.Types.ObjectId();
      await Post.create({
        title: 'Unique Slug',
        content: 'Content',
        author: user._id,
        category: categoryId,
        slug: 'unique-slug',
      });

      await expect(
        Post.create({
          title: 'Another Title',
          content: 'Content',
          author: user._id,
          category: categoryId,
          slug: 'unique-slug',
        })
      ).rejects.toThrow();
    });
  });

  describe('Database Transaction Operations', () => {
    test('should handle multiple operations in sequence', async () => {
      // Create user
      const user = await User.create({
        username: 'sequenceuser',
        email: 'sequence@example.com',
        password: 'password',
      });

      // Create bugs
      const bug1 = await Bug.create({
        title: 'Sequence Bug One',
        description: 'This is the first bug in sequence',
      });

      const bug2 = await Bug.create({
        title: 'Sequence Bug Two',
        description: 'This is the second bug in sequence',
      });

      // verify that all were created
      const users = await User.find();
      const bugs = await Bug.find();

      expect(users.length).toBe(1);
      expect(bugs.length).toBe(2);
      expect(user._id).toBeDefined();
      expect(bug1._id).toBeDefined();
      expect(bug2._id).toBeDefined();
    });

    test('should handle bulk delete operations', async () => {
      // Create multiple bugs
      await Bug.create({
        title: 'Bulk Bug One',
        description: 'First bug for bulk delete test',
        priority: 'Low',
      });

      await Bug.create({
        title: 'Bulk Bug Two',
        description: 'Second bug for bulk delete test',
        priority: 'Low',
      });

      await Bug.create({
        title: 'Bulk Bug Three',
        description: 'Third bug for bulk delete test',
        priority: 'High',
      });

      const result = await Bug.deleteMany({ priority: 'Low' });
      expect(result.deletedCount).toBe(2);

      const remainingBugs = await Bug.find();
      expect(remainingBugs.length).toBe(1);
      expect(remainingBugs[0].priority).toBe('High');
    });

    test('should handle bulk update operations', async () => {
      // Create bugs with different statuses
      await Bug.create({
        title: 'Update Bug One',
        description: 'Bug one for bulk update',
        status: 'Open',
      });

      await Bug.create({
        title: 'Update Bug Two',
        description: 'Bug two for bulk update',
        status: 'Open',
      });

      const result = await Bug.updateMany(
        { status: 'Open' },
        { status: 'In-Progress' }
      );
      expect(result.modifiedCount).toBe(2);

      const updatedBugs = await Bug.find({ status: 'In-Progress' });
      expect(updatedBugs.length).toBe(2);
    });
  });
});
