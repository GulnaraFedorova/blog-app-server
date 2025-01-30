const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../models");

const router = express.Router();

// Проверка наличия JWT_SECRET в переменных среды
if (!process.env.JWT_SECRET) {
    console.error("❌ ОШИБКА: Переменная среды JWT_SECRET не установлена!");
    process.exit(1); // Остановить сервер, если нет ключа
}

// Регистрация пользователя
/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Регистрация нового пользователя
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: Email пользователя
 *               password:
 *                 type: string
 *                 description: Пароль пользователя
 *     responses:
 *       201:
 *         description: Пользователь успешно зарегистрирован
 *       400:
 *         description: Email уже используется
 *       500:
 *         description: Ошибка сервера
 */
router.post("/register", async (req, res) => {
    try {
        console.log("📩 Регистрация пользователя:", req.body.email);

        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: "Необходимо указать email и пароль" });
        }

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: "Этот email уже используется" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ email, password: hashedPassword });

        console.log("✅ Пользователь зарегистрирован:", user.email);
        res.status(201).json({ id: user.id, email: user.email });
    } catch (error) {
        console.error("❌ Ошибка при регистрации:", error);
        res.status(500).json({ error: "Внутренняя ошибка сервера" });
    }
});

// Авторизация пользователя
/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Авторизация пользователя
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: Email пользователя
 *               password:
 *                 type: string
 *                 description: Пароль пользователя
 *     responses:
 *       200:
 *         description: Успешная авторизация
 *       401:
 *         description: Неверный email или пароль
 *       500:
 *         description: Ошибка сервера
 */
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        console.log("🔑 Попытка входа пользователя:", email);

        const user = await User.findOne({ where: { email } });
        if (!user) {
            console.warn("⚠️ Попытка входа с несуществующим email:", email);
            return res.status(401).json({ error: "Неверный email или пароль" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            console.warn("⚠️ Неверный пароль для пользователя:", email);
            return res.status(401).json({ error: "Неверный email или пароль" });
        }

        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1h" });

        console.log("✅ Успешный вход:", email);
        res.status(200).json({ message: "Вход выполнен успешно", token });
    } catch (err) {
        console.error("❌ Ошибка при авторизации:", err);
        res.status(500).json({ error: "Внутренняя ошибка сервера" });
    }
});

module.exports = router;