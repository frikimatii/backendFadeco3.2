const express = require('express');
const router = express.Router();
const Pieza = require("../../models/Pieza");

const piezasLista = [
    "Brazo 250",
    "Brazo 300",
    "Brazo 330",
    "cajas_torneadas_250",
    "cajas_torneadas_300",
    "cajas_torneadas_330",
    "Cubrecuchilla 250",
    "Cubrecuchilla 300",
    "Cubrecuchilla 330",
    "Velero",
    "Vela 330",
    "Vela 250",
    "Vela 300",
    "Planchada 330",
    "Planchada 300",
    "Planchada 250",
    "Tapa Afilador",
    "Aro Numerador",
    "Tapa Afilador 250",
    "Teletubi 330",
    "Teletubi 300",
    "Teletubi 250",
    "baseInox330", 
    "baseInox300", 
    "baseInox250",
    "baseInoxECO",
    "Tapa Afilador Eco",
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
