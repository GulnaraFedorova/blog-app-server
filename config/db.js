require('dotenv').config(); // Подключение переменных окружения
const { Sequelize } = require('sequelize')

// Логирование перед подключением
console.log('Connecting to database with config:', {
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  ssl: true,
})


const sequelize = new Sequelize(
  process.env.DB_NAME,      // Имя базы данных
  process.env.DB_USER,      // Пользователь базы данных
  process.env.DB_PASSWORD,  // Пароль базы данных
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true, // Требуется SSL
        rejectUnauthorized: false, // Не проверять сертификат
      },
    },
    logging: false, // Отключение логов SQL-запросов
  }
)

// Проверка подключения
sequelize.authenticate()
  .then(() => console.log('Database connected successfully!'))
  .catch((err) => console.error('Error connecting to the database:', err));

module.exports = sequelize