const express = require("express");
const models = require("../models");
const { authenticateToken } = require("../middlewares/authMiddleware"); // Проверка JWT

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
router.post("/", authenticateToken, async (req, res) => {
    const { content, mediaUrl } = req.body;
    const userId = req.user.id;

    try {
        const post = await models.Post.create({
            content,
            mediaUrl,
            authorId: userId,
        });
        res.status(201).json({ message: "✅ Пост успешно создан", post });
    } catch (err) {
        console.error("❌ Ошибка при создании поста:", err);
        res.status(500).json({ error: "Внутренняя ошибка сервера" });
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
 *                   content:
 *                     type: string
 *                   mediaUrl:
 *                     type: string
 *                   author:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                         description: Имя автора
 *                       email:
 *                         type: string
 */
router.get("/", async (req, res) => {
    try {
        const posts = await models.Post.findAll({
            include: [{ model: models.User, as: "author", attributes: ["id", "name", "email"] }],
            order: [["createdAt", "DESC"]],
        });
        res.status(200).json(posts);
    } catch (err) {
        console.error("❌ Ошибка при получении постов:", err);
        res.status(500).json({ error: "Внутренняя ошибка сервера" });
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *               mediaUrl:
 *                 type: string
 *     responses:
 *       200:
 *         description: Пост успешно обновлен
 *       403:
 *         description: Доступ запрещен (не автор поста)
 *       404:
 *         description: Пост не найден
 */
router.put("/:id", authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { content, mediaUrl } = req.body;
    const userId = req.user.id;

    try {
        const post = await models.Post.findByPk(id);

        if (!post) {
            return res.status(404).json({ error: "Пост не найден" });
        }

        if (post.authorId !== userId) {
            return res.status(403).json({ error: "❌ Ошибка: Вы не являетесь автором этого поста" });
        }

        post.content = content;
        post.mediaUrl = mediaUrl;
        await post.save();

        res.status(200).json({ message: "✅ Пост успешно обновлен", post });
    } catch (err) {
        console.error("❌ Ошибка при обновлении поста:", err);
        res.status(500).json({ error: "Внутренняя ошибка сервера" });
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
 *     responses:
 *       200:
 *         description: Пост успешно удален
 *       403:
 *         description: Доступ запрещен (не автор поста)
 *       404:
 *         description: Пост не найден
 */
router.delete("/:id", authenticateToken, async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        const post = await models.Post.findByPk(id);

        if (!post) {
            return res.status(404).json({ error: "Пост не найден" });
        }

        if (post.authorId !== userId) {
            return res.status(403).json({ error: "❌ Ошибка: Вы не являетесь автором этого поста" });
        }

        await post.destroy();

        res.status(200).json({ message: "✅ Пост успешно удален" });
    } catch (err) {
        console.error("❌ Ошибка при удалении поста:", err);
        res.status(500).json({ error: "Внутренняя ошибка сервера" });
    }
});

module.exports = router;