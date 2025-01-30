const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const models = require("../models");
const { authenticateToken } = require("../middlewares/authMiddleware");

const router = express.Router();

// Настройки хранения загружаемых файлов
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, "..", "uploads");
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true }); 
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

const upload = multer({ storage });

// Создание поста (Create)
/**
 * @swagger
 * /api/posts:
 *   post:
 *     summary: Создание нового поста
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: Контент поста
 *               media:
 *                 type: string
 *                 format: binary
 *                 description: Медиафайл (изображение или видео)
 *     responses:
 *       201:
 *         description: Пост успешно создан
 *       401:
 *         description: Пользователь не авторизован
 *       500:
 *         description: Ошибка сервера
 */
router.post("/", authenticateToken, upload.single("media"), async (req, res) => {
    const { content } = req.body;
    const userId = req.user.id;
    const mediaUrl = req.file ? `/uploads/${req.file.filename}` : null;

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
 *                   createdAt:
 *                     type: string
 *                     format: date-time
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
router.put("/:id", authenticateToken, upload.single("media"), async (req, res) => {
    console.log("`PUT`-запрос получен. Body:", req.body, "File:", req.file);

    const { id } = req.params;
    const userId = req.user.id;

    let content = req.body.content;
    if (!content) {
        try {
            content = JSON.parse(Object.keys(req.body)[0]).content;
        } catch (err) {
            console.warn("⚠️ Ошибка парсинга `content`:", err);
        }
    }

    content = content ? content.trim() : " "; 
    const mediaUrl = req.file ? `/uploads/${req.file.filename}` : req.body.mediaUrl;

    try {
        const post = await models.Post.findByPk(id);
        if (!post) return res.status(404).json({ error: "Пост не найден" });

        if (post.authorId !== userId) {
            return res.status(403).json({ error: "Ошибка: Вы не автор этого поста" });
        }

        await post.update({ content, mediaUrl });

        console.log("Пост успешно обновлён:", post);
        res.status(200).json({ message: "Пост обновлён", post });
    } catch (err) {
        console.error("Ошибка при обновлении поста:", err);
        res.status(500).json({ error: "Ошибка сервера при обновлении поста" });
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

        // Удаляем файл, если он есть
        if (post.mediaUrl) {
            const filePath = path.join(__dirname, "..", post.mediaUrl);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        await post.destroy();

        res.status(200).json({ message: "Пост успешно удален" });
    } catch (err) {
        console.error("❌ Ошибка при удалении поста:", err);
        res.status(500).json({ error: "Внутренняя ошибка сервера" });
    }
});

module.exports = router;