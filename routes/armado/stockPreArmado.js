const express = require('express');
const router = express.Router();
const Pieza = require("../../models/Pieza");

const preArmado= ["BasePreArmada_Inox330", "BasePreArmada_Inox300", "BasePreArmada_Inox250", "BasePreArmada_InoxECO", "BasePreArmada_Pintada330", "BasePreArmada_Pintada300"]


router.get('/', async (req, res) => {
  try {
      const piezas = await Pieza.find({destino_final: {$in: preArmado} });
      res.status(200).json(piezas);
  } catch (error) {
      console.error("Error al obtener piezas de aluminio:", error);
      res.status(500).json({ mensaje: "Error al obtener piezas de aluminio" });
  }
});

module.exports = router; 