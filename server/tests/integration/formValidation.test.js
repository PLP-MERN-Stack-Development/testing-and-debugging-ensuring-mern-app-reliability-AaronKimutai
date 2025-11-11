const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');
const Bug = require('../../src/models/Bug');
const Post = require('../../src/models/Post');
const User = require('../../src/models/User');

describe('Form Submission and Data Validation Integration Tests', () => {
  let testUser;
  let authToken;
  let categoryId;

  beforeAll(async () => {
    const mongoURI = 'mongodb://127.0.0.1:27017/formValidationTestDB';
    await mongoose.connect(mongoURI);
  });

  beforeEach(async () => {
    // Clear collections
    await Bug.deleteMany();
    await Post.deleteMany();
    await User.deleteMany();

    // Create a test user
    testUser = await User.create({
      username: 'formuser',
      email: 'form@example.com',
      password: 'password123',
    });

    authToken = `mock-jwt-for-user-${testUser._id}`;
    categoryId = new mongoose.Types.ObjectId();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('Bug Form Validation', () => {
    describe('Title Validation', () => {
      it('should reject bug with empty title', async () => {
        const invalidBug = {
          title: '',
          description: 'This is a valid description that meets requirements',
          priority: 'Low',
        };

        const res = await request(app)
          .post('/api/bugs')
          .send(invalidBug);

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('error');
      });

      it('should reject bug with title shorter than 5 characters', async () => {
        const invalidBug = {
          title: 'Test',
          description: 'This is a valid description that meets requirements',
          priority: 'Low',
        };

        const res = await request(app)
          .post('/api/bugs')
          .send(invalidBug);

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('error');
      });

      it('should accept bug with title exactly 5 characters', async () => {
        const validBug = {
          title: '12345',
          description: 'This is a valid description that meets requirements',
          priority: 'Low',
        };

        const res = await request(app)
          .post('/api/bugs')
          .send(validBug);

        expect(res.status).toBe(201);
        expect(res.body.title).toBe(validBug.title);
      });

      it('should accept bug with title longer than 5 characters', async () => {
        const validBug = {
          title: 'This is a valid bug title',
          description: 'This is a valid description that meets requirements',
          priority: 'Low',
        };

        const res = await request(app)
          .post('/api/bugs')
          .send(validBug);

        expect(res.status).toBe(201);
        expect(res.body.title).toBe(validBug.title);
      });
    });

    describe('Description Validation', () => {
      it('should reject bug with empty description', async () => {
        const invalidBug = {
          title: 'Valid Bug Title',
          description: '',
          priority: 'Low',
        };

        const res = await request(app)
          .post('/api/bugs')
          .send(invalidBug);

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('error');
      });

      it('should reject bug with description shorter than 10 characters', async () => {
        const invalidBug = {
          title: 'Valid Bug Title',
          description: 'Short',
          priority: 'Low',
        };

        const res = await request(app)
          .post('/api/bugs')
          .send(invalidBug);

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('error');
      });

      it('should accept bug with description exactly 10 characters', async () => {
        const validBug = {
          title: 'Valid Bug Title',
          description: '1234567890',
          priority: 'Low',
        };

        const res = await request(app)
          .post('/api/bugs')
          .send(validBug);

        expect(res.status).toBe(201);
        expect(res.body.description).toBe(validBug.description);
      });
    });

    describe('Priority Validation', () => {
      it('should accept valid priority values', async () => {
        const priorities = ['Low', 'Medium', 'High', 'Critical'];

        for (const priority of priorities) {
          const validBug = {
            title: 'Valid Bug Title',
            description: 'This is a valid description that meets requirements',
            priority: priority,
          };

          const res = await request(app)
            .post('/api/bugs')
            .send(validBug);

          expect(res.status).toBe(201);
          expect(res.body.priority).toBe(priority);
        }
      });

      it('should reject invalid priority value', async () => {
        const invalidBug = {
          title: 'Valid Bug Title',
          description: 'This is a valid description that meets requirements',
          priority: 'InvalidPriority',
        };

        const res = await request(app)
          .post('/api/bugs')
          .send(invalidBug);

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('error');
      });

      it('should default to Low priority when not provided', async () => {
        const bugWithoutPriority = {
          title: 'Valid Bug Title',
          description: 'This is a valid description that meets requirements',
        };

        const res = await request(app)
          .post('/api/bugs')
          .send(bugWithoutPriority);

        expect(res.status).toBe(201);
        expect(res.body.priority).toBe('Low');
      });
    });

    describe('Status Validation', () => {
      it('should accept valid status values', async () => {
        const statuses = ['Open', 'In-Progress', 'Resolved', 'Closed'];

        for (const status of statuses) {
          const validBug = {
            title: 'Valid Bug Title',
            description: 'This is a valid description that meets requirements',
            status: status,
          };

          const res = await request(app)
            .post('/api/bugs')
            .send(validBug);

          expect(res.status).toBe(201);
          expect(res.body.status).toBe(status);
        }
      });

      it('should reject invalid status value', async () => {
        const invalidBug = {
          title: 'Valid Bug Title',
          description: 'This is a valid description that meets requirements',
          status: 'InvalidStatus',
        };

        const res = await request(app)
          .post('/api/bugs')
          .send(invalidBug);

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('error');
      });

      it('should default to Open status when not provided', async () => {
        const bugWithoutStatus = {
          title: 'Valid Bug Title',
          description: 'This is a valid description that meets requirements',
        };

        const res = await request(app)
          .post('/api/bugs')
          .send(bugWithoutStatus);

        expect(res.status).toBe(201);
        expect(res.body.status).toBe('Open');
      });
    });

    describe('Update Validation', () => {
      it('should validate priority when updating bug', async () => {
        const bug = await Bug.create({
          title: 'Update Test Bug',
          description: 'This is a valid description that meets requirements',
          priority: 'Low',
        });

        const res = await request(app)
          .put(`/api/bugs/${bug._id}`)
          .send({ priority: 'InvalidPriority' });

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('error');
      });

      it('should validate status when updating bug', async () => {
        const bug = await Bug.create({
          title: 'Update Test Bug',
          description: 'This is a valid description that meets requirements',
          status: 'Open',
        });

        const res = await request(app)
          .put(`/api/bugs/${bug._id}`)
          .send({ status: 'InvalidStatus' });

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('error');
      });

      it('should validate title length when updating bug', async () => {
        const bug = await Bug.create({
          title: 'Update Test Bug',
          description: 'This is a valid description that meets requirements',
        });

        const res = await request(app)
          .put(`/api/bugs/${bug._id}`)
          .send({ title: 'Test' }); // Too short

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('error');
      });
    });
  });

  describe('Post Form Validation', () => {
    describe('Required Fields Validation', () => {
      it('should reject post without title', async () => {
        const invalidPost = {
          content: 'This is valid content',
          category: categoryId,
        };

        const res = await request(app)
          .post('/api/posts')
          .set('Authorization', `Bearer ${authToken}`)
          .send(invalidPost);

        expect(res.status).toBe(400);
        expect(res.body.error).toContain('Missing required');
      });

      it('should reject post without content', async () => {
        const invalidPost = {
          title: 'Valid Post Title',
          category: categoryId,
        };

        const res = await request(app)
          .post('/api/posts')
          .set('Authorization', `Bearer ${authToken}`)
          .send(invalidPost);

        expect(res.status).toBe(400);
        expect(res.body.error).toContain('Missing required');
      });

      it('should reject post without category', async () => {
        const invalidPost = {
          title: 'Valid Post Title',
          content: 'This is valid content',
        };

        const res = await request(app)
          .post('/api/posts')
          .set('Authorization', `Bearer ${authToken}`)
          .send(invalidPost);

        expect(res.status).toBe(400);
        expect(res.body.error).toContain('Missing required');
      });
    });

    describe('Title Validation', () => {
      it('should reject post with title shorter than 5 characters', async () => {
        const invalidPost = {
          title: 'Test',
          content: 'This is valid content',
          category: categoryId,
        };

        const res = await request(app)
          .post('/api/posts')
          .set('Authorization', `Bearer ${authToken}`)
          .send(invalidPost);

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('error');
      });

      it('should accept post with valid title', async () => {
        const validPost = {
          title: 'Valid Post Title',
          content: 'This is valid content',
          category: categoryId,
        };

        const res = await request(app)
          .post('/api/posts')
          .set('Authorization', `Bearer ${authToken}`)
          .send(validPost);

        expect(res.status).toBe(201);
        expect(res.body.title).toBe(validPost.title);
      });
    });

    describe('Slug Validation', () => {
      it('should automatically generate unique slug from title', async () => {
        const post1 = {
          title: 'Test Post Title',
          content: 'Content',
          category: categoryId,
        };

        const res1 = await request(app)
          .post('/api/posts')
          .set('Authorization', `Bearer ${authToken}`)
          .send(post1);

        expect(res1.status).toBe(201);
        expect(res1.body.slug).toBe('test-post-title');

        // Try to create another post with same title (should have different slug)
        const res2 = await request(app)
          .post('/api/posts')
          .set('Authorization', `Bearer ${authToken}`)
          .send(post1);

        // Should fail because slug must be unique
        expect(res2.status).toBe(400);
      });
    });

    describe('Category Validation', () => {
      it('should reject invalid category ID format', async () => {
        const invalidPost = {
          title: 'Valid Post Title',
          content: 'Content',
          category: 'invalid-id',
        };

        const res = await request(app)
          .post('/api/posts')
          .set('Authorization', `Bearer ${authToken}`)
          .send(invalidPost);

        expect(res.status).toBe(400);
        expect(res.body.error).toContain('Invalid category');
      });

      it('should accept valid ObjectId as category', async () => {
        const validPost = {
          title: 'Valid Post Title',
          content: 'Content',
          category: categoryId.toString(),
        };

        const res = await request(app)
          .post('/api/posts')
          .set('Authorization', `Bearer ${authToken}`)
          .send(validPost);

        expect(res.status).toBe(201);
        expect(res.body.category).toBe(categoryId.toString());
      });
    });
  });

  describe('Form Submission Error Handling', () => {
    it('should handle malformed JSON gracefully', async () => {
      const res = await request(app)
        .post('/api/bugs')
        .set('Content-Type', 'application/json')
        .send('{ invalid json }');

      expect(res.status).toBe(400);
    });

    it('should handle missing request body', async () => {
      const res = await request(app)
        .post('/api/bugs')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should handle extra fields gracefully', async () => {
      const bugWithExtraFields = {
        title: 'Valid Bug Title',
        description: 'This is a valid description that meets requirements',
        priority: 'Low',
        extraField: 'This should be ignored',
        anotherField: 123,
      };

      const res = await request(app)
        .post('/api/bugs')
        .send(bugWithExtraFields);

      expect(res.status).toBe(201);
      expect(res.body).not.toHaveProperty('extraField');
      expect(res.body).not.toHaveProperty('anotherField');
    });
  });

  describe('Batch Form Validation', () => {
    it('should validate multiple bugs in sequence', async () => {
      const bugs = [
        {
          title: 'First Bug',
          description: 'This is the first bug description',
          priority: 'Low',
        },
        {
          title: 'Second Bug',
          description: 'This is the second bug description',
          priority: 'High',
        },
      ];

      for (const bug of bugs) {
        const res = await request(app)
          .post('/api/bugs')
          .send(bug);

        expect(res.status).toBe(201);
        expect(res.body.title).toBe(bug.title);
      }

      const allBugs = await Bug.find();
      expect(allBugs.length).toBe(2);
    });

    it('should handle mix of valid and invalid form submissions', async () => {
      const validBug = {
        title: 'Valid Bug',
        description: 'This is a valid description that meets requirements',
        priority: 'Low',
      };

      const invalidBug = {
        title: 'Bad',
        description: 'Short',
        priority: 'Invalid',
      };

      // submit a valid bug
      const validRes = await request(app)
        .post('/api/bugs')
        .send(validBug);
      expect(validRes.status).toBe(201);

      // submit an invalid bug
      const invalidRes = await request(app)
        .post('/api/bugs')
        .send(invalidBug);
      expect(invalidRes.status).toBe(400);

      // verify that only valid bug was created
      const allBugs = await Bug.find();
      expect(allBugs.length).toBe(1);
      expect(allBugs[0].title).toBe(validBug.title);
    });
  });
});
