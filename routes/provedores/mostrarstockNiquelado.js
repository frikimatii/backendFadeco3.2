const express = require('express');
const router = express.Router();
const Pieza = require("../../models/Pieza");

const modelosListaPieza = [    
    "Eje Rectificado",
    "Varilla Brazo 330",
    "Varilla Brazo 300",
    "Varilla Brazo 250",
    "Tubo Manija",
    "Tubo Manija 250",
    "Palanca Afilador"]

router.get('/', async (req, res) => {
    try {
        const piezas = await Pieza.find({ nombre: { $in: modelosListaPieza } });

        if (!piezas.length) {
            return res.status(404).json({ mensaje: "No se encontraron piezas con esos nombres." });
        }

        res.status(200).json(piezas);
    } catch (error) {
        console.error("Error al obtener piezas:", error);
        res.status(500).json({ mensaje: "Error interno del servidor" });
    }
});

module.exports = router;