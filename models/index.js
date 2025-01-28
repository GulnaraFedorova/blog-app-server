const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const models = {
    User: require('./user')(sequelize, DataTypes),
    Post: require('./post')(sequelize, DataTypes),
};

// Настройка связей
Object.keys(models).forEach((modelName) => {
    if (models[modelName].associate) {
        models[modelName].associate(models);
    }
});

models.sequelize = sequelize;
models.Sequelize = Sequelize;

module.exports = models;