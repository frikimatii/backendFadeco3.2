const express = require("express");
const router = express.Router();
const Pieza = require("../../models/Pieza");

router.get("/:tipo", async (req, res) => {
    const { tipo } = req.params;

    const nombrePieza = ["baseInox330", "baseInox300", "baseInox250", "basePintada330", "basePintada300", "baseInoxECO", "CajaMotor_ECO"]

    if (!nombrePieza.includes(tipo)) {
        return res.status(400).json({ mensaje: "Tipo de pieza no válido" });
      }
    try {
        const piezas = await Pieza.find({ destino_final: tipo });
        res.status(200).json(piezas);
    } catch (error) {
        console.error("Error al obtener piezas:", error);
        res.status(500).json({ mensaje: "Error al obtener piezas" });
    }
});

module.exports = router;
