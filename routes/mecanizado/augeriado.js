const express = require("express");
const router = express.Router();
const Pieza = require("../../models/Pieza");

const piezasc = [
  "Cuadrado Regulador",
  "Brazo 330",
  "Brazo 300",
  "Brazo 250",
  "Carros",
  "Carros 250",
  "Movimiento",
  "Tornillo Teletubi Eco",
  "Caja Soldada Eco",
  "Carcaza Afilador",
  "PortaEje",
]

router.get("/", async (req, res) => {
  try {
    const piezas = await Pieza.find({ nombre: {$in: piezasc}});
    res.status(200).json(piezas);
  } catch (error) {
    console.error("Error al obtener piezas de aluminio:", error);
    res.status(500).json({ mensaje: "Error al obtener piezas de aluminio" });
  }
});

module.exports = router;
