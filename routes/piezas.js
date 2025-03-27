const express = require('express');
const router = express.Router();
const Pieza = require('../models/Pieza'); // Asegúrate de importar el modelo


// Obtener todas las piezas
router.get('/', async (req, res) => {
    try {
        const piezas = await Pieza.find({}, 'nombre detallesGeneral');
        res.status(200).json(piezas);
    } catch (error) {
        console.error('Error al obtener las piezas:', error);
        res.status(500).json({ mensaje: 'Error al obtener las piezas' });
    }
});

// Actualizar cantidad de una pieza
router.put('/actualizarPieza/:nombre', async (req, res) => {
    try {
        const { nombre } = req.params;
        const { cantidad } = req.body;

        console.log("Nombre recibido:", nombre);  // Debug para ver qué nombre llega
        console.log("Cantidad recibida:", cantidad);

        if (!cantidad) {
            return res.status(404).json({ mensaje: "Pieza no encontrada en la base de datos" });
        }

        res.json({ mensaje: "Pieza actualizada correctamente"});
    } catch (error) {
        console.error("Error al actualizar la pieza:", error);
        res.status(500).json({ mensaje: "Error en el servidor al actualizar la pieza" });
    }
});

module.exports = router;
