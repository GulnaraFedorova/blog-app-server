const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

// Опции Swagger
const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Blog API",
            version: "1.0.0",
            description: "Документация API для личного блога",
        },
        servers: [
            {
                url: process.env.SERVER_URL || "https://blog-app-server-mn0b.onrender.com", // ✅ Используем переменную окружения
                description: "Продакшн-сервер",
            },
            {
                url: "http://localhost:3000",
                description: "Локальный сервер (разработка)",
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ["./routes/*.js"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

module.exports = { swaggerUi, swaggerDocs };