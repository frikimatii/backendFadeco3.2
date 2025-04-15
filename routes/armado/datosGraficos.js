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
];

router.get('/', async (req, res) => {
  try {
    const piezas = await Pieza.find({ nombre: { $in: maquinas } });

    // Mapear solo los campos necesarios
    const resultado = piezas.map(pieza => ({
      nombre: pieza.nombre,
      cantidad: pieza.cantidad?.terminado?.cantidad || 0
    }));

    res.status(200).json(resultado);
  } catch (error) {
    console.error("Error al obtener piezas:", error);
    res.status(500).json({ mensaje: "Error al obtener piezas" });
  }
});

module.exports = router;
