const express = require("express");
const fs = require("fs");
const router = express.Router();

// Endpoint para obtener historial
router.get("/", (req, res) => {
  fs.readFile("historial/historial.json", "utf8", (err, data) => {
    if (err) {
      console.error("Error al leer historial:", err);
      return res.status(500).json({ error: "Error al leer historial" });
    }

    try {
      const historial = JSON.parse(data);
      res.json(historial);
    } catch (e) {
      res.status(500).json({ error: "JSON inválido" });
    }
  });
});

module.exports = router;
