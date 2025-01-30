const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ error: "Ошибка: Токен не найден, доступ запрещен!" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            console.error("Ошибка проверки токена:", err);
            return res.status(403).json({ error: "Ошибка: Неверный токен!" });
        }
        req.user = user;
        next();
    });
}

module.exports = { authenticateToken };