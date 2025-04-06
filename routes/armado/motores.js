const express = require('express');
const router = express.Router();
const Pieza = require("../../models/Pieza");

router.get('/', async (req, res) => {
  try {
      const piezas = await Pieza.find({ });
      res.status(200).json(piezas);
  } catch (error) {
      console.error("Error al obtener piezas de aluminio:", error);
      res.status(500).json({ mensaje: "Error al obtener piezas de aluminio" });
  }
});

module.exports = router; 