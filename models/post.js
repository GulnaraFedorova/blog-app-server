module.exports = (sequelize, DataTypes) => {
    const Post = sequelize.define(
        "Post",
        {
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
                type: DataTypes.STRING(2048),
                allowNull: true,
            },
            authorId: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
        },
        {
            timestamps: true,
        }
    );

    // Настройка связи с User
    Post.associate = (models) => {
        Post.belongsTo(models.User, {
            foreignKey: "authorId",
            as: "author",
            onDelete: "CASCADE",
        });
    };

    return Post;
};