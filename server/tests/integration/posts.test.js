const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app'); 
const Post = require('../../src/models/Post');
const User = require('../../src/models/User');

describe('📘 Posts API Integration Tests', () => {
    let user;
    let token;
    let categoryId;

    beforeAll(async () => {
        const mongoURI = 'mongodb://127.0.0.1:27017/postsTestDB';
        await mongoose.connect(mongoURI);
    });

    beforeEach(async () => {
        // Clear collections
        await Post.deleteMany();
        await User.deleteMany();

        // Create a test user
        user = await User.create({
            username: 'testuser',
            email: 'test@example.com',
            password: 'password123'
        });

        token = `mock-jwt-for-user-${user._id}`;
        categoryId = new mongoose.Types.ObjectId();
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    it('should create a new post when authenticated', async () => {
        const newPost = {
            title: 'First Post',
            content: 'This is the first post content',
            category: categoryId
        };

        const res = await request(app)
            .post('/api/posts')
            .set('Authorization', `Bearer ${token}`)
            .send(newPost);

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('_id');
        expect(res.body.title).toBe(newPost.title);
    });

    it('should return 401 if not authenticated', async () => {
        const newPost = { title: 'No Auth', content: 'Content', category: categoryId };

        const res = await request(app)
            .post('/api/posts')
            .send(newPost);

        expect(res.status).toBe(401);
    });

    it('should return 400 if validation fails', async () => {
        const invalidPost = { title: '', content: '', category: categoryId };

        const res = await request(app)
            .post('/api/posts')
            .set('Authorization', `Bearer ${token}`)
            .send(invalidPost);

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('error');
    });

    it('should return all posts', async () => {
        await Post.create({ title: 'Post1', content: 'Content1', category: categoryId, author: user._id, slug: 'post1' });
        await Post.create({ title: 'Post2', content: 'Content2', category: categoryId, author: user._id, slug: 'post2' });

        const res = await request(app).get('/api/posts');

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBeTruthy();
        expect(res.body.length).toBe(2);
    });

    it('should return a post by ID', async () => {
        const post = await Post.create({ title: 'Single Post', content: 'Content', category: categoryId, author: user._id, slug: 'single-post' });

        const res = await request(app).get(`/api/posts/${post._id}`);
        expect(res.status).toBe(200);
        expect(res.body._id).toBe(post._id.toString());
    });

    it('should return 404 for non-existent post', async () => {
        const nonExistentId = new mongoose.Types.ObjectId();
        const res = await request(app).get(`/api/posts/${nonExistentId}`);
        expect(res.status).toBe(404);
    });

    it('should update a post when authenticated as author', async () => {
        const post = await Post.create({ title: 'Update Me', content: 'Old Content', category: categoryId, author: user._id, slug: 'update-me' });

        const res = await request(app)
            .put(`/api/posts/${post._id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ title: 'Updated Title' });

        expect(res.status).toBe(200);
        expect(res.body.title).toBe('Updated Title');
    });

    it('should return 403 if not the author', async () => {
        const otherUser = await User.create({ username: 'other', email: 'other@example.com', password: 'pass' });
        const post = await Post.create({ title: 'Protected Post', content: 'Content', category: categoryId, author: otherUser._id, slug: 'protected-post' });

        const res = await request(app)
            .put(`/api/posts/${post._id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ title: 'Attempted Edit' });

        expect(res.status).toBe(403);
    });

    it('should delete a post when authenticated as author', async () => {
        const post = await Post.create({ title: 'Delete Me', content: 'Content', category: categoryId, author: user._id, slug: 'delete-me' });

        const res = await request(app)
            .delete(`/api/posts/${post._id}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Post deleted successfully');
    });

    it('should return 403 if not authorized to delete', async () => {
        const otherUser = await User.create({ username: 'other2', email: 'other2@example.com', password: 'pass' });
        const post = await Post.create({ title: 'Cannot Delete', content: 'Content', category: categoryId, author: otherUser._id, slug: 'cannot-delete' });

        const res = await request(app)
            .delete(`/api/posts/${post._id}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(403);
    });
});
