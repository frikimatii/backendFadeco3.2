const express = require('express');
const router = express.Router();

// Supón que tienes un modelo de base de datos llamado 'Maquina'
const Pieza = require("../../models/Pieza");

router.get('/', async (req, res) => {
  try {
    // Obtener todas las máquinas terminadas desde la base de datos
    const maquinasTerminadas = await Pieza.find({ tipo_material: 'ArmadoFinal' });

    let totalCantidad = 0


    // Contar cuántas máquinas terminadas hay
    for (const maquina of maquinasTerminadas){
        totalCantidad += maquina.cantidad.terminado.cantidad || 0
    }
    
    // Enviar la cantidad total de máquinas como respuesta JSON
    res.json({ totalCantidad });
  } catch (error) {
    console.error('Error al obtener el total de máquinas:', error);
    res.status(500).json({ mensaje: 'Error al obtener el total de máquinas' });
  }
});

module.exports = router;
