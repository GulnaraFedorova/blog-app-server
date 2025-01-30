const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Ошибка: Токен отсутствует или имеет неверный формат" });
    }

    const token = authHeader.split(" ")[1];

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            console.error("Ошибка проверки токена:", err.message);
            return res.status(403).json({ error: "Ошибка: Недействительный токен" });
        }
        req.user = user;
        next();
    });
}

module.exports = { authenticateToken };