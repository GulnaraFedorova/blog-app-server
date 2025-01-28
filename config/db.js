const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,      // blog_app
  process.env.DB_USER,      // blog_user
  process.env.DB_PASSWORD,  // securepassword
  {
    host: process.env.DB_HOST, // localhost
    dialect: 'postgres',       // PostgreSQL
    logging: false,
  }
);

module.exports = sequelize;