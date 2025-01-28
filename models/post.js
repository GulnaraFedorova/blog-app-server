module.exports = (sequelize, DataTypes) => {
    const Post = sequelize.define('Post', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        mediaUrl: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        authorId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    });

    // Если нужны связи
    Post.associate = (models) => {
        Post.belongsTo(models.User, { foreignKey: 'authorId', as: 'author' });
    };

    return Post;
};