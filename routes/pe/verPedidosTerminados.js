const express = require("express");
const router = express.Router();
const Pedido = require("../../models/Pedido");

// Ruta para obtener todos los pedidos
router.get("/", async (req, res) => {
  try {
    const pedidos = await Pedido.find({estado: "completado"}).sort({ _id: -1 });; // Obtener todos los pedidos
    res.status(200).json(pedidos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener los pedidos" });
  }
});

module.exports = router;