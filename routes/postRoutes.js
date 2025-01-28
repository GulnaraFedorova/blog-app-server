const express = require('express');
const models = require('../models');
const { authenticateToken } = require('../middlewares/authMiddleware'); // Для проверки JWT

const router = express.Router();

// Создание поста (Create)
/**
 * @swagger
 * /api/posts:
 *   post:
 *     summary: Создание нового поста
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: Контент поста
 *               mediaUrl:
 *                 type: string
 *                 description: URL изображения или видео
 *     responses:
 *       201:
 *         description: Пост успешно создан
 *       401:
 *         description: Пользователь не авторизован
 *       500:
 *         description: Ошибка сервера
 */
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
/**
 * @swagger
 * /api/posts:
 *   get:
 *     summary: Получение всех постов
 *     responses:
 *       200:
 *         description: Список всех постов
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: ID поста
 *                   content:
 *                     type: string
 *                     description: Контент поста
 *                   mediaUrl:
 *                     type: string
 *                     description: URL изображения или видео
 *                   author:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: ID автора
 *                       email:
 *                         type: string
 *                         description: Email автора
 *       500:
 *         description: Ошибка сервера
 */
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
/**
 * @swagger
 * /api/posts/{id}:
 *   put:
 *     summary: Обновление поста
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID поста
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: Обновленный контент поста
 *               mediaUrl:
 *                 type: string
 *                 description: Обновленный URL изображения или видео
 *     responses:
 *       200:
 *         description: Пост успешно обновлен
 *       403:
 *         description: Доступ запрещен (не автор поста)
 *       404:
 *         description: Пост не найден
 *       500:
 *         description: Ошибка сервера
 */
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
/**
 * @swagger
 * /api/posts/{id}:
 *   delete:
 *     summary: Удаление поста
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID поста
 *     responses:
 *       200:
 *         description: Пост успешно удален
 *       403:
 *         description: Доступ запрещен (не автор поста)
 *       404:
 *         description: Пост не найден
 *       500:
 *         description: Ошибка сервера
 */
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