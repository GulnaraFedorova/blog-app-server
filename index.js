require("dotenv").config();
const path = require("path");
const fs = require("fs");
const express = require("express");
const models = require("./models");
const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");
const { swaggerUi, swaggerDocs } = require("./swagger");
const cors = require("cors");

const app = express();

// CORS
const cors = require("cors");
app.use(cors({ origin: "*", methods: "GET,HEAD,PUT,PATCH,POST,DELETE" }));

// JSON
app.use(express.json());

// Подключение маршрутов
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);

// Проверяем и создаем папку для загрузок
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log("✅ Папка 'uploads' создана.");
}

// Раздача загруженных файлов
app.use("/uploads", express.static(path.join(__dirname, "uploads"), {
    setHeaders: (res, path) => {
        if (path.endsWith(".mp4")) {
            res.setHeader("Content-Type", "video/mp4");
        }
    },
}));

// Тестовый маршрут
app.get("/", (req, res) => {
    res.send("✅ Сервер работает");
});

// Подключение к базе данных
models.sequelize
    .authenticate()
    .then(() => {
        console.log("✅ Успешное подключение к базе данных");
    })
    .catch((err) => {
        console.error("❌ Ошибка подключения к базе данных:", err);
    });

// Маршрут для документации Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Сервер запущен на порту ${PORT}`);
});