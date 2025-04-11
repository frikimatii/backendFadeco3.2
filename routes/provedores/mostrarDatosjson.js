const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// Ruta: /api/historialProvedores/:proveedor
router.get('/:proveedor', (req, res) => {
  const proveedorBuscado = req.params.proveedor;
  const filePath = path.join(__dirname, '../../historial/historialProvedores.json');

  fs.readFile(filePath, 'utf8', (err, jsonData) => {
    if (err) return res.status(500).json({ error: 'Error al leer historial' });

    let historialArray;

    try {
      historialArray = JSON.parse(jsonData);
    } catch (e) {
      return res.status(500).json({ error: 'Error al parsear JSON' });
    }

    // Buscar proveedor dentro del array
    const proveedorEncontrado = historialArray.find(p => p.provedor === proveedorBuscado);

    if (!proveedorEncontrado) {
      return res.status(404).json({ error: 'Proveedor no encontrado' });
    }

    // Obtener solo los últimos 10 de cada uno
    const ultimosEnvios = proveedorEncontrado.pedidos.envios.slice(-10);
    const ultimasEntregas = proveedorEncontrado.pedidos.entregas.slice(-10);

    res.json({
      envios: ultimosEnvios,
      entregas: ultimasEntregas
    });
  });
});

module.exports = router;
