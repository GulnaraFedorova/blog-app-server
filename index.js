require("dotenv").config();
const express = require("express");
const models = require("./models");
const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");
const { swaggerUi, swaggerDocs } = require("./swagger");
const cors = require("cors");

const app = express();

// CORS
app.use(cors());

// JSON-парсер (для обработки `req.body`)
app.use(express.json());

// Подключение маршрутов
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);

// Тестовый маршрут
app.get("/", (req, res) => {
    res.send("✅ Сервер работает");
});

app.use("/uploads", express.static(path.join(__dirname, "uploads")));


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