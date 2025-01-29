require('dotenv').config();
const express = require('express');
const models = require('./models');
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const { swaggerUi, swaggerDocs } = require('./swagger')
const cors = require("cors");

const app = express();

// Middleware
app.use(express.json());

app.use(cors());  // Разрешаем CORS для всех доменов
app.use(express.json());

// Подключение маршрутов
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);

// Тестовый маршрут
app.get('/', (req, res) => {
    res.send('Server is running!');
});

// Синхронизация базы данных
models.sequelize
    .sync({ force: false })
    .then(() => {
        console.log('Database synchronized');
    })
    .catch((err) => {
        console.error('Error synchronizing database:', err);
    });

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Маршрут для документации
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs))
