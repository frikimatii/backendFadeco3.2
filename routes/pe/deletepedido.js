const express = require("express");
const router = express.Router();
const Pedido = require("../../models/Pedido");

// Ruta para eliminar un pedido por ID
router.delete("/:id", async (req, res) => {
    try {
      const { id } = req.params;
  
      // Buscar y eliminar el pedido por ID
      const pedidoEliminado = await Pedido.findByIdAndDelete(id);
  
      if (!pedidoEliminado) {
        return res.status(404).json({ message: "Pedido no encontrado" });
      }
  
      res.status(200).json({ message: "Pedido eliminado exitosamente", pedido: pedidoEliminado });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al eliminar el pedido", error: error.message });
    }
  });

module.exports = router;
