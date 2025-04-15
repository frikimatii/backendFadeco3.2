const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// Función para ordenar por fecha (más reciente primero)
const ordenarPorFechaDesc = (array) => {
  return array
    .map(item => {
      const fechaTexto = item.split(" - ")[0];
      const fecha = new Date(fechaTexto.replace(/(\d{1,2})\/(\d{1,2})\/(\d{4})/, '$2/$1/$3'));
      return { raw: item, fecha };
    })
    .sort((a, b) => b.fecha - a.fecha)
    .map(obj => obj.raw);
};

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

    // Ordenar por fecha y obtener los 10 más recientes
    const ultimosEnvios = ordenarPorFechaDesc(proveedorEncontrado.pedidos.envios).slice(0, 10);
    const ultimasEntregas = ordenarPorFechaDesc(proveedorEncontrado.pedidos.entregas).slice(0, 10);

    res.json({
      envios: ultimosEnvios,
      entregas: ultimasEntregas
    });
  });
});

module.exports = router;
