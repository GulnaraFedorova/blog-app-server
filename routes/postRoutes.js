const express = require('express');
const models = require('../models');
const { authenticateToken } = require('../middlewares/authMiddleware'); // Для проверки JWT

const router = express.Router();

// Создание поста (Create)
router.post('/', authenticateToken, async (req, res) => {
    const { content, mediaUrl } = req.body;
    const userId = req.user.id; // Получаем ID пользователя из JWT

    try {
        const post = await models.Post.create({
            content,
            mediaUrl,
            authorId: userId,
        });
        res.status(201).json({ message: 'Post created successfully', post });
    } catch (err) {
        console.error('Error creating post:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Получение всех постов (Read)
router.get('/', async (req, res) => {
    try {
        const posts = await models.Post.findAll({
            include: [{ model: models.User, as: 'author', attributes: ['id', 'email'] }],
        });
        res.status(200).json(posts);
    } catch (err) {
        console.error('Error fetching posts:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Обновление поста (Update)
router.put('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { content, mediaUrl } = req.body;
    const userId = req.user.id;

    try {
        const post = await models.Post.findByPk(id);

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // Проверяем, что пользователь — автор поста
        if (post.authorId !== userId) {
            return res.status(403).json({ error: 'Forbidden: You are not the author of this post' });
        }

        post.content = content;
        post.mediaUrl = mediaUrl;
        await post.save();

        res.status(200).json({ message: 'Post updated successfully', post });
    } catch (err) {
        console.error('Error updating post:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Удаление поста (Delete)
router.delete('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        const post = await models.Post.findByPk(id);

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // Проверяем, что пользователь — автор поста
        if (post.authorId !== userId) {
            return res.status(403).json({ error: 'Forbidden: You are not the author of this post' });
        }

        await post.destroy();

        res.status(200).json({ message: 'Post deleted successfully' });
    } catch (err) {
        console.error('Error deleting post:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;