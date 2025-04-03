const express = require('express');
const router = express.Router();
const Pieza = require("../../models/Pieza");

const modelosListaPieza = ["BasePintada_330", "BasePintada_300", "cabezal_pintada","caja_eco_augeriada", "Teletubi Eco"]

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