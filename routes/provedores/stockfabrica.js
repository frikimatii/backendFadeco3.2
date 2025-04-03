const express = require('express');
const router = express.Router();
const Pieza = require("../../models/Pieza");

const piezasLista = [
    "Lateral i330 contecla",
    "Lateral i330 sintecla",
    "Lateral i300 contecla",
    "Lateral i300 sintecla",
    "Lateral i250 contecla",
    "Lateral i250 sintecla",
    "Lateral p330 contecla",
    "Lateral p330 sintecla",
    "Lateral p300 contecla",
    "Lateral p300 sintecla",
    "Lateral i330 eco",
    "ChapaBase 330Inox",
    "ChapaBase 300Inox",
    "ChapaBase 330Pintada",
    "ChapaBase 300Pintada",
    "ChapaBase 250Inox",
    "Planchuela 250",
    "Planchuela 300",
    "Planchuela 330",
    "Varilla 300",
    "Varilla 330",
    "Varilla 250",
    "PortaEje",
    "Media Luna",
    "Pieza Caja Eco",
    "Planchuela Inferior",
    "Planchuela Interna"

];

router.get('/', async (req, res) => {
    try {
        const piezas = await Pieza.find({ nombre: { $in: piezasLista } });

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
