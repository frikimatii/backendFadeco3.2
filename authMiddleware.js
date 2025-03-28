const jwt = require("jsonwebtoken")

module.exports = function (req, res, next) {
    const token = req.header("Authorization")
    if (!token) return res.status(401).json({ message: "Acceso denegado. No se Proporciono un token" })

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = decoded.id
        next()
    }catch (error){
        res.status(400).json({message: "Token invalido"})
    }
}
