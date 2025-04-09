const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();

const mecanizadosBase = [
    "plegadora", "plasma", "corte", "augeriado",
    "torno", "fresa", "soldador", "pulido", "balancin"
];

// Ahora apunta siempre al mismo archivo
function getFilePath() {
    const folder = path.join(__dirname, "..", "historial");
    if (!fs.existsSync(folder)) fs.mkdirSync(folder);
    return path.join(folder, "historial.json");
}

function guardarAccionEnHistorial(mecanizado, pieza, cantidad) {
    const folder = path.join(__dirname, "..", "historial");
    if (!fs.existsSync(folder)) fs.mkdirSync(folder);

    const filePath = path.join(folder, "historial.json");
    const txtPath = path.join(folder, "historial.txt");

    let historial = [];

    if (fs.existsSync(filePath)) {
        historial = JSON.parse(fs.readFileSync(filePath, "utf8"));
    } else {
        historial = mecanizadosBase.map(nombre => ({
            nombre,
            acciones: []
        }));
    }

    const timestamp = new Date().toLocaleTimeString();
    const day = new Date().toLocaleDateString();
    const mensaje = `🕐${day} ${timestamp}<br>. Mecanizado: ${mecanizado}|Pieza: ${pieza}|Cantidad: ${cantidad}`;

    const mecanizadoObj = historial.find(m => m.nombre === mecanizado);
    if (mecanizadoObj) {
        mecanizadoObj.acciones.push(mensaje);
    }

    // Guarda en JSON
    fs.writeFileSync(filePath, JSON.stringify(historial, null, 2), "utf8");

    // También guarda en TXT
    fs.appendFileSync(txtPath, mensaje + "\n", "utf8");
}

// Ruta POST
router.post("/", (req, res) => {
    const { mecanizado, pieza, cantidad } = req.body;

    if (!mecanizado || !pieza || !cantidad) {
        return res.status(400).json({ error: "Faltan datos" });
    }

    guardarAccionEnHistorial(mecanizado, pieza, cantidad);
    res.json({ mensaje: "✅ Acción guardada correctamente." });
});

module.exports = router;
