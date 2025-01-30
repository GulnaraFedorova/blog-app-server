const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const models = {};

// Проверяем, подключена ли база данных
if (!sequelize) {
    console.error("❌ Ошибка: Отсутствует подключение к базе данных!");
    process.exit(1);
}

// Инициализация моделей
try {
    models.User = require("./user")(sequelize, DataTypes);
    models.Post = require("./post")(sequelize, DataTypes);

    // Настройка связей между моделями
    Object.keys(models).forEach((modelName) => {
        if (models[modelName].associate && typeof models[modelName].associate === "function") {
            models[modelName].associate(models);
        }
    });

    console.log("✅ Все модели загружены успешно");
} catch (error) {
    console.error("❌ Ошибка загрузки моделей:", error);
    process.exit(1);
}

models.sequelize = sequelize;
models.Sequelize = Sequelize;

module.exports = models;