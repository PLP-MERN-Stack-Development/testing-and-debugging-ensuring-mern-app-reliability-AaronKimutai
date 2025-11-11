const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Post = require('../models/Post');
const User = require('../models/User');


const mockAuth = async (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer mock-jwt-for-user-')) {
        return res.status(401).json({ message: 'Not authenticated.' });
    }
    // Extract user ID from token
    const userId = authHeader.substring('Bearer mock-jwt-for-user-'.length);

    // Make sure the user exists in DB
    const user = await User.findById(userId);
    if (!user) return res.status(401).json({ message: 'User not found.' });

    req.user = user;
    next();
};


router.get('/', async (req, res) => {
    try {
        const posts = await Post.find().limit(req.query.limit || 10).skip(req.query.page > 0 ? ((req.query.page - 1) * 10) : 0);
        res.status(200).json(posts);
    } catch (err) {
        res.status(500).json({ error: 'Server error retrieving posts.' });
    }
});


router.post('/', mockAuth, async (req, res) => {
    try {
        const { title, content, category } = req.body;
        if (!title || !content || !category) {
            return res.status(400).json({ error: 'Missing required post fields.' });
        }

        let categoryId;
        try {
            categoryId = typeof category === 'string' ? new mongoose.Types.ObjectId(category) : category;
        } catch (err) {
            return res.status(400).json({ error: 'Invalid category identifier.' });
        }

        const newPost = new Post({
            title,
            content,
            category: categoryId,
            author: req.user._id,
            slug: title.toLowerCase().replace(/\s/g, '-').substring(0, 50)
        });

        await newPost.save();
        res.status(201).json(newPost);
    } catch (err) {
        res.status(400).json({ error: 'Post validation failed.' });
    }
});


router.get('/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found.' });
        res.status(200).json(post);
    } catch (err) {
        res.status(500).json({ error: 'Server error.' });
    }
});


router.put('/:id', mockAuth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found.' });

        if (post.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to edit this post.' });
        }

        Object.assign(post, req.body);
        await post.save();
        res.status(200).json(post);
    } catch (err) {
        res.status(400).json({ error: 'Update failed.' });
    }
});


router.delete('/:id', mockAuth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found.' });

        if (post.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this post.' });
        }

        await post.deleteOne();
        res.status(200).json({ message: 'Post deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Delete failed.' });
    }
});

module.exports = router;
