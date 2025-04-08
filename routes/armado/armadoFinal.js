const express = require('express');
const router = express.Router();
const MaquinasTotales = require("../../models/MaquinaFinal");

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
      const piezas = await MaquinasTotales.find({nombre: {$in: maquinas} });
      res.status(200).json(piezas);
  } catch (error) {
      console.error("Error al obtener piezas de aluminio:", error);
      res.status(500).json({ mensaje: "Error al obtener piezas de aluminio" });
  }
});

module.exports = router; 