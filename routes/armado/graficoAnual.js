const express = require('express');
const router = express.Router();
const DataModel = require("../../models/DatosMaquinas");

router.get('/', async (req, res) => {
  try {
    // Obtener todas las máquinas
    const maquinasTerminadas = await DataModel.find();

    // Inicializamos un objeto para almacenar la cantidad total por mes
    let cantidadPorMes = {
      enero: 0,
      febrero: 0,
      marzo: 0,
      abril: 0,
      mayo: 0,
      junio: 0,
      julio: 0,
      agosto: 0,
      septiembre: 0,
      octubre: 0,
      noviembre: 0,
      diciembre: 0
    };

    // Recorremos cada máquina y sumamos las cantidades por mes
    maquinasTerminadas.forEach(maquina => {
      const meses = maquina.terminadas.mes; // Accedemos a los meses de cada máquina
      for (const mes in meses) {
        if (meses[mes]) {
          cantidadPorMes[mes] += meses[mes]; // Sumamos las cantidades de cada mes
        }
      }
    });

    // Devolvemos el total por mes
    res.json(cantidadPorMes);
  } catch (error) {
    console.error('Error al obtener el total de máquinas:', error);
    res.status(500).json({ mensaje: 'Error al obtener el total de máquinas' });
  }
});

module.exports = router;
