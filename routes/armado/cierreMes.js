const express = require("express");
const router = express.Router();
const Pieza = require("../../models/Pieza");

const maquinas = [
  "Inox_330",
  "Inox_300",
  "Inox_250",
  "Pintada_330",
  "Pintada_300",
  "Inox_ECO",
];

router.post("/", async (req, res) => {
  try {
    const { mes } = req.body;
    const piezas = await Pieza.find({ nombre: { $in: maquinas } });
    const updates = piezas.map(async (pieza) => {
        console.log(pieza.cantidad.terminado.cantidad)
      pieza.cantidad.terminado.cantidad = 0;
      pieza.mesUltimoCierre = mes;
      await pieza.save();
    });

    await Promise.all(updates);

    res.status(200).json({ mensaje: "Mes Cerrado Correctamente" });
  } catch (error) {
    console.error("Error al cerrar el mes:", error);
    res.status(500).json({ mensaje: "Error al cerrar el mes." });
  }
});

module.exports = router;
