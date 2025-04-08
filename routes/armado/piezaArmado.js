const express = require('express');
const router = express.Router();
const Pieza = require("../../models/Pieza");

const maquinas = [    
    "Inox_330",
    "Inox_300",
    "Inox_250",
    "Pintada_330",
    "Pintada_300",
    "Inox_ECO"
]

router.get('/', async (req, res) => {
  try {
      const piezas = await Pieza.find({destino_final:  {$in: maquinas} });
      res.status(200).json(piezas);
  } catch (error) {
      console.error("Error al obtener piezas de aluminio:", error);
      res.status(500).json({ mensaje: "Error al obtener piezas de aluminio" });
  }
});

module.exports = router; 