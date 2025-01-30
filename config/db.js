require("dotenv").config(); // Подключение переменных окружения
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_NAME, // Имя базы данных
  process.env.DB_USER, // Пользователь базы данных
  process.env.DB_PASSWORD, // Пароль базы данных
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: "postgres",
    dialectOptions: {
      ssl: {
        require: true, // Требуется SSL
        rejectUnauthorized: false, // Не проверять сертификат (нужно для Render)
      },
    },
    logging: false, // Отключение логов SQL-запросов

    define: {
      freezeTableName: true, // Отключает автоматическое изменение названий таблиц
      timestamps: true, // Добавляет `createdAt` и `updatedAt`
    },
  }
);

// Проверка подключения к базе
(async () => {
  try {
    await sequelize.authenticate();
    console.log(`✅ Подключение к базе данных ${process.env.DB_NAME} установлено!`);
  } catch (err) {
    console.error("❌ Ошибка подключения к базе данных:", err);
    process.exit(1);
  }
})();

module.exports = sequelize;