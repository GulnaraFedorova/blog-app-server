const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const models = require('../models');

const router = express.Router();

// Регистрация
router.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body
        // Проверка, есть ли пользователь с таким email
        const existingUser = await User.findOne({ where: { email } })
        if (existingUser) {
            return res.status(400).json({ error: 'Email is already in use' })
        }

        // Хэширование пароля
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        // Создание пользователя
        const user = await User.create({ email, password: hashedPassword })
        res.status(201).json({ id: user.id, email: user.email })
    } catch (error) {
        console.error('Error registering user:', error) // Для отладки
        res.status(500).json({ error: 'Internal Server Error' })
    }
})

// Авторизация
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Ищем пользователя в базе данных
        const user = await models.User.findOne({ where: { email } });
        if (!user) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        // Проверяем пароль
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        // Генерируем JWT-токен
        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
            expiresIn: '1h',
        });

        res.status(200).json({ message: 'Login successful', token });
    } catch (err) {
        console.error('Error logging in user:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;